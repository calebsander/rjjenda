<template>
	<div>
		<md-toolbar class='md-accent md-dense' id='week-toolbar'>
			<md-button class='md-icon-button' @click='lastWeek'>
				<md-icon>chevron_left</md-icon>
			</md-button>
			<md-button @click='today'>
				Today
			</md-button>
			<md-button class='md-icon-button' @click='nextWeek'>
				<md-icon>chevron_right</md-icon>
			</md-button>
			<md-spinner md-indeterminate :md-size='40' class='md-warn' v-if='loading'></md-spinner>
		</md-toolbar>
		<md-table>
			<md-table-header>
				<md-table-row>
					<md-table-head class='center'>
						Group
					</md-table-head>
					<md-table-head v-for='day in WEEK_DAYS' :key='day' class='center'>
						{{ getDayName(day) }}
						{{ getDay(day).toShortDate() }}
					</md-table-head>
				</md-table-row>
			</md-table-header>
			<md-table-body>
				<md-table-row v-for='(group, index) in groups' :key='group.id'>
					<md-table-cell>
						<md-icon v-if='group.editPrivileges' class='no-margin'>
							edit
							<md-tooltip md-direction='right'>
								You have editing privileges
							</md-tooltip>
						</md-icon>
						{{ group.name }}
						<md-button class='md-icon-button md-raised' @click='removeGroup(index)'>
							<md-icon>clear</md-icon>
						</md-button>
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day' @mouseover.native='showAssignmentAdd(group, day)'>
						<md-layout md-column :md-gutter='8'>
							<md-list class='md-double-line md-dense' v-if='getAssignments(group, day).length'>
								<md-list-item v-for='assignment in getAssignments(group, day)' :key='assignment.id'>
									<div class='md-list-text-container'>
										<span>{{ assignment.name }}</span>
										<span>
											Weight: {{ assignment.weight }}
											<span v-if='!assignment.visitors'>
												<br>
												No visitors
											</span>
										</span>
									</div>
								</md-list-item>
							</md-list>
							<md-layout md-align='center' v-if='isHoveredCell(group, day)'>
								<md-button class='md-icon-button md-raised top-space' @click='openAddAssignment'>
									<md-icon>assignment</md-icon>
								</md-button>
							</md-layout>
						</md-layout>
					</md-table-cell>
				</md-table-row>
				<md-table-row v-if='teacher'>
					<md-table-cell>
						<md-button class='md-icon-button md-raised' @click='openAddGroup' id='add-group'>
							<md-icon>add</md-icon>
						</md-button>
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day'></md-table-cell> <!--for border along top of row-->
				</md-table-row>
			</md-table-body>
		</md-table>

		<md-dialog ref='addGroup' id='group-dialog' md-open-from='#add-group' md-close-to='#add-group'>
			<md-dialog-title>Show another group</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name of group or section</label>
					<md-autocomplete
						v-model='newGroupName'
						:fetch='getGroups'
						:debounce='500'
						:min-chars='3'
						query-param='nameSearch'
						@selected='selectGroup'
					>
					</md-autocomplete>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='addGroup'>Add</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog ref='addAssignment'>
			<md-dialog-title v-if='hoveredGroup'> <!--avoid accessing properties of null-->
				Add assignment for
				{{ hoveredGroup.name }}
				on
				{{ getDay(hoveredDay).toShortDate() }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newAssignmentName' required></md-input>
				</md-input-container>
				<md-switch v-model='newAssignmentMajor'>Major assignment?</md-switch>
				<md-switch v-model='newAssignmentVisitors'>Visitors allowed?</md-switch>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='addAssignment'>Add</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import ExtendedDate from '../../util/extended-date'
	import {AddAssignment, AddGroup, Assignment, AssignmentGroup, AssignmentListRequest, Assignments, GroupQuery} from '../../api'

	const DAYS_PER_WEEK = 7
	const WEEK_DAYS = 5
	const DAY_NAMES: string[] = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday'
	]

	const now = new ExtendedDate
	const lastMonday = now.addDays(1 - now.date.getDay())

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'assignments-view',
		props: {
			teacher: Boolean //controls whether additional groups can be displayed
		},
		watch: {
			mondayDate: 'reloadAssignments'
		}
	})
	export default class AssignmentsView extends Vue {
		readonly WEEK_DAYS = WEEK_DAYS
		mondayDate: ExtendedDate = lastMonday

		teacher: boolean //property of component

		loading = false

		groups: AssignmentGroup[] = []
		weekAssignments = new Map<AssignmentGroup, Map<number, Assignment[]>>()

		newGroup: AddGroup | null = null
		newGroupName = '' //use newGroup for read

		hoveredGroup: AssignmentGroup | null = null
		hoveredDay: number = -1

		newAssignmentName = ''
		newAssignmentMajor = false
		newAssignmentVisitors = true

		lastWeek() {
			if (this.loading === true) return //avoid having multiple assignment requests running at same time
			this.mondayDate = this.mondayDate.addDays(-DAYS_PER_WEEK)
		}
		today() {
			if (this.loading === true) return //avoid having multiple assignment requests running at same time
			this.mondayDate = lastMonday
		}
		nextWeek() {
			if (this.loading === true) return //avoid having multiple assignment requests running at same time
			this.mondayDate = this.mondayDate.addDays(DAYS_PER_WEEK)
		}
		getDay(oneIndexedDay: number): ExtendedDate {
			return this.mondayDate.addDays(oneIndexedDay - 1)
		}
		getDayName(oneIndexedDay: number): string {
			return DAY_NAMES[oneIndexedDay - 1]
		}

		showAssignmentAdd(group: AssignmentGroup, day: number) {
			if (!group.editPrivileges) return

			this.hoveredGroup = group
			this.hoveredDay = day
		}
		isHoveredCell(group: AssignmentGroup, day: number): boolean {
			return group === this.hoveredGroup && day === this.hoveredDay
		}
		openAddAssignment() {
			this.newAssignmentName = ''
			this.newAssignmentMajor = false
			this.newAssignmentVisitors = true
			;(this.$refs.addAssignment as Dialog).open()
		}
		addAssignment() {
			const name = this.newAssignmentName
			if (!name) {
				alert('Please enter a name for the assignment')
				return
			}

			const group = this.hoveredGroup as AssignmentGroup
			const data: AddAssignment = {
				due: this.getDay(this.hoveredDay).date.toISOString(),
				groupId: group.id,
				major: this.newAssignmentMajor,
				name,
				visitors: this.newAssignmentVisitors
			}
			this.loading = true
			apiFetch({
				url: '/assignments/new',
				data,
				handler: () => {
					(this.$refs.addAssignment as Dialog).close()
					this.loadAssignmentsForGroups([group])
				},
				router: this.$router
			})
		}

		openAddGroup() {
			this.newGroupName = ''
			;(this.$refs.addGroup as Dialog).open()
		}
		getGroups(query: GroupQuery) {
			return new Promise<AddGroup[]>((resolve, _) => { //currently no capability for catching errors from apiFetch()
				apiFetch({
					url: '/assignments/search-groups',
					data: query,
					handler: resolve,
					router: this.$router
				})
			})
		}
		selectGroup(group: AddGroup) {
			this.newGroup = group
		}
		addGroup() {
			const group = this.newGroup
			if (group === null || group.name !== this.newGroupName) { //if no group yet selected or input is modified after last group selection
				alert('Please select a valid group')
				return
			}

			;(this.$refs.addGroup as Dialog).close()
			const assignmentGroup = {
				editPrivileges: group.extracurricular,
				id: group.id,
				name: group.name
			}
			this.groups.push(assignmentGroup)
			this.loadAssignmentsForGroups([assignmentGroup])
		}
		removeGroup(index: number) {
			const [group] = this.groups.splice(index, 1)
			this.weekAssignments.delete(group)
		}
		reloadAssignments() {
			this.loadAssignmentsForGroups(this.groups)
		}
		loadAssignmentsForGroups(groups: AssignmentGroup[]) {
			this.loading = true
			Promise.all(groups.map(group => {
				this.weekAssignments.delete(group)
				const data: AssignmentListRequest = {
					groupId: group.id,
					...this.mondayDate.toYMD(),
					days: WEEK_DAYS
				}
				return new Promise((resolve, _) =>
					apiFetch({
						url: '/assignments/list',
						data,
						handler: (assignments: Assignments) => {
							const dayAssignments = new Map<number, Assignment[]>()
							for (const assignment of assignments) {
								let day = dayAssignments.get(assignment.day)
								if (!day) {
									day = []
									dayAssignments.set(assignment.day, day)
								}
								day.push({
									id: assignment.id,
									name: assignment.name,
									visitors: assignment.visitors,
									weight: assignment.weight
								})
							}
							this.weekAssignments.set(group, dayAssignments)
							resolve()
						},
						router: this.$router
					})
				)
			}))
				.then(() => this.loading = false)
		}
		getAssignments(group: AssignmentGroup, day: number): Assignment[] {
			const groupAssignments = this.weekAssignments.get(group)
			if (!groupAssignments) return []
			return groupAssignments.get(day) || []
		}

		//For external usage
		setGroups(groups: AssignmentGroup[]) {
			this.groups = groups
			this.loadAssignmentsForGroups(groups)
		}
	}
</script>

<style lang='sass' scoped>
	#week-toolbar
		justify-content: center
	.center
		text-align: center
	.no-margin
		margin: 0px
	.top-space
		margin-top: 10px !important
</style>
<style lang='sass'>
	#group-dialog .md-dialog //make the whole dialog box wide (to accommodate long section names)
		width: 100%
	.md-menu-content //make the autocomplete list wide
		min-width: 65%
</style>
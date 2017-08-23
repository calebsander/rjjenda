<template>
	<div>
		<md-toolbar class='md-dense week-toolbar'>
			<md-button @click='lastWeek'>
				<md-icon class='up-a-bit'>chevron_left</md-icon>
				Last week
			</md-button>
			<md-button @click='today'>
				This week
			</md-button>
			<md-button @click='nextWeek'>
				Next week
				<md-icon class='up-a-bit'>chevron_right</md-icon>
			</md-button>
			<md-spinner
				md-indeterminate
				:md-size='40'
				class='md-warn'
				:style='{visibility: loading ? "visible" : "hidden"}'
			>
			</md-spinner>
		</md-toolbar>
		<md-table class='assignment-grid'>
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
				<md-table-row v-for='(group, index) in groups' :key='group.id' class='assignments-row'>
					<md-table-cell class='name-cell'>
						{{ group.name }}
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day' @mouseover.native='showAssignmentAdd(group, day)'>
						<md-layout md-column :md-gutter='8'>
							<md-list class='md-dense assignment-list' v-if='getAssignments(group, day).length'>
								<md-list-item v-for='assignment in getAssignments(group, day)' :key='assignment.id'>
									<span class='assignment-name' :title='assignment.name'>{{ assignment.name }}</span>
									<md-chip v-if='!assignment.weight'>minor</md-chip>
									<md-button
										class='md-icon-button md-list-action'
										v-if='group.editPrivileges'
										@click='deleteAssignment(group, day, assignment)'
									>
										<md-icon>delete</md-icon>
									</md-button>
								</md-list-item>
							</md-list>
							<span class='center no-visitors' v-if='getAssignments(group, day).some(({visitors}) => !visitors)'>
								No visitors
							</span>
							<md-layout>
								<md-button
									v-for='info in getInfos(group, day)'
									:key='info.color'
									class='md-icon-button md-raised'
									:style='{background: info.color, color: "white"}'
									@click='showWarning(info)'
								>
									{{ info.students.length }}
								</md-button>
								<md-button class='md-icon-button md-raised assignment-add' @click='openAddAssignment'>
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
							<md-tooltip md-direction='right'>Show another group</md-tooltip>
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
						required
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
			<md-dialog-title>Add assignment</md-dialog-title>
			<md-dialog-content v-if='newAssignmentViolations.length === 0'>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newAssignmentName' required></md-input>
				</md-input-container>
				<p v-if='hoveredGroup'><strong>Section: </strong>{{ hoveredGroup.name }}</p>
				<p v-if='hoveredGroup'><strong>Date: </strong>{{ getDay(hoveredDay).toShortDate() }}</p>
				<md-switch v-model='newAssignmentMajor'>Major assignment?</md-switch>
				<md-switch v-model='newAssignmentVisitors'>Visitors allowed?</md-switch>
			</md-dialog-content>
			<md-dialog-content v-else>
				<h4>Adding this assignment would cause some students' workloads to exceed the recommended limits.</h4>
				<p v-for="violation in newAssignmentViolations" :key="violation.student + String(violation.days)">
					<strong>{{ violation.student }}</strong>
					would have
					{{ violation.assignments.length + 1}}
					major pieces of work in
					{{ violation.days === 1 ? 'one day' : String(violation.days) + ' consecutive days' }}.
					Click
					<a :href='getMailtoLink(violation)' target='_blank'>here</a>
					to e-mail student and advisor.
					<ol>
						<li v-for="assignment in violation.assignments" :key="assignment">
							{{ assignment }}
						</li>
						<li><em>{{ newAssignmentName }}</em> (your new assignment)</li>
					</ol>
				</p>
				<p>
					If you choose to add this assignment anyway, please contact affected students and their advisors with a plan for mitigation.
				</p>
			</md-dialog-content>
			<md-dialog-actions v-if='newAssignmentViolations.length === 0'>
				<md-button class='md-accent' @click='checkAssignment'>Add</md-button>
			</md-dialog-actions>
			<md-dialog-actions v-else>
				<md-button class='md-accent' @click='cancelAddAssignment'>Cancel</md-button>
				<md-button class='md-accent' @click='addAssignment'>Add anyway</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog-alert
			ref='checkAssignment'
			md-title='Limit violations'
			:md-content-html='checkContent'
		>
		</md-dialog-alert>
		<md-dialog ref='warningDetail' id='warning-detail'>
			<div v-if='selectedWarning'> <!--avoid rendering errors if no warning yet selected-->
				<md-dialog-title>
					Students with
					{{ selectedWarning.weight }}
					major assignment{{ selectedWarning.weight === 1 ? '' : 's' }}
					<div class='subhead'>
						For {{ hoveredGroup.name }}
						on {{ getDayName(hoveredDay) }}
					</div>
				</md-dialog-title>
				<md-dialog-content>
					<md-list class='md-double-line'>
						<md-list-item v-for='student in selectedWarning.students' :key='student.student'>
							<div class='md-list-text-container'>
								<span>{{ student.student }}</span>
								<ol>
									<li v-for='assignment in student.assignments' :key='assignment'>
										{{ assignment }}
									</li>
								</ol>
							</div>
						</md-list-item>
					</md-list>
				</md-dialog-content>
			</div>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {
		AddAssignment,
		AddGroup,
		AssignmentGroup,
		AssignmentListRequest,
		Assignments,
		CheckAssignment,
		GroupWarnings,
		InfoListRequest,
		LimitViolation,
		GroupQuery
	} from '../../api'
	import WeekManager from './WeekManager.vue'

	interface Assignment {
		id: number
		name: string
		visitors: boolean
		weight: number
		updated: Date
	}
	interface StudentInfo {
		student: string
		assignments: string[]
	}
	interface InfoLevel {
		color: string
		students: StudentInfo[]
		weight: number
	}

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
			mondayDate: 'reloadAssignments',
		}
	})
	export default class AssignmentsView extends WeekManager {
		teacher: boolean //property of component

		loading = false

		groups: AssignmentGroup[] = []
		allStudentsGroup: AssignmentGroup | null = null
		//Map of groups to maps of days to lists of assignments
		weekAssignments = new WeakMap<AssignmentGroup, Map<number, Assignment[]>>()
		//Map of groups to maps of days to lists of infos
		weekInfos = new WeakMap<AssignmentGroup, Map<number, InfoLevel[]>>()
		//Map of groups to current load tokens for their assigments
		assignmentLoadTokens = new WeakMap<AssignmentGroup, object>()
		//Current load token for warnings
		warningLoadToken: object | null = null

		newGroup: AddGroup | null = null
		newGroupName = '' //use newGroup for read

		hoveredGroup: AssignmentGroup | null = null
		hoveredDay: number = -1

		newAssignmentName = ''
		newAssignmentMajor = true
		newAssignmentVisitors = false
		newAssignmentViolations: LimitViolation[] = []

		checkContent = ' ' //errors are thrown if this is empty

		selectedWarning: InfoLevel | null = null

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
			this.newAssignmentMajor = true
			this.newAssignmentVisitors = false
			this.newAssignmentViolations = []
			;(this.$refs.addAssignment as Dialog).open()
		}
		get due(): string {
			return this.getDay(this.hoveredDay).toUTC().date.toISOString()
		}
		checkAssignment() {
			const data: CheckAssignment = {
				due: this.due,
				groupId: this.hoveredGroup!.id,
				major: this.newAssignmentMajor
			}
			this.loading = true
			apiFetch({
				url: '/assignments/check-limit',
				data,
				handler: (violations: LimitViolation[]) => {
					this.loading = false
					if (violations.length) this.newAssignmentViolations = violations
					else this.addAssignment()
				},
				router: this.$router
			})
		}
		cancelAddAssignment() {
			(this.$refs.addAssignment as Dialog).close()
		}
		addAssignment() {
			const name = this.newAssignmentName
			if (!name) {
				alert('Please enter a name for the assignment')
				return
			}

			const group = this.hoveredGroup!
			const data: AddAssignment = {
				due: this.due,
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
		deleteAssignment(group: AssignmentGroup, day: number, assignment: Assignment) {
			this.loading = true
			apiFetch({
				url: '/assignments/' + String(assignment.id),
				method: 'DELETE',
				handler: () => {
					const dayAssignments = this.getAssignments(group, day)
					dayAssignments.splice(dayAssignments.indexOf(assignment), 1)
					this.loadInfos().then(() => this.loading = false)
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
			this.groups.splice(index, 1)
		}
		addAllStudentsGroup() {
			this.groups.unshift(this.allStudentsGroup!)
			this.loadAssignmentsForGroups([this.allStudentsGroup!])
		}
		reloadAssignments() {
			this.loadAssignmentsForGroups(this.groups)
		}
		loadInfos(): Promise<void> {
			//Students shouldn't see infos
			if (!this.teacher) return Promise.resolve()

			const loadToken = {}
			this.warningLoadToken = loadToken

			return new Promise((resolve, reject) => {
				//If we are reloading for one, need to reload for all
				//since changing an assignment for one group can affect students in others
				const groups = this.groups
				for (const group of groups) this.weekInfos.delete(group)
				const data: InfoListRequest = {
					groupIds: groups.map(({id}) => id),
					...this.mondayDate.toYMD(),
					days: this.WEEK_DAYS
				}
				apiFetch({
					url: '/assignments/infos',
					data,
					handler: (groupWarnings: GroupWarnings) => {
						if (loadToken !== this.warningLoadToken) {
							reject()
							return
						}

						for (let day = 0; day < groupWarnings.length; day++) {
							const {groups: affectedGroups, infos} = groupWarnings[day]
							for (const group of groups) {
								let groupInfos = this.weekInfos.get(group)
								if (!groupInfos) {
									groupInfos = new Map()
									this.weekInfos.set(group, groupInfos)
								}
								const groupDayLevels: {[color: string]: InfoLevel} = {}
								for (const infoIndex of affectedGroups[group.id] || []) {
									const info = infos[infoIndex]
									const {color, weight} = info
									let level = groupDayLevels[color]
									if (!level) {
										level = {color, students: [], weight}
										groupDayLevels[color] = level
									}
									level.students.push(info)
								}
								const levels: InfoLevel[] = []
								for (const color in groupDayLevels) levels.push(groupDayLevels[color])
								groupInfos.set(day + 1, levels)
							}
						}
						resolve()
					},
					router: this.$router
				})
			})
		}
		loadAssignmentsForGroups(groups: AssignmentGroup[]) {
			this.loading = true
			const loadAssignments = Promise.all(groups.map(group => {
				this.weekAssignments.delete(group)
				const loadToken = {}
				this.assignmentLoadTokens.set(group, loadToken)
				const data: AssignmentListRequest = {
					groupId: group.id,
					...this.mondayDate.toYMD(),
					days: this.WEEK_DAYS
				}
				return new Promise((resolve, reject) =>
					apiFetch({
						url: '/assignments/list',
						data,
						handler: (assignments: Assignments) => {
							if (loadToken !== this.assignmentLoadTokens.get(group)) {
								reject()
								return
							}

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
									updated: new Date(assignment.updated),
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
			Promise.all([loadAssignments, this.loadInfos()])
				.then(() => this.loading = false)
				.catch(err => {
					if (err) throw err //if err is undefined, just means that a newer request was sent that overrode this one
				})
		}
		getAssignments(group: AssignmentGroup, day: number): Assignment[] {
			const groupAssignments = this.weekAssignments.get(group)
			if (!groupAssignments) return []
			return groupAssignments.get(day) || []
		}
		getInfos(group: AssignmentGroup, day: number): InfoLevel[] {
			const groupInfos = this.weekInfos.get(group)
			if (!groupInfos) return []
			return groupInfos.get(day) || []
		}
		getMailtoLink(violation: LimitViolation) {
			let link = 'mailto:' + violation.studentEmail
			if (violation.advisorEmail) link += ',' + violation.advisorEmail
			return link
		}
		showWarning(warning: InfoLevel) {
			this.selectedWarning = warning
			;(this.$refs.warningDetail as Dialog).open()
		}

		//For external usage
		setGroups(groups: AssignmentGroup[]) {
			this.groups = groups.slice()
			if (this.allStudentsGroup !== null) this.addAllStudentsGroup()
			this.loadAssignmentsForGroups(this.groups)
		}
		setAllStudentsGroup(group: AssignmentGroup) {
			this.allStudentsGroup = group
			if (this.groups.length) this.addAllStudentsGroup()
		}
	}
</script>

<style lang='sass' scoped>
	.no-margin
		margin: 0px
	.assignment-list .md-list-item:hover
		background-color: rgba(0,0,0,.2)
	.no-visitors
		margin-bottom: 3px
		font-weight: bold
	.md-table-cell:not(:hover) .assignment-add
		opacity: 0

	.subhead
		opacity: .54
		font-size: 14px
		letter-spacing: .01em
		line-height: 20px
</style>
<style lang='sass'>
	#group-dialog .md-dialog //make the whole dialog box wide (to accommodate long section names)
		width: 100%
	.md-menu-content //make the autocomplete list wide; not sure how to prevent this from applying to all autocompletes & selects
		min-width: 65%
	#warning-detail .md-dialog
		overflow-y: auto
	#app .assignments-row .md-table-cell > div
		padding: 6px
</style>
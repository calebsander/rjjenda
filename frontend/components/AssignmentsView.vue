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
			<md-spinner md-indeterminate :md-size='40' class='md-accent' v-if='loading'></md-spinner>
		</md-toolbar>
		<md-table>
			<md-table-header>
				<md-table-row>
					<md-table-head>
						Group
					</md-table-head>
					<md-table-head v-for='day in WEEK_DAYS' :key='day'>
						{{ getDayName(day) }}
						{{ getDay(day).toShortDate() }}
					</md-table-head>
				</md-table-row>
			</md-table-header>
			<md-table-body>
				<md-table-row v-for='(group, index) in groups' :key='group.id'>
					<md-table-cell>
						{{ group.name }}
						<md-button class='md-icon-button md-raised' @click='removeGroup(index)'>
							<md-icon>clear</md-icon>
						</md-button>
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day'></md-table-cell>
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
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import ExtendedDate from '../extended-date'
	import {AddGroup, Assignment, AssignmentGroup, GroupQuery} from '../../api'

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
			'teacher': Boolean //controls whether additional groups can be displayed
		}
	})
	export default class AssignmentsView extends Vue {
		readonly WEEK_DAYS = WEEK_DAYS
		mondayDate: ExtendedDate = lastMonday

		loading = false

		groups: AssignmentGroup[] = []
		weekAssignments = new Map<AssignmentGroup, Map<number, Assignment[]>>()

		newGroup: AddGroup | null = null
		newGroupName = '' //use newGroup for read

		lastWeek() {
			this.mondayDate = this.mondayDate.addDays(-DAYS_PER_WEEK)
		}
		today() {
			this.mondayDate = lastMonday
		}
		nextWeek() {
			this.mondayDate = this.mondayDate.addDays(DAYS_PER_WEEK)
		}
		getDay(oneIndexedDay: number): ExtendedDate {
			return this.mondayDate.addDays(oneIndexedDay - 1)
		}
		getDayName(oneIndexedDay: number): string {
			return DAY_NAMES[oneIndexedDay - 1]
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
			this.groups.push({
				editPrivileges: false,
				id: group.id,
				name: group.name
			})
		}
		removeGroup(index: number) {
			this.groups.splice(index, 1)
		}

		//For external usage
		setGroups(groups: AssignmentGroup[]) {
			this.groups = groups
		}
	}
</script>

<style lang='sass' scoped>
	#week-toolbar
		justify-content: center
</style>
<style lang='sass'>
	#group-dialog .md-dialog //make the whole dialog box wide (to accommodate long section names)
		width: 100%
	.md-menu-content //make the autocomplete list wide
		min-width: 65%
</style>
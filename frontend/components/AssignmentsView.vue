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
			<md-spinner md-indeterminate md-size='40' class='md-accent' v-if='loading'></md-spinner>
		</md-toolbar>
		<md-table>
			<md-table-header>
				<md-table-row>
					<md-table-head v-for='day in WEEK_DAYS' :key='day'>
						{{ getDayName(day) }}
						{{ getDay(day).toShortDate() }}
					</md-table-head>
				</md-table-row>
			</md-table-header>
		</md-table>
	</div>
</template>

<script lang='ts'>
	import ExtendedDate from '../extended-date'
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AssignmentGroup} from '../../api'

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

	@Component({
		name: 'assignments-view'
	})
	export default class AssignmentsView extends Vue {
		readonly WEEK_DAYS = WEEK_DAYS
		mondayDate: ExtendedDate = lastMonday
		groups: AssignmentGroup[] = []

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
	}
</script>

<style lang='sass' scoped>
	#week-toolbar
		justify-content: center
</style>
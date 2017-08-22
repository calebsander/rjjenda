<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import ExtendedDate from '../../util/extended-date'

	const now = new ExtendedDate
	const lastMonday = now.addDays(1 - now.date.getDay())

	const DAYS_PER_WEEK = 7
	const WEEK_DAYS = 5
	const DAY_NAMES: string[] = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday'
	]

	@Component
	export default class WeekManager extends Vue {
		readonly WEEK_DAYS = WEEK_DAYS
		mondayDate: ExtendedDate = lastMonday

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

<style lang='sass'>
	.week-toolbar
		justify-content: center
	.md-icon.up-a-bit
		margin-top: -2px
	.center
		text-align: center !important
	.hide-button
		min-width: 70px !important
</style>
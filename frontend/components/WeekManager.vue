<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {EventsRequest, EventResponse} from '../../api'
	import apiFetch from '../api-fetch'
	import ExtendedDate from '../../util/extended-date'

	const noonToday = new Date
	noonToday.setHours(12, 0, 0, 0)
	const now = new ExtendedDate(noonToday)
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

		//Map of days to lists of events for that day
		weekEvents = new Map<number, string[]>()
		//Current load token for events
		eventLoadToken: object | null = null

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

		loadEvents(): Promise<void> {
			this.weekEvents.clear()
			const loadToken = {}
			this.eventLoadToken = loadToken

			const data: EventsRequest = {
				...this.mondayDate.toYMD(),
				days: this.WEEK_DAYS
			}
			return new Promise((resolve, reject) => {
				apiFetch({
					url: '/events',
					data,
					handler: (events: EventResponse[]) => {
						if (loadToken !== this.eventLoadToken) {
							reject()
							return
						}

						for (let day = 1; day <= this.WEEK_DAYS; day++) this.weekEvents.set(day, [])
						for (const event of events) this.weekEvents.get(event.day)!.push(event.name)
						resolve()
					},
					router: this.$router
				})
			})
		}
		getEvents(day: number): string[] {
			return this.weekEvents.get(day) || []
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

	.assignment-grid .md-button
		margin-left: 0
	.assignment-grid .md-table-cell
		max-width: 0

	.assignment-list
		background: transparent !important
	.assignment-list .md-list-item
		border: solid 1px black
		border-radius: 5px
		margin: 2px 0 2px 0
	.assignment-name
		white-space: normal !important
		font-size: 0.8em
		line-height: 1em
		padding-top: 2px
		padding-bottom: 2px
	.assignment-list .md-list-item .md-chip
		font-size: 0.8em

	.assignments-row .md-table-cell
		border-right: solid 1px rgba(0,0,0,.1)
		vertical-align: top
	.assignments-row .md-table-cell.name-cell
		vertical-align: middle
		line-height: 1.2em

	.week-toolbar .md-spinner
		position: absolute
		right: 40px

	#app .assignments-row .md-table-cell > div
		padding: 6px
</style>
const MILLIS_PER_DAY = 86400000

export default class ExtendedDate {
	readonly date: Date

	constructor(...args: any[]) {
		this.date = new Date(...args)
	}

	addDays(days: number): ExtendedDate {
		return new ExtendedDate(this.date.getTime() + MILLIS_PER_DAY * days)
	}
	toShortDate(): string {
		return String(this.date.getMonth() + 1) + '/' + String(this.date.getDate())
	}
	toYMD(): {year: number, month: number, date: number} {
		return {
			year: this.date.getFullYear(),
			month: this.date.getMonth(),
			date: this.date.getDate()
		}
	}
	daysSince(firstDate: ExtendedDate) { //both dates should be at the same time of day
		return (this.date.getTime() - firstDate.date.getTime()) / MILLIS_PER_DAY
	}
	//A date whose UTC time is the same as this date in local time
	toUTC(): ExtendedDate {
		const {date} = this
		const utcDate = new Date
		utcDate.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate())
		utcDate.setUTCHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
		return new ExtendedDate(utcDate)
	}
}
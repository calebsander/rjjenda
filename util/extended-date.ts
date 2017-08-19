const MILLIS_PER_DAY = 86400000

function pad(num: number, digits: number) {
	const str = String(num)
	if (str.length >= digits) return str
	return '0'.repeat(digits - str.length) + str
}
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
	toYYYYMMDD(): string {
		return pad(this.date.getFullYear(), 4) + '-' +
			pad(this.date.getMonth() + 1, 2) + '-' +
			pad(this.date.getDate(), 2)
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
	//A date whose local time is the same as this date in UTC time
	fromUTC(): ExtendedDate {
		const {date} = this
		const localDate = new Date
		localDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
		localDate.setHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds())
		return new ExtendedDate(localDate)
	}
}
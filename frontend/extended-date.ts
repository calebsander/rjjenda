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
}
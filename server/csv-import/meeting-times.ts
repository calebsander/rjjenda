import {Readable} from 'stream'
import {parse, RowObject} from './csv-parse'
import {Section} from '../models'

interface MeetingTimes extends RowObject {
	course: string
	section: string
	meetingTimes: string
}

const TIME_MATCH = /D0(\d)P0(\d)/g
export const DAY_ABBREVIATIONS = [
	'', //no day 0
	'M',
	'Tu',
	'W',
	'Th',
	'F'
]

export default (csvStream: Readable): Promise<string[]> =>
	parse(csvStream, ['course', 'section', '_', 'meetingTimes'])
		.then(rows => {
			const sections = rows as MeetingTimes[]
			return Promise.all(sections.map(({course, section, meetingTimes}) => {
				const number = Number(section)
				return Section.findOne({
					where: {
						courseId: course,
						number
					}
				})
					.then<string | undefined>(section => { //return section string if failed, or undefined if succeeded
						if (!section) return course + '-' + String(number)
						let dayPeriod: RegExpExecArray | null
						const meetingTimeStrings: string[] = []
						while (dayPeriod = TIME_MATCH.exec(meetingTimes)) {
							meetingTimeStrings.push( //e.g. M3
								DAY_ABBREVIATIONS[Number(dayPeriod[1])] +
								dayPeriod[2]
							)
						}
						return section
							.set('periods', meetingTimeStrings.join(', '))
							.save()
							.then(_ => undefined)
					})
			}))
				.then(saveResults => saveResults.filter(result => result) as string[]) //return sections that were not found
		})
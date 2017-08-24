import * as bodyParser from 'body-parser'
import * as express from 'express'
import {AdviseeAssignment, AdviseeAssignmentRequest, AdviseeDay, AdviseeWeek, MatchingStudent} from '../../api'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {getInfo} from '../limit-check'
import {Assignment, Course, Group, Section, Student, Teacher} from '../models'
import {TeacherInstance} from '../models/teacher'
import ExtendedDate from '../../util/extended-date'

const router = express.Router()
router.use(restrictToTeacher)
router.get('/advisees', (req, res) => {
	const teacher: TeacherInstance = req.user
	Student.findAll({
		attributes: ['id', 'firstName', 'lastName'],
		where: {advisorId: teacher.id},
		order: ['lastName']
	})
		.then(students => {
			const response: MatchingStudent[] = students.map(
				({id, firstName, lastName}) => ({id, firstName, lastName})
			)
			success(res, response)
		})
		.catch(err => error(res, err))
})
router.post('/assignments',
	bodyParser.json(),
	(req, res) => {
		const {id, year, month, date, days} = req.body as AdviseeAssignmentRequest
		const startDate = new ExtendedDate(year, month, date)
		const dayPromises: Promise<AdviseeDay>[] = []
		for (let day = 0; day < days; day++) {
			const extendedDay = startDate.addDays(day)
			const studentRequest = Student.findOne({
				attributes: [],
				where: {id},
				include: [{
					model: Group,
					attributes: ['name'],
					include: [
						{
							model: Section,
							attributes: ['id'], //needed for section to be linked with group
							include: [
								{
									model: Course,
									attributes: ['name']
								},
								{
									model: Teacher,
									attributes: ['lastName']
								}
							]
						},
						{
							model: Assignment,
							attributes: ['name', 'weight'],
							where: {due: extendedDay.date}
						}
					]
				}]
			})
			const assignmentsRequest = studentRequest.then(student => {
				if (student === null) throw new Error('No student with id: ' + id)
				const assignments: AdviseeAssignment[] = []
				for (const group of student.groups) {
					let course: string
					let teacher: string | undefined
					const {section} = group
					if (section) {
						course = section.course.name
						teacher = section.teacher ? section.teacher.lastName : undefined
					}
					else course = group.name!
					for (const assignment of group.assignments!) {
						assignments.push({
							course,
							name: assignment.name,
							teacher,
							weight: assignment.weight
						})
					}
				}
				return Promise.resolve(assignments)
			})
			const warningRequest: Promise<string | undefined> = getInfo(extendedDay, [id])
				.then(infos => {
					const infoMatched = infos.get(id)
					if (!infoMatched) return Promise.resolve(undefined)
					return Promise.resolve(infoMatched.color)
				})
			dayPromises.push(
				Promise.all([assignmentsRequest, warningRequest])
					.then(([assignments, warning]) => ({assignments, warning}))
			)
		}
		Promise.all(dayPromises)
			.then((response: AdviseeWeek) => success(res, response))
			.catch(err => error(res, err))
	}
)

export default router
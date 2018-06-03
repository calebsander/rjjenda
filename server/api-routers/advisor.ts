import * as bodyParser from 'body-parser'
import * as express from 'express'
import {AdviseeAssignment, AdviseeAssignmentRequest, AdviseeDay, AdviseeWeek, MatchingStudent} from '../../api'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {getWarning} from '../limit-check'
import {Assignment, Course, Group, Section, Student, Teacher} from '../models'
import {TeacherInstance} from '../models/teacher'
import ExtendedDate from '../../util/extended-date'

const router = express.Router()
router.use(restrictToTeacher)
router.get('/advisees', (req, res) => {
	const teacher: TeacherInstance = req.user as TeacherInstance
	Student.findAll({
		attributes: ['id', 'firstName', 'lastName'],
		where: {advisorId: teacher.id},
		order: ['lastName']
	})
		.then(students =>
			students.map(({id, firstName, lastName}) =>
				({id, firstName, lastName})
			)
		)
		.then((response: MatchingStudent[]) => success(res, response))
		.catch(error(res))
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
							attributes: ['name', 'weight', 'createdAt'],
							where: {due: extendedDay.date}
						}
					]
				}]
			})
			const assignmentsRequest = studentRequest.then(student => {
				if (student === null) throw new Error('No student with id: ' + id)
				const assignments: AdviseeAssignment[] = []
				const createdAtDates = new Map<AdviseeAssignment, number>() //date in epoch time
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
						const assignmentResponse = {
							course,
							name: assignment.name,
							teacher,
							weight: assignment.weight
						}
						assignments.push(assignmentResponse)
						createdAtDates.set(assignmentResponse, assignment.createdAt.getTime())
					}
				}
				assignments.sort((assignment1, assignment2) => {
					return createdAtDates.get(assignment1)! - createdAtDates.get(assignment2)!
				})
				return assignments
			})
			const warningRequest: Promise<string | undefined> = getWarning(extendedDay, [id])
				.then(warnings => {
					const warningMatched = warnings.get(id)
					return warningMatched && warningMatched.color
				})
			dayPromises.push(
				Promise.all([assignmentsRequest, warningRequest])
					.then(([assignments, warning]) => ({assignments, warning}))
			)
		}
		Promise.all(dayPromises)
			.then((response: AdviseeWeek) => success(res, response))
			.catch(error(res))
	}
)

export default router
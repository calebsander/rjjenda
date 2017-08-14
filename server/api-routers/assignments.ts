import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {AddAssignment, AddGroup, AssignmentGroup, AssignmentListRequest, Assignments, GroupQuery} from '../../api'
import {error, success} from '../api-respond'
import {restrictToLoggedIn, restrictToStudent, restrictToTeacher} from '../api-restrict'
import ExtendedDate from '../../util/extended-date'
import {Assignment, Course, Group, Section, Student} from '../models'
import {CourseAttributes} from '../models/course'
import {GroupAttributes} from '../models/group'
import {StudentInstance} from '../models/student'
import {TeacherInstance} from '../models/teacher'
import sectionGroupName from '../section-group-name'

const router = express.Router()
router.get('/my-sections',
	restrictToTeacher,
	(req, res) => {
		const teacher: TeacherInstance = req.user
		Section.findAll({
			attributes: ['number'],
			where: {teacherId: teacher.id},
			include: [
				{
					model: Course,
					attributes: ['name']
				},
				{
					model: Group,
					attributes: ['id']
				}
			],
			order: [
				Sequelize.col('course.name'),
				'number'
			]
		})
			.then(sections => {
				const response: AssignmentGroup[] = sections.map(section => ({
					editPrivileges: true,
					id: section.group.id as number,
					name: sectionGroupName(section)
				}))
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)
router.get('/my-classes',
	restrictToStudent,
	(req, res) => {
		const student: StudentInstance = req.user
		const {id} = student
		Student.findOne({
			attributes: [],
			include: [{
				model: Group,
				attributes: ['id', 'name'],
				include: [{
					model: Section,
					attributes: ['number'],
					include: [{
						model: Course,
						attributes: ['name']
					}]
				}]
			}],
			where: {id}
		})
			.then(student => {
				if (student === null) throw new Error('No student with id: ' + id)
				const response: AssignmentGroup[] = student.groups.map(group => ({
					editPrivileges: false,
					id: group.id as number,
					name: group.section ? sectionGroupName(group.section) : group.name as string
				}))
				response.sort((group1, group2) => {
					const name1 = group1.name.toLowerCase()
					const name2 = group2.name.toLowerCase()
					if (name1 < name2) return -1
					else if (name1 > name2) return 1
					else return 0
				})
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)
function containsCaseInsensitive(column: string, search: string) {
	return Sequelize.where(
		Sequelize.fn('strpos', Sequelize.fn('lower', Sequelize.col(column)), search.toLowerCase()),
		{$ne: 0}
	)
}
router.post('/search-groups',
	restrictToTeacher, //students aren't allowed to look at groups besides the one they're in
	bodyParser.json(),
	(req, res) => {
		const {nameSearch} = req.body as GroupQuery
		const findSectionGroups = Course.findAll({
			where: containsCaseInsensitive('course.name', nameSearch) as Sequelize.WhereOptions<CourseAttributes>,
			attributes: ['name'],
			include: [{
				model: Section,
				attributes: ['number'],
				include: [{
					model: Group,
					attributes: ['id']
				}]
			}],
			order: ['name']
		})
		const findExtraGroups = Group.findAll({
			where: Sequelize.and(
				{sectionId: null},
				containsCaseInsensitive('name', nameSearch)
			) as Sequelize.WhereOptions<GroupAttributes>,
			attributes: ['id', 'name']
		})
		Promise.all([findSectionGroups, findExtraGroups])
			.then(([courses, groups]) => {
				const response: AddGroup[] = groups.map(group => ({
					id: group.id as number,
					name: group.name as string,
					extracurricular: true
				}))
				for (const course of courses) {
					if (!course.sections) continue //should never occur
					course.sections.sort((section1, section2) => //can't order on included model in Sequelize query
						(section1.number as number) - (section2.number as number)
					)
					for (const section of course.sections) {
						section.course = course
						response.push({
							id: section.group.id as number,
							name: sectionGroupName(section),
							extracurricular: false
						})
					}
				}
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)
router.post('/new',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const teacher: TeacherInstance = req.user
		const {due, groupId, major, name, visitors} = req.body as AddAssignment
		Group.findOne({
			attributes: [],
			where: {id: groupId},
			include: [{
				model: Section,
				attributes: ['teacherId']
			}]
		})
			.then(group => {
				if (group === null) throw new Error('No group with id: ' + String(groupId))
				if (group.section && group.section.teacherId !== teacher.id) throw new Error('Edit privileges not granted')

				return Assignment.create({
					due: new Date(due),
					groupId,
					name,
					visitors,
					weight: major ? 1 : 0
				})
			})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
router.post('/list',
	restrictToLoggedIn,
	bodyParser.json(),
	(req, res) => {
		const {groupId, year, month, date, days} = req.body as AssignmentListRequest
		const startDate = new Date(year, month, date) //midnight of start of day, in this timezone
		const extendedStartDate = new ExtendedDate(startDate)
		const endDate = extendedStartDate.addDays(days) //exclusive
		Assignment.findAll({
			attributes: ['id', 'due', 'name', 'visitors', 'weight'],
			where: {
				groupId,
				due: {
					$gte: startDate,
					$lt: endDate.date
				}
			}
		})
			.then(assignments => {
				const response: Assignments = assignments.map(assignment => ({
					day: new ExtendedDate(assignment.due).daysSince(extendedStartDate.toUTC()) + 1,
					id: assignment.id as number,
					name: assignment.name,
					visitors: assignment.visitors,
					weight: assignment.weight
				}))
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)
router.delete('/:id',
	restrictToTeacher,
	(req, res) => {
		const teacher: TeacherInstance = req.user
		const id = Number(req.params.id)
		Assignment.findOne({
			attributes: ['id'],
			include: [{
				model: Group,
				attributes: ['id'],
				include: [{
					model: Section,
					attributes: ['teacherId']
				}]
			}],
			where: {id}
		})
			.then(assignment => {
				if (assignment === null) throw new Error('No assignment with id: ' + String(id))
				const {section} = assignment.group
				if (section && section.teacherId !== teacher.id) throw new Error('Edit privileges not granted')
				return assignment.destroy()
			})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)

export default router
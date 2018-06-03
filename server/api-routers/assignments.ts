import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {
	AddAssignment,
	AssignmentGroup,
	AssignmentListRequest,
	Assignments,
	AtFaultViolation,
	CheckAssignment,
	CourseList,
	DayGroupWarnings,
	EditAssignment,
	GroupWarningIndices,
	GroupWarnings,
	WarningListRequest,
	LimitViolation,
	NoVisitorsRequest,
	NoVisitorsResponse,
	OtherSection,
	StudentWarning,
	GroupQuery
} from '../../api'
import {error, success} from '../api-respond'
import {restrictToLoggedIn, restrictToStudent, restrictToTeacher} from '../api-restrict'
import {DAY_ABBREVIATIONS} from '../csv-import/meeting-times'
import {checkAddition, getWarning, violationsForTeacher} from '../limit-check'
import {Assignment, Course, Group, Section, Student, Teacher} from '../models'
import {CourseAttributes} from '../models/course'
import {SectionAttributes} from '../models/section'
import {StudentInstance} from '../models/student'
import {TeacherInstance} from '../models/teacher'
import sectionGroupName from '../section-group-name'
import ExtendedDate from '../../util/extended-date'

function getSectionsForTeacher(requestingTeacher: string, teacherId: string, res: express.Response): void {
	getSections(requestingTeacher, {teacherId}, res)
}
function getSections(requestingTeacher: string, where: Sequelize.WhereOptions<SectionAttributes>, res: express.Response): void {
	Section.findAll({
		attributes: ['number', 'teacherId'],
		where,
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
				editPrivileges: section.teacherId! === requestingTeacher,
				id: section.group.id!,
				name: sectionGroupName(section)
			}))
			success(res, response)
		})
		.catch(error(res))
}

//Gets the period number of a section with the given period string on a given day.
//Returns 0 if section does not meet on that day.
function getPeriod(date: Date, periods: string | undefined): number {
	if (!periods) return 0 //place unknown periods at the start
	const abbreviation = DAY_ABBREVIATIONS[date.getDay()]
	if (!abbreviation) throw new Error('Assignment not on M-F?')
	let periodStart = periods.indexOf(abbreviation)
	if (periodStart === -1) return 0 //unknown period
	periodStart += abbreviation.length //index of start of period number
	let periodEnd = periods.indexOf(',', periodStart)
	if (periodEnd === -1) periodEnd = periods.length
	return Number(periods.substring(periodStart, periodEnd))
}
//Comparison function for strings
const sortStrings = (s1: string, s2: string): number =>
	(s1 < s2) ? -1 :
	(s1 > s2) ? +1 :
	             0

const router = express.Router()
router.get('/my-displayed',
	restrictToTeacher,
	(req, res) => {
		const {id} = req.user as TeacherInstance
		Teacher.findOne({
			attributes: [],
			where: {id},
			include: [{
				model: Group,
				attributes: ['id', 'name'],
				include: [{
					model: Section,
					attributes: ['number', 'teacherId'],
					include: [{
						model: Course,
						attributes: ['name']
					}]
				}]
			}]
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No teacher with id: ' + id)
				if (!teacher.groups.length) return getSectionsForTeacher(id, id, res)
				const response: AssignmentGroup[] = teacher.groups.map(({section, name, id: groupId}) => ({
					editPrivileges: section ? section.teacherId! === id : true,
					id: groupId!,
					name: section ? sectionGroupName(section) : name!
				}))
				success(res, response)
			})
			.catch(error(res))
	}
)
router.post('/my-displayed/:groupId',
	restrictToTeacher,
	(req, res) => {
		const groupId = req.params.groupId as number
		Group.findOne({
			attributes: ['id'],
			where: {id: groupId}
		})
			.then(group => {
				if (group === null) throw new Error('No group with id: ' + String(groupId))
				return (req.user as TeacherInstance).addGroup(group)
			})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.delete('/my-displayed/:groupId',
	restrictToTeacher,
	(req, res) => {
		const groupId = req.params.groupId as number
		Group.findOne({
			attributes: ['id'],
			where: {id: groupId}
		})
			.then(group => {
				if (group === null) throw new Error('No group with id: ' + String(groupId))
				return (req.user as TeacherInstance).removeGroup(group)
			})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.get('/my-sections',
	restrictToTeacher,
	(req, res) => {
		const {id} = req.user as TeacherInstance
		getSectionsForTeacher(id, id, res)
	}
)
router.get('/teacher-sections/:teacherId',
	restrictToTeacher,
	(req, res) =>
		getSectionsForTeacher((req.user as TeacherInstance).id, req.params.teacherId as string, res)
)
router.get('/list-courses',
	restrictToTeacher,
	(_, res) =>
		Course.findAll({
			attributes: ['id', 'name'],
			order: ['name']
		})
			.then(courses => {
				const response: CourseList = courses.map(({id, name}) => ({id, name}))
				success(res, response)
			})
			.catch(error(res))
)
router.get('/course-sections/:courseId',
	restrictToTeacher,
	(req, res) => {
		const courseId = req.params.courseId as string
		getSections((req.user as TeacherInstance).id, {courseId}, res)
	}
)
router.get('/my-classes',
	restrictToStudent,
	(req, res) => {
		const student: StudentInstance = req.user as StudentInstance
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
					id: group.id!,
					name: group.section ? sectionGroupName(group.section) : group.name!
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
			.catch(error(res))
	}
)
function containsCaseInsensitive(column: string, search: string) {
	return Sequelize.where(
		Sequelize.fn('strpos', Sequelize.fn('lower', Sequelize.col(column)), search.toLowerCase()),
		{[Sequelize.Op.ne]: 0}
	)
}
router.post('/search-groups',
	restrictToTeacher, //students aren't allowed to look at groups besides the one they're in
	bodyParser.json(),
	(req, res) => {
		const teacherId = (req.user as TeacherInstance).id
		const {nameSearch} = req.body as GroupQuery
		const findSectionGroups = Course.findAll({
			where: containsCaseInsensitive('course.name', nameSearch) as Sequelize.WhereOptions<CourseAttributes>,
			attributes: ['name'],
			include: [{
				model: Section,
				attributes: ['number', 'teacherId'],
				include: [{
					model: Group,
					attributes: ['id']
				}]
			}],
			order: ['name']
		})
		const findExtraGroups = Group.findAll({
			where: {
				[Sequelize.Op.and]: [
					{sectionId: null},
					containsCaseInsensitive('name', nameSearch)
				]
			},
			attributes: ['id', 'name']
		})
		Promise.all([findSectionGroups, findExtraGroups])
			.then(([courses, groups]) => {
				const response: AssignmentGroup[] = groups.map(group => ({
					id: group.id as number,
					name: group.name as string,
					editPrivileges: true
				}))
				for (const course of courses) {
					if (!course.sections) continue //should never occur
					course.sections.sort((section1, section2) => //can't order on included model in Sequelize query
						(section1.number as number) - (section2.number as number)
					)
					for (const section of course.sections) {
						section.course = course
						response.push({
							id: section.group.id!,
							name: sectionGroupName(section),
							editPrivileges: section.teacherId === teacherId
						})
					}
				}
				success(res, response)
			})
			.catch(error(res))
	}
)
const getWeight = (major: boolean) => major ? 1 : 0
router.post('/check-limit',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const {due, groupIds, major} = req.body as CheckAssignment
		const violationsPromise = major
			? Promise.all(groupIds.map(groupId =>
					checkAddition(
						new ExtendedDate(due).fromUTC(),
						getWeight(major),
						groupId
					)
				))
					.then(groupViolations =>
						([] as LimitViolation[]).concat(...groupViolations)
					)
			: Promise.resolve([])
		violationsPromise
			.then((violations: LimitViolation[]) => success(res, violations))
			.catch(error(res))
	}
)
router.post('/new',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const teacher: TeacherInstance = req.user as TeacherInstance
		const {due, groupIds, major, name, visitors} = req.body as AddAssignment
		Group.findAll({
			attributes: ['id'],
			where: {
				id: {[Sequelize.Op.in]: groupIds}
			},
			include: [{
				model: Section,
				attributes: ['teacherId']
			}]
		})
			.then(groups => {
				const creationPromises: PromiseLike<any>[] = []
				for (const group of groups) {
					if (group.section && group.section.teacherId !== teacher.id) throw new Error('Edit privileges not granted')

					creationPromises.push(
						Assignment.create({
							due: new ExtendedDate(due).fromUTC().date,
							groupId: group.id!,
							name,
							visitors,
							weight: getWeight(major)
						})
					)
				}
				return Promise.all(creationPromises)
			})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.post('/edit',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const teacher: TeacherInstance = req.user as TeacherInstance
		const {id, name, visitors} = req.body as EditAssignment
		Assignment.findOne({
			attributes: ['id'],
			where: {id},
			include: [{
				model: Group,
				attributes: ['id'],
				include: [{
					model: Section,
					attributes: ['teacherId']
				}]
			}]
		})
			.then(assignment => {
				if (assignment === null) throw new Error('No assignment with id: ' + String(id))
				const {group} = assignment
				if (group.section && group.section.teacherId !== teacher.id) throw new Error('Edit privileges not granted')

				assignment.name = name
				assignment.visitors = visitors
				return assignment.save()
			})
			.then(() => success(res))
			.catch(error(res))
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
					[Sequelize.Op.gte]: startDate,
					[Sequelize.Op.lt]: endDate.date
				}
			},
			order: ['createdAt']
		})
			.then(assignments =>
				assignments.map(assignment => ({
					day: new ExtendedDate(assignment.due).daysSince(extendedStartDate.toUTC()) + 1,
					id: assignment.id!,
					name: assignment.name,
					visitors: assignment.visitors,
					weight: assignment.weight
				}))
			)
			.then((response: Assignments) => success(res, response))
			.catch(error(res))
	}
)
router.post('/warnings',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const {groupIds, year, month, date, days} = req.body as WarningListRequest
		const startDate = new ExtendedDate(year, month, date)
		Group.findAll({
			attributes: ['id'],
			where: {
				id: {[Sequelize.Op.in]: groupIds}
			},
			include: [{
				model: Student,
				attributes: ['id']
			}]
		})
			.then(groups => {
				const studentIds = new Set<string>()
				const memberships = new Map<string, Set<number>>() //map of student ids to sets of group ids
				for (const {id: groupId, students} of groups) {
					for (const {id: studentId} of students!) {
						studentIds.add(studentId)
						let studentGroups = memberships.get(studentId)
						if (!studentGroups) {
							studentGroups = new Set
							memberships.set(studentId, studentGroups)
						}
						studentGroups.add(groupId!)
					}
				}
				const studentIdArray = [...studentIds]
				const dayPromises: Promise<DayGroupWarnings>[] = []
				for (let day = 0; day < days; day++) {
					dayPromises[day] = getWarning(startDate.addDays(day), studentIdArray)
						.then(studentWarningMap => {
							const groups: GroupWarningIndices = {}
							const warnings: StudentWarning[] = []
							for (const [studentId, warningMatched] of studentWarningMap) {
								const warningIndex = warnings.length
								warnings.push({
									assignments: warningMatched.assignments,
									color: warningMatched.color,
									student: warningMatched.studentName,
									weight: warningMatched.weight
								})
								for (const groupId of memberships.get(studentId)!) {
									let groupWarningIndices = groups[groupId]
									if (!groupWarningIndices) {
										groupWarningIndices = []
										groups[groupId] = groupWarningIndices
									}
									groupWarningIndices.push(warningIndex)
								}
							}
							return {groups, warnings}
						})
				}
				return Promise.all(dayPromises)
			})
				.then((response: GroupWarnings) => success(res, response))
				.catch(error(res))
	}
)
router.delete('/:id',
	restrictToTeacher,
	(req, res) => {
		const teacher: TeacherInstance = req.user as TeacherInstance
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
			.catch(error(res))
	}
)
router.post('/no-visitors',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const {year, month, date, days} = req.body as NoVisitorsRequest
		const startDate = new ExtendedDate(year, month, date)
		const endDate = startDate.addDays(days).date
		Assignment.findAll({
			attributes: ['due'],
			where: {
				due: {
					[Sequelize.Op.gte]: startDate.date,
					[Sequelize.Op.lt]: endDate
				},
				visitors: false
			},
			include: [{
				model: Group,
				attributes: ['id', 'name'],
				include: [{
					model: Section,
					attributes: ['number', 'periods'],
					include: [{
						model: Course,
						attributes: ['name']
					}]
				}]
			}]
		})
			.then(assignments => {
				const groupPeriods = new Map<string, string>() //map of group names to group period strings
				const daysGroups: Set<string>[] = new Array(days) //set of group names with assignments on a given day
					.fill(0 as any).map(_ => new Set)
				for (const {due, group} of assignments) {
					const day = ExtendedDate.fromYYYYMMDD(due).daysSince(startDate)
					const {name, section} = group
					const groupName = section ? sectionGroupName(section) : name!
					if (!groupPeriods.has(groupName) && section) {
						const {periods} = section
						if (periods) groupPeriods.set(groupName, periods)
					}
					daysGroups[day].add(groupName) //ensure no group is listed twice on the same day
				}
				const response: NoVisitorsResponse = {
					days: daysGroups.map((groups, day) => {
						const {date} = startDate.addDays(day)
						return {
							groups: [...groups]
								.sort((group1, group2) => //sort by period, then group name
									(getPeriod(date, groupPeriods.get(group1)) - getPeriod(date, groupPeriods.get(group2))) ||
									sortStrings(group1, group2)
								)
								.map(group => ({
									name: group,
									periods: groupPeriods.get(group) || ''
								}))
						}
					})
				}
				success(res, response)
			})
			.catch(error(res))
	}
)
router.get('/other-sections/:groupId',
	restrictToTeacher,
	(req, res) => {
		const teacherId = (req.user as TeacherInstance).id
		const groupId = Number(req.params.groupId)
		Group.findOne({
			attributes: [],
			where: {id: groupId},
			include: [{
				model: Section,
				attributes: ['courseId', 'number']
			}]
		})
			.then(group => {
				if (group === null) throw new Error('No group with id: ' + String(groupId))
				const {section} = group
				if (section === null) return Promise.resolve([])

				return Section.findAll({
					attributes: ['number'],
					where: {
						courseId: section.courseId!,
						number: {[Sequelize.Op.ne]: section.number!},
						teacherId
					},
					include: [{
						model: Group,
						attributes: ['id']
					}],
					order: ['number']
				})
					.then(sections =>
						sections.map(({group, number}) => ({
							groupId: group.id!,
							number: number!
						}))
					)
			})
			.then((response: OtherSection[]) => success(res, response))
			.catch(error(res))
	}
)
router.get('/my-violations',
	restrictToTeacher,
	(req, res) => {
		const teacherId = (req.user as TeacherInstance).id
		violationsForTeacher(teacherId)
			.then((response: AtFaultViolation[]) => success(res, response))
			.catch(error(res))
	}
)

export default router
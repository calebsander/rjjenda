import {Op} from 'sequelize'
import {AtFaultViolation, LimitViolation} from '../api'
import {Assignment, Course, Limit, GradeGroup, Group, Section, Student, Teacher, Warning} from './models'
import {AssignmentInstance} from './models/assignment'
import {TeacherInstance} from './models/teacher'
import {StudentInstance} from './models/student'
import ExtendedDate from '../util/extended-date'

interface Settings {
	emailDomain: string
}
const {emailDomain}: Settings = require('../settings.json')
function getEmail(username: string) {
	return username + '@' + emailDomain
}

interface GroupInfo {
	id: number
	name: string
	teacher: string | null
}
interface StudentGroupsInfo {
	id: string
	name: string
	email?: string
	advisorEmail?: string
	groups: GroupInfo[]
}
function teacherSuffix(teacher: TeacherInstance) {
	return ' - ' + teacher.lastName
}
function getStudentGroupsInfo({id, firstName, lastName, groups, username, advisor}: StudentInstance): StudentGroupsInfo {
	return {
		id,
		name: firstName + ' ' + lastName,
		groups: groups.map(({id, name, section}) => ({
			id: id!,
			name: section ? section.course.name + teacherSuffix(section.teacher!) : (name || ''),
			teacher: section && section.teacher && section.teacher.lastName
		})),
		email: username ? getEmail(username) : undefined,
		advisorEmail: advisor ? getEmail(advisor.username) : undefined
	}
}
function assignmentName(groupNames: Map<number, string>, includeDate: boolean): (assignment: AssignmentInstance) => string {
	return ({name, groupId, due, weight}: AssignmentInstance): string => {
		let dateString: string
		if (includeDate) {
			const [, m, d] = due.split('-')
			dateString = ' on ' + m + '/' + d
		}
		else dateString = ''
		return name +
			' (' + groupNames.get(groupId)! + ')' +
			dateString +
			(weight ? '' : ' - minor')
	}
}

export function checkAddition(day: ExtendedDate, newWeight: number, groupId: number): Promise<LimitViolation[]> {
	return checkRange(day, day, newWeight, groupId)
		.then(violations => {
			for (const violation of violations) delete violation.fault
			return violations
		})
}
export function getAllViolations(): Promise<AtFaultViolation[]> {
	return Promise.resolve(
		GradeGroup.findOne({
			attributes: ['groupId'],
			where: {year: null}
		})
			.then(allStudentsGroup => {
				if (allStudentsGroup === null) throw new Error('No all-school group')
				return violationsForStudentsInGroup(allStudentsGroup.groupId!)
			})
	)
}
export function violationsForTeacher(teacherId: string): Promise<AtFaultViolation[]> {
	const violations = Section.findAll({
		attributes: [],
		where: {teacherId},
		include: [{
			model: Group,
			attributes: ['id']
		}]
	})
		.then(sections => {
			const groupIds = sections.map(section => section.group.id!)
			return Promise.all(groupIds.map(violationsForStudentsInGroup))
		})
	const teacher = Teacher.findOne({
		attributes: ['lastName'],
		where: {id: teacherId}
	})
	return Promise.all([violations, teacher])
		.then(([groupsViolations, teacher]) => {
			if (teacher === null) throw new Error('No teacher with id: ' + teacherId)

			const teacherNameSearch = teacherSuffix(teacher)
			const violations: AtFaultViolation[] = []
			const addedViolationIds = new Set<string>()
			for (const groupViolations of groupsViolations) {
				violations.push(...groupViolations.filter(violation => {
					//We need to check that we don't include the same violation twice,
					//which could happen if two of the assignments come from different classes
					//both taught by the teacher
					const violationId = violation.student + ',' + violation.start + ',' + violation.end
					const alreadyAdded = addedViolationIds.has(violationId)
					if (alreadyAdded) return false
					else {
						addedViolationIds.add(violationId)
						return violation.assignments.some(assignment => assignment.includes(teacherNameSearch))
					}
				}))
			}
			sortViolationsByDate(violations)
			return Promise.resolve(violations)
		})
}
function violationsForStudentsInGroup(groupId: number): Promise<AtFaultViolation[]> {
	const minAssignmentDay = Assignment.min('due', {
		where: {
			weight: {[Op.gt]: 0}
		}
	})
		.then((date: string) => {
			return Promise.resolve(new ExtendedDate(date).fromUTC())
		})
	const maxAssignmentDay = Assignment.max('due', {
		where: {
			weight: {[Op.gt]: 0}
		}
	})
		.then((date: string) => {
			return Promise.resolve(new ExtendedDate(date).fromUTC())
		})
	return Promise.all([minAssignmentDay, maxAssignmentDay])
		.then(([start, end]) => {
			const now = new ExtendedDate().toDayStart()
			let boundedStart: ExtendedDate
			if (now.toYYYYMMDD() > start.toYYYYMMDD()) boundedStart = now
			else boundedStart = start
			return checkRange(boundedStart, end, 0, groupId)
		})
}
function argmax(arr: number[]): number {
	let maxIndex = -1
	let max: number | undefined = undefined
	for (let i = 0; i < arr.length; i++) {
		const value = arr[i]
		if (maxIndex === -1 || value > max!) {
			maxIndex = i
			max = value
		}
	}
	return maxIndex
}
function sortViolationsByDate(violations: AtFaultViolation[]): void {
	violations.sort((violation1, violation2) => {
		for (const date of ['start', 'end'] as ('start' | 'end')[]) {
			const [m1, d1] = violation1[date].split('/')
			const [m2, d2] = violation2[date].split('/')
			if (m1 !== m2) return Number(m1) - Number(m2)
			if (d1 !== d2) return Number(d1) - Number(d2)
		}
		return 0
	})
}
/**
 * Gets all violations of limits that would result
 * from adding a new assignment on any day in the given range with the given weight.
 * General strategy:
 * - Get all limits
 * - Get all students in the group and all the other groups they are in
 * - Get all assignments for those groups on all days
 * that lie in some overlapping limit window
 * - Check (for each student, for each limit, for each possible start day)
 * whether the limit weight would be matched
 */
function checkRange(start: ExtendedDate, end: ExtendedDate, newWeight: number, groupId: number): Promise<AtFaultViolation[]> {
	return Promise.resolve(
		Limit.findAll({
			attributes: ['days', 'assignmentWeight']
		})
			.then(limits => {
				const maxDays = Math.max(...limits.map(({days}) => days))
				const studentsAndOtherGroups = Group.findOne({
					attributes: [],
					where: {id: groupId},
					include: [{
						model: Student,
						attributes: ['firstName', 'lastName', 'username'],
						include: [
							{
								model: Group,
								attributes: ['id', 'name'],
								include: [{ //in order to be able to get the names of section groups
									model: Section,
									attributes: ['number'],
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
								}]
							},
							{
								model: Teacher,
								as: 'advisor',
								attributes: ['username']
							}
						]
					}]
				})
					.then(group => {
						if (group === null) throw new Error('No group with id ' + String(groupId))
						return Promise.resolve(group.students!.map(getStudentGroupsInfo))
					})
				return studentsAndOtherGroups.then(students => {
					const groupNames = new Map<number, string>() //map of ids to group names
					const groupTeachers = new Map<number, string | null>() //map of ids to teacher last names
					for (const student of students) {
						for (const group of student.groups) {
							groupNames.set(group.id, group.name)
							groupTeachers.set(group.id, group.teacher)
						}
					}
					const allAssignments = Assignment.findAll({
						attributes: ['due', 'groupId', 'name', 'weight', 'createdAt'],
						order: ['createdAt'],
						where: {
							groupId: {
								[Op.in]: Array.from(groupNames.keys())
							},
							due: {
								[Op.gt]: start.addDays(-maxDays).date,
								[Op.lt]: end.addDays(+maxDays).date
							},
							weight: {[Op.gt]: 0}
						}
					})
					return allAssignments.then(assignments => {
						const endYYYYMMDD = end.toYYYYMMDD()
						const violations: AtFaultViolation[] = []
						for (const student of students) {
							const groups = new Set(student.groups.map(({id}) => id))
							const studentAssignments = assignments.filter(assignment => groups.has(assignment.groupId))
							const dayAssignments = new Map<string, AssignmentInstance[]>() //map of YYYY-MM-DDs to lists of assignments
							for (const assignment of studentAssignments) {
								let day = dayAssignments.get(assignment.due)
								if (!day) {
									day = []
									dayAssignments.set(assignment.due, day)
								}
								day.push(assignment)
							}
							for (const limit of limits) {
								const assignmentsRange = end.daysSince(start)
								const dayRange = limit.days - 1
								for (let windowStartDay = -dayRange; windowStartDay <= assignmentsRange; windowStartDay++) {
									const extendedWindowStart = start.addDays(windowStartDay)
									const windowStartYYYYMMDD = extendedWindowStart.toYYYYMMDD()
									const extendedWindowEnd = extendedWindowStart.addDays(dayRange)
									const windowEndYYYYMMDD = extendedWindowEnd.toYYYYMMDD()
									const assignmentsInRange: AssignmentInstance[] = []
									for (let day = extendedWindowStart; day.toYYYYMMDD() <= windowEndYYYYMMDD; day = day.addDays(1)) {
										assignmentsInRange.push(...(dayAssignments.get(day.toYYYYMMDD()) || []))
									}
									//Prevents returning multiple violations for the same set of assignments
									//if they lie in a smaller window that the limit window,
									//since starting on the next day will yield the same violation
									if (
										windowStartYYYYMMDD < endYYYYMMDD &&
										assignmentsInRange.length &&
										assignmentsInRange[0].due !== windowStartYYYYMMDD
									) continue

									const weightSum = assignmentsInRange
										.map(({weight}) => weight)
										.reduce((a, b) => a + b, 0)
										+ newWeight
									if (weightSum >= limit.assignmentWeight) {
										const assignmentCreationTimes = assignmentsInRange.map(
											({createdAt}) => createdAt.getTime()
										)
										const lastCreated = assignmentsInRange[argmax(assignmentCreationTimes)].groupId
										const faultGroupName = groupNames.get(lastCreated)!
										violations.push({
											days: limit.days,
											start: extendedWindowStart.toShortDate(),
											end: extendedWindowEnd.toShortDate(),
											student: student.name,
											assignments: assignmentsInRange.map(assignmentName(groupNames, limit.days > 1)),
											fault: faultGroupName,
											studentEmail: student.email!,
											advisorEmail: student.advisorEmail
										})
									}
								}
							}
						}
						sortViolationsByDate(violations)
						return Promise.resolve(violations)
					})
				})
			})
	)
}

export interface WarningMatched {
	assignments: string[]
	color: string
	studentId: string
	studentName: string
	weight: number
}
export function getWarning(day: ExtendedDate, studentIds: string[]): Promise<Map<string, WarningMatched>> {
	const studentsAndGroups = Student.findAll({
		attributes: ['id', 'firstName', 'lastName'],
		where: {
			id: {[Op.in]: studentIds}
		},
		include: [{
			model: Group,
			attributes: ['id', 'name'],
			include: [
				{ //in order to be able to get the names of section groups
					model: Section,
					attributes: ['number'],
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
				}
			]
		}]
	})
		.then(students =>
			Promise.resolve(students.map(getStudentGroupsInfo))
		)
	const studentWarningMapPromise = studentsAndGroups.then(students => {
		const groupNames = new Map<number, string>() //map of ids to group names
		for (const student of students) {
			for (const group of student.groups) groupNames.set(group.id, group.name)
		}
		const allAssignments = Assignment.findAll({
			attributes: ['name', 'weight', 'groupId'],
			order: ['createdAt'],
			where: {
				groupId: {
					[Op.in]: Array.from(groupNames.keys())
				},
				due: day.date
			}
		})
		return allAssignments.then(assignments => {
			const studentWarningPromises: PromiseLike<WarningMatched | null>[] = []
			for (const student of students) {
				const studentGroups = new Set(student.groups.map(({id}) => id))
				const studentAssignments = assignments.filter(({groupId}) => studentGroups.has(groupId))
				const weightSum = studentAssignments.reduce((sum, {weight}) => sum + weight, 0)
				const noWarningMatched = Promise.resolve(null)
				const studentWarningPromise = studentAssignments.length
					? Warning.findOne({
							attributes: ['color', 'assignmentWeight'],
							where: {
								assignmentWeight: {[Op.lte]: weightSum}
							},
							order: [['assignmentWeight', 'DESC']]
						})
							.then(warning =>
								warning
									? Promise.resolve<WarningMatched>({
											assignments: studentAssignments.map(assignmentName(groupNames, false)),
											color: warning.color,
											studentId: student.id,
											studentName: student.name,
											weight: warning.assignmentWeight
										})
									: noWarningMatched
							)
					: noWarningMatched
				studentWarningPromises.push(studentWarningPromise)
			}
			return Promise.all(studentWarningPromises)
				.then(studentWarnings => {
					const studentWarningMap = new Map<string, WarningMatched>() //map of student ids to warnings
					for (const studentWarning of studentWarnings) {
						if (!studentWarning) continue

						studentWarningMap.set(studentWarning.studentId, studentWarning)
					}
					return Promise.resolve(studentWarningMap)
				})
		})
	})
	return Promise.resolve(studentWarningMapPromise)
}
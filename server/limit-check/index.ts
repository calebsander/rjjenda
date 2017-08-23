import {AtFaultViolation, LimitViolation} from '../../api'
import {Assignment, Course, Limit, GradeGroup, Group, Info, Section, Student, Teacher} from '../models'
import {AssignmentInstance} from '../models/assignment'
import {StudentInstance} from '../models/student'
import ExtendedDate from '../../util/extended-date'

interface Settings {
	emailDomain: string
}
const {emailDomain}: Settings = require('../../settings.json')
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
function getStudentGroupsInfo({id, firstName, lastName, groups, username, advisor}: StudentInstance): StudentGroupsInfo {
	return {
		id,
		name: firstName + ' ' + lastName,
		groups: groups.map(({id, name, section}) => ({
			id: id!,
			name: section ? section.course.name + ' - ' + section.teacher!.lastName : (name || ''),
			teacher: section && section.teacher && section.teacher.lastName
		})),
		email: username ? getEmail(username) : undefined,
		advisorEmail: advisor ? getEmail(advisor.username) : undefined
	}
}
function assignmentName(groupNames: Map<number, string>): (assignment: AssignmentInstance) => string {
	return({name, groupId}: AssignmentInstance): string => {
		return name + ' (' + groupNames.get(groupId)! + ')'
	}
}

export function checkAddition(day: ExtendedDate, newWeight: number, groupId: number): Promise<LimitViolation[]> {
	return checkRange(day, day, newWeight, groupId)
		.then(violations => Promise.resolve(
			//Keep only the necessary fields
			violations.map(({days, student, assignments, studentEmail, advisorEmail}) =>
					({days, student, assignments, studentEmail, advisorEmail})
			)
		))
}
export function getAllViolations(): Promise<AtFaultViolation[]> {
	const minAssignmentDay = Assignment.min('due', {
		where: {
			weight: {$gt: 0}
		}
	})
		.then((date: string) => {
			return Promise.resolve(new ExtendedDate(date).fromUTC())
		})
	const maxAssignmentDay = Assignment.max('due', {
		where: {
			weight: {$gt: 0}
		}
	})
		.then((date: string) => {
			return Promise.resolve(new ExtendedDate(date).fromUTC())
		})
	const allStudentsGroupId = GradeGroup.findOne({
		attributes: ['groupId'],
		where: {year: null}
	})
		.then(allStudentsGroup => {
			if (allStudentsGroup === null) throw new Error('No all-school group')
			return Promise.resolve(allStudentsGroup.groupId!)
		})
	return Promise.all([minAssignmentDay, maxAssignmentDay, allStudentsGroupId])
		.then(([start, end, groupId]) =>
			checkRange(start, end, 0, groupId)
		)
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
						attributes: ['due', 'groupId', 'name', 'weight', 'updatedAt'],
						order: ['createdAt'],
						where: {
							groupId: {
								$in: Array.from(groupNames.keys())
							},
							due: {
								$gt: start.addDays(-maxDays).date,
								$lt: end.addDays(+maxDays).date
							},
							weight: {$gt: 0}
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
									const windowEndYYYYMMDD = extendedWindowStart.addDays(dayRange).toYYYYMMDD()
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
										const assignmentUpdatedTimes = assignmentsInRange.map(
											({updatedAt}) => updatedAt.getTime()
										)
										const lastUpdated = assignmentsInRange[argmax(assignmentUpdatedTimes)].groupId
										const faultGroupName = groupNames.get(lastUpdated)!
										const faultTeacher = groupTeachers.get(lastUpdated)
										violations.push({
											days: limit.days,
											student: student.name,
											assignments: assignmentsInRange.map(assignmentName(groupNames)),
											fault: faultGroupName +
												(faultTeacher ? ' (' + faultTeacher + ')' : ''),
											studentEmail: student.email!,
											advisorEmail: student.advisorEmail
										})
									}
								}
							}
						}
						return Promise.resolve(violations)
					})
				})
			})
	)
}

export interface InfoMatched {
	assignments: string[]
	color: string
	studentId: string
	studentName: string
	weight: number
}
export function getInfo(day: ExtendedDate, studentIds: string[]): Promise<Map<string, InfoMatched>> {
	const studentsAndGroups = Student.findAll({
		attributes: ['id', 'firstName', 'lastName'],
		where: {
			id: {$in: studentIds}
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
	const studentInfoMapPromise = studentsAndGroups.then(students => {
		const groupNames = new Map<number, string>() //map of ids to group names
		for (const student of students) {
			for (const group of student.groups) groupNames.set(group.id, group.name)
		}
		const allAssignments = Assignment.findAll({
			attributes: ['name', 'weight', 'groupId'],
			order: ['createdAt'],
			where: {
				groupId: {
					$in: Array.from(groupNames.keys())
				},
				due: day.date,
				weight: {$gt: 0}
			}
		})
		return allAssignments.then(assignments => {
			const studentInfoPromises: PromiseLike<InfoMatched | null>[] = []
			for (const student of students) {
				const groups = new Set(student.groups.map(({id}) => id))
				const studentAssignments = assignments.filter(assignment => groups.has(assignment.groupId))
				const weightSum = studentAssignments.reduce((sum, {weight}) => sum + weight, 0)
				const noInfoMatched = Promise.resolve(null)
				let studentInfoPromise: PromiseLike<InfoMatched | null>
				if (weightSum) {
					studentInfoPromise = Info.findAll({
						attributes: ['color', 'assignmentWeight'],
						where: {
							assignmentWeight: {$lte: weightSum}
						}
					})
						.then(infos => {
							if (!infos.length) return noInfoMatched
							const greatestInfoIndex = argmax(infos.map(info => info.assignmentWeight))
							const greatestInfo = infos[greatestInfoIndex]
							return Promise.resolve<InfoMatched>({
								assignments: studentAssignments.map(assignmentName(groupNames)),
								color: greatestInfo.color,
								studentId: student.id,
								studentName: student.name,
								weight: greatestInfo.assignmentWeight
							})
						})
				}
				else studentInfoPromise = noInfoMatched
				studentInfoPromises.push(studentInfoPromise)
			}
			return Promise.all(studentInfoPromises)
				.then(studentInfos => {
					const studentInfoMap = new Map<string, InfoMatched>() //map of student ids to infos
					for (const studentInfo of studentInfos) {
						if (!studentInfo) continue

						studentInfoMap.set(studentInfo.studentId, studentInfo)
					}
					return Promise.resolve(studentInfoMap)
				})
		})
	})
	return Promise.resolve(studentInfoMapPromise)
}
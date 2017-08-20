import {LimitViolation} from '../../api'
import {Assignment, Course, Limit, Group, Section, Student} from '../models'
import sectionGroupName from '../section-group-name'
import ExtendedDate from '../../util/extended-date'

/**
 * Gets all violations of limits that would result
 * from adding a new assignment on the given day with the given weight.
 * General strategy:
 * - Get all limits
 * - Get all students in the group and all the other groups they are in
 * - Get all assignments for those groups on all days
 * that lie in some overlapping limit window
 * - Check (for each student, for each limit, for each possible start day)
 * whether the limit weight would be matched
 */
export function checkAddition(day: ExtendedDate, newWeight: number, groupId: number): Promise<LimitViolation[]> {
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
						attributes: ['firstName', 'lastName'],
						include: [{
							model: Group,
							attributes: ['id', 'name'],
							include: [{ //in order to be able to get the names of section groups
								model: Section,
								attributes: ['number'],
								include: [{
									model: Course,
									attributes: ['name']
								}]
							}]
						}]
					}]
				})
					.then(group => {
						if (group === null) throw new Error('No group with id ' + String(groupId))
						return Promise.resolve(
							group.students!.map(({firstName, lastName, groups}) =>
								({
									name: firstName + ' ' + lastName,
									groups: groups.map(({id, section}) => ({
										id: id!,
										name: section ? sectionGroupName(section) : (group.name || '')
									}))
								})
							)
						)
					})
				return studentsAndOtherGroups.then(students => {
					const groupNames = new Map<number, string>() //map of ids to group names
					for (const student of students) {
						for (const group of student.groups) groupNames.set(group.id, group.name)
					}
					const allAssignments = Assignment.findAll({
						attributes: ['due', 'groupId', 'name', 'weight'],
						order: ['due'],
						where: {
							groupId: {
								$in: Array.from(groupNames.keys())
							},
							due: {
								$gt: day.addDays(-maxDays).date,
								$lt: day.addDays(+maxDays).date
							}
						}
					})
					return allAssignments.then(assignments => {
						const dayYYYYMMDD = day.toYYYYMMDD()
						const violations: LimitViolation[] = []
						for (const student of students) {
							const groups = new Set(student.groups.map(({id}) => id))
							for (const limit of limits) {
								const dayRange = limit.days - 1
								for (let startDay = -dayRange; startDay <= 0; startDay++) {
									const extendedStart = day.addDays(startDay)
									const startYYYYMMDD = extendedStart.toYYYYMMDD()
									const endYYYYMMDD = extendedStart.addDays(dayRange).toYYYYMMDD()
									const assignmentsInRange = assignments.filter(assignment => //get assignments for student's classes in day range
										groups.has(assignment.groupId) &&
										startYYYYMMDD <= assignment.due &&
										assignment.due <= endYYYYMMDD &&
										assignment.weight //no point in counting assignments that don't contribute weight
									)
									//Prevents returning multiple violations for the same set of assignments
									//if they lie in a smaller window that the limit window
									if (startYYYYMMDD < dayYYYYMMDD && assignments[0].due !== startYYYYMMDD) continue

									const weightSum = assignmentsInRange
										.map(({weight}) => weight)
										.reduce((a, b) => a + b, 0)
										+ newWeight
									if (weightSum >= limit.assignmentWeight) {
										const [y, m, d] = startYYYYMMDD.split('-')
										violations.push({
											start: m + '/' + d + '/' + y,
											days: limit.days,
											student: student.name,
											assignments: assignmentsInRange
												.map(({name, groupId, due}) => {
													const [y, m, d] = (due as string).split('-')
													return name + ' for ' + groupNames.get(groupId)! + ' on ' + m + '/' + d + '/' + y
												})
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
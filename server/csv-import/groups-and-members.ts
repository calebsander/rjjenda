import {Readable} from 'stream'
import {parse, RowObject} from './csv-parse'
import {Course, Group, Section, Student, Teacher} from '../models'
import {CourseModel} from '../models/course'
import {GroupModel} from '../models/group'
import {StudentModel} from '../models/student'

interface GroupMemberStreams {
	groupStream: Readable
	memberStream: Readable
}
interface Group extends RowObject {
	'Group ID': string
	'Course #': string
	'Course Name': string
	'Section #': string
	'Department': string
}
interface Membership extends RowObject {
	'Group ID': string
	'User ID': string
	'Role(s)': 'Organizer' | 'Student'
}

//Resolves to list of sections referenced by memberships with no group listing
export default ({groupStream, memberStream}: GroupMemberStreams): Promise<string[]> =>
	Promise.all([
		parse(groupStream),
		parse(memberStream),
		Student.findAll({ //we need students to set advisors and group memberships, so get them all in one batch
			attributes: ['id']
		}),
		Course.destroy({where: {}}) //cascades to delete sections, groups, assignments, and memberships
	])
		.then(([groupRows, memberRows, allStudents]) => {
			const groups = groupRows as Group[]
			const courseMap = new Map<string, string>() //mapping of all course numbers to course names
			const advisoryGroups = new Set<string>() //contains all course IDs that correspond to advisories
			for (const group of groups) {
				if (group['Department'] === 'Advisee Groups') { //these are not real courses
					advisoryGroups.add(group['Group ID'])
				}
				else courseMap.set(group['Course #'], group['Course Name']) //even if there are multiple sections, only records one course
			}
			const courseCreationPromises: Promise<unknown>[] = []
			const courseInstanceMap = new Map<string, CourseModel>() //mapping of courses IDs to created instances
			for (const [id, name] of courseMap) {
				courseCreationPromises.push(
					Course.create({
						id,
						name
					})
						.then(course => courseInstanceMap.set(id, course))
				)
			}
			return Promise.all(courseCreationPromises) //create courses before creating sections
				.then(() => {
					const memberships = memberRows as Membership[]
					const sectionTeachers = new Map<string, string>() //mapping of 'COURSE-SECTION' to teacher IDs
					for (const membership of memberships) {
						if (membership['Role(s)'] === 'Organizer') {
							sectionTeachers.set(membership['Group ID'], membership['User ID'])
						}
					}
					const sectionCreationPromises: Promise<unknown>[] = []
					const groupInstanceMap = new Map<string, GroupModel>() //mapping of 'COURSE-SECTION' to created group instances
					for (const [courseSection, teacherId] of sectionTeachers) {
						const [course, section] = courseSection.split('-')
						if (!courseMap.has(course)) continue //must be an advisory "course"

						sectionCreationPromises.push(
							Teacher.findOne({where: {id: teacherId}})
								.then(teacher => {
									if (teacher === null) throw new Error('No such teacher: ' + teacherId)
									const courseInstance = courseInstanceMap.get(course)
									if (courseInstance === undefined) throw new Error('No such course: ' + course)
									return Section.create({
										courseId: courseInstance.id,
										number: Number(section),
										teacherId: teacher.id
									})
										.then(section =>
											Group.create({
												sectionId: section.id as number,
												name: null
											})
												.then(group => groupInstanceMap.set(courseSection, group))
										)
								})
						)
					}
					const studentInstanceMap = new Map<string, StudentModel>()
					for (const student of allStudents) studentInstanceMap.set(student.id, student)
					const groupStudents = new Map<string, string[]>() //mapping of group IDs to lists of all enrolled students
					const advisorSetPromises: Promise<unknown>[] = []
					for (const membership of memberships) {
						if (membership['Role(s)'] === 'Student') {
							const groupId = membership['Group ID']
							const studentId = membership['User ID']
							if (advisoryGroups.has(groupId)) {
								const teacherId = sectionTeachers.get(groupId)
								if (teacherId === undefined) throw new Error('No organizer found for group: ' + groupId)
								const student = studentInstanceMap.get(studentId)
								if (student === undefined) throw new Error('No such student: ' + studentId)
								student.set('advisorId', teacherId)
								advisorSetPromises.push(student.save())
							}
							else {
								let students = groupStudents.get(groupId)
								if (students === undefined) {
									students = []
									groupStudents.set(groupId, students)
								}
								students.push(studentId)
							}
						}
					}
					const membershipsAddPromise = Promise.all(sectionCreationPromises) //groups must be made first
						.then(() => {
							const groupMembersPromises: Promise<void>[] = []
							const missingSections: string[] = [] //list of sections not specified in the section list
							for (const [groupId, students] of groupStudents) {
								const groupInstance = groupInstanceMap.get(groupId)
								if (groupInstance === undefined) { //sections like '721-01' have members but no group info
									missingSections.push(groupId)
									continue
								}

								groupMembersPromises.push(
									groupInstance.setStudents(students.map(studentId => {
										const student = studentInstanceMap.get(studentId)
										if (student === undefined) throw new Error('No such student: ' + studentId)
										return student
									}))
								)
							}
							return Promise.all(groupMembersPromises)
								.then(() => Promise.resolve(missingSections))
						})
					return Promise.all([
						membershipsAddPromise,
						Promise.all(advisorSetPromises)
					])
						.then(([missingSections]) => Promise.resolve(missingSections))
				})
		})
import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Groups, GroupStudent, NewGroupName, NewGroup, StudentQuery} from '../../api'
import {error, success} from '../api-respond'
import {Course, Group, Section, Student, Teacher} from '../models'
import {GroupAttributes, GroupInstance} from '../models/group'
import {SectionInstance} from '../models/section'
import {StudentAttributes, StudentInstance} from '../models/student'
import sectionGroupName from '../section-group-name'

const router = express.Router()

interface FindOptionsIgnoreAttributes<T> extends Sequelize.FindOptions<T> {
	includeIgnoreAttributes?: boolean
}
router.get('/groups', (_, res) => {
	Group.findAll({
		includeIgnoreAttributes: false, //necessary to keep join table attributes out of the SELECT statement
		attributes: [
			'id',
			'name',
			'sectionId',
			[Sequelize.fn('COUNT', Sequelize.col('students.id')), 'studentCount']
		],
		include: [Student],
		group: [Sequelize.col('group.id')]
	} as FindOptionsIgnoreAttributes<GroupAttributes>)
		.then(groups => {
			const responsePromise: Promise<Groups> = Promise.all(
				groups.map(group => {
					let sectionPromise: PromiseLike<SectionInstance | null>
					if (group.sectionId === null) sectionPromise = Promise.resolve(null)
					else {
						sectionPromise = Section.find({ //I was having issues including student count and section in same group query
							attributes: ['number'],
							where: {
								id: group.sectionId
							},
							include: [
								{
									model: Teacher,
									attributes: ['lastName']
								},
								{
									model: Course,
									attributes: ['name']
								}
							]
						})
					}
					return sectionPromise.then(section => ({
						id: group.id as number,
						section: section !== null,
						name:
							section ? sectionGroupName(section) : (group.name || ''),
						teacher: section && section.teacher && section.teacher.lastName,
						studentCount: Number(group.get('studentCount'))
					}))
				})
			)
			return responsePromise
		})
		.then((response: Groups) => {
			response.sort((group1, group2) => { //sort groups by display name, case-insensitive
				const name1 = group1.name.toLowerCase()
				const name2 = group2.name.toLowerCase()
				if (name1 < name2) return -1
				else if (name1 > name2) return 1
				else return 0
			})
			success(res, response)
		})
		.catch(err => error(res, err))
})
router.post('/group/set-name',
	bodyParser.json(),
	(req, res) => {
		const {id, newName} = req.body as NewGroupName
		Group.findOne({
			where: {id}
		})
			.then(group => {
				if (group === null) throw new Error('No group with id: ' + String(id))
				group.set('name', newName)
				return group.save()
			})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
router.get('/group/set-teacher/:groupId/:teacherId', (req, res) => {
	const {groupId, teacherId} = req.params as {[param: string]: string}
	const id = Number(groupId)
	Group.findOne({
		attributes: [],
		where: {id},
		include: [{
			model: Section,
			attributes: ['id']
		}]
	})
		.then(group => {
			if (group === null) throw new Error('No group with id: ' + String(id))
			const section = group.section as SectionInstance
			section.set('teacherId', teacherId)
			return section.save()
		})
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.delete('/group/:id', (req, res) => {
	const id = Number(req.params.id)
	Group.findOne({
		attributes: ['id', 'sectionId'],
		where: {id}
	})
		.then(group => {
			if (group === null) throw new Error('No group with id: ' + String(id))
			if (group.sectionId === null) return group.destroy() as PromiseLike<any>
			else return Section.destroy({where: {id: group.sectionId}}) as PromiseLike<any> //will cascade to delete group as well
		})
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.post('/group',
	bodyParser.json(),
	(req, res) => {
		const {name} = req.body as NewGroup
		Group.create({
			name,
			sectionId: null
		})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
function toGroupStudents(students: StudentInstance[]): GroupStudent[] {
	return students.map(student => ({
		id: student.id,
		name: student.firstName + ' ' + student.lastName
	}))
}
router.get('/list-members/:id', (req, res) => {
	const id = Number(req.params.id)
	Group.findOne({
		attributes: [],
		include: [{
			model: Student,
			attributes: ['id', 'firstName', 'lastName']
		}],
		where: {id},
		order: [
			Sequelize.col('students.lastName'),
			Sequelize.col('students.firstName')
		]
	})
		.then(group => {
			if (group === null) throw new Error('No group with id: ' + String(id))
			const students = group.students
			if (!students) throw new Error('Failed to load students for group with id: ' + String(id))
			const response: GroupStudent[] = toGroupStudents(students)
			success(res, response)
		})
		.catch(err => error(res, err))
})
const FULL_NAME = Sequelize.fn('lower',
	Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName'))
)
router.post('/search-students',
	bodyParser.json(),
	(req, res) => {
		const {nameSearch} = req.body as StudentQuery
		Student.findAll({
			attributes: ['id', 'firstName', 'lastName'],
			where: Sequelize.where(
				Sequelize.fn('strpos', FULL_NAME, nameSearch.toLowerCase()),
				{$ne: 0}
			) as Sequelize.WhereOptions<StudentAttributes>
		})
			.then(students => {
				const response: GroupStudent[] = toGroupStudents(students)
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)
interface GroupAndStudent {
	group: GroupInstance,
	student: StudentInstance
}
function getGroupAndStudent(req: express.Request): Promise<GroupAndStudent> {
	const id = Number(req.params.id)
	const studentId = req.params.studentId as string
	return Promise.all([
		Group.findOne({
			attributes: ['id'],
			where: {id}
		}),
		Student.findOne({
			attributes: ['id'],
			where: {id: studentId}
		})
	])
		.then(([group, student]) => {
			if (group === null) throw new Error('No group with id: ' + String(id))
			if (student === null) throw new Error('No student with id: ' + String(studentId))
			return Promise.resolve({group, student})
		})
}
router.get('/add-member/:id/:studentId', (req, res) => {
	getGroupAndStudent(req)
		.then(({group, student}) => group.addStudent(student))
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.delete('/remove-member/:id/:studentId', (req, res) => {
	getGroupAndStudent(req)
		.then(({group, student}) => group.removeStudent(student))
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
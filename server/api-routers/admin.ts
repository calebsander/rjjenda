import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Students, StudentUpdate, Groups} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import groupsMembersRouter from './groups-members'
import {Course, Group, Section, Student, Teacher} from '../models'
import {GroupAttributes} from '../models/group'
import {SectionInstance} from '../models/section'

const router = express.Router()
router.use(restrictToAdmin)
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.get('/students', (_, res) => {
	Student.findAll({
		attributes: ['id', 'firstName', 'lastName', 'username', 'year'],
		include: [{
			model: Teacher,
			attributes: ['lastName'],
			as: 'advisor'
		}],
		order: [
			['lastName', 'ASC'],
			['firstName', 'ASC']
		]
	})
		.then(students => {
			const response: Students = students.map(({id, firstName, lastName, username, year, advisor}) => {
				return {
					id,
					firstName,
					lastName,
					username,
					year,
					advisor: advisor === null ? '' : advisor.lastName
				}
			})
			success(res, response)
		})
		.catch(err => error(res, err))
})
interface IdParams {
	id: string
}
router.delete('/student/:id', (req, res) => {
	const {id} = req.params as IdParams
	Student.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.post('/student/:id/update',
	bodyParser.json(),
	(req, res) => {
		function update() {
			return Student.findOne({
				attributes: ['id'],
				where: {id}
			})
				.then(student => {
					if (student === null) throw new Error('No such student id: ' + id)
					return student
						.set(attribute, value)
						.save()
				})
				.then(() => success(res))
				.catch(err => error(res, err))
		}
		const {id} = req.params as IdParams
		let {attribute, value} = req.body as StudentUpdate
		if (attribute === 'advisor') {
			Teacher.findOne({
				attributes: ['id'],
				where: {lastName: value}
			})
				.then(teacher => {
					if (teacher === null) throw new Error('No teacher with last name: ' + value)
					attribute = 'advisorId'
					value = teacher.id
					update()
				})
				.catch(err => error(res, err))
		}
		else update()
	}
)
router.use(groupsMembersRouter)
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
					return sectionPromise.then(section => {
						return {
							id: group.id,
							section: section !== null,
							name:
								section ? (section.course.name + ' - section ' + String(section.number))
								: (group.name || ''),
							teacher: section && section.teacher.lastName,
							studentCount: Number(group.get('studentCount'))
						}
					})
				})
			)
			return responsePromise
		})
		.then((response: Groups) => success(res, response))
		.catch(err => error(res, err))
})

export default router
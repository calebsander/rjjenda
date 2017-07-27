import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Groups, NewGroupName, NewGroup} from '../../api'
import {error, success} from '../api-respond'
import {Course, Group, Section, Student, Teacher} from '../models'
import {GroupAttributes} from '../models/group'
import {SectionInstance} from '../models/section'

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
							section ? (section.course.name + ' - section ' + String(section.number))
							: (group.name || ''),
						teacher: section && section.teacher.lastName,
						studentCount: Number(group.get('studentCount'))
					}))
				})
			)
			return responsePromise
		})
		.then((response: Groups) => {
			response.sort((group1, group2) => {
				if (group1.name < group2.name) return -1
				else if (group1.name > group2.name) return 1
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
			let sectionDeletion: PromiseLike<any>
			if (group.sectionId === null) sectionDeletion = Promise.resolve()
			else sectionDeletion = Section.destroy({where: {id: group.sectionId}})
			return sectionDeletion.then(() => group.destroy())
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

export default router
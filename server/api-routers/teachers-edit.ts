import * as bodyParser from 'body-parser'
import * as express from 'express'
import {NewTeacher, Teachers, TeacherPermission, TeacherUpdate} from '../../api'
import {error, success} from '../api-respond'
import {Teacher} from '../models'

const router = express.Router()
router.get('/teachers', (_, res) => {
	Teacher.findAll({
		attributes: [
			'id',
			'firstName',
			'lastName',
			'username',
			'admin',
			'admissions'
		],
		order: [
			['lastName', 'ASC'],
			['firstName', 'ASC']
		]
	})
		.then(teachers =>
			teachers.map(teacher => ({
				id: teacher.id,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				username: teacher.username,
				admin: teacher.admin,
				admissions: teacher.admissions
			}))
		)
		.then((response: Teachers) => success(res, response))
		.catch(error(res))
})
router.delete('/teacher/:id', (req, res) => {
	const id = req.params.id as string
	Teacher.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(error(res))
})
router.post('/teacher/:id/update',
	bodyParser.json(),
	(req, res) => {
		const id = req.params.id as string
		const {attribute, value} = req.body as TeacherUpdate
		Teacher.findOne({
			attributes: ['id'],
			where: {id}
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No teacher with id: ' + id)
				teacher.set(attribute, value).save()
			})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.post('/teacher/:id/permission',
	bodyParser.json(),
	(req, res) => {
		const id = req.params.id as string
		const {permission, value} = req.body as TeacherPermission
		Teacher.findOne({
			attributes: ['id'],
			where: {id}
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No teacher with id: ' + id)
				teacher.set(permission, value).save()
			})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.post('/teacher',
	bodyParser.json(),
	(req, res) => {
		Teacher.create(req.body as NewTeacher)
			.then(() => success(res))
			.catch(error(res))
	}
)

export default router
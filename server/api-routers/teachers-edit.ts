//import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Teachers} from '../../api'
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
		.then(teachers => {
			const response: Teachers = teachers.map(teacher => ({
				id: teacher.id,
				firstName: teacher.firstName,
				lastName: teacher.lastName,
				username: teacher.username,
				admin: teacher.admin,
				admissions: teacher.admissions
			}))
			success(res, response)
		})
		.catch(err => error(res, err))
})
router.delete('/teacher/:id', (req, res) => {
	const id = req.params.id as string
	Teacher.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
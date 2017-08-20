import * as express from 'express'
import {TeachersList} from '../../api'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {Teacher} from '../models'

const router = express.Router()
router.get('/',
	restrictToTeacher,
	(_, res) => { //for selecting advisor or section teacher
		Teacher.findAll({
			attributes: ['id', 'firstName', 'lastName'],
			order: ['lastName']
		})
			.then(teachers => {
				const response: TeachersList = teachers.map(
					teacher => ({
						id: teacher.id,
						name: teacher.firstName + ' ' + teacher.lastName
					})
				)
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)

export default router
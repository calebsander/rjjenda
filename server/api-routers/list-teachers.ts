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
			.then(teachers =>
				teachers.map(teacher => ({
					id: teacher.id,
					name: teacher.firstName + ' ' + teacher.lastName
				}))
			)
			.then((response: TeachersList) => success(res, response))
			.catch(error(res))
	}
)

export default router
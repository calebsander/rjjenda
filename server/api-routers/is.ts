import * as express from 'express'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {Teacher} from '../models'
import {TeacherModel} from '../models/teacher'

const router = express.Router()
router.get('/admin',
	restrictToTeacher,
	(req, res) => {
		const {id} = req.user as TeacherModel
		Teacher.findOne({
			attributes: ['admin'],
			where: {id}
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No such teacher: ' + id)
				success(res, teacher.admin)
			})
			.catch(error(res))
	}
)
router.get('/admissions',
	restrictToTeacher,
	(req, res) => {
		const {id} = req.user as TeacherModel
		Teacher.findOne({
			attributes: ['admissions'],
			where: {id}
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No such teacher: ' + id)
				success(res, teacher.admissions)
			})
			.catch(error(res))
	}
)

export default router
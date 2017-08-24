import * as express from 'express'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {Teacher} from '../models'
import {TeacherInstance} from '../models/teacher'

const router = express.Router()
router.get('/admin',
	restrictToTeacher,
	(req, res) => {
		const {id} = req.user as TeacherInstance
		Teacher.findOne({
			attributes: ['admin'],
			where: {id}
		})
			.then(teacher => {
				if (teacher === null) throw new Error('No such teacher: ' + id)
				success(res, teacher.admin)
			})
			.catch(err => error(res, err))
	}
)

export default router
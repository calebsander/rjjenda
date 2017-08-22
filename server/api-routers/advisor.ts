import * as express from 'express'
import {AssignedStudent} from '../../api'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {Student} from '../models'
import {TeacherInstance} from '../models/teacher'

const router = express.Router()
router.get('/advisees',
	restrictToTeacher,
	(req, res) => {
		const teacher: TeacherInstance = req.user
		Student.findAll({
			attributes: ['id', 'firstName', 'lastName'],
			where: {advisorId: teacher.id},
			order: ['lastName']
		})
			.then(students => {
				const response: AssignedStudent[] = students.map(
					({id, firstName, lastName}) => ({id, firstName, lastName})
				)
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)

export default router
import * as express from 'express'
import {TeachersList} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import coursesEditRouter from './courses-edit'
import groupsMembersRouter from './groups-members'
import groupsEditRouter from './groups-edit'
import studentsEditRouter from './students-edit'
import {Teacher} from '../models'

const router = express.Router()
router.use(restrictToAdmin)
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.use(groupsMembersRouter)
router.use(studentsEditRouter)
router.use(groupsEditRouter)
router.use(coursesEditRouter)
router.get('/list-teachers', (_, res) => {
	Teacher.findAll({
		attributes: ['id', 'firstName', 'lastName']
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
})

export default router
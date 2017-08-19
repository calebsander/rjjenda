import * as express from 'express'
import {TeachersList, WrongDomainEmails} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import coursesEditRouter from './courses-edit'
import groupsMembersRouter from './groups-members'
import groupsEditRouter from './groups-edit'
import limitsEditRouter from './limits-edit'
import studentsEditRouter from './students-edit'
import teachersEditRouter from './teachers-edit'
import {Teacher} from '../models'

const router = express.Router()
router.use(restrictToAdmin)
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(invalidEmails => {
			const response: WrongDomainEmails = {invalidEmails}
			success(res, response)
		})
		.catch(err => error(res, err))
})
router.use(groupsMembersRouter)
router.use(studentsEditRouter)
router.use(groupsEditRouter)
router.use(coursesEditRouter)
router.use(teachersEditRouter)
router.use(limitsEditRouter)
router.get('/list-teachers', (_, res) => { //for selecting advisor or section teacher
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
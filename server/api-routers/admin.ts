import * as express from 'express'
import {WrongDomainEmails} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import coursesEditRouter from './courses-edit'
import groupsMembersRouter from './groups-members'
import groupsEditRouter from './groups-edit'
import warningsEditRouter from './warnings-edit'
import limitsEditRouter from './limits-edit'
import studentsEditRouter from './students-edit'
import teachersEditRouter from './teachers-edit'
import viewAsRouter from './view-as'
import violationsRouter from './violations'

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
router.use(warningsEditRouter)
router.use(viewAsRouter)
router.use(violationsRouter)

export default router
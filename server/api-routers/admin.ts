import * as express from 'express'
import {SectionsNotFound, WrongDomainEmails} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importMeetingTimes from '../csv-import/meeting-times'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import coursesEditRouter from './courses-edit'
import eventsEditRouter from './events-edit'
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
router.post('/upload-meeting-times', (req, res) => {
	importMeetingTimes(req)
		.then(missingSections => {
			const response: SectionsNotFound = {missingSections}
			success(res, response)
		})
		.catch(error(res))
})
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(invalidEmails => {
			const response: WrongDomainEmails = {invalidEmails}
			success(res, response)
		})
		.catch(error(res))
})
router.use(groupsMembersRouter)
router.use(studentsEditRouter)
router.use(groupsEditRouter)
router.use(coursesEditRouter)
router.use(eventsEditRouter)
router.use(teachersEditRouter)
router.use(limitsEditRouter)
router.use(warningsEditRouter)
router.use(viewAsRouter)
router.use(violationsRouter)

export default router
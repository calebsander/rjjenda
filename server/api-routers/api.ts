import * as express from 'express'
import adminRouter from './admin'
import assignmentsRouter from './assignments'
import authenticationRouter from './authentication'
import loggedInRouter from './logged-in'
import userInfoRouter from './user-info'
import versionRouter from './version'

const router = express.Router()
router.use('/admin', adminRouter)
router.use('/assignments', assignmentsRouter)
router.use('/auth', authenticationRouter)
router.use('/logged-in', loggedInRouter)
router.use('/user-info', userInfoRouter)
router.use('/version', versionRouter)

export default router
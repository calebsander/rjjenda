import * as express from 'express'
import authenticationRouter from './authentication'
import loggedInRouter from './logged-in'
import userInfoRouter from './user-info'

const router = express.Router()
router.use('/auth', authenticationRouter)
router.use('/logged-in', loggedInRouter)
router.use('/user-info', userInfoRouter)

export default router
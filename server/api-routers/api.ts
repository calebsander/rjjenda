import * as express from 'express'
import authenticationRouter from './authentication'

const router = express.Router()
router.use('/auth', authenticationRouter)

export default router
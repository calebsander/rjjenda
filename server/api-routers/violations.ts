import * as express from 'express'
import {AtFaultViolation} from '../../api'
import {success, error} from '../api-respond'
import {getAllViolations} from '../limit-check'

const router = express.Router()
router.get('/limit-violations', (_, res) => {
	getAllViolations()
		.then((violations: AtFaultViolation[]) => success(res, violations))
		.catch(err => error(res, err))
})

export default router
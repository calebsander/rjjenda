import * as express from 'express'
import {success} from '../api-respond'

const router = express.Router()
router.get('/', (req, res) => {
	req.logout()
	success(res)
})

export default router
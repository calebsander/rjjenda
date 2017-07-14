import * as express from 'express'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'

const router = express.Router()
router.use(restrictToAdmin)
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(() => success(res))
		.catch(err => error(res, err.message))
})

export default router
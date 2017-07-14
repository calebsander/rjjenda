import * as express from 'express'
import {UserInfo} from '../../api'
import {UserType} from '../authentication'

const router = express.Router()
router.get('/', (req, res) => {
	const user: UserType = req.user
	user.reload({attributes: ['firstName']})
		.then(user => {
			const response: UserInfo = {
				name: user.get('firstName')
			}
			res.json({success: true, data: response})
		})
})

export default router
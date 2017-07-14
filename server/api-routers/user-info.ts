import * as express from 'express'
import {restrictToLoggedIn} from '../api-restrict'
import {success} from '../api-respond'
import {UserInfo} from '../../api'
import {UserType} from '../authentication'

const router = express.Router()
router.get('/',
	restrictToLoggedIn,
	(req, res) => {
		const user: UserType = req.user
		user.reload({attributes: ['firstName']})
			.then(user => {
				const response: UserInfo = {
					name: user.get('firstName')
				}
				success(res, response)
			})
	}
)

export default router
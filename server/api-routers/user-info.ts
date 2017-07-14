import * as express from 'express'
import {restrictToLoggedIn} from '../api-restrict'
import {success} from '../api-respond'
import {UserInfo} from '../../api'
import {SavedUserType, UserType} from '../authentication'

const router = express.Router()
router.get('/',
	restrictToLoggedIn,
	(req, res) => {
		const user: UserType = req.user
		const userType = new SavedUserType(user.id).type
		user.reload({
			attributes: ['firstName'].concat(
				userType === 'teacher' ? ['admin', 'admissions'] : []
			)
		})
			.then(user => {
				const response: UserInfo = {
					admin: user.get('admin'),
					admissions: user.get('admissions'),
					name: user.get('firstName')
				}
				success(res, response)
			})
	}
)

export default router
import * as express from 'express'
import {restrictToLoggedIn} from '../api-restrict'
import {success} from '../api-respond'
import {UserInfo} from '../../api'
import {SavedUserType, UserType} from '../authentication'
import {TeacherModel} from '../models/teacher'

const router = express.Router()
router.get('/',
	restrictToLoggedIn,
	(req, res) => {
		const user: UserType = req.user as UserType
		const teacher = new SavedUserType(user.id).type === 'teacher'
		const attributes = ['firstName']
		if (teacher) attributes.push('admin', 'admissions')
		user.reload({attributes})
			.then(user => {
				const response: UserInfo = {
					admin: teacher && (user as TeacherModel).admin,
					admissions: teacher && (user as TeacherModel).admissions,
					name: user.firstName
				}
				success(res, response)
			})
	}
)

export default router
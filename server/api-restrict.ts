import {NextFunction, Request, Response} from 'express'
import {NEED_TO_BE_LOGGED_IN} from '../api'
import {error} from './api-respond'
import {SavedUserType, UserType} from './authentication'
import {TeacherInstance} from './models/teacher'

export function restrictToLoggedIn(req: Request, res: Response, next: NextFunction) {
	if (req.isAuthenticated()) next()
	else error(res)(new Error(NEED_TO_BE_LOGGED_IN))
}
function restrictToUserType(type: 'student' | 'teacher') {
	return (req: Request, res: Response, next: NextFunction) =>
		restrictToLoggedIn(req, res, () => {
			const user: UserType = req.user
			const savedUser = new SavedUserType(user.id)
			if (savedUser.type === type) next()
			else error(res)(new Error('Need to be a ' + type))
		})
}
export const restrictToStudent = restrictToUserType('student')
export const restrictToTeacher = restrictToUserType('teacher')
export function restrictToAdmin(req: Request, res: Response, next: NextFunction) {
	restrictToTeacher(req, res, () => {
		const user: TeacherInstance = req.user
		user.reload({attributes: ['admin']})
			.then(user => {
				if (user.get('admin')) next()
				else error(res)(new Error('Need to be an administrator'))
			})
			.catch(error(res))
	})
}
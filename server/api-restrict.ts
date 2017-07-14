import {NextFunction, Request, Response} from 'express'
import {error} from './api-respond'
import {SavedUserType, UserType} from './authentication'
import {TeacherInstance} from './models/teacher'

export function restrictToLoggedIn(req: Request, res: Response, next: NextFunction) {
	if (req.isAuthenticated()) next()
	else error(res, 'Need to be logged in')
}
export function restrictToTeacher(req: Request, res: Response, next: NextFunction) {
	restrictToLoggedIn(req, res, () => {
		const user: UserType = req.user
		const savedUser = new SavedUserType(user.id)
		if (savedUser.type === 'teacher') next()
		else error(res, 'Need to be a teacher')
	})
}
export function restrictToAdmin(req: Request, res: Response, next: NextFunction) {
	restrictToTeacher(req, res, () => {
		const user: TeacherInstance = req.user
		user.reload({attributes: ['admin']})
			.then(user => {
				if (user.get('admin')) next()
				else error(res, 'Need to be an administrator')
			})
			.catch(err => error(res, err.message))
	})
}
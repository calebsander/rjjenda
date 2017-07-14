import {NextFunction, Request, Response} from 'express'
import {error} from './api-respond'

export function restrictToLoggedIn(req: Request, res: Response, next: NextFunction) {
	if (req.isAuthenticated()) next()
	else error(res, 'Need to be logged in')
}
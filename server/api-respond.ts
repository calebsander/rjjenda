import {Response} from 'express'
import * as Sequelize from 'sequelize'
import {APIResponse} from '../api'

const VALIDATION_ERROR = 'Validation error'

function sendJSON(res: Response, json: APIResponse) {
	res.json(json)
}
export function error(res: Response, err: Error) {
	console.error(err) //should eventually go to a log or something
	const {message} = err
	let fullMessage: string
	//Extract more descriptive message than simply "Validation error"
	//e.g. "username must be unique"
	if (message === VALIDATION_ERROR) {
		fullMessage = (err as Sequelize.ValidationError).errors
			.map(error => error.message)
			.join(', ')
	}
	else fullMessage = message
	sendJSON(res, {success: false, message: fullMessage})
}
export function success(res: Response, data?: any) {
	sendJSON(res, {success: true, data})
}
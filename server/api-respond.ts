import {Response} from 'express'
import * as Sequelize from 'sequelize'
import {APIResponse} from '../api'

const VALIDATION_ERROR = 'Validation error'

function sendJSON(res: Response, json: APIResponse) {
	res.json(json)
}
export function error(res: Response): (err: Error) => void {
	return err => {
		console.error(err)
		const {message} = err
		//Extract more descriptive message than simply "Validation error"
		//e.g. "username must be unique"
		const fullMessage = message === VALIDATION_ERROR
			? (err as Sequelize.ValidationError).errors
				.map(error => error.message)
				.join(', ')
			: message
		sendJSON(res, {success: false, message: fullMessage})
	}
}
export function success(res: Response, data?: any) {
	sendJSON(res, {success: true, data})
}
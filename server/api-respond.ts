import {Response} from 'express'
import {APIResponse} from '../api'

function sendJSON(res: Response, json: APIResponse) {
	res.json(json)
}
export function error(res: Response, err: Error) {
	console.error(err)
	const {message} = err
	sendJSON(res, {success: false, message})
}
export function success(res: Response, data?: any) {
	sendJSON(res, {success: true, data})
}
import {Response} from 'express'
import {APIResponse} from '../api'

function sendJSON(res: Response, json: APIResponse) {
	res.json(json)
}
export function error(res: Response, message: string) {
	sendJSON(res, {success: false, message})
}
export function success(res: Response, data: any) {
	sendJSON(res, {success: true, data})
}
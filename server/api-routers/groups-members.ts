import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Readable} from 'stream'
import {error, success} from '../api-respond'
import {UserType} from '../authentication'
import importGroupsMembersCSV from '../csv-import/groups-and-members'

const UPLOAD_TIMEOUT = 30000 //milliseconds to wait before scrapping groups upload
const groupUploads = new Map<string, string>()

interface StringBody {
	body: string
}

const router = express.Router()
router.post('/upload-groups',
	bodyParser.text(),
	(req, res) => {
		const user: UserType = req.user
		const {id} = user
		const {body} = req as StringBody
		groupUploads.set(id, body)
		setTimeout(() => {
			const groupUpload = groupUploads.get(id)
			if (groupUpload === body) groupUploads.delete(id) //only delete if groupUpload corresponds to this upload
		}, UPLOAD_TIMEOUT)
		success(res)
	}
)
router.post('/upload-members', (req, res) => {
	const user: UserType = req.user
	const {id} = user
	const groupUpload = groupUploads.get(id)
	if (groupUpload === undefined) {
		error(res, new Error('No matching group upload'))
		return
	}
	const groupStream = new Readable
	groupStream._read = () => {}
	groupStream.push(groupUpload)
	groupStream.push(null)
	importGroupsMembersCSV({groupStream, memberStream: req})
		.then(() => {
			groupUploads.delete(id)
			success(res)
		})
		.catch(err => error(res, err))
})

export default router
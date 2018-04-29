import * as bodyParser from 'body-parser'
import * as express from 'express'
import {NewEvent} from '../../api'
import {error, success} from '../api-respond'
import {Event} from '../models'
import ExtendedDate from '../../util/extended-date'

const router = express.Router()
router.post('/new-event',
	bodyParser.json(),
	(req, res) => {
		const {year, month, date, days, name} = req.body as NewEvent
		if (days < 1) return error(res)(new Error('Must last at least 1 day'))

		const start = new Date(year, month, date)
		Event.create({
			start,
			end: new ExtendedDate(start).addDays(days).date,
			name
		})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.delete('/event/:id', (req, res) => {
	const id: number = req.params.id
	Event.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(error(res))
})

export default router
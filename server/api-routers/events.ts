import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Op} from 'sequelize'
import {EventResponse, EventsRequest} from '../../api'
import {success, error} from '../api-respond'
import {restrictToLoggedIn} from '../api-restrict'
import {Event} from '../models'
import ExtendedDate from '../../util/extended-date'

//No API for creating events as this only needs to be done once per year,
//and so it is not too much trouble to access the database directly

const router = express.Router()
router.post('/',
	restrictToLoggedIn,
	bodyParser.json(),
	(req, res) => {
		const {year, month, date, days} = req.body as EventsRequest
		const startDate = new Date(year, month, date) //midnight of start of day, in this timezone
		const extendedStartDate = new ExtendedDate(startDate)
		const endDate = extendedStartDate.addDays(days) //exclusive
		Event.findAll({
			attributes: ['date', 'name'],
			where: {
				date: {
					[Op.gte]: startDate,
					[Op.lt]: endDate.date
				}
			}
		})
			.then(events => {
				const response: EventResponse[] = events.map(({date, name}) => ({
					day: new ExtendedDate(date).daysSince(extendedStartDate.toUTC()) + 1,
					name
				}))
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)

export default router
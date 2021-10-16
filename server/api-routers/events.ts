import * as express from 'express'
import {Op} from 'sequelize'
import {EventResponse, EventsRequest} from '../../api'
import {success, error} from '../api-respond'
import {restrictToLoggedIn} from '../api-restrict'
import {Event} from '../models'
import ExtendedDate from '../../util/extended-date'

const router = express.Router()
router.post('/',
	restrictToLoggedIn,
	express.json(),
	(req, res) => {
		const {year, month, date, days} = req.body as EventsRequest
		const startDate = new Date(year, month, date) //midnight of start of day, in this timezone
		const extendedStart = new ExtendedDate(startDate)
		const endDate = extendedStart.addDays(days).date //exclusive
		Event.findAll({
			attributes: ['id', 'start', 'end', 'name'],
			where: {
				start: {[Op.lt]: endDate},
				end: {[Op.gt]: startDate}
			},
			order: ['start', 'end']
		})
			.then(events =>
				events.map(({id, start, end, name}) => ({
					id: id!,
					start: new ExtendedDate(start).daysSince(extendedStart.toUTC()) + 1,
					end: new ExtendedDate(end).daysSince(extendedStart.toUTC()) + 1,
					name
				}))
			)
			.then((response: EventResponse[]) => success(res, response))
			.catch(error(res))
	}
)

export default router
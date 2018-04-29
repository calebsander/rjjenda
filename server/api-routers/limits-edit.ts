import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Limits, NewLimit} from '../../api'
import {error, success} from '../api-respond'
import {Limit} from '../models'

const router = express.Router()
router.get('/limits', (_, res) =>
	Limit.findAll({
		attributes: ['id', 'days', 'assignmentWeight'],
		order: ['days']
	})
		.then(limits =>
			limits.map(({id, days, assignmentWeight}) =>
				({id, days, weight: assignmentWeight})
			)
		)
		.then((response: Limits) => success(res, response))
		.catch(error(res))
)
router.post('/limit',
	bodyParser.json(),
	(req, res) => {
		const {days, weight} = req.body as NewLimit
		Limit.create({
			days,
			assignmentWeight: weight
		})
			.then(() => success(res))
			.catch(error(res))
	}
)
router.delete('/limit/:id', (req, res) => {
	const id = Number(req.params.id)
	Limit.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(error(res))
})

export default router
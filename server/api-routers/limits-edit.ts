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
		.then(limits => {
			const response: Limits = limits.map(
				({id, days, assignmentWeight}) => ({id, days, weight: assignmentWeight})
			)
			success(res, response)
		})
		.catch(err => error(res, err))
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
			.catch(err => error(res, err))
	}
)
router.delete('/limit/:id', (req, res) => {
	const id = Number(req.params.id)
	Limit.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
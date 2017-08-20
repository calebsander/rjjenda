import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Infos, NewInfo} from '../../api'
import {success, error} from '../api-respond'
import {Info} from '../models'

const router = express.Router()
router.get('/infos', (_, res) =>
	Info.findAll({
		attributes: ['id', 'assignmentWeight', 'color'],
		order: ['assignmentWeight']
	})
		.then(infos => {
			const response: Infos = infos.map(({id, assignmentWeight, color}) => ({
				id,
				weight: assignmentWeight,
				color
			}))
			success(res, response)
		})
		.catch(err => error(res, err))
)
const HEX_COLOR = /^#[0-9A-F]{6}$/
router.post('/info',
	bodyParser.json(),
	(req, res) => {
		const {color, weight} = req.body as NewInfo
		if (!HEX_COLOR.test(color)) error(res, new Error('Not a hex color: ' + color))
		Info.create({
			assignmentWeight: weight,
			color
		})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
router.delete('/info/:id', (req, res) => {
	const id = Number(req.params.id)
	Info.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
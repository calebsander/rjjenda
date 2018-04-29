import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Warnings, NewWarning} from '../../api'
import {success, error} from '../api-respond'
import {Warning} from '../models'

const router = express.Router()
router.get('/warnings', (_, res) =>
	Warning.findAll({
		attributes: ['id', 'assignmentWeight', 'color'],
		order: ['assignmentWeight']
	})
		.then(warnings => {
			const response: Warnings = warnings.map(({id, assignmentWeight, color}) => ({
				id,
				weight: assignmentWeight,
				color
			}))
			success(res, response)
		})
		.catch(err => error(res, err))
)
const HEX_COLOR = /^#[0-9A-F]{6}$/
router.post('/warning',
	bodyParser.json(),
	(req, res) => {
		const {color, weight} = req.body as NewWarning
		if (!HEX_COLOR.test(color)) return error(res, new Error('Not a hex color: ' + color))

		Warning.create({
			assignmentWeight: weight,
			color
		})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
router.delete('/warning/:id', (req, res) => {
	const id = Number(req.params.id)
	Warning.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
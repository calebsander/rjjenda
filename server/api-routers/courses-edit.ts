import * as express from 'express'
import {Courses} from '../../api'
import {success, error} from '../api-respond'
import {Course, Section} from '../models'

const router = express.Router()
router.use('/courses', (_, res) => {
	Course.findAll({
		attributes: ['id', 'name'],
		include: [{
			model: Section,
			attributes: ['number']
		}],
		order: [
			['name']
		]
	})
		.then(courses => {
			const response: Courses = courses.map(course => {
				const id = course.id
				if (!course.sections) throw new Error('Failed to load sections for course with id: ' + String(id))
				return {
					id,
					name: course.name,
					sections: course.sections.map(section => section.number as number)
				}
			})
			success(res, response)
		})
		.catch(err => error(res, err))
})

export default router
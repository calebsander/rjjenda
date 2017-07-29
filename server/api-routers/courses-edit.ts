import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Courses, NewCourseName} from '../../api'
import {success, error} from '../api-respond'
import {Course, Section} from '../models'

const router = express.Router()
router.get('/courses', (_, res) => {
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
				if (!course.sections) throw new Error('Failed to load sections for course with id: ' + id)
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
router.post('/course/set-name',
	bodyParser.json(),
	(req, res) => {
		const {id, name} = req.body as NewCourseName
		Course.findOne({
			attributes: ['id'],
			where: {id}
		})
			.then(course => {
				if (course === null) throw new Error('No course with id: ' + id)
				course.set('name', name)
				return course.save()
			})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)

export default router
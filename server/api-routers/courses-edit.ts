import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Courses, NewCourse, NewCourseName} from '../../api'
import {success, error} from '../api-respond'
import {Course, Group, Section} from '../models'

const router = express.Router()
router.get('/courses', (_, res) => {
	Course.findAll({
		attributes: ['id', 'name'],
		include: [{
			model: Section,
			attributes: ['number']
		}],
		order: [
			'name',
			Sequelize.col('sections.number')
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
router.get('/new-section/:courseId/:number', (req, res) => {
	const courseId = req.params.courseId as string
	const number = req.params.number as number
	Section.create({
		courseId,
		number
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.delete('/section/:courseId/:number', (req, res) => {
	const courseId = req.params.courseId as string
	const number = req.params.number as number
	Section.destroy({
		where: {
			courseId,
			number
		}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})
router.post('/course',
	bodyParser.json(),
	(req, res) => {
		const {id, name, sectionCount} = req.body as NewCourse
		Course.create({
			id,
			name
		})
			.then(() => {
				const sectionPromises: PromiseLike<any>[] = []
				for (let section = 1; section <= sectionCount; section++) {
					sectionPromises.push(
						Section.create({
							courseId: id,
							number: section
						})
							.then(createdSection =>
								Group.create({
									sectionId: createdSection.id as number,
									name: null
								})
							)
					)
				}
				return Promise.all(sectionPromises)
			})
			.then(() => success(res))
			.catch(err => error(res, err))
	}
)
router.delete('/course/:id', (req, res) => {
	const id = req.params.id as string
	Course.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err))
})

export default router
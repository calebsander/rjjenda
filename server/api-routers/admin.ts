import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Students, StudentUpdate} from '../../api'
import {error, success} from '../api-respond'
import {restrictToAdmin} from '../api-restrict'
import importUsersFromCSV from '../csv-import/students-and-teachers'
import {Student, Teacher} from '../models'

const router = express.Router()
router.use(restrictToAdmin)
router.post('/upload-users', (req, res) => {
	importUsersFromCSV(req)
		.then(() => success(res))
		.catch(err => error(res, err.message))
})
router.get('/students', (_, res) => {
	Student.findAll({
		attributes: ['id', 'firstName', 'lastName', 'username', 'year'],
		include: [{
			model: Teacher as Sequelize.Model<any, any>,
			attributes: ['lastName'],
			as: 'advisor'
		}],
		order: [
			['lastName', 'ASC'],
			['firstName', 'ASC']
		]
	})
		.then(students => {
			const response: Students = students.map(({id, firstName, lastName, username, year, advisor}) => {
				return {
					id,
					firstName,
					lastName,
					username,
					year,
					advisor: advisor === null ? '' : advisor.lastName
				}
			})
			success(res, response)
		})
		.catch(err => error(res, err.message))
})
interface IdParams {
	id: string
}
router.delete('/student/:id', (req, res) => {
	const {id} = req.params as IdParams
	Student.destroy({
		where: {id}
	})
		.then(() => success(res))
		.catch(err => error(res, err.message))
})
router.post('/student/:id/update',
	bodyParser.json(),
	(req, res) => {
		function update() {
			return Student.findOne({
				attributes: ['id'],
				where: {id}
			})
				.then(student => {
					if (student === null) throw new Error('No such student id: ' + id)
					return student
						.set(attribute, value)
						.save()
				})
				.then(() => success(res))
				.catch(err => error(res, err.message))
		}
		const {id} = req.params as IdParams
		let {attribute, value} = req.body as StudentUpdate
		if (attribute === 'advisor') {
			Teacher.findOne({
				attributes: ['id'],
				where: {lastName: value}
			})
				.then(teacher => {
					if (teacher === null) throw new Error('No teacher with last name: ' + value)
					attribute = 'advisorId'
					value = teacher.id
					update()
				})
				.catch(err => error(res, err.message))
		}
		else update()
	}
)

export default router
import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {MatchingStudent, StudentQuery} from '../../api'
import {success, error} from '../api-respond'
import {restrictToTeacher} from '../api-restrict'
import {toGroupStudents} from './groups-edit'
import {Student} from '../models'
import {StudentAttributes} from '../models/student'

const FULL_NAME = Sequelize.fn('lower',
	Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName'))
)

const router = express.Router()
router.post('/',
	restrictToTeacher,
	bodyParser.json(),
	(req, res) => {
		const {nameSearch} = req.body as StudentQuery
		Student.findAll({
			attributes: ['id', 'firstName', 'lastName'],
			where: Sequelize.where(
				Sequelize.fn('strpos', FULL_NAME, nameSearch.toLowerCase()),
				{$ne: 0}
			) as Sequelize.WhereOptions<StudentAttributes>
		})
			.then(students => {
				const response: MatchingStudent[] = toGroupStudents(students)
				success(res, response)
			})
			.catch(err => error(res, err))
	}
)

export default router
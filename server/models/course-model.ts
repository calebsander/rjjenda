import * as Sequelize from 'sequelize'
import {CourseAttributes, CourseInstance} from './course'
import {AssociableModel, addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<CourseInstance, CourseAttributes> =>
	addAssociations(
		sequelize.define<CourseInstance, CourseAttributes>('course', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			}
		}),
		({Course, Section}) => {
			Course.hasMany(Section)
		}
	)
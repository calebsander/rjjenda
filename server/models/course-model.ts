import * as Sequelize from 'sequelize'
import {CourseAttributes, CourseModel} from './course'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<CourseModel> =>
	addAssociations(
		sequelize.define<CourseModel, CourseAttributes>('course', {
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
			Course.hasMany(Section, {
				onDelete: 'CASCADE'
			})
		}
	)
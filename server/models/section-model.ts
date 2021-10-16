import * as Sequelize from 'sequelize'
import {SectionAttributes, SectionModel} from './section'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<SectionModel> =>
	addAssociations(
		sequelize.define<SectionModel, SectionAttributes>('section', {
			number: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			periods: {
				type: Sequelize.STRING,
				allowNull: true
			}
		}),
		({Section, Course, Teacher, Group}) => {
			Section.belongsTo(Course)
			Section.belongsTo(Teacher)
			Section.hasOne(Group, {
				onDelete: 'CASCADE'
			})
		}
	)
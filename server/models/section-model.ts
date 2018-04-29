import * as Sequelize from 'sequelize'
import {SectionAttributes, SectionInstance} from './section'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<SectionInstance, SectionAttributes> =>
	addAssociations(
		sequelize.define<SectionInstance, SectionAttributes>('section', {
			number: {
				type: Sequelize.INTEGER,
				allowNull: false
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
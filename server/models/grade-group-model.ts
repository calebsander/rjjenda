import * as Sequelize from 'sequelize'
import {GradeGroupAttributes, GradeGroupInstance} from './grade-group'
import {AssociableModel, addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<GradeGroupInstance, GradeGroupAttributes> =>
	addAssociations(
		sequelize.define<GradeGroupInstance, GradeGroupAttributes>('grade_group', {
			year: { //not used as primary key so that it can be null
				type: Sequelize.INTEGER,
				unique: true
			}
		}),
		({GradeGroup, Group}) => GradeGroup.belongsTo(Group)
	)
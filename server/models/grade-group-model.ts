import * as Sequelize from 'sequelize'
import {GradeGroupAttributes, GradeGroupModel} from './grade-group'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<GradeGroupModel> =>
	addAssociations(
		sequelize.define<GradeGroupModel, GradeGroupAttributes>('grade_group', {
			year: { //not used as primary key so that it can be null
				type: Sequelize.INTEGER,
				unique: true
			}
		}),
		({GradeGroup, Group}) => GradeGroup.belongsTo(Group)
	)
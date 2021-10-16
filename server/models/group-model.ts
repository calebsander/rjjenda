import * as Sequelize from 'sequelize'
import {GroupAttributes, GroupModel} from './group'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<GroupModel> =>
	addAssociations(
		sequelize.define<GroupModel, GroupAttributes>('group', {
			name: Sequelize.STRING
		} as Sequelize.ModelAttributes<GroupModel>),
		({Group, Student, Section, Assignment, GradeGroup}) => {
			Group.belongsToMany(Student, {through: 'memberships'})
			Group.belongsTo(Section)
			Group.hasOne(GradeGroup, {
				onDelete: 'CASCADE'
			})
			Group.hasMany(Assignment, {
				onDelete: 'CASCADE'
			})
		}
	)
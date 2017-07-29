import * as Sequelize from 'sequelize'
import {GroupAttributes, GroupInstance} from './group'
import {AssociableModel, addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<GroupInstance, GroupAttributes> =>
	addAssociations(
		sequelize.define<GroupInstance, GroupAttributes>('group', {
			name: Sequelize.STRING
		}),
		({Group, Student, Section, Assignment}) => {
			Group.belongsToMany(Student, {through: 'memberships'})
			Group.belongsTo(Section)
			Group.hasMany(Assignment, {
				onDelete: 'CASCADE'
			})
		}
	)
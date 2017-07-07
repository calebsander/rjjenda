import * as Sequelize from 'sequelize'
import {GroupAttributes, GroupInstance} from './group'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<GroupInstance, GroupAttributes> => {
	return addAssociations(
		sequelize.define<GroupInstance, GroupAttributes>('group', {
			name: Sequelize.STRING
		}),
		({Group, Student, Section, Assignment}) => {
			Group.belongsToMany(Student, {through: 'memberships'})
			Group.belongsTo(Section)
			Group.hasMany(Assignment)
		}
	)
}
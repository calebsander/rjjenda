import * as Sequelize from 'sequelize'
import {StudentAttributes, StudentInstance} from './student'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<StudentInstance, StudentAttributes> => {
	return addAssociations(
		sequelize.define<StudentInstance, StudentAttributes>('student', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false
			},
			firstName: {
				type: Sequelize.STRING,
				allowNull: false
			},
			lastName: {
				type: Sequelize.STRING,
				allowNull: false
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false
			},
			year: {
				type: Sequelize.INTEGER,
				allowNull: false
			}
		}),
		({Student, Teacher, Group}) => {
			Student.belongsTo(Teacher, {as: 'advisor'})
			Student.belongsToMany(Group, {through: 'memberships'})
		}
	)
}
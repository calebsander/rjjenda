import * as Sequelize from 'sequelize'
import {StudentAttributes, StudentModel} from './student'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<StudentModel> =>
	addAssociations(
		sequelize.define<StudentModel, StudentAttributes>('student', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
				validate: {is: /^S/}
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
				allowNull: false,
				unique: true
			},
			year: {
				type: Sequelize.INTEGER,
				allowNull: false
			}
		} as Sequelize.ModelAttributes<StudentModel>),
		({Student, Teacher, Group}) => {
			Student.belongsTo(Teacher, {as: 'advisor'})
			Student.belongsToMany(Group, {through: 'memberships'})
		}
	)
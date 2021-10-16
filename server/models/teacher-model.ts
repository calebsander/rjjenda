import * as Sequelize from 'sequelize'
import {TeacherAttributes, TeacherModel} from './teacher'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<TeacherModel> =>
	addAssociations(
		sequelize.define<TeacherModel, TeacherAttributes>('teacher', {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
				validate: {is: /^T/}
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
			admin: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			},
			admissions: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			}
		}),
		({Group, Section, Student, Teacher}) => {
			Teacher.hasMany(Student, {as: 'Advisees', foreignKey: 'advisorId'})
			Teacher.hasMany(Section)
			Teacher.belongsToMany(Group, {through: 'displays'})
		}
	)
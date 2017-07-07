import * as Sequelize from 'sequelize'
import {TeacherAttributes, TeacherInstance} from './teacher'
import {AssociableModel, addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<TeacherInstance, TeacherAttributes> =>
	addAssociations(
		sequelize.define<TeacherInstance, TeacherAttributes>('teacher', {
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
			admin: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			},
			admissions: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			}
		}),
		({Teacher, Student, Section}) => {
			Teacher.hasMany(Student, {as: 'Advisees', foreignKey: 'advisorId'})
			Teacher.hasMany(Section)
		}
	)
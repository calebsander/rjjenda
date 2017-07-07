import * as Sequelize from 'sequelize'
import {AssignmentAttributes, AssignmentInstance} from './assignment'
import {AssociableModel, addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<AssignmentInstance, AssignmentAttributes> =>
	addAssociations(
		sequelize.define<AssignmentInstance, AssignmentAttributes>('assignment', {
			weight: {
				type: Sequelize.FLOAT,
				allowNull: false
			},
			due: {
				type: Sequelize.DATEONLY,
				allowNull: false
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			visitors: {
				type: Sequelize.BOOLEAN,
				allowNull: false
			}
		}),
		({Assignment, Group}) => {
			Assignment.belongsTo(Group)
		}
	)
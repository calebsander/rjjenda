import * as Sequelize from 'sequelize'
import {AssignmentAttributes, AssignmentInstance} from './assignment'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<AssignmentInstance, AssignmentAttributes> =>
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
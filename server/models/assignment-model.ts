import * as Sequelize from 'sequelize'
import {AssignmentAttributes, AssignmentModel} from './assignment'
import {addAssociations} from './index'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<AssignmentModel> =>
	addAssociations(
		sequelize.define<AssignmentModel, AssignmentAttributes>('assignment', {
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
		} as Sequelize.ModelAttributes<AssignmentModel>),
		({Assignment, Group}) => {
			Assignment.belongsTo(Group)
		}
	)
import * as Sequelize from 'sequelize'
import {InfoAttributes, InfoInstance} from './info'
import {AssociableModel} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<InfoInstance, InfoAttributes> =>
	sequelize.define<InfoInstance, InfoAttributes>('info', {
		assignmentWeight: {
			type: Sequelize.FLOAT,
			allowNull: false
		},
		color: {
			type: Sequelize.STRING,
			allowNull: false
		}
	})
import * as Sequelize from 'sequelize'
import {WarningAttributes, WarningInstance} from './warning'
import {AssociableModel} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<WarningInstance, WarningAttributes> =>
	sequelize.define<WarningInstance, WarningAttributes>('warning', {
		assignmentWeight: {
			type: Sequelize.FLOAT,
			allowNull: false
		},
		color: {
			type: Sequelize.STRING,
			allowNull: false
		}
	})
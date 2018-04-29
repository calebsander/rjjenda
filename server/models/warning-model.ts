import * as Sequelize from 'sequelize'
import {WarningAttributes, WarningInstance} from './warning'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<WarningInstance, WarningAttributes> =>
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
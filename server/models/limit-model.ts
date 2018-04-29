import * as Sequelize from 'sequelize'
import {LimitAttributes, LimitInstance} from './limit'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<LimitInstance, LimitAttributes> =>
	sequelize.define<LimitInstance, LimitAttributes>('limit', {
		days: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		assignmentWeight: {
			type: Sequelize.FLOAT,
			allowNull: false
		}
	})
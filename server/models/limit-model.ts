import * as Sequelize from 'sequelize'
import {LimitAttributes, LimitInstance} from './limit'
import {AssociableModel} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<LimitInstance, LimitAttributes> =>
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
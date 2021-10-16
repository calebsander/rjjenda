import * as Sequelize from 'sequelize'
import {LimitAttributes, LimitModel} from './limit'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<LimitModel> =>
	sequelize.define<LimitModel, LimitAttributes>('limit', {
		days: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		assignmentWeight: {
			type: Sequelize.FLOAT,
			allowNull: false
		}
	})
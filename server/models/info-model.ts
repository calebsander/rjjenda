import * as Sequelize from 'sequelize'
import {InfoAttributes, InfoInstance} from './info'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<InfoInstance, InfoAttributes> =>
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
import * as Sequelize from 'sequelize'
import {EventAttributes, EventInstance} from './event'

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<EventInstance, EventAttributes> =>
	sequelize.define<EventInstance, EventAttributes>('event', {
		start: {
			type: Sequelize.DATEONLY,
			allowNull: false
		},
		end: {
			type: Sequelize.DATEONLY,
			allowNull: false
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false
		}
	})
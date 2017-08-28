import * as Sequelize from 'sequelize'
import {EventAttributes, EventInstance} from './event'
import {AssociableModel} from './index'

export default (sequelize: Sequelize.Sequelize): AssociableModel<EventInstance, EventAttributes> =>
	sequelize.define<EventInstance, EventAttributes>('event', {
		date: {
			type: Sequelize.DATEONLY,
			allowNull: false
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false
		}
	})
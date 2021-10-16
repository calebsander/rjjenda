import * as Sequelize from 'sequelize'
import {EventAttributes, EventModel} from './event'

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<EventModel> =>
	sequelize.define<EventModel, EventAttributes>('event', {
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
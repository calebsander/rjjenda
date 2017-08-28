import {Instance} from 'sequelize'

export interface EventAttributes {
	id?: number //arbitrary
	date: Date | string //querying returns it as 'YYYY-MM-DD'
	name: string
}

export interface EventInstance extends Instance<EventAttributes>, EventAttributes {}
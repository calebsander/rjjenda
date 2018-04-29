import {Instance} from 'sequelize'

export interface EventAttributes {
	id?: number //arbitrary
	start: Date | string //querying returns them as 'YYYY-MM-DD'; inclusive
	end: Date | string //exclusive
	name: string
}

export interface EventInstance extends Instance<EventAttributes>, EventAttributes {}
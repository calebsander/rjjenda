import {Instance} from 'sequelize'

export interface LimitAttributes {
	id: number //arbitrary
	days: number //number of consecutive days limit applies to
	assignmentWeight: number //max sum of assignment weights
}

export interface LimitInstance extends Instance<LimitAttributes>, LimitAttributes {}
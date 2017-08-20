import {Instance} from 'sequelize'

export interface InfoAttributes {
	assignmentWeight: number //sum of assignment weights
	color: string //hex color to display on UI
}

export interface InfoInstance extends Instance<InfoAttributes>, InfoAttributes {
	id: number //arbitrary
}
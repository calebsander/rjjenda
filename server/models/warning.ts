import {Instance} from 'sequelize'

export interface WarningAttributes {
	assignmentWeight: number //sum of assignment weights
	color: string //hex color to display on UI
}

export interface WarningInstance extends Instance<WarningAttributes>, WarningAttributes {
	id: number //arbitrary
}
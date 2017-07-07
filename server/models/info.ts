import {Instance} from 'sequelize'

export interface InfoAttributes {
	id: number //arbitrary
	assignmentWeight: number //sum of assignment weights
	color: string //HTML color to display on UI
}

export interface InfoInstance extends Instance<InfoAttributes> {}
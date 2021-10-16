import {Model} from 'sequelize'

export interface WarningAttributes {
	id?: number //arbitrary
	assignmentWeight: number //sum of assignment weights
	color: string //hex color to display on UI
}

export interface WarningModel extends Model<WarningAttributes>, WarningAttributes {
	id: number
}
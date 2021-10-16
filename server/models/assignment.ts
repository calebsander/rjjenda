import {Model} from 'sequelize'
import {GroupModel} from './group'

export interface AssignmentAttributes {
	id?: number //arbitrary
	due: Date | string //querying returns it as 'YYYY-MM-DD'
	groupId: number
	name: string
	visitors: boolean //should visitors be allowed to class on that day
	weight: number //allows for flexibility, but currently will be 0 for minor/event and 1 for major
}

export interface AssignmentModel extends Model<AssignmentAttributes>, AssignmentAttributes {
	createdAt: Date
	due: string
	group: GroupModel
}
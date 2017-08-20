import {Instance} from 'sequelize'
import {GroupInstance} from './group'

export interface AssignmentAttributes {
	id?: number //arbitrary
	due: Date | string //querying returns it as 'YYYY-MM-DD'
	groupId: number
	name: string
	visitors: boolean //should visitors be allowed to class on that day
	weight: number //allows for flexibility, but currently will be 0 for minor/event and 1 for major
}

export interface AssignmentInstance extends Instance<AssignmentAttributes>, AssignmentAttributes {
	due: string
	group: GroupInstance
	updatedAt: Date
}
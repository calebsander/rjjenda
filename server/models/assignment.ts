import {Instance} from 'sequelize'
import {GroupInstance} from './group'

export interface AssignmentAttributes {
	id: number //arbitrary
	group: GroupInstance
	weight: number //allows for flexibility, but currently will be 0 for minor/event and 1 for major
	dueDate: Date
	name: string
	visitors: boolean //should visitors be allowed to class on that day
}

export interface AssignmentInstance extends Instance<AssignmentAttributes>, AssignmentAttributes {}
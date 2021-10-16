import {Model} from 'sequelize'
import {GroupModel} from './group'

export interface TeacherAttributes {
	id: string //Commonwealth-assigned teacher ID (e.g. T1234)
	firstName: string //e.g. Alex
	lastName: string //e.g. Lew
	username: string //e.g. alew
	admin: boolean //whether teacher has admin privileges
	admissions: boolean //whether teacher has admissions privileges
}

export interface TeacherModel extends Model<TeacherAttributes>, TeacherAttributes {
	groups: GroupModel[]
	addGroup(group: GroupModel): Promise<void>
	removeGroup(group: GroupModel): Promise<void>
}
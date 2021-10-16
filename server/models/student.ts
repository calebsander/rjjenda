import {Model} from 'sequelize'
import {GroupModel} from './group'
import {TeacherModel} from './teacher'

export interface StudentAttributes {
	id: string //Commonwealth-assigned student ID (e.g. S1234)
	firstName: string //e.g. Caleb
	lastName: string //e.g. Sander
	username: string //e.g. csander
	advisorId: string | null //advisor relationships don't exist on initial import
	year: number //e.g. 2017
}

export interface StudentModel extends Model<StudentAttributes>, StudentAttributes {
	advisor: TeacherModel | null
	groups: GroupModel[]
}
import {Instance} from 'sequelize'
import {GroupInstance} from './group'
import {TeacherInstance} from './teacher'

export interface StudentAttributes {
	id: string //Commonwealth-assigned student ID (e.g. S1234)
	firstName: string //e.g. Caleb
	lastName: string //e.g. Sander
	username: string //e.g. csander
	advisor: TeacherInstance | null //advisor relationships don't exist on initial import
	year: number //e.g. 2017
}

export interface StudentInstance extends Instance<StudentAttributes>, StudentAttributes {
	advisorId: number
	groups: GroupInstance[]
}
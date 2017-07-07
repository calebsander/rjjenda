import {Instance} from 'sequelize'
import {TeacherInstance} from './teacher'

export interface StudentAttributes {
	id: string //Commonwealth-assigned student ID (e.g. S1234)
	firstName: string //e.g. Caleb
	lastName: string //e.g. Sander
	username: string //e.g. csander
	advisor: TeacherInstance
	year: number //e.g. 2017
}

export interface StudentInstance extends Instance<StudentAttributes> {}
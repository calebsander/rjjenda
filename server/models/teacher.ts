import {Instance} from 'sequelize'

export interface TeacherAttributes {
	id: string //Commonwealth-assigned teacher ID (e.g. T1234)
	firstName: string //e.g. Alex
	lastName: string //e.g. Lew
	username: string //e.g. alew
	admin: boolean //whether teacher has admin privileges
	admissions: boolean //whether teacher has admissions privileges
}

export interface TeacherInstance extends Instance<TeacherAttributes>, TeacherAttributes {}
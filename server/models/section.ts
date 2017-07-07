import {Instance} from 'sequelize'
import {CourseInstance} from './course'
import {TeacherInstance} from './teacher'

export interface SectionAttributes {
	id: number //arbitrary
	course: CourseInstance
	number: number //e.g. 2
	teacher: TeacherInstance
}

export interface SectionInstance extends Instance<SectionAttributes> {}
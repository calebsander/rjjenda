import {Instance} from 'sequelize'
import {CourseAttributes, CourseInstance} from './course'
import {TeacherAttributes, TeacherInstance} from './teacher'

export interface SectionAttributes {
	id: number //arbitrary
	course: CourseAttributes
	number: number //e.g. 2
	teacher: TeacherAttributes
}

export interface SectionInstance extends Instance<SectionAttributes> {}
import {Instance} from 'sequelize'
import {CourseInstance} from './course'
import {TeacherInstance} from './teacher'

export interface SectionAttributes {
	id?: number //arbitrary
	courseId?: string
	number?: number //e.g. 2
	teacherId?: string
}

export interface SectionInstance extends Instance<SectionAttributes>, SectionAttributes {
	course: CourseInstance
	teacher: TeacherInstance
}
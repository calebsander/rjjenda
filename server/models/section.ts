import {Instance} from 'sequelize'
import {CourseInstance} from './course'
import {GroupInstance} from './group'
import {TeacherInstance} from './teacher'

export interface SectionAttributes {
	id?: number //arbitrary
	courseId?: string
	number?: number //e.g. 2
	teacherId?: string
}

export interface SectionInstance extends Instance<SectionAttributes>, SectionAttributes {
	course: CourseInstance
	group: GroupInstance,
	teacher: TeacherInstance
}
import {Model} from 'sequelize'
import {CourseModel} from './course'
import {GroupModel} from './group'
import {TeacherModel} from './teacher'

export interface SectionAttributes {
	id?: number //arbitrary
	courseId?: string
	number?: number //e.g. 2
	periods?: string | null //e.g. 'M2, Tu5, W3, Th1'
	teacherId?: string
}

export interface SectionModel extends Model<SectionAttributes>, SectionAttributes {
	course: CourseModel
	group: GroupModel,
	teacher: TeacherModel | null
}
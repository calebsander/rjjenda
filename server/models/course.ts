import {Model} from 'sequelize'
import {SectionModel} from './section'

export interface CourseAttributes {
	id: string //e.g. 101
	name: string //e.g. English 9
}

export interface CourseModel extends Model<CourseAttributes>, CourseAttributes {
	sections?: SectionModel[]
}
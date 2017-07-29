import {Instance} from 'sequelize'
import {SectionInstance} from './section'

export interface CourseAttributes {
	id: string //e.g. 101
	name: string //e.g. English 9
}

export interface CourseInstance extends Instance<CourseAttributes>, CourseAttributes {
	sections?: SectionInstance[]
}
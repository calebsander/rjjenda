import {Instance} from 'sequelize'
import {GroupInstance} from './group'

export interface GradeGroupAttributes {
	year: number | null //if null, corresponds to all students; otherwise, the graduation year of this grade
	groupId?: number //the group representing this grade group
}

export interface GradeGroupInstance extends Instance<GradeGroupAttributes>, GradeGroupAttributes {
	group: GroupInstance
}
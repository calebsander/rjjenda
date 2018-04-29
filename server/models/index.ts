import * as Sequelize from 'sequelize'
import {StudentAttributes, StudentInstance} from './student'
import {TeacherAttributes, TeacherInstance} from './teacher'
import {CourseAttributes, CourseInstance} from './course'
import {SectionAttributes, SectionInstance} from './section'
import {GroupAttributes, GroupInstance} from './group'
import {AssignmentAttributes, AssignmentInstance} from './assignment'
import {LimitAttributes, LimitInstance} from './limit'
import {WarningAttributes, WarningInstance} from './warning'
import {GradeGroupAttributes, GradeGroupInstance} from './grade-group'
import {EventAttributes, EventInstance} from './event'
import StudentModel from './student-model'
import TeacherModel from './teacher-model'
import CourseModel from './course-model'
import SectionModel from './section-model'
import GroupModel from './group-model'
import AssignmentModel from './assignment-model'
import LimitModel from './limit-model'
import WarningModel from './warning-model'
import GradeGroupModel from './grade-group-model'
import EventModel from './event-model'
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

type AssociateFunction = (models: SequelizeModels) => void
export interface SequelizeModels {
	Student: Sequelize.Model<StudentInstance, StudentAttributes>
	Teacher: Sequelize.Model<TeacherInstance, TeacherAttributes>
	Course: Sequelize.Model<CourseInstance, CourseAttributes>
	Section: Sequelize.Model<SectionInstance, SectionAttributes>
	GradeGroup: Sequelize.Model<GradeGroupInstance, GradeGroupAttributes>
	Group: Sequelize.Model<GroupInstance, GroupAttributes>
	Assignment: Sequelize.Model<AssignmentInstance, AssignmentAttributes>
	Limit: Sequelize.Model<LimitInstance, LimitAttributes>
	Warning: Sequelize.Model<WarningInstance, WarningAttributes>
	Event: Sequelize.Model<EventInstance, EventAttributes>
	[modelName: string]: Sequelize.Model<any, any>
}
export function addAssociations<I, A>(model: Sequelize.Model<I, A>, associate: AssociateFunction): Sequelize.Model<I, A> {
	return Object.assign(model, {associate})
}

class Database {
	readonly sequelize: Sequelize.Sequelize
	readonly models: SequelizeModels

	constructor() {
		this.sequelize = new Sequelize(config)
		this.models = {
			Student: StudentModel(this.sequelize),
			Teacher: TeacherModel(this.sequelize),
			Course: CourseModel(this.sequelize),
			Section: SectionModel(this.sequelize),
			Group: GroupModel(this.sequelize),
			Assignment: AssignmentModel(this.sequelize),
			Limit: LimitModel(this.sequelize),
			Warning: WarningModel(this.sequelize),
			GradeGroup: GradeGroupModel(this.sequelize),
			Event: EventModel(this.sequelize)
		}

		for (const modelName in this.models) {
			const model = this.models[modelName]
			if (model.associate) model.associate(this.models)
		}
	}
}

const database = new Database
export const sequelize = database.sequelize
export const {
	Student,
	Teacher,
	Course,
	Section,
	Group,
	Assignment,
	Limit,
	Warning,
	GradeGroup,
	Event
} = database.models
import * as Sequelize from 'sequelize'
import {StudentModel} from './student'
import {TeacherModel} from './teacher'
import {CourseModel} from './course'
import {SectionModel} from './section'
import {GroupModel} from './group'
import {AssignmentModel} from './assignment'
import {LimitModel} from './limit'
import {WarningModel} from './warning'
import {GradeGroupModel} from './grade-group'
import {EventModel} from './event'
import defineStudent from './student-model'
import defineTeacher from './teacher-model'
import defineCourse from './course-model'
import defineSection from './section-model'
import defineGroup from './group-model'
import defineAssignment from './assignment-model'
import defineLimit from './limit-model'
import defineWarning from './warning-model'
import defineGradeGroup from './grade-group-model'
import defineEvent from './event-model'
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

type AssociateFunction = (models: SequelizeModels) => void
type AssociatableModelCtor<M extends Sequelize.Model<any>> =
	Sequelize.ModelCtor<M> & {associate?: AssociateFunction}
export interface SequelizeModels {
	Student: Sequelize.ModelCtor<StudentModel>
	Teacher: Sequelize.ModelCtor<TeacherModel>
	Course: Sequelize.ModelCtor<CourseModel>
	Section: Sequelize.ModelCtor<SectionModel>
	GradeGroup: Sequelize.ModelCtor<GradeGroupModel>
	Group: Sequelize.ModelCtor<GroupModel>
	Assignment: Sequelize.ModelCtor<AssignmentModel>
	Limit: Sequelize.ModelCtor<LimitModel>
	Warning: Sequelize.ModelCtor<WarningModel>
	Event: Sequelize.ModelCtor<EventModel>
	[modelName: string]: AssociatableModelCtor<Sequelize.Model<{}>>
}
export function addAssociations<M extends Sequelize.Model<any>>(
	model: Sequelize.ModelCtor<M>,
	associate: AssociateFunction
): AssociatableModelCtor<M> {
	return Object.assign(model, {associate})
}

class Database {
	readonly sequelize: Sequelize.Sequelize
	readonly models: SequelizeModels

	constructor() {
		this.sequelize = new Sequelize.Sequelize(config)
		this.models = {
			Student: defineStudent(this.sequelize),
			Teacher: defineTeacher(this.sequelize),
			Course: defineCourse(this.sequelize),
			Section: defineSection(this.sequelize),
			Group: defineGroup(this.sequelize),
			Assignment: defineAssignment(this.sequelize),
			Limit: defineLimit(this.sequelize),
			Warning: defineWarning(this.sequelize),
			GradeGroup: defineGradeGroup(this.sequelize),
			Event: defineEvent(this.sequelize)
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
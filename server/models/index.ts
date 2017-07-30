import * as Sequelize from 'sequelize'
import {StudentAttributes, StudentInstance} from './student'
import {TeacherAttributes, TeacherInstance} from './teacher'
import {CourseAttributes, CourseInstance} from './course'
import {SectionAttributes, SectionInstance} from './section'
import {GroupAttributes, GroupInstance} from './group'
import {AssignmentAttributes, AssignmentInstance} from './assignment'
import {LimitAttributes, LimitInstance} from './limit'
import {InfoAttributes, InfoInstance} from './info'
import {GradeGroupAttributes, GradeGroupInstance} from './grade-group'
import StudentModel from './student-model'
import TeacherModel from './teacher-model'
import CourseModel from './course-model'
import SectionModel from './section-model'
import GroupModel from './group-model'
import AssignmentModel from './assignment-model'
import LimitModel from './limit-model'
import InfoModel from './info-model'
import GradeGroupModel from './grade-group-model'
const env: string = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

type AssociateFunction = (models: SequelizeModels) => void
interface Associable {
	associate?: AssociateFunction
}
export type AssociableModel<I, A> = Sequelize.Model<I, A> & Associable
export interface SequelizeModels {
	Student: AssociableModel<StudentInstance, StudentAttributes>
	Teacher: AssociableModel<TeacherInstance, TeacherAttributes>
	Course: AssociableModel<CourseInstance, CourseAttributes>
	Section: AssociableModel<SectionInstance, SectionAttributes>
	GradeGroup: AssociableModel<GradeGroupInstance, GradeGroupAttributes>
	Group: AssociableModel<GroupInstance, GroupAttributes>
	Assignment: AssociableModel<AssignmentInstance, AssignmentAttributes>
	Limit: AssociableModel<LimitInstance, LimitAttributes>
	Info: AssociableModel<InfoInstance, InfoAttributes>
	[modelName: string]: Associable
}
export function addAssociations<I, A>(model: Sequelize.Model<I, A>, associate: AssociateFunction): AssociableModel<I, A> {
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
			Info: InfoModel(this.sequelize),
			GradeGroup: GradeGroupModel(this.sequelize)
		}

		for (const modelName in this.models) {
			const model = this.models[modelName]
			if (model.associate) model.associate(this.models)
		}
	}
}

const database = new Database
export const sequelize = database.sequelize
export const {Student, Teacher, Course, Section, Group, Assignment, Limit, Info, GradeGroup} =
	database.models
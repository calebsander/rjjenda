import {Model} from 'sequelize'
import {AssignmentModel} from './assignment'
import {SectionModel} from './section'
import {StudentModel} from './student'

export interface GroupAttributes {
	id?: number //arbitrary
	sectionId: number | null
	name: string | null //null if associated with a section, because name is in the course + section number
}

export interface GroupModel extends Model<GroupAttributes>, GroupAttributes {
	section: SectionModel | null //null if not associated with a section
	students?: StudentModel[]
	assignments?: AssignmentModel[]
	studentCount?: number
	setStudents(students: StudentModel[]): Promise<void>
	addStudent(student: StudentModel): Promise<void>
	removeStudent(student: StudentModel): Promise<void>
}
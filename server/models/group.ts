import {Instance} from 'sequelize'
import {SectionInstance} from './section'
import {StudentInstance} from './student'

export interface GroupAttributes {
	sectionId: number | null
	name: string | null //null if associated with a section, because name is in the course + section number
	//teacherId: number | null //null if associated with a section, because teacher is stored with section
}

export interface GroupInstance extends Instance<GroupAttributes>, GroupAttributes {
	id: number //arbitrary
	section: SectionInstance | null //null if not associated with a section
	studentCount?: number
	setStudents(students: StudentInstance[]): Promise<void>
}
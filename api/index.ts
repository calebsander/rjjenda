//Authentication
export const NEED_TO_BE_LOGGED_IN = 'Need to be logged in'

export type LoggedIn =
	{loggedIn: false} |
	{loggedIn: true, type: 'student' | 'teacher'}

export interface UserInfo {
	admin?: boolean
	admissions?: boolean
	name: string
}

//Used for admin page & advisor page
export interface MatchingStudent {
	id: string
	firstName: string
	lastName: string
}

//Assignments view
export interface AssignmentGroup {
	editPrivileges: boolean
	id: number
	name: string
}

export interface GroupQuery {
	nameSearch: string
}

export interface OtherSection {
	groupId: number
	number: number
}

export interface CheckAssignment {
	due: string //ISO string
	groupIds: number[] //assumed that these groups do not have any students in common
	major: boolean
}
export interface LimitViolation {
	days: number
	student: string
	assignments: string[]
	studentEmail: string
	advisorEmail?: string
}
export interface AtFaultViolation extends LimitViolation {
	fault: string //the group name at fault
}

export interface AddAssignment {
	due: string //ISO string
	groupIds: number[] //assumed that these groups do not have any students in common
	major: boolean
	name: string
	visitors: boolean
}

export interface EditAssignment {
	id: number
	name: string
	visitors: boolean
}

export interface AssignmentListRequest {
	groupId: number
	year: number
	month: number //JavaScript-style (i.e. 0 to 11)
	date: number
	days: number
}
interface AssignmentResponse {
	day: number //index (starting at 1) in the date window
	id: number
	name: string
	visitors: boolean
	updated: string //ISO string
	weight: number
}
export type Assignments = AssignmentResponse[]

export interface NoVisitorsRequest {
	year: number
	month: number
	date: number
	days: number
}

export interface WarningListRequest {
	groupIds: number[]
	year: number
	month: number
	date: number
	days: number
}
export interface StudentWarning {
	assignments: string[]
	color: string //#abcdef
	student: string
	weight: number
}
export interface GroupWarningIndices {
	[groupId: number]: number[] | undefined
}
export interface DayGroupWarnings {
	groups: GroupWarningIndices //indices into warnings
	warnings: StudentWarning[]
}
export type GroupWarnings = DayGroupWarnings[]

interface AssignmentCourse {
	id: string
	name: string
}
export type CourseList = AssignmentCourse[]

//Advisor view
export interface AdviseeAssignmentRequest {
	id: string
	year: number
	month: number
	date: number
	days: number
}
export interface AdviseeAssignment {
	course: string
	name: string
	teacher?: string
	weight: number
}
export interface AdviseeDay {
	assignments: AdviseeAssignment[]
	warning: string | undefined //#abcdef
}
export type AdviseeWeek = AdviseeDay[]

//Admin interface
export interface Student {
	id: string
	firstName: string
	lastName: string
	username: string
	year: number
	advisor: string
	[attribute: string]: string | number
}
export type Students = Student[]

export interface StudentUpdate {
	attribute: string
	value: any
}

export interface NewStudent {
	id: string
	firstName: string
	lastName: string
	username: string
	year: number
	//advisor can be set later
}

export interface Teacher {
	id: string
	firstName: string
	lastName: string
	username: string
	admin: boolean
	admissions: boolean
	[attribute: string]: string | boolean
}
export type Teachers = Teacher[]

export type TeacherEditAttribute = 'firstName' | 'lastName' | 'username'
export interface TeacherUpdate {
	attribute: TeacherEditAttribute
	value: string
}

export interface TeacherPermission {
	permission: 'admin' | 'admissions'
	value: boolean
}

export type NewTeacher = Teacher

export interface Group {
	id: number
	section: boolean
	name: string
	teacher: string | null
	studentCount: number
	[attribute: string]: string | number | boolean | null
}
export type Groups = Group[]

export interface NewGroupName {
	id: number
	newName: string
}

export interface NewGroup {
	name: string
}

export interface StudentQuery {
	nameSearch: string
}

export interface Course {
	id: string
	name: string
	sections: number[]
}
export type Courses = Course[]

export interface NewCourse {
	id: string
	name: string
	sectionCount: number
}
export interface NewCourseName {
	id: string
	name: string
}

export interface Limit {
	id: number
	days: number
	weight: number
}
export type Limits = Limit[]
export interface NewLimit {
	days: number
	weight: number
}

export interface Warning {
	id: number
	color: string //#abcdef
	weight: number
}
export type Warnings = Warning[]
export interface NewWarning {
	color: string //#abcdef
	weight: number
}

export interface WrongDomainEmails {
	invalidEmails: string[]
}

export interface SectionsNotFound {
	missingSections: string[]
}

interface TeacherEntry {
	id: string
	name: string
}
export type TeachersList = TeacherEntry[]

//Version info
export interface VersionInfo {
	app: string
	node: string
	sequelize: string
	typescript: string
}

//Generic format for all API responses
export type APIResponse =
	{success: false, message: string} |
	{success: true, data: any}
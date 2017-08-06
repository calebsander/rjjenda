<template>
	<div>
		<md-table-card id='students-table'>
			<md-toolbar>
				<h1 class='md-title'>Students</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newStudent' id='new-student'>
					<md-icon>add</md-icon>
					<md-tooltip>Create a new student</md-tooltip>
				</md-button>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>ID</md-table-head>
						<md-table-head>First name</md-table-head>
						<md-table-head>Last name</md-table-head>
						<md-table-head>
							Username
							<md-tooltip md-direction='top'>Should match e-mail address</md-tooltip>
						</md-table-head>
						<md-table-head>Year</md-table-head>
						<md-table-head>
							Advisor
							<md-tooltip md-direction='top'>Last name only</md-tooltip>
						</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='student in studentsSlice' :key='student.id'>
						<md-table-cell> <!--Can't reference student by id when updating id, so editing is disabled-->
							{{ student.id }}
						</md-table-cell>
						<md-table-cell @click.native='edit(student, "firstName")'>
							{{ student.firstName }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(student, "lastName")'>
							{{ student.lastName }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(student, "username")'>
							{{ student.username }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(student, "year")'>
							{{ student.year }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='editAdvisor(student)'>
							{{ student.advisor }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteStudent(student.id)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
			<md-table-pagination
				:md-size='DEFAULT_PAGINATION'
				:md-total='students.length'
				:md-page-options='[DEFAULT_PAGINATION]'
				@pagination='paginate'
			>
			</md-table-pagination>
		</md-table-card>

		<md-dialog ref='editor' md-open-from='#students-table' md-close-to='#students-table'>
			<md-dialog-title v-if='editStudent'> <!--Avoid computations if editStudent == null-->
				Editing {{ editAttribute }} of
				{{ editStudent.firstName }} {{editStudent.lastName }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>{{ editAttribute }}</label>
					<md-input v-model='editValue'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='save'>Save</md-button>
				<md-button class='md-primary' @click='cancel'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<teacher-selector ref='teacherSelector' @save='saveAdvisor'></teacher-selector>

		<md-dialog ref='newStudent' md-open-from='#new-student' md-close-to='#new-student'>
			<md-dialog-title>New student</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>ID (must start with "S")</label>
					<md-input v-model='newId' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>First name</label>
					<md-input v-model='newFirstName' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Last name</label>
					<md-input v-model='newLastName' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Username (from e-mail)</label>
					<md-input v-model='newUsername' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Graduation Year</label>
					<md-input v-model='newYear' type='number' required></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='create'>Create</md-button>
				<md-button class='md-primary' @click='cancelCreation'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import TeacherSelector from './TeacherSelector.vue'
	import apiFetch from '../api-fetch'
	import {NewStudent, Student, Students, StudentUpdate} from '../../../api'

	interface PaginationOptions {
		page: number
		size: number
	}
	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-students',
		components: {
			'teacher-selector': TeacherSelector
		},
		watch: {
			newFirstName: 'updateUsername',
			newLastName: 'updateUsername'
		}
	})
	export default class ManageStudents extends Vue {
		readonly DEFAULT_PAGINATION = 10
		students: Students = []
		studentsSlice: Students = []
		loading = true

		page: number = 1
		size: number = this.DEFAULT_PAGINATION

		editStudent: Student | null = null
		editAttribute = ''
		editValue = ''

		newId = ''
		newFirstName = ''
		newLastName = ''
		newUsername = ''
		newYear = 0

		mounted() {
			this.loadStudents()
		}
		loadStudents() {
			apiFetch({
				url: '/admin/students',
				handler: (students: Students) => {
					this.students = students
					this.paginate(this) //stay on current page after reload
					this.loading = false
				},
				router: this.$router
			})
		}
		getPageStart({page, size}: PaginationOptions) {
			return (page - 1) * size
		}
		paginate({page, size}: PaginationOptions) {
			this.studentsSlice = this.students.slice(this.getPageStart({page, size}), page * size)
			this.page = page
			this.size = size
		}
		deleteStudent(id: string) {
			this.loading = true
			apiFetch({
				url: '/admin/student/' + id,
				method: 'DELETE',
				handler: () => this.loadStudents(),
				router: this.$router
			})
		}
		edit(student: Student, attribute: string) {
			this.editStudent = student
			this.editAttribute = attribute
			this.editValue = String(student[attribute])
			;(this.$refs.editor as Dialog).open()
		}
		cancel() {
			(this.$refs.editor as Dialog).close()
		}
		save() {
			const student = this.editStudent as Student //asserting it is not null
			const value = this.editAttribute === 'year' ? Number(this.editValue) : this.editValue
			const updateData: StudentUpdate = {
				attribute: this.editAttribute,
				value
			}
			this.loading = true
			apiFetch({
				url: '/admin/student/' + student.id + '/update',
				data: updateData,
				handler: () => {
					(this.$refs.editor as Dialog).close()
					student[this.editAttribute] = value
					this.loading = false
				},
				router: this.$router
			})
		}
		editAdvisor(student: Student) {
			(this.$refs.teacherSelector as Dialog).open()
			this.editStudent = student
		}
		saveAdvisor(advisorId: string) {
			const student = this.editStudent as Student
			this.loading = true
			apiFetch({
				url: '/admin/student/set-advisor/' + student.id + '/' + advisorId,
				handler: () => this.loadStudents(), //we don't have advisor's name, so have to reload to display it
				router: this.$router
			})
		}
		newStudent() {
			this.newId = ''
			this.newFirstName = ''
			this.newLastName = ''
			this.newUsername = ''
			this.newYear = new Date().getFullYear() + 4 //default to assuming incoming freshman
			;(this.$refs.newStudent as Dialog).open()
		}
		updateUsername() { //automatically generate username
			if (this.newFirstName && this.newLastName) {
				this.newUsername = (this.newFirstName[0] + this.newLastName).toLowerCase()
			}
		}
		create() {
			if (!this.newId.startsWith('S')) {
				alert('ID must start with "S"')
				return
			}
			if (!this.newFirstName) {
				alert('No first name given')
				return
			}
			if (!this.newLastName) {
				alert('No last name given')
				return
			}
			if (!this.newUsername) {
				alert('No username given')
				return
			}

			const data: NewStudent = {
				id: this.newId,
				firstName: this.newFirstName,
				lastName: this.newLastName,
				username: this.newUsername,
				year: this.newYear
			}
			this.loading = true
			apiFetch({
				url: '/admin/student',
				data,
				handler: () => {
					(this.$refs.newStudent as Dialog).close()
					this.loading = false
					this.students.splice(this.getPageStart(this), 0, { //add student to top of current page
						...data,
						advisor: ''
					})
					this.paginate(this)
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newStudent as Dialog).close()
		}
	}
</script>
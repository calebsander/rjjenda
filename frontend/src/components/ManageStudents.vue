<template>
	<div>
		<md-table-card id='students-table'>
			<md-toolbar>
				<h1 class='md-title'>Students</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
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
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import TeacherSelector from './TeacherSelector.vue'
	import apiFetch from '../api-fetch'
	import {Student, Students, StudentUpdate} from '../../../api'

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
		}
	})
	export default class ManageStudents extends Vue {
		readonly DEFAULT_PAGINATION = 10
		students: Students = []
		studentsSlice: Students = []
		loading = true
		editStudent: Student | null = null
		editAttribute = ''
		editValue = ''

		mounted() {
			this.loadStudents()
		}
		loadStudents() {
			apiFetch({
				url: '/admin/students',
				handler: (students: Students) => {
					this.students = students
					this.paginate({page: 1, size: this.DEFAULT_PAGINATION})
					this.loading = false
				},
				router: this.$router
			})
		}
		paginate({page, size}: PaginationOptions) {
			this.studentsSlice = this.students.slice((page - 1) * size, page * size)
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
				handler: () => this.loadStudents(),
				router: this.$router
			})
		}
	}
</script>
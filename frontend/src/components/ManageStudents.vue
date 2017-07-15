<template>
	<div>
		<md-table-card id='table'>
			<md-toolbar>
				<h1 class='md-title'>Students</h1>
				<md-spinner md-indeterminate v-if='loading'></md-spinner>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>ID</md-table-head>
						<md-table-head>First name</md-table-head>
						<md-table-head>Last name</md-table-head>
						<md-table-head>Username</md-table-head>
						<md-table-head>Year</md-table-head>
						<md-table-head>Advisor</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='student in studentsSlice' :key='student.id'>
						<md-table-cell> <!--Can't reference student by id when updating id-->
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
						<md-table-cell @click.native='edit(student, "advisor")'>
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

		<md-dialog ref='editor' md-open-from='#table' md-close-to='#table'>
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
				<md-button class='md-primary' @click='save'>Save</md-button>
				<md-button class='md-primary' @click='cancel'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
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
		name: 'manage-students'
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
	}
</script>
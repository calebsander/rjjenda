<template>
	<div>
		<md-table-card id='teachers-table'>
			<md-toolbar>
				<h1 class='md-title'>Teachers</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newTeacher' id='new-teacher'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Add a new teacher</md-tooltip>
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
						<md-table-head>Admin</md-table-head>
						<md-table-head>Admissions</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='teacher in teachersSlice' :key='teacher.id'>
						<md-table-cell> <!--id is primary key, so can't be changed-->
							{{ teacher.id }}
						</md-table-cell>
						<md-table-cell @click.native='edit(teacher, "firstName")'>
							{{ teacher.firstName }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(teacher, "lastName")'>
							{{ teacher.lastName }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(teacher, "username")'>
							{{ teacher.username }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell>
							<md-checkbox v-model='teacher.admin' @change='editPermission(teacher, "admin")'></md-checkbox>
						</md-table-cell>
						<md-table-cell>
							<md-checkbox v-model='teacher.admissions' @change='editPermission(teacher, "admissions")'></md-checkbox>
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteTeacher(teacher)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
			<md-table-pagination
				:md-size='DEFAULT_PAGINATION'
				:md-total='teachers.length'
				:md-page-options='[DEFAULT_PAGINATION]'
				@pagination='paginate'
			>
			</md-table-pagination>
		</md-table-card>

		<md-dialog ref='editor' md-open-from='#teachers-table' md-close-to='#teachers-table'>
			<div v-if='editTeacher'> <!--avoid computations if editTeacher == null-->
				<md-dialog-title>
					Editing {{ editAttribute }} of
					{{ editTeacher.firstName }} {{editTeacher.lastName }}
				</md-dialog-title>
				<md-dialog-content>
					<md-input-container>
						<label>{{ editAttribute }}</label>
						<md-input v-model='editTeacher[editAttribute]'></md-input>
					</md-input-container>
				</md-dialog-content>
				<md-dialog-actions>
					<md-button class='md-accent' @click='save'>Save</md-button>
					<md-button class='md-primary' @click='cancel'>Cancel</md-button>
				</md-dialog-actions>
			</div>
		</md-dialog>

		<md-dialog ref='newTeacher' md-open-from='#new-teacher' md-close-to='#new-teacher'>
			<md-dialog-title>New teacher</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>ID (must start with "T")</label>
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
				<md-checkbox v-model='newAdmin' required>Admin</md-checkbox>
				<md-checkbox v-model='newAdmissions' required>Admissions</md-checkbox>
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
	import apiFetch from '../api-fetch'
	import {NewTeacher, Teacher, Teachers, TeacherEditAttribute, TeacherUpdate} from '../../../api'

	interface PaginationOptions {
		page: number
		size: number
	}
	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-teachers',
		watch: {
			newFirstName: 'updateUsername',
			newLastName: 'updateUsername'
		}
	})
	export default class ManageTeachers extends Vue {
		readonly DEFAULT_PAGINATION = 10
		teachers: Teachers = []
		teachersSlice: Teachers = []
		loading = true

		page: number = 1
		size: number = this.DEFAULT_PAGINATION

		editTeacher: Teacher | null = null
		editAttribute: TeacherEditAttribute = 'firstName' //arbitrary

		newId = ''
		newFirstName = ''
		newLastName = ''
		newUsername = ''
		newAdmin = false
		newAdmissions = false

		mounted() {
			this.loadTeachers()
		}
		loadTeachers() {
			apiFetch({
				url: '/admin/teachers',
				handler: (teachers: Teachers) => {
					this.teachers = teachers
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
			this.teachersSlice = this.teachers.slice(this.getPageStart({page, size}), page * size)
			this.page = page
			this.size = size
		}
		deleteTeacher(teacher: Teacher) {
			this.loading = true
			apiFetch({
				url: '/admin/teacher/' + String(teacher.id),
				method: 'DELETE',
				handler: () => {
					this.loading = false
					const teacherIndex = this.teachers.indexOf(teacher)
					this.teachers.splice(teacherIndex, 1)
					this.paginate(this)
				},
				router: this.$router
			})
		}
		edit(teacher: Teacher, attribute: TeacherEditAttribute) {
			this.editTeacher = teacher
			this.editAttribute = attribute
			;(this.$refs.editor as Dialog).open()
		}
		cancel() {
			(this.$refs.editor as Dialog).close()
		}
		save() {
			const teacher = this.editTeacher as Teacher //asserting it is not null
			const updateData: TeacherUpdate = {
				attribute: this.editAttribute,
				value: teacher[this.editAttribute]
			}
			this.loading = true
			apiFetch({
				url: '/admin/teacher/' + teacher.id + '/update',
				data: updateData,
				handler: () => {
					(this.$refs.editor as Dialog).close()
					this.loading = false
				},
				router: this.$router
			})
		}
		editPermission(teacher: Teacher, permission: 'admin' | 'admissions') {
			this.loading = true
			console.log(teacher, permission)
			//not implemented yet
		}
		newTeacher() {
			this.newId = ''
			this.newFirstName = ''
			this.newLastName = ''
			this.newUsername = ''
			this.newAdmin = false
			this.newAdmissions = false
			;(this.$refs.newTeacher as Dialog).open()
		}
		updateUsername() { //automatically generate username
			if (this.newFirstName && this.newLastName) {
				this.newUsername = (this.newFirstName[0] + this.newLastName).toLowerCase()
			}
		}
		create() {
			if (!this.newId.startsWith('T')) {
				alert('ID must start with "T"')
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

			const data: NewTeacher = {
				id: this.newId,
				firstName: this.newFirstName,
				lastName: this.newLastName,
				username: this.newUsername,
				admin: this.newAdmin,
				admissions: this.newAdmissions
			}
			this.loading = true
			apiFetch({
				url: '/admin/teacher',
				data,
				handler: () => {
					(this.$refs.newTeacher as Dialog).close()
					this.loading = false
					this.teachers.splice(this.getPageStart(this), 0, data) //add student to top of current page
					this.paginate(this)
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newTeacher as Dialog).close()
		}
	}
</script>
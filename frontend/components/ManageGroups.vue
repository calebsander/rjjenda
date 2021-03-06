<template>
	<div>
		<md-table-card id='groups-table'>
			<md-toolbar>
				<h1 class='md-title'>Groups</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newGroup' id='new-group'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new extracurricular group</md-tooltip>
				</md-button>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>Name</md-table-head>
						<md-table-head>Teacher</md-table-head>
						<md-table-head>Students</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='group in groupsSlice' :key='group.id'>
						<md-table-cell v-if='group.section'>
							{{ group.name }}
							<md-tooltip md-direction='top'>
								Group name automatically generated from course listing;
								edit it there
							</md-tooltip>
						</md-table-cell>
						<md-table-cell v-else @click.native='editName(group)'>
							{{ group.name }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell v-if='group.section' @click.native='editTeacher(group)'>
							{{ group.teacher }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell v-else>
							<md-tooltip md-direction='top'>
								Extracurricular groups don't have teachers assigned to them
							</md-tooltip>
						</md-table-cell>
						<md-table-cell @click.native='editStudents(group)'>
							{{ group.studentCount }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteGroup(group.id)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
			<md-table-pagination
				:md-size='DEFAULT_PAGINATION'
				:md-total='groups.length'
				:md-page-options='[DEFAULT_PAGINATION]'
				@pagination='paginate'
			>
			</md-table-pagination>
		</md-table-card>

		<md-dialog ref='editor' md-open-from='#groups-table' md-close-to='#groups-table'>
			<md-dialog-title v-if='editGroup'> <!--avoid computations if editGroup == null-->
				Editing name of
				{{ editGroup.name }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newName' required ref='editName'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='save'>Save</md-button>
				<md-button class='md-primary' @click='cancel'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<teacher-selector ref='teacherSelector' @save='saveTeacher' :teachers='teachers'></teacher-selector>

		<md-dialog ref='newGroup' md-open-from='#new-group' md-close-to='#new-group'>
			<md-dialog-title>New extracurricular group</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newGroupName' required ref='newName'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='create'>Create</md-button>
				<md-button class='md-primary' @click='cancelCreation'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog ref='selectStudents' md-open-from='#groups-table' md-close-to='#groups-table'>
			<md-dialog-title v-if='editGroup'> <!--avoid computations if editGroup == null-->
				Manage students in {{ editGroup.name }}
			</md-dialog-title>
			<md-dialog-content>
				<md-list>
					<md-list-item>
						<md-input-container>
							<label>Student name</label>
							<md-autocomplete
								v-model='newStudentName'
								:fetch='getStudents'
								:debounce='500'
								:min-chars='3'
								query-param='nameSearch'
								@selected='selectStudent'
								ref='studentName'
							>
							</md-autocomplete>
						</md-input-container>
						<md-button class='md-raised md-icon-button' @click='addStudent'>
							<md-icon>add</md-icon>
							<md-tooltip>Add student to group</md-tooltip>
						</md-button>
						<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
					</md-list-item>
					<md-list-item v-for='(student, index) in groupStudents' :key='index'>
						{{ student.firstName }} {{ student.lastName }}
						<md-button class='md-icon-button md-raised' @click='deleteStudent(index)'>
							<md-icon>delete</md-icon>
						</md-button>
					</md-list-item>
				</md-list>
			</md-dialog-content>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import TeacherSelector from './TeacherSelector.vue'
	import apiFetch from '../api-fetch'
	import {Group, Groups, MatchingStudent, NewGroupName, NewGroup, StudentQuery} from '../../api'
	import {UPDATE_COURSES} from '../admin-update-events'

	interface PaginationOptions {
		page: number
		size: number
	}
	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-groups',
		props: ['teachers'],
		components: {
			'teacher-selector': TeacherSelector
		}
	})
	export default class ManageGroups extends Vue {
		readonly DEFAULT_PAGINATION = 10
		groups: Groups = []
		groupsSlice: Groups = []
		loading = true

		page: number = 1
		size: number = this.DEFAULT_PAGINATION

		editGroup: Group | null = null
		newName = ''
		newGroupName = ''
		groupStudents: MatchingStudent[] = []
		newStudent: MatchingStudent | null = null
		newStudentName = '' //write-only; use newStudent for read

		mounted() {
			this.loadGroups()
		}
		loadGroups() {
			this.loading = true
			apiFetch({
				url: '/admin/groups',
				handler: (groups: Groups) => {
					this.groups = groups
					this.paginate(this) //stay on current page after reload
					this.loading = false
				},
				router: this.$router
			})
		}
		paginate({page, size}: PaginationOptions) {
			this.groupsSlice = this.groups.slice((page - 1) * size, page * size)
			this.page = page
			this.size = size
		}
		deleteGroup(id: number) {
			this.loading = true
			apiFetch({
				url: '/admin/group/' + String(id),
				method: 'DELETE',
				handler: () => {
					this.loadGroups()
					this.$emit(UPDATE_COURSES)
				},
				router: this.$router
			})
		}
		editName(group: Group) {
			this.editGroup = group
			this.newName = group.name
			;(this.$refs.editor as Dialog).open()
			setTimeout(() => (this.$refs.editName as Vue).$el.focus(), 0)
		}
		cancel() {
			(this.$refs.editor as Dialog).close()
		}
		save() {
			const group = this.editGroup as Group
			const data: NewGroupName = {
				id: group.id,
				newName: this.newName
			}
			this.loading = true
			apiFetch({
				url: '/admin/group/set-name',
				data,
				handler: () => {
					(this.$refs.editor as Dialog).close()
					group.name = this.newName
					this.loading = false
				},
				router: this.$router
			})
		}
		editTeacher(group: Group) {
			(this.$refs.teacherSelector as TeacherSelector).open()
			this.editGroup = group
		}
		saveTeacher(teacherId: string) {
			const group = this.editGroup as Group
			this.loading = true
			apiFetch({
				url: '/admin/group/set-teacher/' + String(group.id) + '/' + teacherId,
				handler: () => this.loadGroups(),
				router: this.$router
			})
		}
		resetSelectedStudent() {
			this.newStudent = null
			this.newStudentName = ''
		}
		editStudents(group: Group) {
			this.editGroup = group
			this.resetSelectedStudent()
			;(this.$refs.selectStudents as Dialog).open()
			setTimeout(() => {
				(this.$refs.studentName as Vue).$el.querySelector('input')!.focus() //have to select child of autocomplete container
			}, 0)
			this.loading = true
			apiFetch({
				url: '/admin/list-members/' + String(group.id),
				handler: (students: MatchingStudent[]) => {
					this.groupStudents = students
					this.loading = false
				},
				router: this.$router
			})
		}
		newGroup() {
			this.newGroupName = ''
			;(this.$refs.newGroup as Dialog).open()
			setTimeout(() => (this.$refs.newName as Vue).$el.focus(), 0)
		}
		create() {
			if (!this.newGroupName) {
				alert('Enter a name for the group')
				return
			}
			this.loading = true
			const data: NewGroup = {
				name: this.newGroupName
			}
			apiFetch({
				url: '/admin/group',
				data,
				handler: () => {
					(this.$refs.newGroup as Dialog).close()
					this.loadGroups()
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newGroup as Dialog).close()
		}
		getStudents(query: StudentQuery) {
			return new Promise<(MatchingStudent & {name: string})[]>((resolve, _) => { //currently no capability for catching errors from apiFetch()
				apiFetch({
					url: '/search-students',
					data: query,
					handler: (students: MatchingStudent[]) => {
						resolve(students.map(({id, firstName, lastName}) => ({
							id,
							firstName,
							lastName,
							name: firstName + ' ' + lastName
						})))
					},
					router: this.$router
				})
			})
		}
		selectStudent(student: MatchingStudent) {
			this.newStudent = student
		}
		addStudent() {
			const group = this.editGroup as Group
			const student = this.newStudent
			if (student === null) {
				alert('No student selected')
				return
			}
			const matchingStudent = this.groupStudents.find(existingStudent => //check whether student has already been added
				existingStudent.id === student.id
			)
			if (matchingStudent) {
				alert('Student already exists in group')
				return
			}

			this.loading = true
			apiFetch({
				url: '/admin/add-member/' + String(group.id) + '/' + student.id,
				handler: () => {
					this.loading = false
					this.resetSelectedStudent()
					this.groupStudents.push(student)
					group.studentCount++
				},
				router: this.$router
			})
		}
		deleteStudent(index: number) {
			const group = this.editGroup as Group
			const student = this.groupStudents[index]
			this.loading = true
			apiFetch({
				url: '/admin/remove-member/' + String(group.id) + '/' + student.id,
				method: 'DELETE',
				handler: () => {
					this.loading = false
					this.groupStudents.splice(index, 1)
					group.studentCount--
				},
				router: this.$router
			})
		}
	}
</script>
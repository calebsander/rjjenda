<template>
	<div>
		<md-table-card id='groups-table'>
			<md-toolbar>
				<h1 class='md-title'>Groups</h1>
				<md-spinner md-indeterminate v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newGroup' id='new-group'>
					<md-icon>add</md-icon>
					<md-tooltip>Create a new extracurricular group</md-tooltip>
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
			<md-dialog-title v-if='editGroup'> <!--Avoid computations if editGroup == null-->
				Editing name of
				{{ editGroup.name }}
			</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input v-model='newName'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-primary' @click='save'>Save</md-button>
				<md-button class='md-primary' @click='cancel'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<teacher-selector ref='teacherSelector' @save='saveTeacher'></teacher-selector>

		<md-dialog ref='newGroup' md-open-from='#new-group' md-close-to='#new-group'>
			<md-dialog-title>New extracurricular group</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Name</label>
					<md-input required v-model='newGroupName'></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-primary' @click='create'>Create</md-button>
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
	import {Group, Groups, NewGroupName, NewGroup} from '../../../api'

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
		components: {
			'teacher-selector': TeacherSelector
		}
	})
	export default class ManageGroups extends Vue {
		readonly DEFAULT_PAGINATION = 10
		groups: Groups = []
		groupsSlice: Groups = []
		loading = true
		editGroup: Group | null = null
		newName = ''
		newGroupName = ''

		mounted() {
			this.loadGroups()
		}
		loadGroups() {
			apiFetch({
				url: '/admin/groups',
				handler: (groups: Groups) => {
					this.groups = groups
					this.paginate({page: 1, size: this.DEFAULT_PAGINATION})
					this.loading = false
				},
				router: this.$router
			})
		}
		paginate({page, size}: PaginationOptions) {
			this.groupsSlice = this.groups.slice((page - 1) * size, page * size)
		}
		deleteGroup(id: number) {
			this.loading = true
			apiFetch({
				url: '/admin/group/' + String(id),
				method: 'DELETE',
				handler: () => this.loadGroups(),
				router: this.$router
			})
		}
		editName(group: Group) {
			this.editGroup = group
			this.newName = group.name
			;(this.$refs.editor as Dialog).open()
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
			(this.$refs.teacherSelector as Dialog).open()
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
		editStudents(group: Group) {
			console.log(group)
		}
		newGroup() {
			this.newGroupName = ''
			;(this.$refs.newGroup as Dialog).open()
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
	}
</script>
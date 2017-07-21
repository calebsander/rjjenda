<template>
	<div>
		<md-table-card id='groups-table'>
			<md-toolbar>
				<h1 class='md-title'>Groups</h1>
				<md-spinner md-indeterminate v-if='loading'></md-spinner>
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
						<md-table-cell v-else @click.native='edit(group, "name")'>
							{{ group.name }}
							<md-icon>edit</md-icon>
						</md-table-cell>
						<md-table-cell @click.native='edit(group, "teacher")'>
							{{ group.teacher }}
							<md-icon>edit</md-icon>
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
				Editing {{ editAttribute }} of
				{{ editGroup.name }}
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
	import {Group, Groups} from '../../../api'

	interface PaginationOptions {
		page: number
		size: number
	}
	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-groups'
	})
	export default class ManageGroups extends Vue {
		readonly DEFAULT_PAGINATION = 10
		groups: Groups = []
		groupsSlice: Groups = []
		loading = true
		editGroup: Group | null = null
		editAttribute = ''
		editValue = ''

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
		deleteGroup(id: string) {
			this.loading = true
			apiFetch({
				url: '/admin/group/' + id,
				method: 'DELETE',
				handler: () => this.loadGroups(),
				router: this.$router
			})
		}
		edit(group: Group, attribute: string) {
			this.editGroup = group
			this.editAttribute = attribute
			this.editValue = String(group[attribute])
			;(this.$refs.editor as Dialog).open()
		}
		cancel() {
			(this.$refs.editor as Dialog).close()
		}
		save() {
			/*const student = this.editStudent as Student //asserting it is not null
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
			})*/
		}
		editStudents(group: Group) {
			console.log(group)
		}
	}
</script>
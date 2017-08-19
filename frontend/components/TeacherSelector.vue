<template>
	<md-dialog ref='dialog'>
		<md-dialog-title>Select teacher</md-dialog-title>
		<md-dialog-content>
			<md-input-container>
				<label>Teacher</label>
				<md-autocomplete
					v-model='selectedTeacher'
					:list='teachersOrDefault'
					:filter-list='filterTeachers'
					:debounce='500'
					required
				>
				</md-autocomplete>
			</md-input-container>
		</md-dialog-content>
		<md-dialog-actions>
			<md-button class='md-accent' @click='save'>Save</md-button>
			<md-button class='md-primary' @click='cancel'>Cancel</md-button>
		</md-dialog-actions>
	</md-dialog>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {TeachersList} from '../../api'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	interface TeacherName {
		name: string
	}

	@Component({
		name: 'teacher-selector',
		props: ['teachers']
	})
	export default class TeacherSelector extends Vue {
		selectedTeacher = ''
		teachers: TeachersList | null

		get teachersOrDefault(): TeachersList {
			return this.teachers || [{id: '', name: 'placeholder'}]
		}
		get teacherIds(): Map<string, string> { //mapping of teacher names to ids
			return new Map(
				this.teachersOrDefault.map(({id, name}) => [name, id] as [string, string])
			)
		}
		filterTeachers(teachers: TeacherName[], query: string): TeacherName[] {
			return teachers.filter(
				({name}) => name.toLowerCase().includes(query.toLowerCase())
			)
		}
		get selectedId(): string | undefined {
			return this.teacherIds.get(this.selectedTeacher)
		}
		open() {
			this.selectedTeacher = ''
			;(this.$refs.dialog as Dialog).open()
		}
		cancel() {
			(this.$refs.dialog as Dialog).close()
		}
		save() {
			const selectedId = this.selectedId
			if (selectedId === undefined) {
				alert('No such teacher')
				return
			}
			(this.$refs.dialog as Dialog).close()
			this.$emit('save', selectedId)
		}
	}
</script>
<template>
	<md-dialog ref='dialog'>
		<md-dialog-title>Select teacher</md-dialog-title>
		<md-dialog-content>
			<md-input-container>
				<label>Teacher</label>
				<md-select v-model='selectedId' required>
					<md-option v-for='teacher in teachersOrDefault' :value='teacher.id' :key='teacher.id'>
						{{ teacher.name }}
					</md-option>
				</md-select>
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

	@Component({
		name: 'teacher-selector',
		props: ['teachers']
	})
	export default class TeacherSelector extends Vue {
		selectedId = ''
		teachers!: TeachersList | null

		get teachersOrDefault(): TeachersList {
			return this.teachers || [{id: '', name: ''}]
		}
		open() {
			this.selectedId = ''
			;(this.$refs.dialog as Dialog).open()
		}
		cancel() {
			(this.$refs.dialog as Dialog).close()
		}
		save() {
			if (!this.selectedId) {
				alert('Please select a teacher')
				return
			}
			(this.$refs.dialog as Dialog).close()
			this.$emit('save', this.selectedId)
		}
	}
</script>
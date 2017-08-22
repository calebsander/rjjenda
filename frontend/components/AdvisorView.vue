<template>
	<div>
		<md-toolbar class='md-dense week-toolbar'>
			<md-button @click='lastWeek'>
				<md-icon class='up-a-bit'>chevron_left</md-icon>
				Last week
			</md-button>
			<md-button @click='today'>
				This week
			</md-button>
			<md-button @click='nextWeek'>
				Next week
				<md-icon class='up-a-bit'>chevron_right</md-icon>
			</md-button>
			<md-spinner
				md-indeterminate
				:md-size='40'
				class='md-warn'
				:style='{visibility: loading ? "visible" : "hidden"}'
			>
			</md-spinner>
		</md-toolbar>
		<md-table>
			<md-table-header>
				<md-table-row>
					<md-table-head class='center'>
						Student
					</md-table-head>
					<md-table-head v-for='day in WEEK_DAYS' :key='day' class='center'>
						{{ getDayName(day) }}
						{{ getDay(day).toShortDate() }}
					</md-table-head>
				</md-table-row>
			</md-table-header>
			<md-table-body>
				<md-table-row v-for='(student, index) in students' :key='student.id'>
					<md-table-cell>
						{{ student.firstName }} {{ student.lastName }}
						<md-button class='md-raised hide-button' @click='removeStudent(index)'>Hide</md-button>
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day'>
					</md-table-cell>
				</md-table-row>
			</md-table-body>
		</md-table>

		<md-button class='md-raised' @click='loadAdvisees'>Show advisees</md-button>
	</div>
</template>

<script lang='ts'>
	import Component from 'vue-class-component'
	import {AssignedStudent} from '../../api'
	import apiFetch from '../api-fetch'
	import WeekManager from './WeekManager.vue'

	@Component
	export default class AdvisorView extends WeekManager {
		loading = false

		students: AssignedStudent[] = []

		mounted() {
			this.loadAdvisees()
		}
		loadAdvisees() {
			this.loading = true
			apiFetch({
				url: '/advisor/advisees',
				handler: (students: AssignedStudent[]) => {
					this.loading = false
					this.addStudents(students)
				},
				router: this.$router
			})
		}
		addStudents(students: AssignedStudent[]) {
			const areNewStudents: boolean[] = []
			for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
				const newId = students[studentIndex].id
				areNewStudents[studentIndex] = !this.students.find(({id}) => id === newId)
			}
			for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
				if (areNewStudents[studentIndex]) {
					this.students.push(students[studentIndex])
				}
			}
			this.students.sort((student1, student2) => {
				if (student1.lastName < student2.lastName) return -1
				if (student1.lastName > student2.lastName) return 1
				if (student1.firstName < student2.firstName) return -1
				if (student1.firstName > student2.firstName) return 1
				return 0
			})
		}
		removeStudent(index: number) {
			this.students.splice(index, 1)
		}
	}
</script>
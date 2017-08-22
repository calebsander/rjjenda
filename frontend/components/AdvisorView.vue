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
		<md-table class='assignment-grid'>
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
				<md-table-row v-for='(student, index) in students' :key='student.id' class='assignments-row'>
					<md-table-cell class='name-cell'>
						{{ student.firstName }} {{ student.lastName }}
					</md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day'>
						<md-layout md-column :md-gutter='8'>
							<md-list class='md-dense assignment-list'>
								<md-list-item v-for='assignment in getAssignments(student, day)' :key='assignment.name'>
									<span class='assignment-name' :title='assignment.name'>
										{{ assignment.name }}
										<span v-if='assignment.course'>
											({{ assignment.course }})
											<span v-if='assignment.teacher'>
												({{ assignment.teacher }})
											</span>
										</span>
									</span>
									<md-chip v-if='!assignment.weight'>minor</md-chip>
								</md-list-item>
							</md-list>
							<md-button
								v-if='getWarning(student, day)'
								class='md-icon-button md-raised'
								:style='{background: getWarning(student, day), color: "white"}'
							>
								!
							</md-button>
						</md-layout>
					</md-table-cell>
				</md-table-row>
				<md-table-row> <!-- for border along last student row-->
					<md-table-cell></md-table-cell>
					<md-table-cell v-for='day in WEEK_DAYS' :key='day'></md-table-cell>
				</md-table-row>
			</md-table-body>
		</md-table>

		<md-button class='md-raised' @click='loadAdvisees'>Show advisees</md-button>
	</div>
</template>

<script lang='ts'>
	import Component from 'vue-class-component'
	import {AdviseeAssignmentRequest, AdviseeAssignment, AdviseeDay, AdviseeWeek, AssignedStudent} from '../../api'
	import apiFetch from '../api-fetch'
	import WeekManager from './WeekManager.vue'

	@Component({
		watch: {
			mondayDate: 'reloadAssignments',
		}
	})
	export default class AdvisorView extends WeekManager {
		loading = false

		students: AssignedStudent[] = []
		//Map of students to maps of days to assignments and warnings for that day
		weekAssignments = new WeakMap<AssignedStudent, Map<number, AdviseeDay>>()
		//Map of students to their current load tokens
		loadTokens = new WeakMap<AssignedStudent, object>()

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
			const newStudents: AssignedStudent[] = []
			for (const student of students) {
				if (!this.students.find(({id}) => id === student.id)) {
					newStudents.push(student)
				}
			}
			this.students.push(...newStudents)
			this.students.sort((student1, student2) => {
				if (student1.lastName < student2.lastName) return -1
				if (student1.lastName > student2.lastName) return 1
				if (student1.firstName < student2.firstName) return -1
				if (student1.firstName > student2.firstName) return 1
				return 0
			})
			this.loadAssignments(newStudents)
		}
		removeStudent(index: number) {
			this.students.splice(index, 1)
		}
		loadAssignments(students: AssignedStudent[]) {
			this.loading = true
			Promise.all(students.map(student => {
				this.weekAssignments.delete(student)
				const loadToken = {}
				this.loadTokens.set(student, loadToken)
				const data: AdviseeAssignmentRequest = {
					id: student.id,
					...this.mondayDate.toYMD(),
					days: this.WEEK_DAYS
				}
				return new Promise((resolve, reject) => {
					apiFetch({
						url: '/advisor/assignments',
						data,
						handler: (week: AdviseeWeek) => {
							if (loadToken !== this.loadTokens.get(student)) {
								reject()
								return
							}

							const dayAssignments = new Map<number, AdviseeDay>()
							for (let day = 0; day < week.length; day++) dayAssignments.set(day + 1, week[day]) //since days are 1-indexed in template
							this.weekAssignments.set(student, dayAssignments)
							resolve()
						},
						router: this.$router
					})
				})
			}))
				.then(() => this.loading = false)
		}
		reloadAssignments() {
			this.loadAssignments(this.students)
		}
		getAssignments(student: AssignedStudent, day: number): AdviseeAssignment[] {
			const studentAssignments = this.weekAssignments.get(student)
			if (!studentAssignments) return []
			const dayAssignments = studentAssignments.get(day)
			if (!dayAssignments) return []
			return dayAssignments.assignments
		}
		getWarning(student: AssignedStudent, day: number): string | undefined {
			const studentAssignments = this.weekAssignments.get(student)
			if (!studentAssignments) return undefined
			const dayAssignments = studentAssignments.get(day)
			if (!dayAssignments) return undefined
			return dayAssignments.warning
		}
	}
</script>
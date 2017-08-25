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
			<md-spinner md-indeterminate :md-size='40' class='md-warn' v-if='loading'></md-spinner>
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
					<md-table-cell v-for='day in WEEK_DAYS' :key='mondayDate + String(day)'>
						<div class="warning-bg" v-if="getWarning(student, day) !== undefined" :style="{background: getWarning(student, day)}"></div>
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
						</md-layout>
					</md-table-cell>
				</md-table-row>
				<md-table-row>
					<md-table-cell :colspan='1 + WEEK_DAYS'>
						<md-button class='md-icon-button md-raised' @click='openAddStudent' id='add-student'>
							<md-icon>add</md-icon>
							<md-tooltip md-direction='right'>Show another student</md-tooltip>
						</md-button>
					</md-table-cell>
				</md-table-row>
			</md-table-body>
		</md-table>

		<md-dialog ref='addStudent' md-open-from='#add-student' md-close-to='#add-student'>
			<md-dialog-title>Show another student</md-dialog-title>
			<md-dialog-content>
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
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='addStudent'>Add</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<style scoped lang="sass">
	.md-table-cell
		position: relative
		z-index: 1
	.md-table-cell .warning-bg
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%
		opacity: 0.25
		z-index: -1
</style>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {
		AdviseeAssignmentRequest,
		AdviseeAssignment,
		AdviseeDay,
		AdviseeWeek,
		MatchingStudent,
		StudentQuery
	} from '../../api'
	import apiFetch from '../api-fetch'
	import WeekManager from './WeekManager.vue'

	interface Dialog extends Vue {
		open(): void
		close(): void
	}

	@Component({
		watch: {
			mondayDate: 'reloadAssignments',
		}
	})
	export default class AdvisorView extends WeekManager {
		loading = false

		students: MatchingStudent[] = []
		//Map of students to maps of days to assignments and warnings for that day
		weekAssignments = new WeakMap<MatchingStudent, Map<number, AdviseeDay>>()
		//Map of students to their current load tokens
		loadTokens = new WeakMap<MatchingStudent, object>()

		newStudent: MatchingStudent | null = null
		newStudentName = '' //use newGroup for read

		mounted() {
			this.loadAdvisees()
		}
		loadAdvisees() {
			this.loading = true
			apiFetch({
				url: '/advisor/advisees',
				handler: (students: MatchingStudent[]) => {
					this.loading = false
					this.addStudents(students)
				},
				router: this.$router
			})
		}
		openAddStudent() {
			this.newStudentName = ''
			this.newStudent = null
			;(this.$refs.addStudent as Dialog).open()
			setTimeout(() => {
				(this.$refs.studentName as Vue).$el.querySelector('input')!.focus() //have to select child of autocomplete container
			}, 0)
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
			if (this.newStudent === null) {
				alert('Please select a valid student')
				return
			}

			this.addStudents([this.newStudent])
			;(this.$refs.addStudent as Dialog).close()
		}
		addStudents(students: MatchingStudent[]) {
			const newStudents: MatchingStudent[] = []
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
		loadAssignments(students: MatchingStudent[]) {
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
		getAssignments(student: MatchingStudent, day: number): AdviseeAssignment[] {
			const studentAssignments = this.weekAssignments.get(student)
			if (!studentAssignments) return []
			const dayAssignments = studentAssignments.get(day)
			if (!dayAssignments) return []
			return dayAssignments.assignments
		}
		getWarning(student: MatchingStudent, day: number): string | undefined {
			const studentAssignments = this.weekAssignments.get(student)
			if (!studentAssignments) return undefined
			const dayAssignments = studentAssignments.get(day)
			if (!dayAssignments) return undefined
			return dayAssignments.warning
		}
	}
</script>
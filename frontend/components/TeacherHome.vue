<template>
	<div>
		<assignments-view ref='assignments' teacher></assignments-view>
		<md-button class='md-raised' @click='showMyViolations'>
			Show guidelines violations triggered by my assignments
		</md-button>
		<div v-if='admin'>
			<md-button class='md-raised' @click='loadMyGroups'>Show my sections</md-button>
			<md-button class='md-raised' @click='selectTeacher'>Show another teacher's sections</md-button>
			<md-button class='md-raised' @click='selectCourse'>Show all sections for a course</md-button>
		</div>
		<div v-if='admissions'>
			<md-button class='md-raised' @click='admissionsView'>
				Show sections this week not accepting visitors
			</md-button>

			<md-dialog ref='noVisitors'>
				<md-dialog-title>
					Sections this week not accepting visitors
				</md-dialog-title>
				<md-dialog-content>
					<div v-if='noVisitorsDays && noVisitorsDays.length'>
						<md-list>
							<md-list-item v-for='(day, index) in noVisitorsDays' :key='index'>
								<div class='md-list-text-container'>
									<strong>{{ day.day }}</strong>
									<ul>
										<li v-for='group in day.groups' :key='group.name'>
											{{ group.name }}
											<span v-if='group.periods'>
												({{ group.periods }})
											</span>
										</li>
									</ul>
								</div>
							</md-list-item>
						</md-list>
					</div>
					<div v-else>
						No assignments are preventing visitors this week
					</div>
				</md-dialog-content>
			</md-dialog>
		</div>

		<teacher-selector ref='teacherSelector' @save='loadTeacher' :teachers='teachers'></teacher-selector>
		<md-dialog ref='courseSelector'>
			<md-dialog-title>Select course</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Course</label>
					<md-select v-model='selectedCourse' required>
						<md-option v-for='course in courses' :value='course.id' :key='course.id'>
							{{ course.id }} - {{ course.name }}
						</md-option>
					</md-select>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='loadCourse'>Load</md-button>
				<md-button class='md-primary' @click='cancelCourse'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>

		<md-dialog ref='violations'>
			<md-dialog-title>Guideline violations triggered by my assignments</md-dialog-title>
			<md-dialog-content>
				<md-spinner v-if='!violations' md-indeterminate class='md-warn'></md-spinner>
				<violations-table :violations='violations'></violations-table>
			</md-dialog-content>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {
		AssignmentGroup,
		AtFaultViolation,
		CourseList,
		NoVisitorsGroup,
		NoVisitorsRequest,
		NoVisitorsResponse,
		TeachersList
	} from '../../api'
	import apiFetch from '../api-fetch'
	import AssignmentsView from './AssignmentsView.vue'
	import TeacherSelector from './TeacherSelector.vue'
	import ViolationsTable from './ViolationsTable.vue'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	interface NoVisitorsDayGroups {
		day: string //e.g. Monday
		groups: NoVisitorsGroup[]
	}

	@Component({
		components: {
			'assignments-view': AssignmentsView,
			'teacher-selector': TeacherSelector,
			'violations-table': ViolationsTable
		}
	})
	export default class TeacherHome extends Vue {
		teachers: TeachersList = []
		selectedCourse: string = ''
		courses: CourseList = []

		admin = false
		admissions = false

		violations: AtFaultViolation[] | null = null
		noVisitorsDays: NoVisitorsDayGroups[] | null = null

		mounted() {
			apiFetch({
				url: '/assignments/my-displayed',
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
			apiFetch({
				url: '/is/admin',
				handler: (admin: boolean) => this.admin = admin,
				router: this.$router
			})
			apiFetch({
				url: '/is/admissions',
				handler: (admissions: boolean) => this.admissions = admissions,
				router: this.$router
			})
		}
		loadMyGroups() {
			apiFetch({
				url: '/assignments/my-sections',
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
		loadGroups(groups: AssignmentGroup[]) {
			(this.$refs.assignments as AssignmentsView).addGroups(groups)
		}
		selectTeacher() {
			if (!this.teachers.length) {
				apiFetch({
					url: '/list-teachers',
					handler: (teachers: TeachersList) => this.teachers = teachers,
					router: this.$router
				})
			}
			(this.$refs.teacherSelector as Dialog).open()
		}
		loadTeacher(teacherId: string) {
			apiFetch({
				url: '/assignments/teacher-sections/' + teacherId,
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
		selectCourse() {
			if (!this.courses.length) {
				this.courses = [{id: '', name: ''}]
				apiFetch({
					url: '/assignments/list-courses',
					handler: (courses: CourseList) => this.courses.push(...courses),
					router: this.$router
				})
			}
			this.selectedCourse = ''
			;(this.$refs.courseSelector as Dialog).open()
		}
		cancelCourse() {
			(this.$refs.courseSelector as Dialog).close()
		}
		loadCourse() {
			if (!this.selectedCourse) {
				alert('Please select a course')
				return
			}
			(this.$refs.courseSelector as Dialog).close()
			apiFetch({
				url: '/assignments/course-sections/' + this.selectedCourse,
				handler: (groups: AssignmentGroup[]) => this.loadGroups(groups),
				router: this.$router
			})
		}
		admissionsView() {
			const assignmentsView = this.$refs.assignments as AssignmentsView
			const data: NoVisitorsRequest = {
				...assignmentsView.mondayDate.toYMD(),
				days: assignmentsView.WEEK_DAYS
			}
			apiFetch({
				url: '/assignments/no-visitors',
				data,
				handler: ({days}: NoVisitorsResponse) => {
					this.noVisitorsDays = days
						.map(({groups}, day) => ({
							day: assignmentsView.getDayName(day + 1),
							groups
						}))
						.filter(({groups}) => groups.length)
					;(this.$refs.noVisitors as Dialog).open()
				},
				router: this.$router
			})
		}
		showMyViolations() {
			this.violations = null
			;(this.$refs.violations as Dialog).open()
			apiFetch({
				url: '/assignments/my-violations',
				handler: (violations: AtFaultViolation[]) => this.violations = violations,
				router: this.$router
			})
		}
	}
</script>
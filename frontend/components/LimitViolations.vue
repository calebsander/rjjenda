<template>
	<md-card>
		<md-card-header>
			<div class='md-title'>
				Assignment limit violations
				<md-spinner v-if='loading' md-indeterminate class='md-warn' :md-size='30'></md-spinner>
			</div>
		</md-card-header>
		<md-card-content v-if='violations'>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>Days in window</md-table-head>
						<md-table-head>Student</md-table-head>
						<md-table-head>Assignments</md-table-head>
						<md-table-head>Group at fault</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='(violation, index) in violations' :key='index'>
						<md-table-cell>{{ violation.days }}</md-table-cell>
						<md-table-cell>{{ violation.student }}</md-table-cell>
						<md-table-cell>
							<div v-for='assignment in violation.assignments' :key='assignment'>
								{{ assignment }}
							</div>
						</md-table-cell>
						<md-table-cell>{{ violation.fault }}</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
		</md-card-content>
		<md-card-actions>
			<md-button @click='load'>Load</md-button>
		</md-card-actions>
	</md-card>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AtFaultViolation} from '../../api'
	import apiFetch from '../api-fetch'

	@Component
	export default class LimitViolations extends Vue {
		loading = false
		violations: AtFaultViolation[] | null = null

		load() {
			this.loading = true
			apiFetch({
				url: '/admin/limit-violations',
				handler: (violations: AtFaultViolation[]) => {
					this.loading = false
					this.violations = violations
				},
				router: this.$router
			})
		}
	}
</script>
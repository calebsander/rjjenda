<template>
	<md-table v-if='violations'>
		<md-table-header>
			<md-table-row>
				<md-table-head>Date</md-table-head>
				<md-table-head>Student</md-table-head>
				<md-table-head>Assignments</md-table-head>
				<md-table-head>Group that added last assignment</md-table-head>
			</md-table-row>
		</md-table-header>
		<md-table-body>
			<md-table-row v-for='(violation, index) in violations' :key='index'>
				<md-table-cell>
					{{ violation.start }}
					<span v-if='violation.start !== violation.end'>
						- {{ violation.end }}
					</span>
				</md-table-cell>
				<md-table-cell>
					{{ violation.student }}<br>
					(<a :href='getMailtoLink(violation)' target='_blank'>e-mail</a> student and advisor)
				</md-table-cell>
				<md-table-cell>
					<div v-for='assignment in violation.assignments' :key='assignment'>
						{{ assignment }}
					</div>
				</md-table-cell>
				<md-table-cell>{{ violation.fault }}</md-table-cell>
			</md-table-row>
		</md-table-body>
	</md-table>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {AtFaultViolation} from '../../api'

	@Component({
		name: 'limit-violations',
		props: ['violations']
	})
	export default class ViolationsTable extends Vue {
		violations: AtFaultViolation[] | null

		getMailtoLink(violation: AtFaultViolation) {
			let link = 'mailto:' + violation.studentEmail
			if (violation.advisorEmail) link += ',' + violation.advisorEmail
			link += '?cc=abudding@commschool.org'
			return link
		}
	}
</script>
<template>
	<md-card>
		<md-card-header>
			<div class='md-title'>
				Assignment limit violations
				<md-spinner v-if='loading' md-indeterminate class='md-warn' :md-size='30'></md-spinner>
			</div>
		</md-card-header>
		<md-card-content>
			<violations-table :violations='violations'></violations-table>
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
	import ViolationsTable from './ViolationsTable.vue'

	@Component({
		name: 'limit-violations',
		components: {
			'violations-table': ViolationsTable
		}
	})
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
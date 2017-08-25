<template>
	<div>
		<md-table-card>
			<md-toolbar>
				<h1 class='md-title'>Limits</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newLimit' id='new-limit'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new limit</md-tooltip>
				</md-button>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>Consecutive days</md-table-head>
						<md-table-head>Total assignment weight</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='limit in limits' :key='limit.id'>
						<md-table-cell>{{ limit.days }}</md-table-cell>
						<md-table-cell>{{ limit.weight }}</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteLimit(limit)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
		</md-table-card>

		<md-dialog ref='newLimit' md-open-from='#new-limit' md-close-to='#new-limit'>
			<md-dialog-title>New limit</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Consecutive days</label>
					<md-input v-model='newDays' type='number' required ref='days'></md-input>
				</md-input-container>
				<md-input-container>
					<label>Total assignment weight</label>
					<md-input v-model='newWeight' type='number' required></md-input>
				</md-input-container>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='create'>Create</md-button>
				<md-button class='md-primary' @click='cancelCreation'>Cancel</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {Limit, NewLimit} from '../../api'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component({
		name: 'manage-limits'
	})
	export default class ManageLimits extends Vue {
		limits: Limit[] = []
		loading = true

		newDays = 1
		newWeight = 3

		mounted() {
			this.loadLimits()
		}
		loadLimits() {
			apiFetch({
				url: '/admin/limits',
				handler: (limits: Limit[]) => {
					this.limits = limits
					this.loading = false
				},
				router: this.$router
			})
		}
		newLimit() {
			this.newDays = 1
			this.newWeight = 3
			;(this.$refs.newLimit as Dialog).open()
			setTimeout(() => (this.$refs.days as Vue).$el.focus(), 0)
		}
		create() {
			this.newDays = Math.round(this.newDays)
			if (this.newDays < 1) {
				alert('Please select a positive number of days')
				return
			}
			if (this.newWeight <= 0) {
				alert('Please select a positive assignment weight')
				return
			}

			const data: NewLimit = {
				days: this.newDays,
				weight: this.newWeight
			}
			this.loading = true
			apiFetch({
				url: '/admin/limit',
				data,
				handler: () => {
					(this.$refs.newLimit as Dialog).close()
					this.loadLimits()
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newLimit as Dialog).close()
		}
		deleteLimit(limit: Limit) {
			this.loading = true
			apiFetch({
				url: '/admin/limit/' + limit.id,
				method: 'DELETE',
				handler: () => {
					this.loading = false
					const limitIndex = this.limits.indexOf(limit)
					this.limits.splice(limitIndex, 1)
				},
				router: this.$router
			})
		}
	}
</script>
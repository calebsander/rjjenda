<template>
	<div>
		<md-table-card>
			<md-toolbar>
				<h1 class='md-title'>Assignment weight warnings</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newWarning' id='new-warning'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new warning</md-tooltip>
				</md-button>
			</md-toolbar>
			<md-table>
				<md-table-header>
					<md-table-row>
						<md-table-head>Total assignment weight</md-table-head>
						<md-table-head>Color</md-table-head>
						<md-table-head>Delete</md-table-head>
					</md-table-row>
				</md-table-header>
				<md-table-body>
					<md-table-row v-for='warning in warnings' :key='warning.id'>
						<md-table-cell>{{ warning.weight }}</md-table-cell>
						<md-table-cell :style='{background: warning.color, color: "white"}'>
							{{ warning.color }}
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteWarning(warning)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
		</md-table-card>

		<md-dialog ref='newWarning' md-open-from='#new-warning' md-close-to='#new-warning'>
			<md-dialog-title>New assignment warning</md-dialog-title>
			<md-dialog-content>
				<md-input-container>
					<label>Total assignment weight</label>
					<md-input v-model='newWeight' type='number' required></md-input>
				</md-input-container>
				<md-input-container>
					<label>Color</label>
					<md-input v-model='newColor.hex' disabled required></md-input>
				</md-input-container>
				<slider-picker v-model='newColor'></slider-picker>
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
	import {Slider} from 'vue-color'
	import {Warning, NewWarning} from '../../api'
	import apiFetch from '../api-fetch'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}
	interface Color {
		hex: string
	}

	const RED: Color = {
		hex: '#FF0000'
	}

	@Component({
		components: {
			'slider-picker': Slider
		}
	})
	export default class ManageWarnings extends Vue {
		loading = true
		warnings: Warning[] = []

		newWeight = 1
		newColor = RED

		mounted() {
			this.loadWarnings()
		}
		loadWarnings() {
			apiFetch({
				url: '/admin/warnings',
				handler: (warnings: Warning[]) => {
					this.loading = false
					this.warnings = warnings
				},
				router: this.$router
			})
		}
		newWarning() {
			this.newWeight = 1
			this.newColor = RED
			;(this.$refs.newWarning as Dialog).open()
		}
		create() {
			if (this.newWeight <= 0) {
				alert('Please enter a positive assignment weight')
				return
			}

			const data: NewWarning = {
				color: this.newColor.hex,
				weight: this.newWeight
			}
			this.loading = true
			apiFetch({
				url: '/admin/warning',
				data,
				handler: () => {
					(this.$refs.newWarning as Dialog).close()
					this.loadWarnings()
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newWarning as Dialog).close()
		}
		deleteWarning(warning: Warning) {
			this.loading = true
			apiFetch({
				url: '/admin/warning/' + String(warning.id),
				method: 'DELETE',
				handler: () => {
					this.loading = false
					const warningIndex = this.warnings.indexOf(warning)
					this.warnings.splice(warningIndex, 1)
				},
				router: this.$router
			})
		}
	}
</script>
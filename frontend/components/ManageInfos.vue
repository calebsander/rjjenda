<template>
	<div>
		<md-table-card>
			<md-toolbar>
				<h1 class='md-title'>Assignment weight infos</h1>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-raised md-icon-button' @click='newInfo' id='new-info'>
					<md-icon>add</md-icon>
					<md-tooltip md-direction='left'>Create a new info</md-tooltip>
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
					<md-table-row v-for='info in infos' :key='info.id'>
						<md-table-cell>{{ info.weight }}</md-table-cell>
						<md-table-cell :style='{background: info.color, color: "white"}'>
							{{ info.color }}
						</md-table-cell>
						<md-table-cell>
							<md-button class='md-icon-button md-raised' @click='deleteInfo(info)'>
								<md-icon>delete</md-icon>
							</md-button>
						</md-table-cell>
					</md-table-row>
				</md-table-body>
			</md-table>
		</md-table-card>

		<md-dialog ref='newInfo' md-open-from='#new-info' md-close-to='#new-info'>
			<md-dialog-title>New assignment info</md-dialog-title>
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
	import {Info, NewInfo} from '../../api'
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
	export default class ManageInfos extends Vue {
		loading = true
		infos: Info[] = []

		newWeight = 1
		newColor = RED

		mounted() {
			this.loadInfos()
		}
		loadInfos() {
			apiFetch({
				url: '/admin/infos',
				handler: (infos: Info[]) => {
					this.loading = false
					this.infos = infos
				},
				router: this.$router
			})
		}
		newInfo() {
			this.newWeight = 1
			this.newColor = RED
			;(this.$refs.newInfo as Dialog).open()
		}
		create() {
			if (this.newWeight <= 0) {
				alert('Please enter a positive assignment weight')
				return
			}

			const data: NewInfo = {
				color: this.newColor.hex,
				weight: this.newWeight
			}
			this.loading = true
			apiFetch({
				url: '/admin/info',
				data,
				handler: () => {
					(this.$refs.newInfo as Dialog).close()
					this.loadInfos()
				},
				router: this.$router
			})
		}
		cancelCreation() {
			(this.$refs.newInfo as Dialog).close()
		}
		deleteInfo(info: Info) {
			this.loading = true
			apiFetch({
				url: '/admin/info/' + String(info.id),
				method: 'DELETE',
				handler: () => {
					this.loading = false
					const infoIndex = this.infos.indexOf(info)
					this.infos.splice(infoIndex, 1)
				},
				router: this.$router
			})
		}
	}
</script>
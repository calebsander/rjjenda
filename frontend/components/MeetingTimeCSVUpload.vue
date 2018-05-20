<template>
	<div>
		<md-card>
			<md-card-header>
				<div class='md-title'>
					Upload section meeting times CSV
				</div>
			</md-card-header>
			<md-card-content>
				<md-input-container>
					<md-file required placeholder='Click to select file' accept='.csv' @selected='selected'></md-file>
				</md-input-container>
			</md-card-content>
			<md-card-actions>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-accent' @click='upload' :disabled='file === null'>Upload</md-button>
			</md-card-actions>
		</md-card>
		<md-dialog-alert
			ref='importWarnings'
			md-title='Import warnings'
			:md-content-html='alertContent'
			@close='refreshPage'
		>
		</md-dialog-alert>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'
	import {SectionsNotFound} from '../../api'

	interface BufferResult extends EventTarget {
		result: ArrayBuffer
	}
	interface Dialog extends Vue {
		open(): void
	}

	@Component({
		name: 'meeting-time-csv-upload'
	})
	export default class MeetingTimeCSVUpload extends Vue {
		loading = false
		file: File | null = null
		alertContent = ' ' //errors are thrown if this is empty

		selected(files: FileList) {
			this.file = files[0]
		}
		upload() {
			const fileReader = new FileReader
			fileReader.onload = event => {
				const csvBuffer = (event.target as BufferResult).result
				apiFetch({
					url: '/admin/upload-meeting-times',
					data: csvBuffer,
					handler: ({missingSections}: SectionsNotFound) => {
						this.loading = false
						if (missingSections.length) {
							this.alertContent = 'The following sections could not be found:<br>' +
								missingSections.join('<br>')
							;(this.$refs.importWarnings as Dialog).open()
						}
						else this.refreshPage() //reloads so student and teacher tables refresh
					},
					router: this.$router
				})
			}
			fileReader.readAsArrayBuffer(this.file as File)
			this.loading = true
		}
		refreshPage() {
			location.reload()
		}
	}
</script>
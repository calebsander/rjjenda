<template>
	<div>
		<md-card>
			<md-card-header>
				<div class='md-title'>
					Upload users CSV
				</div>
			</md-card-header>
			<md-card-content>
				This will not delete any users, only add to the list
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
	import {WrongDomainEmails} from '../../api'

	interface BufferResult extends EventTarget {
		result: ArrayBuffer
	}
	interface Dialog extends Vue {
		open(): void
	}

	@Component({
		name: 'user-csv-upload'
	})
	export default class UserCSVUpload extends Vue {
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
					url: '/admin/upload-users',
					data: csvBuffer,
					handler: ({invalidEmails}: WrongDomainEmails) => {
						this.loading = false
						if (invalidEmails.length) {
							this.alertContent = 'The following e-mails are not Commonwealth e-mails, '
								+ 'so these teachers will not be able to log in:'
							for (const email of invalidEmails) this.alertContent += '<br>' + email
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
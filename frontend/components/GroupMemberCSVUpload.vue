<template>
	<div>
		<md-card>
			<md-card-header>
				<div class='md-title'>
					Upload groups and members CSV
				</div>
			</md-card-header>
			<md-card-content>
				This will delete all old groups and memberships,
				except for extracurricular groups
				<md-input-container>
					<md-file
						required
						placeholder='Click to select groups file'
						accept='.csv'
						@selected='selectedGroup'
					>
					</md-file>
				</md-input-container>
				<md-input-container>
					<md-file
						required
						placeholder='Click to select members file'
						accept='.csv'
						@selected='selectedMember'
					>
					</md-file>
				</md-input-container>
			</md-card-content>
			<md-card-actions>
				<md-spinner md-indeterminate class='md-warn' v-if='loading'></md-spinner>
				<md-button class='md-accent' @click='upload' :disabled='groupFile === null || memberFile === null'>Upload</md-button>
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
		name: 'group-member-csv-upload'
	})
	export default class GroupMemberCSVUpload extends Vue {
		loading = false
		groupFile: File | null = null
		memberFile: File | null = null
		alertContent = ' ' //errors are thrown if this is empty

		selectedGroup(files: FileList) {
			this.groupFile = files[0]
		}
		selectedMember(files: FileList) {
			this.memberFile = files[0]
		}
		upload() {
			const groupFileReader = new FileReader
			groupFileReader.onload = event => {
				const csvBuffer = (event.target as BufferResult).result
				apiFetch({
					url: '/admin/upload-groups',
					data: csvBuffer,
					handler: () => {
						const memberFileReader = new FileReader
						memberFileReader.onload = event => {
							const csvBuffer = (event.target as BufferResult).result
							apiFetch({
								url: '/admin/upload-members',
								data: csvBuffer,
								handler: ({missingSections}: SectionsNotFound) => {
									this.loading = false
									if (missingSections.length) {
										this.alertContent = 'No group info provided for the following sections:'
										for (const section of missingSections) this.alertContent += '<br>' + section
										;(this.$refs.importWarnings as Dialog).open()
									}
									else this.refreshPage() //reloads so groups and students table refresh
								},
								router: this.$router
							})
						}
						memberFileReader.readAsArrayBuffer(this.memberFile as File)
					},
					router: this.$router
				})
			}
			groupFileReader.readAsArrayBuffer(this.groupFile as File)
			this.loading = true
		}
		refreshPage() {
			location.reload()
		}
	}
</script>
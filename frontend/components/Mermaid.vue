<template>
	<div>
		<md-button @click='showInfo'>
			<img src='/assets/mermaid.svg' id='mermaid'/>
		</md-button>

		<md-dialog ref='info' md-open-from='#mermaid' md-close-to='#mermaid'>
			<md-dialog-title>
				<md-icon>info</md-icon>
				Information
			</md-dialog-title>
			<md-dialog-content>
				<div>Created by <b>Caleb Sander</b>, Class of 2017</div>
				<br>
				<div v-for='line in versionInfo' :key='line'>{{ line }}</div>
			</md-dialog-content>
			<md-dialog-actions>
				<md-button class='md-accent' @click='hideInfo'>Close</md-button>
			</md-dialog-actions>
		</md-dialog>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {VersionInfo} from '../../api'
	import apiFetch from '../api-fetch'

	interface Dialog extends Vue {
		close(): void
		open(): void
	}

	@Component
	export default class Mermaid extends Vue {
		versionInfo = ['Loading version info...']

		showInfo() {
			(this.$refs.info as Dialog).open()
			apiFetch({
				url: '/version',
				handler: (versionInfo: VersionInfo) =>
					this.versionInfo = [
						'App v' + versionInfo.app,
						'Node.js v' + versionInfo.node,
						'Sequelize v' + versionInfo.sequelize,
						'Typescript v' + versionInfo.typescript
					]
				,
				router: this.$router
			})
		}
		hideInfo() {
			(this.$refs.info as Dialog).close()
		}
	}
</script>

<style lang='sass' scoped>
	img#mermaid
		height: 60px
</style>
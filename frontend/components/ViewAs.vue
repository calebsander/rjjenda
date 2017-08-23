<template>
	<md-card>
		<md-card-header>
			<div class='md-title'>Sign in as another user</div>
			<div class='md-subhead'>
				You will have to sign out of the other account
				in order to switch back to yours
			</div>
		</md-card-header>
		<md-card-content>
			<md-input-container>
				<label>Username</label>
				<md-input v-model='username' required></md-input>
			</md-input-container>
		</md-card-content>
		<md-card-actions>
			<md-button class='md-accent' @click='view'>View</md-button>
		</md-card-actions>
	</md-card>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'

	@Component({
		name: 'view-as'
	})
	export default class ViewAs extends Vue {
		username = ''

		view() {
			if (!this.username) {
				alert('Please enter a username')
				return
			}

			apiFetch({
				url: '/admin/view-as/' + this.username,
				handler: () => this.$router.push('/'),
				router: this.$router
			})
		}
	}
</script>
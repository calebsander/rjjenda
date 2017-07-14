<<template>
	<md-card>
		<md-card-header>
			<div class='md-title'>
				Upload users CSV
			</div>
		</md-card-header>
		<md-card-content>
			This will not delete any users, only add to the list
			<md-input-container>
				<md-file v-model='filename' required placeholder='Click to select file' accept='.csv' @selected='selected'></md-file>
			</md-input-container>
		</md-card-content>
		<md-card-actions>
			<md-spinner md-indeterminate v-if='loading'></md-spinner>
			<md-button @click='upload'>Upload</md-button>
		</md-card-actions>
	</md-card>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import apiFetch from '../api-fetch'

	interface BufferResult extends EventTarget {
		result: ArrayBuffer
	}

	@Component({
		name: 'user-csv-upload'
	})
	export default class UserCSVUpload extends Vue {
		loading = false
		file: File
		filename: string | null = null

		selected(files: FileList) {
			this.file = files[0]
		}
		upload() {
			const fileReader = new FileReader()
			fileReader.onload = event => {
				const csvBuffer = (event.target as BufferResult).result
				console.log(csvBuffer)
				apiFetch({
					url: '/admin/upload-users',
					method: 'POST',
					data: csvBuffer,
					handler: () => {
						this.loading = false
						this.filename = null
					},
					router: this.$router
				})
			}
			fileReader.readAsArrayBuffer(this.file)
			this.loading = true
		}
	}
</script>
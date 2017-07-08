import Vue, {PluginObject} from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import LoginComponent from './components/Login.vue'

Vue.use(VueMaterial)

new Vue({
	el: '#app',
	components: {LoginComponent}
})
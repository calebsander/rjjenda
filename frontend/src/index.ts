import Vue, {PluginObject} from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import VueRouter from 'vue-router'
import CheckLoggedInComponent from './components/CheckLoggedInComponent.vue'
import LoginComponent from './components/Login.vue'
import StudentView from './components/StudentView.vue'

Vue.use(VueMaterial)
Vue.use(VueRouter)

const routes = [
	{path: '/', component: CheckLoggedInComponent},
	{path: '/login', component: LoginComponent},
	{path: '/student', component: StudentView}
]
const router = new VueRouter({
	mode: 'history',
	routes
})

new Vue({
	el: '#app',
	router
})
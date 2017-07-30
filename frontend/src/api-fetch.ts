import VueRouter from 'vue-router'
import {APIResponse, NEED_TO_BE_LOGGED_IN} from '../../api'

interface FetchOptions {
	url: string
	method?: 'DELETE' //'GET' or 'POST' should not have to be specified
	data?: any
	handler?: (response: any) => void
	router: VueRouter
}

export default ({url, method, data, handler, router}: FetchOptions): void => {
	const arrayBufferData = data instanceof ArrayBuffer
	const headers = new Headers
	if (data) {
		headers.append(
			'content-type',
			arrayBufferData ? 'text/plain' : 'application/json'
		)
	}
	const options: RequestInit = {
		body: arrayBufferData ? data :
			data ? JSON.stringify(data) : undefined,
		cache: 'no-cache',
		credentials: 'include',
		headers,
		method: data ? 'POST' : (method || 'GET')
	}
	fetch(url, options)
		.then(response => response.json())
		.then((response: APIResponse) => {
			if (response.success) {
				if (handler) handler(response.data)
			}
			else {
				const {message} = response
				console.error(message)
				if (message === NEED_TO_BE_LOGGED_IN) router.push('/login')
				else alert('Error occurred: ' + message)
			}
		})
}
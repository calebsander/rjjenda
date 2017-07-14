import VueRouter from 'vue-router'
import {APIResponse} from '../../api'

interface FetchOptions {
	url: string
	method?: string
	data?: any
	handler?: (response: any) => void
	router: VueRouter
}

export default ({url, method, data, handler, router}: FetchOptions): void => {
	const headers = new Headers
	if (data) headers.append('content-type', 'application/json')
	const options: RequestInit = {
		body: (data instanceof ArrayBuffer) ? data :
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
				alert('Error occurred: ' + message)
			}
		})
}
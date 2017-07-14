export type LoggedIn =
	{loggedIn: false} |
	{loggedIn: true, type: 'student' | 'teacher'}

export interface UserInfo {
	name: string
}

export type APIResponse =
	{success: false, message: string} |
	{success: true, data: any}
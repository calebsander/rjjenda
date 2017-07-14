import * as express from 'express'
import {LoggedIn} from '../../api'
import {UserType, SavedUserType} from '../authentication'

const router = express.Router()
router.get('/', (req, res) => {
	let response: LoggedIn
	if (req.isAuthenticated()) {
		const user: UserType = req.user
		const savedUser = new SavedUserType(user.id)
		response = {loggedIn: true, type: savedUser.type}
	}
	else response = {loggedIn: false}
	res.json({success: true, data: response})
})

export default router
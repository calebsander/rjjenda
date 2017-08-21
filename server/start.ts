#!/usr/bin/env node

import app from './app'
import {sequelize} from './models'

interface Settings {
	port: number
}
const {port}: Settings = require('../settings.json')

sequelize.sync().then(() => {
	app.listen(port)
	console.log('Listening on port:', port)
})
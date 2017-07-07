#!/usr/bin/env node

import app from './app'
import {sequelize} from './models'

const PORT = 8000

sequelize.sync().then(() => {
	app.listen(PORT)
	console.log('Listening on port: ' + PORT)
})
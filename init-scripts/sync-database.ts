#!/usr/bin/env node

import {sequelize} from '../server/models'
sequelize.sync({force: true})
	.then(() => {
		console.log('Done')
		process.exit() //unclear why process doesn't end on its own
	})
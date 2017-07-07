#!/usr/bin/env node

import {sequelize} from '../server/models'
sequelize.sync({force: true})
	.then(() => sequelize.close())
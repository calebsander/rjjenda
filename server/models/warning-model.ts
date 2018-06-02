import * as Sequelize from 'sequelize'
import {WarningAttributes, WarningInstance} from './warning'

let Warning: Sequelize.Model<WarningInstance, WarningAttributes> | undefined

//Ordered by weight
let warningCache: WarningInstance[] | null = null
function invalidateWarningCache(): void {
	warningCache = null
}
export const getWarnings = (): PromiseLike<WarningInstance[]> =>
	warningCache
		? Promise.resolve(warningCache)
		: Warning!.findAll({
			attributes: ['id', 'color', 'assignmentWeight'],
			order: ['assignmentWeight']
		})
			.then(warnings => warningCache = warnings)

export default (sequelize: Sequelize.Sequelize): Sequelize.Model<WarningInstance, WarningAttributes> =>
	Warning = sequelize.define<WarningInstance, WarningAttributes>('warning', {
		assignmentWeight: {
			type: Sequelize.FLOAT,
			allowNull: false
		},
		color: {
			type: Sequelize.STRING,
			allowNull: false
		}
	}, {
		hooks: {
			afterCreate: invalidateWarningCache,
			afterBulkDestroy: invalidateWarningCache //deletion is done by deleting all WHERE id matches
		}
	})
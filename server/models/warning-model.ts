import * as Sequelize from 'sequelize'
import {WarningAttributes, WarningModel} from './warning'

let Warning: Sequelize.ModelCtor<WarningModel> | undefined

//Ordered by weight
let warningCache: WarningModel[] | null = null
function invalidateWarningCache(): void {
	warningCache = null
}
export const getWarnings = (): Promise<WarningModel[]> =>
	warningCache
		? Promise.resolve(warningCache)
		: Warning!.findAll({
			attributes: ['id', 'color', 'assignmentWeight'],
			order: ['assignmentWeight']
		})
			.then(warnings => warningCache = warnings)

export default (sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<WarningModel> =>
	Warning = sequelize.define<WarningModel, WarningAttributes>('warning', {
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
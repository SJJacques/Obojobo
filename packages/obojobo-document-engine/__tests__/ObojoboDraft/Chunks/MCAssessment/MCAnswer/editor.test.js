import { CHILD_REQUIRED, CHILD_TYPE_INVALID } from 'slate-schema-violations'

import MCAnswer from '../../../../../ObojoboDraft/Chunks/MCAssessment/MCAnswer/editor'
const MCANSWER_NODE = 'ObojoboDraft.Chunks.MCAssessment.MCAnswer'

describe('MCAnswer editor', () => {
	test('plugins.renderNode renders a node', () => {
		const props = {
			attributes: { dummy: 'dummyData' },
			node: {
				type: MCANSWER_NODE,
				data: {
					get: () => {
						return {}
					}
				}
			}
		}

		expect(MCAnswer.plugins.renderNode(props)).toMatchSnapshot()
	})

	test('plugins.schema.normalize fixes invalid children', () => {
		const change = {
			removeNodeByKey: jest.fn(),
			insertNodeByKey: jest.fn()
		}

		change.withoutNormalizing = jest.fn().mockImplementationOnce(funct => {
			funct(change)
		})

		MCAnswer.plugins.schema.blocks[MCANSWER_NODE].normalize(change, {
			code: CHILD_TYPE_INVALID,
			node: {},
			child: { key: 'mockKey', object: 'text' },
			index: null
		})

		expect(change.insertNodeByKey).toHaveBeenCalled()
	})

	test('plugins.schema.normalize adds missing children', () => {
		const change = {
			insertNodeByKey: jest.fn()
		}

		MCAnswer.plugins.schema.blocks[MCANSWER_NODE].normalize(change, {
			code: CHILD_REQUIRED,
			node: {},
			child: null,
			index: 0
		})

		expect(change.insertNodeByKey).toHaveBeenCalled()
	})
})

import './viewer-component.scss'
import './editor-component.scss'

import { Transforms, Editor } from 'slate'
import { ReactEditor } from 'slate-react'
import Common from 'obojobo-document-engine/src/scripts/common'
import withSlateWrapper from 'obojobo-document-engine/src/scripts/oboeditor/components/node/with-slate-wrapper'
import React from 'react'
import Node from 'obojobo-document-engine/src/scripts/oboeditor/components/node/editor-component'

const { Button } = Common.components
const QUESTION_NODE = 'ObojoboDraft.Chunks.Question'
const SOLUTION_NODE = 'ObojoboDraft.Chunks.Question.Solution'
const MCASSESSMENT_NODE = 'ObojoboDraft.Chunks.MCAssessment'
const NUMERIC_ASSESSMENT_NODE = 'ObojoboDraft.Chunks.NumericAssessment'
const ASSESSMENT_NODE = 'ObojoboDraft.Sections.Assessment'
const PAGE_NODE = 'ObojoboDraft.Pages.Page'
const TEXT_NODE = 'ObojoboDraft.Chunks.Text'
const TEXT_LINE_NODE = 'ObojoboDraft.Chunks.Text.TextLine'

// mc editor component elements
const CHOICE_NODE = 'ObojoboDraft.Chunks.AbstractAssessment.Choice'
const MCANSWER_NODE = 'ObojoboDraft.Chunks.MCAssessment.MCAnswer'

class Question extends React.Component {
	constructor(props) {
		super(props)
		this.addSolution = this.addSolution.bind(this)
		this.delete = this.delete.bind(this)
		this.onSetType = this.onSetType.bind(this)
		this.onSetDontKnowType = this.onSetDontKnowType.bind(this)
		this.onSetAssessmentType = this.onSetAssessmentType.bind(this)
		this.isInAssessment = this.getIsInAssessment()
	}

	getIsInAssessment() {
		return [
			...Editor.levels(this.props.editor, {
				at: ReactEditor.findPath(this.props.editor, this.props.element),
				reverse: true
			})
		].some(([node]) => {
			return node.type === ASSESSMENT_NODE
		})
	}

	onSetType(event) {
		const type = event.target.checked ? 'survey' : 'default'

		// update this element's content.type
		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		Transforms.setNodes(
			this.props.editor,
			{ content: { ...this.props.element.content, type } },
			{ at: path }
		)

		// The Question Assessment item should be the last child
		const lastChildIndex = this.getHasSolution()
			? this.props.element.children.length - 2
			: this.props.element.children.length - 1
		return Transforms.setNodes(
			this.props.editor,
			{ questionType: type },
			{ at: path.concat(lastChildIndex) }
		)
	}

	onSetDontKnowType(event) {
		const dontKnowType = event.target.checked ? 'dontKnow' : 'default'
		const dontKnowObject = 
		{
			"type": "ObojoboDraft.Chunks.AbstractAssessment.Choice",
			"content": {
			  "score": 0
			},
			"children": [
			  {
				"type": "ObojoboDraft.Chunks.MCAssessment.MCAnswer",
				"content": {},
				"children": [
				  {
					"type": "ObojoboDraft.Chunks.Text",
					"content": {},
					"children": [
					  {
						"type": "ObojoboDraft.Chunks.Text",
						"subtype": "ObojoboDraft.Chunks.Text.TextLine",
						"content": {
						  "indent": 0
						},
						"children": [
						  {
							"text": "I don't know"
						  }
						],
						"id": "7b51a0a5-3daa-4b2b-9e76-96b4571a1107"
					  }
					],
					"id": "078c3c39-f31b-4a30-bc52-dd5d55660366"
				  }
				],
				"id": "938e5ad0-daa1-4255-8256-c419b335d799"
			  }
			],
			"id": "a4510c6a-04e5-4901-8950-838ab729ed44"
		}
		
		const path = ReactEditor.findPath(this.props.editor, this.props.element)

		// The Question Assessment item should be the last child
		// This determines whether the assessment is numeric or MC
		// Its index is dependent on whether there is an explanation
		const lastChildIndex = this.getHasSolution()
			? this.props.element.children.length - 2
			: this.props.element.children.length - 1
		Transforms.setNodes(
			this.props.editor,
			{ dontKnowType: dontKnowType },
			{ at: path.concat(lastChildIndex) }
		)

		// the actual question assessment item
		const questionArray = this.props.element.children[lastChildIndex].children

		// console.log("this.props.element.content: ", this.props.element.content)
		// console.log("this should match w/ add possible answer: ", questionArray)

		// update this element's content.dontKnowType
		Transforms.setNodes(
			this.props.editor,
			{ content: { ...this.props.element.content, dontKnowType } },
			{ at: path }
		)

		// console.log("this.props.editor: ", this.props.editor)
		// console.log("this.props.element.children: ", this.props.element.children)

		if (this.props.element.content.dontKnowType === 'dontKnow') {
			return Transforms.insertNodes(
				this.props.editor,
				{
					type: CHOICE_NODE,
					content: { score: 0 },
					children: [
						{
							type: MCANSWER_NODE,
							content: {},
							children: [
								{
									type: TEXT_NODE,
									subtype: TEXT_LINE_NODE,
									content: { indent: 0 },
									children: [{ text: 'I don\'t know'}]
							}
							]
						}
					]
				},
				{ at: path.concat(questionArray.length) }
			)
		}
		
	}

	getHasSolution() {
		return (
			this.props.element.children[this.props.element.children.length - 1].subtype === SOLUTION_NODE
		)
	}

	onSetAssessmentType(event) {
		const type = event.target.value

		const item = Common.Registry.getItemForType(type)
		const newBlock = item.cloneBlankNode()

		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		const hasSolution = this.getHasSolution()
		const assessmentLocation = hasSolution
			? this.props.element.children.length - 2
			: this.props.element.children.length - 1

		Editor.withoutNormalizing(this.props.editor, () => {
			// Remove the old assessment
			Transforms.removeNodes(this.props.editor, {
				at: path.concat(assessmentLocation)
			})
			// Insert the new assessment
			Transforms.insertNodes(this.props.editor, newBlock, {
				at: path.concat(assessmentLocation)
			})
		})
	}

	delete() {
		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		return Transforms.removeNodes(this.props.editor, { at: path })
	}

	addSolution() {
		const path = ReactEditor.findPath(this.props.editor, this.props.element)
		console.log("path of solution node", path)
		return Transforms.insertNodes(
			this.props.editor,
			{
				type: QUESTION_NODE,
				subtype: SOLUTION_NODE,
				content: { score: 0 },
				children: [
					{
						type: PAGE_NODE,
						content: {},
						children: [
							{
								type: TEXT_NODE,
								content: {},
								children: [
									{
										type: TEXT_NODE,
										subtype: TEXT_LINE_NODE,
										content: { indent: 0 },
										children: [{ text: '' }]
									}
								]
							}
						]
					}
				]
			},
			{ at: path.concat(this.props.element.children.length) }
		)
	}

	getContentDescription(isTypeSurvey, isInAssessment) {
		if (isTypeSurvey || isInAssessment) {
			return []
		}

		return [
			{
				name: 'revealAnswer',
				description: 'Allow reveal answer?',
				type: 'select',
				values: [
					{
						value: 'default',
						description: '(Use the default setting for this question type)'
					},
					{
						value: 'never',
						description: 'No'
					},
					{ value: 'always', description: 'Yes' },
					{
						value: 'when-incorrect',
						description: 'Yes, but only after submitting an incorrect answer'
					}
				]
			}
		]
	}

	render() {
		const element = this.props.element
		const content = element.content

		const isTypeSurvey = content.type === 'survey'
		// const isTypeDontKnow = content.dontKnowType === 'dontKnow'

		const hasSolution = this.getHasSolution()
		let questionType

		// The question type is determined by the MCAssessment or the NumericAssessement
		// This is either the last node or the second to last node
		if (hasSolution) {
			questionType = element.children[element.children.length - 2].type
		} else {
			questionType = element.children[element.children.length - 1].type
		}

		return (
			<Node
				{...this.props}
				className="obojobo-draft--chunks--question--wrapper"
				contentDescription={this.getContentDescription(isTypeSurvey, this.isInAssessment)}
			>
				<div
					className={`component obojobo-draft--chunks--question is-viewed pad is-type-${content.type}`}
				>
					<div className="flipper question-editor">
						<div className="content-back">
							<div className="question-settings" contentEditable={false}>
								<label>Question Type</label>
								<select
									contentEditable={false}
									value={questionType}
									onChange={this.onSetAssessmentType}
								>
									<option value={MCASSESSMENT_NODE}>Multiple choice</option>
									<option value={NUMERIC_ASSESSMENT_NODE}>Input a number</option>
								</select>
								<label className="question-type" contentEditable={false}>
									<input type="checkbox" checked={isTypeSurvey} onChange={this.onSetType} />
									Survey Only
								</label>
								<label className="i-dont-know" contentEditable={false}>
									<input type="checkbox" onChange={this.onSetDontKnowType} />
									Toggle 'I don't know' option
								</label>
							</div>
							{this.props.children}
							{hasSolution ? null : (
								<div className="add-solution-container" contentEditable={false}>
									<Button className="add-solution" onClick={this.addSolution}>
										Add Explanation
									</Button>
								</div>
							)}
						</div>
					</div>
					<Button className="delete-button" onClick={() => this.delete()} contentEditable={false}>
						×
					</Button>
				</div>
			</Node>
		)
	}
}

export default withSlateWrapper(Question)

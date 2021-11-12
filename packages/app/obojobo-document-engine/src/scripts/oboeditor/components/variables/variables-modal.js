import './variables-modal.scss'

import React from 'react'

import SimpleDialog from '../../../common/components/modal/simple-dialog'
import Button from '../../../common/components/button'
import Switch from '../../../common/components/switch'
import VariableMenu from './variable-list.js'
import VariableList from './variable-menu.js'

class VariablesModal extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef()
        this.state = { ...JSON.parse(JSON.stringify(props.content)) }

        this.createVariable = this.createVariable.bind(this)
        const varExample = {
            name: "example",
            type: "random-list"
        }
        if (!this.state.variables) this.state.variables = [varExample]
    }

    componentWillUnmount() {
        if (this.props.onClose) this.props.onClose()
    }

    createVariable() {
        console.log(this.state.variables)
    }
    
    render() {
        return (
            <SimpleDialog ok title="Variables" onConfirm={() => this.props.onClose(this.state)}>
                <div className="variables-modal">
                    < VariableList>
                        variables={this.state.variables}
                    </VariableList>
                </div>
            </SimpleDialog>
        )
    }

}

export default VariablesModal
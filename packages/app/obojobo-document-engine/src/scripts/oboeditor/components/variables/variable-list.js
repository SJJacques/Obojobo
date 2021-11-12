import React from 'react'
import Button from '../../../common/components/button'

class VariableList extends React.Component {
    constructor(props) {
        super(props)
    
    }

    render() {
        return(
            <div className = 'variable-list'>
                {variables.map((variable, index) => (
                    <div
                        key={variables.name}
                        className={'single-variable' + index === currSelect ? 'variable-is-selected' : ''}
                    >
                        <h4>${variable.name}</h4>    
                        <p>{variable.type}</p>
                    </div>    
                ))}
               <Button className="add-variable-button" onClick={setCreatingVar}>
                        + Create Variable
                </Button>
            </div>
        )
    }
}

export default VariableList
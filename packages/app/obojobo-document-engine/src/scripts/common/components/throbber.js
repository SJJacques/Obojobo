import './throbber.scss'

import React from 'react'

const Throbber = props => {
	return (
		<div className="viewer--components--throbber" aria-label="Loading content">
			<div className="throbber" aria-hidden={true}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 100 100"
					preserveAspectRatio="xMidYMid"
				>
					<circle
						cx="50"
						cy="50"
						fill="none"
						stroke={props.color || 'black'}
						strokeWidth="10"
						r="35"
						strokeDasharray="60 110"
						transform="rotate(0.82332 50 50)"
					></circle>
				</svg>
			</div>
		</div>
	)
}

export default Throbber

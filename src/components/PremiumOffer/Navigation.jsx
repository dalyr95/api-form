import React from 'react';
import { Link } from "react-router-dom";

class Navigation extends React.Component {
	render() {
		let nextRoute, prevRoute, save;
		let routes = this.props.routes;
		let buttons = 0;

		routes.forEach((r, i) => {
			if (this.props.location.pathname.includes(r)) {
				if (routes[i - 1]) {
					prevRoute = routes[i - 1];
				} 
				if (routes[i + 1]) {
					nextRoute = routes[i + 1];
				}
			};
		});

		if (nextRoute) {
			nextRoute = (<Link to={nextRoute}>{nextRoute} {'>>'}</Link>);
			buttons++;
		}
		if (prevRoute) {
			prevRoute = (<Link to={prevRoute}>{'<<'} {prevRoute}</Link>);
			buttons++;
		}

		if (this.props.location.pathname !== 'summary-view') {
			save = (<Link to='summary-view'>Save</Link>);
		}

		return (
			<div className={`navigation navigation-buttons-${buttons}`}>
				<div>
					{prevRoute}
					{nextRoute}
				</div>
				<div>{save}</div>
			</div>
		);
	}
}

export default Navigation;
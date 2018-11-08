import React from 'react';
import { Link } from "react-router-dom";

class Start extends React.Component {
	render() {
		return (
			<div className="panel">

				<h2>Premium Buyer Service</h2>
				<p>To find your highest offer from a specialist buyer, we need some extra details about your car.</p>

				<ul>
					<li>It’s an online form and takes a few minutes to complete</li>
					<li>Info you enter is automatically saved, so you can pause at any time</li>
					<li>You can call us on 01444 620 630 if you get stuck</li>
				</ul>

				<div className="navigation">
					<Link to="/basic-details">Start</Link>
				</div>
			</div>
		);
	}
}

export default Start;
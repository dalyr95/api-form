import React from 'react';

class Conditional extends React.Component {
	render() {
		let show, valid;

		if (typeof this.props.condition !== 'function') { console.warn(`Provide a \`condition\` function for "${this.props.input.name}" with value "${this.props.input.value}"`); }
		if (this.props.input.value == null) { console.warn(`Provide a valid value for "${this.props.input.name}"`); }

		try {
			valid = this.props.condition(this.props.input);
		} catch(e) {
			console.error(e);

			return (null);
		}

		if (typeof valid !== 'boolean') {
			console.warn(`Provide \`<Conditional/>\` component for "${this.props.input.name}" with value "${this.props.input.value}", a \`condition\` function which returns a boolean.`);
		}

		show = (valid === true) ? (
			<React.Fragment>
				{this.props.children}
			</React.Fragment>
		) : (null);

		return show;
	}
}

export default Conditional;

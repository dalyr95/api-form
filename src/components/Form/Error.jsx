import React from 'react';

class Error extends React.Component {
	render() {
		let show, valid;

		if (typeof this.props.validate !== 'function') { console.warn(`Provide a \`validate\` function for "${this.props.input.name}" with value "${this.props.input.value}"`); }
		if (this.props.input.value == null) { console.warn(`Provide a valid value for "${this.props.input.name}"`); }
		
		try {
			valid = this.props.validate(this.props.input.value);
		} catch(e) {
			console.error(e);

			return (null);
		}

		if (typeof valid !== 'boolean') {
			console.warn(`Provide \`<Error/>\` component for "${this.props.input.name}" with value "${this.props.input.value}", a validation function which returns a boolean.`);
		}

		show = (this.props.validate(this.props.input.value) === false) ? (
			<div className='form-error'>{this.props.message || this.props.children}</div>
		) : (null);

		return show;
	}
}

export default Error;

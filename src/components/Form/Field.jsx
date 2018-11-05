import React from 'react';

class Field extends React.Component {
  constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
	}

	onChange(e) {
		if (this.props.handleOwnPropagation !== true) {
			e.stopPropagation();
		}
	}

	render() {
		/**
		 * Check children of Field for inputs and pass on values correctly
		 * In updateModel in Form, the existing model already exists, so do we want to nuke this field or what?
		 */

		return (
			<fieldset onChange={this.onChange}>
				{
					React.Children.map(this.props.children, (child) => {
						if (!child || !child.props) {
							return child;
						}

						let p = {};

						// In case anyone passed in a DOM element as a child
						if (typeof child.type !== 'string') {
							p = this.props;
						}

						// Pass `updateParent` to child component
						return React.cloneElement(child, {
							...child.props,
							...p
						});
					})
				}
			</fieldset>
		);
  }
}

export default Field;

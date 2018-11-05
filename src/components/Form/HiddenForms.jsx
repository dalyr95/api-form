import React from 'react';

import Form from './Form.jsx';

class HiddenForms extends React.Component {
	render() {
		let renderWrappedChildren = (children) => {
			return React.Children.map(children, (child) => {
			  // This is support for non-node elements (eg. pure text), they have no props
			  if (!child || !child.props) {
				return child;
			  }

			  let p = (child.type !== 'string') ? { visible: false } : {};

			  if (child.props.children) {
				return React.cloneElement(child, {
				  children: this.renderWrappedChildren(child.props.children),
				  ...p
				});
			  }
			  
			  return React.cloneElement(child, {...p});
			});
		  };

		return (renderWrappedChildren(this.props.children));
	}
}

export default HiddenForms;

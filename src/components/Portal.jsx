import React from 'react';
import ReactDOM from 'react-dom';

class Portal extends React.Component {
  componentDidMount() {
    this.$el = document.createElement('div');
    this.$el.setAttribute('class', this.props.containerStyle || '');
    this.$root = document.getElementById(this.props.id);

    if (!this.$root) {
      this.$root = document.createElement('div');
      this.$root.setAttribute('id', this.props.id || '');
      document.body.appendChild(this.$root);
    }

    this.$root.appendChild(this.$el);
  }

  componentWillUnmount() {
    this.$root.removeChild(this.$el);
  }

  render() {
    if (!this.$root) { return (null); }

    return ReactDOM.createPortal(
      this.props.children,
      this.$el,
    );
  }
}

export default Portal;

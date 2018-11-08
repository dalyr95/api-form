import React from 'react';
import styles from './ImageUpload.less';

class DropZoneUploadItem extends React.Component {
  constructor(props) {
    super(props);

    this.onDrop = this.onDrop.bind(this);
    this.onDragExit = this.onDragExit.bind(this);
    this.dropzoneOnDragOver = this.dropzoneOnDragOver.bind(this);

    this.state = {
      dragging: false
    };
  }

  onDrop(ii, e) {
    e.preventDefault();

    this.props.updateImage(ii, this.props.assignImage);
    this.props.removeImage(this.props.assignImage);

    this.setState({ dragging: false });
  }

  dropzoneOnDragOver(e) {
    e.preventDefault();

    if (this.state.dragging !== true) {
      this.setState({ dragging: true });
    }
  }

  onDragExit() {
    this.setState({ dragging: false });			
  }

  render() {
    let ii = this.props.ii;
    let className = (this.state.dragging) ? styles.over : '';

    return (
      <li
        className={className}
        onDragOver={this.dropzoneOnDragOver}
        onDrop={this.onDrop.bind(this, this.props.ii)}
        onDragExit={this.onDragExit}
        onDragLeave={this.onDragExit}
      >
        {ii.label}
      </li>
    );
  }
}

export default DropZoneUploadItem;

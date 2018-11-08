import React from 'react';

import DropZoneUploadItem from './DropZoneUploadItem.jsx';

class UploadMultiple extends React.Component {
  constructor(props) {
    super(props);

    this.imageChange = this.imageChange.bind(this);
    this.onDragExit = this.onDragExit.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDropDown = this.onDropDown.bind(this);
    this.showDropZone = this.showDropZone.bind(this);

    this.$input = React.createRef();

    this.state = {
      showDropZone: false,
      assignImage: false,
      dragging: false,
      images: []
    };
  }

  componentDidMount() {
    this.$body = document.body;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.assignImage !== this.state.assignImage) {
      let vector = (this.state.assignImage) ? 'add' : 'remove';
      this.$body.classList[vector]('fade');
    }
  }

  showDropZone(e) {
    e.preventDefault();

    this.setState({showDropZone: true});
  }

  onDragStart(img) {
    this.setState({ assignImage: img });
  }

  onDragOver() {
    if (this.state.dragging !== true) {
      this.setState({ dragging: true });
    }
  }

  onDragExit() {
    this.setState({
      assignImage: false,
      dragging: false
    });			
  }

  onDrop(e) {
    e.preventDefault();

    this.$input.current.files = e.dataTransfer.files;

    this.setState({
      assignImage: false,
      dragging: false
    });		
  }

  onDragEnd() {
    this.setState({
      assignImage: false,
      dragging: false
    });
  }

  imageChange(e) {
    let files = e.currentTarget.files;

    this.setState({
      dragging: false,
      images: Array.from(this.state.images).concat(Array.from(files))
    });
  }

  removeImage(img) {
    this.setState({
      assignImage: false,
      images: this.state.images.filter(i => i !== img)
    });
  }

  onDropDown(img, e) {
    let ii;

    Object.values(this.props.sections).forEach(sections => {
      sections.inputs.forEach(i => {
        if (e.currentTarget.value === i.name) { ii = i; }
      });
    });

    this.props.updateImage(ii, img);
    this.removeImage(img);
  }

  render() {
    if (this.state.showDropZone === false) {
      return (
        <div className={'upload_multiple_text'} onClick={this.showDropZone}><a href="#">Upload multiple images</a></div>
      );
    }
    let images;

    if (this.state.images.length > 0) {
      let imagesArray = this.state.images;

      let options = [];

      Object.entries(this.props.sections).map(i => {
        if (i[1].inputs.length === 0) { return null; }

        let option = {};
        i[1].inputs.forEach(ii => {
          option[ii.name.replace(/-[0-9]*$/, '')] = (<option key={`${i[0]}--${ii.name}`} name={ii.name} value={ii.name}>{ii.label}</option>);
        });

        options.push((
          <optgroup label={i[1].title.replace(/^\w/, c => c.toUpperCase())} key={i[0]}>
            {Object.values(option)}
          </optgroup>
        ));
      });

      images = (
        <div className={'image_upload_multiple_images'}>
          {
            imagesArray.map(i => {
              if (i.type.startsWith('image/') === false) { return; }

              let src = window.URL.createObjectURL(i);

              var img = document.createElement('img');
              img.src = src;
              img.onload = function() {
                window.URL.revokeObjectURL(src);
              };

              return (
                <div key={`${i.name}-${i.size}-${i.lastModified}`}>
                  <div className={'image_upload_multiple_single'}>
                    <div className={'image_input_image'}><img src={src}/></div>
                  </div>
                  <label className="select">
                    <select defaultValue="" onChange={this.onDropDown.bind(this, i)}>
                      <option value="">Select...</option>
                      {options}
                    </select>
                  </label>
                </div>
              );
            })
          }
        </div>
      );
    }

    let dragging = (this.state.dragging === true) ? 'dragging' : '';
    let sections = [];

    Object.entries(this.props.sections).forEach(i => {
      let inputs = i[1].inputs.map(ii => (
        <DropZoneUploadItem
          updateImage={this.props.updateImage}
          assignImage={this.state.assignImage}
          removeImage={this.removeImage}
          key={ii.name}
          ii={ii}
        />
      ));

      sections.push(
        <section key={i[0]}>
          <h4>{i[0]}</h4>
          <ul>{inputs}</ul>
        </section>
      );
    });

    return (
      <React.Fragment>
        <div
          className={['image_upload_multiple', dragging].join(' ')}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragExit={this.onDragExit}
          onDragLeave={this.onDragExit}
        >
          <label>
            <h2>Drag files to upload or <span>browse</span></h2>
            <input ref={this.$input} type="file" accept="image/*" multiple onChange={ this.imageChange } />
          </label>
        </div>
        {images}
      </React.Fragment>
    );
  }
}

export default UploadMultiple;

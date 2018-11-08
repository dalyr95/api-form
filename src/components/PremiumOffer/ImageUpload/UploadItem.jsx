import React from 'react';
import Portal from '../../Portal.jsx';

import Cropper from 'cropperjs';

let cx = require('classnames');

class UploadItem extends React.Component {
  constructor(props) {
    super(props);

    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragExit = this.onDragExit.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.clickLabel = this.clickLabel.bind(this);
    this.dismissModal = this.dismissModal.bind(this);

    this.initCropper = this.initCropper.bind(this);
    this.cropperCancel = this.cropperCancel.bind(this);
    this.cropperSave = this.cropperSave.bind(this);

    this.$input = React.createRef();
    this.$cropper = React.createRef();

    this.state = {
      dragging: false,
      editImage: false
    };
  }

  componentDidUpdate() {
    /**
     * NOTE - Backup clearup
     */
    if (this.state.editImage === false && this.state.cropperBlobUrl) {
      window.URL.revokeObjectURL(this.state.cropperBlobUrl);
    }
  }

  componentWillUnmount() {
    window.URL.revokeObjectURL(this.state.cropperBlobUrl);
  }

  clickLabel(e) {
    let image = this.props.ii.croppedBlobURL || this.props.ii.blobURL;

    if (image) { e.preventDefault(); }
  }

  dismissModal(e) {
    if (e.target === e.currentTarget) {
      window.URL.revokeObjectURL(this.state.cropperBlobUrl);

      this.setState({
        cropperBlobUrl: null
      }, () => {
        setTimeout(() => {
          this.setState({
            cropperBlobUrl: null,
            ready: false,
            editImage: false
          });
        }, 250);
      });
    }
  }

  onDragOver(e) {
    e.preventDefault();

    if (this.state.dragging !== true) {
      this.setState({ dragging: true });
    }
  }

  onDragExit(e) {
    e.preventDefault();

    this.setState({ dragging: false });
  }

  onDrop(e) {
    e.preventDefault();
    this.$input.current.files = e.dataTransfer.files;

    this.setState({ dragging: false });
  }

  deleteImage(ii, e) {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Do you want to delete this image?')) {
      this.props.imageRemove(ii);
    }
  }

  editImage(ii, e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      editImage: true
    }, () => {
      if (this.state.cropperBlobUrl) {
        this.initCropper(ii);
        return;
      }

      let xmlHTTP = new XMLHttpRequest();
      xmlHTTP.open('GET', ii.blobURL, true);
      xmlHTTP.responseType = 'arraybuffer';
      xmlHTTP.onload = (e) => {
        let blob = new Blob([e.target.response]);
        let blobURL = window.URL.createObjectURL(blob);

        this.setState({
          loadingEditImage: null,
          cropperBlobUrl: blobURL
        }, () => this.initCropper(ii));
      };
      xmlHTTP.onprogress = (e) => {
        this.setState({
          loadingEditImage: parseInt((e.loaded / e.total) * 100)
        });
      };
      xmlHTTP.onloadstart = () => {
        this.setState({
          ready: false,
          loadingEditImage: 0
        });
      };
      xmlHTTP.send();
    });
  }

  initCropper(ii) {
    const image = this.$cropper.current;

    const ready = () => {
      if (ii.coords) {
        this.cropper.setData(ii.coords);
      }

      this.setState({
        ready: true
      });
    };

    this.cropper = new Cropper(image, {
      aspectRatio: 4 / 3,
      // Needed as on iOS portrait camera images will be landscape
      //checkCrossOrigin: true,
      //checkOrientation: false,
      zoomOnWheel: false,
      ready: ready
    });
  }

  cropperRotate(degree, e) {
    e.preventDefault();
    e.stopPropagation();

    this.cropper.rotate(degree);
  }

  cropperZoom(zoom, e) {
    e.preventDefault();
    e.stopPropagation();

    this.cropper.zoom(0.2 * zoom);
  }

  cropperCancel(e) {
    e.preventDefault();
    e.stopPropagation();

    window.URL.revokeObjectURL(this.state.cropperBlobUrl);

    this.setState({
      cropperBlobUrl: null
    }, () => {
      setTimeout(() => {
        this.cropper.destroy();
        this.cropper = null;

        setTimeout(() => {
          this.setState({
            cropperBlobUrl: null,
            ready: false,
            editImage: false
          });
        });
      }, 250);
    });
  }

  cropperSave(ii, e) {
    e.preventDefault();
    e.stopPropagation();

    window.URL.revokeObjectURL(this.state.cropperBlobUrl);

    this.setState({
      cropperBlobUrl: null
    }, () => {
      this.cropper.getCroppedCanvas({
        fillColor: '#000'
      }).toBlob((blob => {
        let coords = this.cropper.getData({
          rounded: true
        });

        // imgix doesn't like negative x,y
        coords.x = (coords.x < 0) ? 0 : coords.x;
        coords.y = (coords.y < 0) ? 0 : coords.y;

        this.cropper.destroy();
        this.cropper = null;

        this.props.imageCropped(ii, window.URL.createObjectURL(blob), coords, e);

        setTimeout(() => {
          this.setState({
            cropperBlobUrl: null,
            ready: false,
            editImage: false
          });
        });
      }));
    });
  }

  render() {
    let editImage, content;
    let ii = this.props.ii;

    let image = ii.croppedBlobURL || ii.blobURL;

    if (image) {
      /**
       * TODO - Formalize bucket urls
       */
      image = image.replace(/(https:\/\/s3.eu-west-\2\.amazonaws.com\/vehicle-photos-stage|https:\/\/vehicle-photos-stage.s3.eu-west-2.amazonaws.com)/, this.props.imgixURL);
      image = image.replace(/(https:\/\/s3.eu-west-\2\.amazonaws.com\/motorway-vehicle-photos|https:\/\/motorway-vehicle-photos.s3.eu-west-2.amazonaws.com)/, this.props.imgixURL);

      let img;
      let display = this.props.display;

      if (display) {
        let imgixParams = '';
        let imgixParamsCrop = '';

        // iOS doesn't like query strings on blob urls
        if (image.includes('imgix')) {
          /**
           * TODO - This can be done via `srcset`
           */
          let imageSize = 130;
          if (display.mobile && display.retina) {
            imageSize = 1000;
          } else if (display.mobile === false && display.retina) {
            imageSize = 260;
          } else if (display.mobile && display.retina === false) {
            imageSize = 500;
          }

          if (ii.coords && Number.isInteger(ii.coords.x)) {
            imgixParamsCrop = `&rect=${ii.coords.x},${ii.coords.y},${ii.coords.width},${ii.coords.height}&or=${ii.coords.rotate}`;
          }

          imgixParams = `?h=${imageSize}&w=${imageSize}&auto=format${imgixParamsCrop}`;
        }

        img = (
          <img src={`${image}${imgixParams}`} />
        );
      }

      content = (
        <div className={'image_input_image'}>
          {
            Number.isInteger(this.props.uploading) ? (
              <span className={'image_progress'}>
                <em style={{width: `${(this.props.uploading <= 2) ? 2 : this.props.uploading}%`}}></em>
              </span>
            ) : (
              <React.Fragment>
                <button className={'image_input_edit'} onClick={this.editImage.bind(this, ii)}>🔧</button>
                <button className={'image_input_delete'} onClick={this.deleteImage.bind(this, ii)}>&times;</button>
              </React.Fragment>
            )
          }
          {img}
        </div>
      );
    } else {
      content =  (
        <div className={'image_input_button'} data-name={ii.name}></div>
      );
    }

    if (this.state.editImage === true) {
      let cropperClasses = (this.state.ready) ? `${'cropper_container'} ${'ready'}` : 'cropper_container';

      let editImageContent, editImageLoader;

      if (Number.isInteger(this.state.loadingEditImage) || this.state.cropperBlobUrl) {
        editImageLoader = (
          <div className={'cropperLoading'}>
            <em style={{width: `${(Number.isInteger(this.state.loadingEditImage)) ? this.state.loadingEditImage : 100}%`}}/>
          </div>
        );
      }

      if (this.state.cropperBlobUrl) {
        editImageContent = (
          <div className={cropperClasses} style={{opacity: (this.state.ready) ? 1 : 0}}>
            <div className={'cropper_img'}>
              <img ref={this.$cropper} src={this.state.cropperBlobUrl} crossOrigin="true" />
            </div>
            <div className={'cropper_controls'}>
              <ul>
                <li><button className={cx('button light')} onClick={this.cropperCancel}>Cancel</button></li>
                <li><button className={cx('zoomIn', 'button light')} onClick={this.cropperZoom.bind(this, 1)}>+</button></li>
                <li><button className={cx('zoomOut', 'button light')} onClick={this.cropperZoom.bind(this, -1)}>-</button></li>
                <li><button className={cx('rotateLeft', 'button light')} onClick={this.cropperRotate.bind(this, -90)}>Rotate 90 Left</button></li>
                <li><button className={cx('rotateRight', 'button light')} onClick={this.cropperRotate.bind(this, 90)}>Rotate 90 Right</button></li>
                <li><button onClick={this.cropperSave.bind(this, ii)}>Save changes</button></li>
              </ul>
            </div>
          </div>
        );
      }

      editImage = (
        <Portal
          id='image-upload-edit'
          containerStyle={'imageComponent'}
        >
          <div className={'cropper_modal'} onClick={this.dismissModal}>
            {editImageLoader}
            {editImageContent}
          </div>
        </Portal>
      );
    }

    let label = ii.label.split(' - ');
    label = (label.length > 1) ? (
      <React.Fragment>
        <span className={'image_input_label'}>{label[0]}</span>
        <span className={'image_input_label'}>{label[1]}</span>
      </React.Fragment>
    ) : (
      <span className={'image_input_label'}>{label[0]}</span>
    );

    return (
      <li
        className={cx('image_input', {['dragging']: this.state.dragging})}
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
        onDragExit={this.onDragExit}
        onDragLeave={this.onDragExit}
      > 
        {label}
        <label onClick={this.clickLabel}>
          <input ref={this.$input} name={ii.name} type="file" accept="image/*" onChange={ this.props.imageChange.bind(this, ii) } />
          {content}
        </label>
        {editImage}
      </li>
    );
  }
}

export default UploadItem;

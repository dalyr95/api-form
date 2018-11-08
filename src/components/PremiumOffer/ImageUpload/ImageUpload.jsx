import React from 'react';

import UploadMultiple from './UploadMultiple.jsx';
import UploadItem from './UploadItem.jsx';

//import Helper from '../../forms/Helper/Helper.jsx';
//import Portal from '../../portal/Portal.jsx';

import './ImageUpload.css';

let cx = require('classnames');

class Upload extends React.Component {
  constructor(props) {
    super(props);

    this.PHOTOS_API = `${this.props.endpoints.gigApi}/v2/photos`;
    this.IMGIX_URL = this.props.endpoints.premiumFormImgix;

    this.imageChange = this.imageChange.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.imageRemove = this.imageRemove.bind(this);
    this.imageCropped = this.imageCropped.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.updateParent = this.updateParent.bind(this);

    this.state = {
      uploading: {
        progress: {}
      },
      sections: this.props.sections
    };
  }

  componentDidMount() {
    document.body.addEventListener('dragover', this.preventImageDragDisplayingFile);
    document.body.addEventListener('drop', this.preventImageDragDisplayingFile);

    this.mql = window.matchMedia('(max-width: 1000px)');
    let retina = (window.devicePixelRatio > 1);

    this.setDisplay = () => {
      this.setState({
        display: {
          mobile: this.mql.matches,
          retina: retina
        }
      });
    };

    this.setDisplay();
    this.mql.addListener(this.setDisplay);

    // IE11 support
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
          var dataURL = this.toDataURL(type, quality).split(',')[1];
          setTimeout(function() {

            var binStr = atob( dataURL ),
              len = binStr.length,
              arr = new Uint8Array(len);

            for (var i = 0; i < len; i++ ) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback( new Blob( [arr], {type: type || 'image/png'} ) );

          });
        }
      });
    }
  }

  componentDidUpdate() {
    let inputs = JSON.stringify(Object.keys(this.state.sections).reduce((accumulator, currentValue) => {
      accumulator[currentValue] = this.state.sections[currentValue].inputs.map(i => `${i.externalURL}-${i.blobURL}`);
      return accumulator;
    }, {}));

    if (inputs !== this._previousInputs) {
      this.updateParent();
    }

    this._previousInputs = inputs;
  }

  componentWillUnmount() {
    Object.entries(this.state.sections).forEach(i => {
      i[1].inputs.forEach(input => {
        window.URL.revokeObjectURL(input.croppedBlobURL);
        window.URL.revokeObjectURL(input.blobURL);
      });
    });

    document.body.removeEventListener('dragover', this.preventImageDragDisplayingFile);
    document.body.removeEventListener('drop', this.preventImageDragDisplayingFile);

    this.mql.removeListener(this.setDisplay);
  }

  preventImageDragDisplayingFile(e) {
    e.preventDefault();
  }

  imageChange(ii, e) {
    let file = e.currentTarget.files[0];
    this.updateImage(ii, file);
  }

  imageCropped(ii, croppedBlobURL, coords) {
    let inputs = {...this.state.sections};

    Object.entries(inputs).forEach(i => {
      i[1].inputs.forEach(input => {
        if (input === ii) {
          input.coords = coords;
          input.croppedBlobURL = croppedBlobURL;
        }
      });
    });

    this.setState({ sections: inputs }, () => {
      let xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status !== 200) {
          alert(`Something has gone wrong.`);
          /**
           * TODO - Reenable this outside of CRAP
           */
          //throw new Error(`Premium Crop Image: (${xhr.status}) - ${JSON.stringify(xhr.responseText)}`);
        }
      };

      let meta = {url: ii.externalURL, ...coords};

      xhr.open('POST', `${this.PHOTOS_API}/meta`, true);
      xhr.setRequestHeader('x-access-token', this.props.auth_token);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(Object.keys(meta).reduce((a,k) => {a.push(k+'='+encodeURIComponent(meta[k]));return a;},[]).join('&'));
    });
  }

  imageRemove(ii) {
    let inputs = {...this.state.sections};

    Object.entries(inputs).forEach(i => {
      i[1].inputs.forEach(input => {
        if (input === ii) {
          let xhr = new XMLHttpRequest();

          xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4 && xhr.status !== 200) {
              alert(`Something has gone wrong.`);
          /**
           * TODO - Reenable this outside of CRAP
           */
              //throw new Error(`Premium Delete Image: (${xhr.status}) - ${JSON.stringify(xhr.responseText)}`);
            }
          });

          /**
           * NOTE - Endpoint doesn't accept multi-part form data
           */
          xhr.open('DELETE', this.PHOTOS_API, true);
          xhr.setRequestHeader('x-access-token', this.props.auth_token);
          xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          xhr.send(`url=${input.externalURL}`);

          window.URL.revokeObjectURL(input.croppedBlobURL);
          window.URL.revokeObjectURL(input.blobURL);

          input.croppedBlobURL = null;
          input.coords = null;
          input.file = null;
          input.blobURL = null;
          input.externalURL = null;
          document.querySelector(`input[name="${input.name}"]`).value = '';

          if (i[0] === 'damage') {
            i[1].inputs = i[1].inputs.filter(img => {
              return (img.name !== ii.name);
            });
          }
        }
      });
    });

    this.setState({ sections: inputs });
  }

  updateImage(ii, file) {
    if (!ii || !file) { return; }
    if (!file.type.startsWith('image/')){ alert('Please upload an image file'); return; }

    let src = window.URL.createObjectURL(file);

    let inputs = {...this.state.sections};

    Object.entries(inputs).forEach(i => {
      i[1].inputs.forEach(input => {
        if (input === ii) {
          window.URL.revokeObjectURL(input.croppedBlobURL);
          window.URL.revokeObjectURL(input.blobURL);

          input.croppedBlobURL = null;
          input.coords = null;

          input.file = file;
          input.blobURL = src;

          this.uploadImage(input, (ii) => {
            // Don't bother if there's no coords.
            // Image dimensions might not be calculated yet
            if (ii.coords && Number.isInteger(ii.coords.x)) {
              this.imageCropped(ii, ii.croppedBlobURL, ii.coords);
            }
          });

          if (i[0] === 'damage') {
            let name = ii.name.replace(/-[0-9]*$/, '');

            let previous = i[1].inputs.filter(obj => {
              return (obj.name.search(new RegExp(`^${name}`)) === 0);
            }).sort((a,b) => {
              return parseInt(a.name.match(/[0-9]*$/)[0] || '0') - parseInt(b.name.match(/[0-9]*$/)[0] || '0');
            });

            // Get the highest number input name to avoid key conflicts when adding/deleting
            let nextInput = parseInt(previous[previous.length - 1].name.match(/[0-9]*$/)[0] || '0') + 1;

            i[1].inputs.push({
              name: `${name}-${nextInput}`,
              label: ii.label
            });

            i[1].inputs.sort((a, b) => a.name.localeCompare(b.name));
          }

          this.setState({ sections: inputs });

          let loadIMG = new Image();

          loadIMG.onload = (e) => {
            let width  = e.currentTarget.naturalWidth;
            let height = e.currentTarget.naturalHeight;

            inputs = {...this.state.sections};

            Object.entries(inputs).forEach(i => {
              i[1].inputs.forEach(input => {
                if (input === ii) {
                  let taller = (height >= width);

                  let x = 0;
                  let y = 0;
                  let newWidth = width;
                  let newHeight = height;

                  if (taller) {
                    newHeight = Math.round((width/4) * 3);
                    y = Math.round((height - newHeight) / 2);
                  } else {
                    newWidth = Math.round(height * (4/3));
                    x = Math.round((width - newWidth) / 2);
                  }

                  input.coords = {
                    x: (x < 0) ? 0 : x,
                    y: (y < 0) ? 0 : y,
                    width: newWidth,
                    height: newHeight,
                    rotate: 0,
                    scaleX: 1,
                    scaleY: 1
                  };

                  // If the image has been uploaded before the image has loaded.
                  // Can happen with lots of images and pressure on memory
                  // This checks if it's still uploading
                  if (!Number.isInteger(this.state.uploading.progress[ii.name])) {
                    this.imageCropped(ii, ii.croppedBlobURL, ii.coords);
                  }

                  let canvas = document.createElement('canvas');
                  canvas.width = newWidth;
                  canvas.height = newHeight;
                  let context = canvas.getContext('2d');

                  // draw cropped image
                  let sourceX = x;
                  let sourceY = y;
                  let sourceWidth = newWidth;
                  let sourceHeight = newHeight;
                  let destWidth = newWidth;
                  let destHeight = newHeight;
                  let destX = 0;
                  let destY = 0;

                  context.drawImage(loadIMG, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

                  canvas.toBlob(blob => {
                    window.URL.revokeObjectURL(input.croppedBlobURL);
                    input.croppedBlobURL = window.URL.createObjectURL(blob);

                    this.setState({ sections: inputs });

                    canvas = null;
                    context = null;
                    loadIMG = null;
                  });
                }
              });
            });
          };
          loadIMG.src = input.blobURL;
        }
      });
    });
  }

  uploadImage(input, cb) {
    let id = input.name;
    let uploading = {...this.state.uploading};
    uploading.progress[id] = 0;

    this.setState({ uploading: uploading }, () => {
      let xhr = new XMLHttpRequest();

      xhr.addEventListener('readystatechange', () => {
        let errorState = () => {
          uploading = {...this.state.uploading};
          delete uploading.progress[id];

          this.setState({ uploading: uploading });

          alert(`Something has gone wrong.`);

          /**
           * TODO - Reenable this outside of CRAP
           */
          //throw new Error(`Premium Upload Image: (${xhr.status}) - ${JSON.stringify(xhr.responseText)}`);
        };

        if (xhr.readyState === 4 && xhr.status === 200) {
          let inputs = {...this.state.sections};
          let uploadedInput;

          Object.entries(inputs).forEach(i => {
            i[1].inputs.forEach(ii => {
              if (input === ii) {
                uploadedInput = ii;
              }
            });
          });

          try {
            let response = JSON.parse(xhr.responseText);

            if (response && response.location) {
              uploadedInput.externalURL = response.location;

              this.setState({
                sections: inputs
              });

              if (cb) { cb(uploadedInput); }
            }
          } catch(e) {
            errorState();
          }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
          errorState();
        }
      });

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          let percentage = Math.round((e.loaded * 100) / e.total);

          uploading = {...this.state.uploading};
          uploading.progress[id] = percentage;

          this.setState({ uploading: uploading });
        }
      }, false);

      xhr.upload.addEventListener('load', () => {
        uploading = {...this.state.uploading};
        uploading.progress[id] = 100;

        this.setState({ uploading: uploading });

        setTimeout(() => {
          uploading = {...this.state.uploading};
          delete uploading.progress[id];

          this.setState({ uploading: uploading });
        }, 200);
      });

      /**
       * TODO - Sometimes `this.props.premiumOffer.id` isn't available, refetch
       */
      let form = new FormData();
      form.append('file', input.file);
      form.append('name', `${input.name}-${Date.now()}`);
      form.append('kind', input.name.replace(/-[0-9]*$/, ''));
      form.append('id', this.props.id);

      xhr.open('POST', this.PHOTOS_API, true);
      xhr.setRequestHeader('x-access-token', this.props.auth_token);
      xhr.send(form);
    });
  }

  updateParent() {
    if (!this.props.updateParent) { return; }

    this.props.updateParent(this.state.sections);
  }

  onDragOver(e) {
    e.preventDefault();
  }

  render() {
    let uploadingElement, progressAmount;
    let uploading = {...this.state.uploading};

    let progress = Object.values(uploading.progress);
    let sections = [];

    Object.entries(this.state.sections).forEach(i => {
      let inputs;

      if (i[0] === 'damage') {
        inputs = [];

        let damageCategories = {};

        i[1].inputs.forEach(ii => {
          if (damageCategories[ii.label]) {
            damageCategories[ii.label].push(ii);
          } else {
            damageCategories[ii.label] = [ii];
          }
        });

        Object.entries(damageCategories).forEach(cat => {
          let catInputs = cat[1].map(ii => (
            <UploadItem
              key={`${ii.name}${(ii.externalURL) ? `-${ii.externalURL}` : ''}`}
              ii={ii}
              imageChange={this.imageChange}
              imageRemove={this.imageRemove}
              imageCropped={this.imageCropped}
              uploading={this.state.uploading.progress[ii.name]}
              display={this.state.display}
              imgixURL={this.IMGIX_URL}
            />
          ));

          inputs.push((<ul key={`damage-images-section-${cat[0]}`} className={cx('image_section', 'image_section_damage')}>{catInputs}</ul>));
        });

      } else {
        inputs = i[1].inputs.map(ii => (
          <UploadItem
            key={`${ii.name}${(ii.externalURL) ? `-${ii.externalURL}` : ''}`}
            ii={ii}
            imageChange={this.imageChange}
            imageRemove={this.imageRemove}
            imageCropped={this.imageCropped}
            uploading={this.state.uploading.progress[ii.name]}
            display={this.state.display}
            imgixURL={this.IMGIX_URL}
          />
        ));
        inputs = (<ul className={'image_section'}>{inputs}</ul>);
      }

      if (i[1].inputs.length > 0) {
        sections.push(
          <div key={i[0]} data-section={i[0]}>
            <h4>{i[1].title}</h4>
            <div className={'image_strap'}>
              {i[1].strap}&nbsp;
              {/*<Helper helper={{ label: 'see examples', content: i[1].helper, modal: true, inline: true }}/>*/}
            </div>
            {inputs}
          </div>
        );
      }
    });

    if (progress.length > 0) {
      progressAmount = (
        <span className={'uploading_progress'}><em style={{width: `${Math.round(progress.reduce((a, b) => a + b, 0) / progress.length)}%`}}></em></span>
      );

      uploadingElement = (
        <div className={'uploading_message'}>
					Uploading {progress.length} image{(progress.length > 1) ? 's' : ''}... {progressAmount}
        </div>
      );
    }

    return (
      <div onDragOver={this.onDragOver} className={'imageComponent'}>
        <UploadMultiple
          sections={this.state.sections}
          updateImage={this.updateImage}
          uploadImage={this.uploadImage}
        />
        {sections}
      </div>
    );
  }
}

export default Upload;

import React from 'react';

import Form from '../Form/Form.jsx';
import Field from '../Form/Field.jsx';

import ImageUpload from './ImageUpload/ImageUpload.jsx';

import Navigation from './Navigation.jsx';

class PhotosForm extends React.Component {
	constructor(props) {
    super(props);
    
    this.update = this.update.bind(this);

    this.state = {
      sections: {
        exterior: {
          title: 'Exterior',
          strap: 'Ensure the whole of the car is visible in each photo.',
          inputs: [
            {
              name: 'exterior_front_driver',
              label: 'Front - Driver side'
            },
            {
              name: 'exterior_rear_driver',
              label: 'Back - Driver side'
            },
            {
              name: 'exterior_front_passenger',
              label: 'Front - Passenger side'
            },
            {
              name: 'exterior_rear_passenger',
              label: 'Back - Passenger side'
            }
          ]
        },
        interior: {
          title: 'Interior',
          strap: 'Take zoomed-out photos showing as much of the interior as possible.',
          inputs: [
            {
              name: 'interior_front_seats',
              label: 'Front seats'
            },
            {
              name: 'interior_rear_seats',
              label: 'Rear seats'
            },
            {
              name: 'interior_dashboard',
              label: 'Dashboard'
            },
            {
              name: 'interior_boot',
              label: 'Boot interior'
            }
          ]
        },
        wheels: {
          title: 'Wheels',
          strap: 'Take side-on photos showing the whole wheel and tyre.',
          inputs: [
            {
              name: 'wheels_front_driver',
              label: 'Front - Driver side'
            },
            {
              name: 'wheels_rear_driver',
              label: 'Rear - Driver side'
            },
            {
              name: 'wheels_front_passenger',
              label: 'Front - Passenger side'
            },
            {
              name: 'wheels_rear_passenger',
              label: 'Rear - Passenger side'
            }
          ]
        },
        treads: {
          title: 'Tyre treads',
          strap: 'Take close-up photos from the ground showing the tread of each tyre.',
          inputs: [
            {
              name: 'tyre_tread_front_driver',
              label: 'Front - Driver side'
            },
            {
              name: 'tyre_tread_rear_driver',
              label: 'Rear - Driver side'
            },
            {
              name: 'tyre_tread_front_passenger',
              label: 'Front - Passenger side'
            },
            {
              name: 'tyre_tread_rear_passenger',
              label: 'Rear - Passenger side'
            }
          ]
        },
        damage: {
          title: 'Condition photos',
          strap: 'Add photos of the issues you identified earlier.',
          inputs: [
            {
              condition: 'condition.scratches',
              name: 'damage_scratches',
              label: 'Scratches'
            },
            {
              condition: 'condition.scuffs',
              name: 'damage_scuffs',
              label: 'Scuffs'
            },
            {
              condition: 'condition.dents',
              name: 'damage_dents',
              label: 'Dents'
            },
            {
              condition: 'condition.paintwork',
              name: 'damage_paintwork',
              label: 'Paintwork problems'
            },
            {
              condition: 'wheels_and_tyres.tyres',
              name: 'damage_tyres',
              label: 'Tyre problems'
            },
            {
              condition: 'wheels_and_tyres.alloys',
              name: 'damage_alloy_scuffs',
              label: 'Alloy scuffs'
            },
            {
              condition: 'condition.trim',
              name: 'damage_missing_trims',
              label: 'Missing trim'
            },
            {
              condition: 'condition.dashboard',
              name: 'damage_warning_lights',
              label: 'Warning lights'
            }
          ]
        }
      }
    }

    this.state.filteredSections = this.processSections();
  }

  processSections() {
    let damageSections = [];
    let sections = JSON.parse(JSON.stringify(this.state.sections));
    let damageSectionsImages = {};
    let damageSectionsClone = JSON.parse(JSON.stringify(sections.damage.inputs));

    let data = this.props;
    let photos = data.photos;
    let conditionAndWheels = data.conditionAndWheels;

    if (photos && photos.length >= 0) {
      photos.forEach(photo => {
        Object.entries(sections).forEach(section => {
          let title = section[0];
          section = section[1];

          section.inputs.forEach((input, i) => {
            if (input.name === photo.kind) {
              Object.keys(photo.meta).map((key) => {
                photo.meta[key] = parseInt(photo.meta[key]);
              });

              input.blobURL = photo.url;
              input.externalURL = photo.url;
              input.coords = photo.meta;

              if (title === 'damage') {
                damageSectionsImages[input.name] = damageSectionsImages[input.name] + 1 || 0;
                damageSections.push({...input, name: `${input.name}-${damageSectionsImages[input.name]}`});
              }
            }
          });
        });
      });
    }

    if (damageSections.length > 0) {
      sections.damage.inputs = damageSectionsClone.map(i => {
        let required = !damageSectionsImages[i.name];
        return { ...i, name: `${i.name}-${damageSectionsImages[i.name] + 1 || 0}`, required: required };
      }).concat(damageSections).sort((a, b) => a.name.localeCompare(b.name));
    }

    sections.damage.inputs = sections.damage.inputs.filter(section => {
      let path = section.condition.split('.');
      let show = (conditionAndWheels[path[0]][path[1]] === true);
      return show;
    }).sort((a, b) => a.name.localeCompare(b.name));

    return sections;
  }

  update(sections) {
    this.setState({
      filteredSections: sections
    });
  }

	render() {
    let elements = [];

		Object.values(this.state.filteredSections).forEach(s => {
			s.inputs.forEach(i => {
				elements.push({
					element: 'input',
					type: 'file',
					required: s.required,
          value: i.externalURL || i.croppedBlobURL || i.blobURL || null,
          meta: {
            summary: {
              label: i.label
            }
          },
					...i
				})
			});
    });

    /**
     * TODO - Multiple upload doesn't update summary
     */

		return (
			<Form
				update={this.props.update}
				name='photos'
				onMount={this.props.update}
				initialData={this.props.initialData}
				//onFocus={this.update}
				persistEvents={false} // Has a performance impact, only use if you need event data
        visible={this.props.visible}
        seen={this.props.seen}
        listen={true}
			>	
        <h2>Photos</h2>
				<Field parentKey='photos-elements' elements={elements}></Field>
        <ImageUpload
          id={this.props.id}
          endpoints={{
            gigApi: 'https://motorway-dealership-platform-staging.azurewebsites.net/api',
            premiumFormImgix: '//motorway-stage.imgix.net'
          }}
          sections={this.state.filteredSections}
        />
        <Navigation {...this.props}></Navigation>
			</Form>
		);
	}
}

export default PhotosForm;
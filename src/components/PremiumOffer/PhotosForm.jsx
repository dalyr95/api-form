import React from 'react';

import Form from '../Form/Form.jsx';
import Field from '../Form/Field.jsx';

import Navigation from './Navigation.jsx';

class PhotosForm extends React.Component {
	constructor(props) {
		super(props);

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
  }
  
	shouldComponentUpdate() {
		return (this.props.visible !== false);
	}

	componentDidMount() {
		return;
		setTimeout(() => {
			console.log(21312323);
			this.setState({
				damage: false
			});
		}, 5000);
	}

	render() {
		let elements = [];

		Object.values(this.state.sections).forEach(s => {
			s.inputs.forEach(i => {
				elements.push({
					element: 'input',
					type: 'file',
					required: true,
					value: null,
					...i
				})
			});
		});


		return (
			<Form
				//update={this.update}
				name='photos'
				onMount={this.props.update}
				onBlur={this.props.update}
				onChange={this.props.update}
				initialData={this.props.initialData}
				//onFocus={this.update}
				persistEvents={false} // Has a performance impact, only use if you need event data
        visible={this.props.visible}
				seen={this.props.seen}
			>	
        <h2>Photos</h2>
				<Field elements={elements}></Field>
        <img src="https://media.tenor.com/images/feea9c253d7f33dd893efbaf922ea2e2/tenor.gif"/>
        <Navigation {...this.props}></Navigation>
			</Form>
		);
	}
}

export default PhotosForm;
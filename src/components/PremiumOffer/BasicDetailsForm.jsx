import React from 'react';

import Form from '../Form/Form.jsx';
import Conditional from '../Form/Conditional.jsx';
import Field from '../Form/Field.jsx';
import Fieldset from '../Form/Fieldset.jsx';

import Navigation from './Navigation.jsx';

class BasicDetailsForm extends React.Component {
	constructor(props) {
		super(props);

		this.update = this.update.bind(this);
	}

	componentDidMount() {
		console.log('mount');
	}

	componentWillUnmount() {
		console.log('unmount');
	}

	initialDataTransform(initialData={}) {
		if (initialData['num_keys']) {
			if (initialData['num_keys'] && initialData['num_keys'] !== 2) {
				initialData['num_keys0'] = 'none';
			}
			initialData['num_keys1'] = initialData['num_keys'].toString();
		}
		return initialData;
	}

	update(e, data) {
		let d = Object.assign({}, data.data);
		d['num_keys'] = (d['num_keys0'] === 'none') ? d['num_keys1'] : d['num_keys0'];

		delete d['num_keys0'];
		delete d['num_keys1'];

		data.data = d;

		this.props.update(e, data);
	}

	shouldComponentUpdate() {
		return (this.props.visible !== false);
	}

	render() {
		return (
				<Form
					//update={this.update}
					name='basic_details'
					onMount={this.update}
					onBlur={this.update}
					onChange={this.update}
					//onFocus={this.update}
					initialData={this.props.initialData}
					initialDataTransform={this.initialDataTransform}
					persistEvents={false} // Has a performance impact, only use if you need event data
					visible={this.props.visible}
					seen={this.props.seen}
				>	
					<h2>Basic details</h2>
					<h4>Does your car have any of these features?</h4>
					<Fieldset name="equipment" serialization="array" meta={{summary: {
						label: 'Features'
					}}}>
						<div>
							<input id="equipment_0" type="checkbox" value="sat_nav"/><label htmlFor="equipment_0">Sat nav</label>
						</div>
						<div>
							<input id="equipment_1" type="checkbox" value="panoramic_roof"/><label htmlFor="equipment_1">Panoramic roof / sun roof</label>
						</div>
						<div>
							<input id="equipment_2" type="checkbox" value="heated_seats"/><label htmlFor="equipment_2">Heated seats</label>
						</div>
						<div>
							<input id="equipment_3" type="checkbox" value="parking_cam"/><label htmlFor="equipment_3">Rear parking camera</label>
						</div>
						<div>
							<input id="equipment_4" type="checkbox" value="sound_system"/><label htmlFor="equipment_4">Upgraded sound system</label>
						</div>
					</Fieldset>
					{
						/*
						// Example of serialization object
						<Fieldset name="equipment1" serialization="object">
							<input id="equipment_00" type="checkbox" value="sat_nav"/><label htmlFor="equipment_00">Sat nav</label>
							<input id="equipment_10" type="checkbox" value="panoramic_roof"/><label htmlFor="equipment_10">Panoramic roof / sun roof</label>
							<input id="equipment_20" type="checkbox" value="heated_seats"/><label htmlFor="equipment_20">Heated seats</label>
							<input id="equipment_30" type="checkbox" value="parking_cam"/><label htmlFor="equipment_30">Rear parking camera</label>
							<input id="equipment_40" type="checkbox" value="sound_system"/><label htmlFor="equipment_40">Upgraded sound system</label>
						</Fieldset>
						*/
					}

					<h4>What colour are the seats?</h4>
					<label>
						<select name="seat_color" required meta={{summary: { mutate: function(fields) {
							let value;
							if (this.props.model.basic_details.seat_color) {
								value = fields.filter(f => {
									return this.props.model.basic_details.seat_color === f.value
								});
							}

							return (value && value[0]) ? value[0].text : value;
						}.bind(this, this.props.fields.seat_color)
						}}}>
							<option value="" disabled={true}>Select a colour</option>
							{
								this.props.fields.seat_color.map(f => {
									return (<option key={f.value} name={f.value} value={f.value}>{f.text}</option>);
								})
							}
						</select>
					</label>

					<h4>How are they upholstered?</h4>
					<label className="select">
						<select name="seat_fabric" required meta={{summary: { mutate: function(fields) {
								let value;
							if (this.props.model.basic_details.seat_fabric) {
								value = fields.filter(f => {
									return this.props.model.basic_details.seat_fabric === f.value
								});
							}

							return (value && value[0]) ? value[0].text : value;
						}.bind(this, this.props.fields.seat_fabric)
						}}}>
							<option value="" disabled={true}>Select a fabric</option>
							{
								this.props.fields.seat_fabric.map(f => {
									return (<option key={f.value} name={f.value} value={f.value}>{f.text}</option>);
								})
							}
						</select>
					</label>

					<h4>Do you have two working keys for the car?</h4>
					{/* Use field to pass down summary */}
					<Field handleOwnPropagation={true} meta={{summary: {
						label: 'Number of keys',
						mutate: () => {
							let value = this.props.model.basic_details.num_keys0;

							if (this.props.model.basic_details.num_keys0 === 'none') {
								value = this.props.model.basic_details.num_keys1 || '--';
							}

							return value;
						}
					}}}>
						<input id="num_keys_0___0" type="radio" name="num_keys0" value="2" required/>
						<label htmlFor="num_keys_0___0">Yes</label>
						<input id="num_keys_1___0" type="radio" name="num_keys0" value="none" required/>
						<label htmlFor="num_keys_1___0">No</label>
					</Field>

					<Conditional
							name="num_keys0"
							condition={(input) => {
								return (input.checked && input.value === 'none');
							}}
						>
						{ /*
						<h4>How many working keys do you have?</h4>
						<input id="num_keys_0___1" type="radio" name="num_keys1" value="0" required />
						<label htmlFor="num_keys_0___1">None</label>
						<input id="num_keys_1___1" type="radio" name="num_keys1" value="1" required />
						<label htmlFor="num_keys_1___1">1</label>
						<input id="num_keys_2___1" type="radio" name="num_keys1" value="3" required />
						<label htmlFor="num_keys_2___1">3+</label>
						*/}

						<Field handleOwnPropagation={true} meta={{summary: {
							show: false
						}}}>
							<h4>How many working keys do you have?</h4>
							<input id="num_keys_0___1" type="radio" name="num_keys1" value="0" required />
							<label htmlFor="num_keys_0___1">None</label>
							<input id="num_keys_1___1" type="radio" name="num_keys1" value="1" required />
							<label htmlFor="num_keys_1___1">1</label>
							<input id="num_keys_2___1" type="radio" name="num_keys1" value="3" required />
							<label htmlFor="num_keys_2___1">3+</label>
						</Field>
					</Conditional>

					<h4>Do you have the V5C logbook?</h4>
					<input id="logbook_0" type="radio" name="logbook" value="true" required />
					<label htmlFor="logbook_0">Yes</label>
					<input id="logbook_1" type="radio" name="logbook" value="false" required />
					<label htmlFor="logbook_1">No</label>
					<Conditional
							name="logbook"
							condition={(input) => {
								return (input.checked && input.value === true);
							}}
						>
						<h4>Is the V5C logbook in your name?</h4>
						<input id="logbook_self_0" type="radio" name="logbook_self" value="true" required />
						<label htmlFor="logbook_self_0">Yes</label>
						<input id="logbook_self_1" type="radio" name="logbook_self" value="false" required />
						<label htmlFor="logbook_self_2">No</label>
					</Conditional>

					<h4>Do you have the book pack?</h4>
					<input id="book_pack_0" type="radio" name="book_pack" value="true" required/>
					<label htmlFor="book_pack_0">Yes</label>
					<input id="book_pack_1" type="radio" name="book_pack" value="false" required/>
					<label htmlFor="book_pack_1">No</label>

					<Navigation {...this.props}></Navigation>
				</Form>
		);
	}
}

export default BasicDetailsForm;
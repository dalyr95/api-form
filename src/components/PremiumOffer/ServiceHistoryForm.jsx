import React from 'react';

import Form from '../Form/Form.jsx';
import Conditional from '../Form/Conditional.jsx';
import Field from '../Form/Field.jsx';
import MonthControl from '../Form/MonthControl.jsx';

import Navigation from './Navigation.jsx';

class ServiceHistoryForm extends React.Component {
	constructor(props) {
		super(props);
	}

	initialDataTransform(initialData={}) {
		if (!initialData) { return {}; }

		if (initialData['service_date']) {
			let match = initialData['service_date'].match(/^[0-9]{4}-[0-9]{2}/);
			initialData['service_date'] = (match) ? match[0] : '';
		}
		return initialData;
	}

	shouldComponentUpdate() {
		return (this.props.visible !== false);
	}

	render() {
		return (
			<Form
				//update={this.update}
				name='service_history'
				onMount={this.props.update}
				onBlur={this.props.update}
				onChange={this.props.update}
				//onFocus={this.props.update}
				initialData={this.props.initialData}
				persistEvents={false} // Has a performance impact, only use if you need event data
				visible={this.props.visible}
				seen={this.props.seen}
			>	
				<h2>Service history</h2>
				<h4>What is the service history of your car?</h4>
				<input id="service_history_0" type="radio" name="service_history" value="yes" required/>
				<label htmlFor="service_history_0">Full or partial service history</label>
				<input id="service_history_1" type="radio" name="service_history" value="no" required/>
				<label htmlFor="service_history_1">No service history</label>
				<input id="service_history_2" type="radio" name="service_history" value="not_applicable" required/>
				<label htmlFor="service_history_2">Not yet due first service</label>

				<h4>Do you have the service record?</h4>
				<input id="service_record_0" type="radio" name="service_record" value="true" required />
				<label htmlFor="service_record_0">Yes</label>
				<input id="service_record_1" type="radio" name="service_record" value="false" required />
				<label htmlFor="service_record_1">No</label>

				<Conditional
						name="service_record"
						condition={(input) => {
							return (input.checked && input.value === true);
						}}
					>
					<h4>How many services do you have recorded in the service record?</h4>

					<h6>Manufacturer or official dealer services:</h6>
					<label htmlFor="service_stamps_official">Manufacturer or official dealer services:</label>
					<input name="service_stamps_official" type="number" min="0" placeholder="0" value="0" required />

					<h6>Independent garage services:</h6>
					<label htmlFor="service_stamps_independent">Manufacturer or official dealer services:</label>
					<input name="service_stamps_independent" type="number" min="0" placeholder="0" value="0" required />
					
					<h4>When was the vehicle last serviced?</h4>

					<Field name="service_date" type="month"  min="2013-01" max="2018-11" value="" year={2013} required>
						<MonthControl />
					</Field>

					<h4>What was the mileage at the last service?</h4>
					<input name="service_mileage" type="number" min="0" required />

					<h4>Do you have the service record?</h4>
					<input id="cambelt_changed_0" type="radio" name="cambelt_changed" value="true" required/>
					<label htmlFor="cambelt_changed_0">Yes</label>
					<input id="cambelt_changed_1" type="radio" name="cambelt_changed" value="false" required/>
					<label htmlFor="cambelt_changed_1">No</label>

					<Conditional
							name="cambelt_changed"
							condition={(input) => {
								return (input.checked && input.value === true);
							}}
						>
							<h4>When was the cambelt changed?</h4>
							<Field  name="cambelt_change_date" type="month" min="2013-01" max="2018-11"  year={2013} value="" required>
								<MonthControl />
							</Field>

							<h4>What was the mileage when the cambelt was changed?</h4>
							<input id="cambelt_change_mileage" type="number" min="0" placeholder="0" value="" required></input>
					</Conditional>
				</Conditional>
				<Navigation {...this.props}></Navigation>
			</Form>
		);
	}
}

export default ServiceHistoryForm;
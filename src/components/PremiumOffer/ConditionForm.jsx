import React from 'react';

import Form from '../Form/Form.jsx';
import Conditional from '../Form/Conditional.jsx';

import Navigation from './Navigation.jsx';

class ConditionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			inputs: [
			  {
				field: 'scratches',
				name: 'Scratches',
				details: {
				  field: 'scratches_details',
				  placeholder: 'Describe the location and size of the scratches'
				}
			  },
			  {
				field: 'scuffs',
				name: 'Scuffs',
				details: {
				  field: 'scuffs_details',
				  placeholder: 'Describe the location and size of the scuffs'
				}
			  },
			  {
				field: 'dents',
				name: 'Dents',
				details: {
				  field: 'dents_details',
				  placeholder: 'Describe the location and size of the dents'
				}
			  },
			  {
				field: 'paintwork',
				name: 'Paintwork problems',
				details: {
				  field: 'paintwork_details',
				  placeholder: 'Describe the condition of the paintwork'
				}
			  },
			  {
				field: 'trim',
				label: 'Missing trim',
				name: 'Broken/missing lights, mirrors, trim or fittings',
				details: {
				  field: 'trim_details',
				  placeholder: 'Describe the broken or missing items'
				}
			  },
			  {
				field: 'aircon',
				label: 'Air conditioning problems',
				name: 'Air conditioning problems',
				details: {
				  field: 'aircon_details',
				  placeholder: 'Describe the air conditioning problem'
				}
			  },
			  {
				field: 'electrical',
				label: 'Electrical problems',
				name: 'Electrical problems',
				details: {
				  field: 'electrical_details',
				  placeholder: 'Describe the electricial problem'
				}
			  },
			  {
				field: 'dashboard',
				label: 'Warning lights',
				name: 'Warning lights on dashboard',
				details: {
				  field: 'dashboard_details',
				  placeholder: 'Describe which warning lights are illuminated'
				}
			  }
			]
		  };
	}

	shouldComponentUpdate() {
		return (this.props.visible !== false);
	}

	render() {
		return (
			<Form
				//update={this.update}
				name='condition'
				onMount={this.props.update}
				onBlur={this.props.update}
				onChange={this.props.update}
				//onFocus={this.update}
				initialData={this.props.initialData}
				persistEvents={false} // Has a performance impact, only use if you need event data
				visible={this.props.visible}
				seen={this.props.seen}
			>	
				<h2>Condition</h2>
				<h4>Does your car have any of the following?</h4>

				{
					this.state.inputs.map(i => {
						return (
							<React.Fragment key={`${i.label}-${i.field}`}>
								<h4>{i.label || i.name}</h4>
								<input id={`${i.field}_0`} type="radio" name={i.field} value="true" required/>
								<label htmlFor={`${i.field}_0`}>Yes</label>
								<input id={`${i.field}_1`} type="radio" name={i.field} value="false" required/>
								<label htmlFor={`${i.field}_1`}>No</label>
								<Conditional
									name={i.field}
									condition={(input) => {
										return (input.checked && input.value === true);
									}}
								>
									<textarea name={i.details.field} placeholder={i.details.placeholder}></textarea>
								</Conditional>
							</React.Fragment>
						)
					})
				}
				<Navigation {...this.props}></Navigation>
			</Form>
		);
	}
}

export default ConditionForm;

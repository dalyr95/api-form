import React from 'react';

import Form from '../Form/Form.jsx';
import Conditional from '../Form/Conditional.jsx';

import Navigation from './Navigation.jsx';

class WheelsAndTyresForm extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      inputsWithFollowUp: [
        {
          field: 'alloys',
          label: 'Alloys damaged',
          name: 'Have any of the alloys been kerbed or scuffed',
          details: {
            field: 'alloys_details',
            placeholder: 'Describe the amount of kerbing and scuffing'
          }
        },
        {
          field: 'tyres',
          label: 'Tyres damaged',
          name: 'Are there any problems with the tyres',
          details: {
            field: 'tyres_details',
            placeholder: 'Describe what is wrong with the tyres, and which tyres are affected'
          }
        }
      ],
      inputsStandalone: [
        {
          field: 'wheel_nut',
          label: 'Wheel nut damaged',
          name: 'Do you have the locking wheel nut'
        },
        {
					field: 'tool_pack',
					label: 'Do you have the tool pack',
          name: 'Do you have the tool pack'
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
				name='wheels_and_tyres'
				onMount={this.props.update}
				onBlur={this.props.update}
				onChange={this.props.update}
				initialData={this.props.initialData}
				//onFocus={this.update}
				persistEvents={false} // Has a performance impact, only use if you need event data
				visible={this.props.visible}
				seen={this.props.seen}
			>	
				<h2>Wheels & tyres</h2>

				{
					this.state.inputsWithFollowUp.map(i => {
						return (
							<React.Fragment key={`${i.label}-${i.field}`}>
								<h4>{i.label}</h4>
								<input id={`${i.field}_0`} type="radio" name={i.field} value="true" required />
								<label htmlFor={`${i.field}_0`}>Yes</label>
								<input id={`${i.field}_1`} type="radio" name={i.field} value="false" required />
								<label htmlFor={`${i.field}_1`}>No</label>
								<Conditional
									name={i.field}
									condition={(input) => {
										return (input.checked && input.value === true);
									}}
								>
									<textarea name={`${i.details.field}`} placeholder={i.details.placeholder} required></textarea>
								</Conditional>
							</React.Fragment>
						)
					})
				}

				{
					this.state.inputsStandalone.map(i => {
						return (
							<React.Fragment key={`${i.label}-${i.field}`}>
								<h4>{i.label}</h4>
								<input id={`${i.field}_0`} type="radio" name={i.field} value="true" required/>
								<label htmlFor={`${i.field}_0`}>Yes</label>
								<input id={`${i.field}_1`} type="radio" name={i.field} value="false" required/>
								<label htmlFor={`${i.field}_1`}>No</label>
							</React.Fragment>
						)
					})
				}
				<Navigation {...this.props}></Navigation>
			</Form>
		);
	}
}

export default WheelsAndTyresForm;
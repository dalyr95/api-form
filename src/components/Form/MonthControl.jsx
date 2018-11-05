import React, { Component } from 'react';

class MonthControl extends React.Component {
  constructor(props) {
    super(props);

	this.props = props;
	this.onChange = this.onChange.bind(this);
    this.onChangeFallback = this.onChangeFallback.bind(this);

    let date = new Date();
    this._year =  date.getFullYear();
    this._month = date.getMonth() + 1;
	
    this.state = {
      value: this.props.value || ''
    };
  }

  onChange(e, value) {
		value = value || e.currentTarget.value;

		if (value) {
			value = value.split('-').filter(i => i);

			let month = (!isNaN(value[1])) ? value[1] : this._month.toString().padLeft(2, 0);
			let year = (!isNaN(value[0])) ? value[0] : this._year;
			year = parseInt(year);

			if (year > this._year) {
				year = this._year;
			} else if (year < (this.props.year || 1950)) {
				year = this.props.year || 1950;
			}

			value = `${year}-${month}`;
		}

		this.setState({ value: value });

    if (this.props.updateForm) {
      this.props.updateForm(e, value);
    }
  }

  componentDidMount() {
    let test = document.createElement('input');
    test.setAttribute('type', 'month');

    if (test.type !== 'month') {
      this.setState({
        fallback: true
      });
    }
  }

  onChangeFallback(e) {
    let value = this.state.value.split('-').filter(i => i);

    let month = (!isNaN(value[1])) ? value[1] : this._month.toString().padLeft(2, 0);
    let year = (!isNaN(value[0])) ? value[0] : this._year;

    if (e.currentTarget.name.includes('month')) {
      month = e.currentTarget.value;
    } else {
      year = e.currentTarget.value;
    }

    this.onChange(e, `${year}-${month}`);
  }

  render() {
    let input, v;
    let value = this.state.value;
    let year = this.props.year || 1950;
    let yearMax = this._year;

    if (value) {
      v = value.split('-');
      if (!isNaN(v[0]) && !isNaN(v[1])) {
        value = `${v[0]}-${v[1]}`;
      }
    }

    let valid = (this.props.valid && value && value.match(/^\d{4}-\d{2}$/));

    if (this.state.fallback) {
      const fillRange = (start, end) => {
        return Array(end - start + 1).fill().map((item, index) => start + index);
      };

      let years = fillRange(year, this._year);

      input = (
        <div className=''>
          <select name={this.props.name} onChange={this.onChangeFallback} value={(v) ? v[1] : ''}>
            <option value="" disabled>Month</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select name={this.props.name} onChange={this.onChangeFallback} value={(v) ? v[0] : ''}>
            <option value="" disabled>Year</option>
            { years.reverse().map(y => (<option key={y} value={y}>{y}</option>)) }
          </select>
        </div>
      );
    } else {
      input = (
        <input
		  id={this.props.id || ''}
		  name={this.props.name}
          type='month'
          value={value}
          onChange={this.onChange}
          min={(this.props.year) ? `${this.props.year}-01` : this.props.min || year}
          max={this.props.max || yearMax}
          placeholder={this.props.placeholder}
        />
      );
    }
    return (
		<React.Fragment>
			{input}
		</React.Fragment>
    );
  }
}

export default MonthControl;

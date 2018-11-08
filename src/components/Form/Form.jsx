import React from 'react';

import Conditional from '../Form/Conditional.jsx';
import Error from '../Form/Error.jsx';
import Field from '../Form/Field.jsx';
import Fieldset from '../Form/Fieldset.jsx';

class Form extends React.Component {
	constructor(props) {
		super(props);

		window.Offer = window.Offer || {};
		window.Offer[this.props.name] = this;

		['onBlur', 'onChange', 'onFocus', 'onSubmit', '_parseDom', '_getDOMAttributes', '_transformReactPropsToValues', '_getReactProps', 'updateModel', 'onUpdate', 'report'].forEach(f => {
			this[f] = this[f].bind(this);
		});

		this.$form = React.createRef();

		this._DOM = {};
		this._ReactDOM = {};

		this._formElementTypes = [
			Field, // Custom Element Component 
			'fieldset',
			'form',
			'input',
			'select',
			'textarea',
			//'button',
			//'datalist',
			//'keygen',
			//'label',
			//'legend',
			//'meter',
			//'optgroup',
			//'option',
			//'output',
			//'progress',
		];

		this.state = {
			interacted: {}
		};

		this.__Model = {};		// Keeps track of all input values

		if (!this.props.onChange && !this.props.onBlur) {
			console.warn(`No \`onChange\` or \`onBlur\` handlers are provided for \`<Form/>\` name \`${this.props.name}\`. Are you sure?`);
		}

		if (!this.props.name) {
			console.warn(`No \`name\` prop for \`<Form/>\` component. Are you sure?`);
		}

		this._time = performance.now();
	}

	componentDidMount() {
		this.hydrate(this.props.initialData, () => {
			if (this.props.onMount) { this.props.onMount({type: 'mount'}, this.report())}
		});
	}

	componentDidUpdate() {
		//console.log(`Start render to update for \`${this.props.name}\``, `${Math.round(performance.now() - this._time)}ms`);

		// Don't like triggering updates in `componentDidUpdate`, should move to a listener store
		if (this.props.listen && this.__PreviousModel !== JSON.stringify(this.__Model)) {
			console.log('UPDATING');
			this.onUpdate();
		}
	}

	onBlur(e) {
		if (this.props.persistEvents) { e.persist(); }

		this.setState({
			$focused: null
		});

		if (this.props.onBlur) { this.props.onBlur(this._parseSyntheticEvent(e), this.report()); }
	}

	onFocus(e) {
		if (this.props.persistEvents) { e.persist(); }

		this.setState({
			interacted: {...this.state.interacted, [e.target.name || e.target.id]: true},
			$focused: e.target
		});

		if (this.props.onFocus) { this.props.onFocus(this._parseSyntheticEvent(e), this.report()); }
	}

	onChange(e, value) {
		if (this.props.persistEvents) { e.persist(); }

		//this._DOM = this.updateModel(e.target.name, this._getDOMAttributes(e.target), this._DOM);
		let DOMAttributes = this._parseDOMAttributesToReactProps(this._getDOMAttributes(e.target));
		DOMAttributes.HTMLvalid = e.target.checkValidity();
		DOMAttributes.value = value || DOMAttributes.value;
		DOMAttributes.valid = this._isElementValid(DOMAttributes);

		let name = this.generateFetchName(DOMAttributes);

		if (!name) {
			console.error(`Element \`${DOMAttributes.type}\` does not have a name or id`, DOMAttributes);
			return;
		}

		let model = this.__resolveModelPath(name, this.__Model);
		const meta = model.meta;
		model = this.__mergeDeep(model, DOMAttributes);

		// Deep merge will stringify any functions in meta
		if (meta) {
			model.meta = meta;
		}

		this.__Model = this.updateModel(name, model, this.__Model);

		if (!model) {
			console.error(`Could not find a model to change for \`${name}\``);
			return;
		}

		let event = this._parseSyntheticEvent(e);

		this.setState({
			model: this.__Model
		}, () => {
			if (this.props.onChange) { this.props.onChange(event, this.report()); }
		});
	}

	onSubmit(e) {
		if (this.props.persistEvents) { e.persist(); }

		e.preventDefault();

		if (this.props.onSubmit) { this.props.onSubmit(e, this.report()); }
	}

	onUpdate() {
		if (this.props.update) { this.props.update(null, this.report()); }
	}

	report() {
		return {
			data: this._transformReactPropsToValues(),
			name: this.props.name,
			progress: JSON.parse(JSON.stringify(this._progress)),
			raw: Object.assign({}, this.__Model)
		};
	}

	hydrate(hydrateData={}, cb=() => {}) {
		if (this.props.initialDataTransform) {
			hydrateData = this.props.initialDataTransform(hydrateData);
		}

		let getModel = (_ReactProps, model) => {
			if (!_ReactProps) { return; }

			let name = this.generateFetchName(_ReactProps);

			return this.__resolveModelPath(name, model) || {};
		};

		let updateModel = (_ReactProps) => {
			if (!_ReactProps) { return; }

			let name = this.generateFetchName(_ReactProps);
			let model = getModel(_ReactProps, this.__Model);

			/**
			 * TODO - Should we add to model anyway???
			 * Could be picked up on a later DOM run
			 */
			if (!model) { return; }

			if (_ReactProps.fieldset) {
				let fieldset = this.__resolveModelPath(_ReactProps.fieldset, hydrateData) || {};
				let modelModel = getModel(_ReactProps, this.__Model);

				if (Array.isArray(fieldset)) {
					/**
					 * TODO - Check what the type is and set checked or value accordingly
					 * Assuming atm fieldset arrays would be checkboxes as it's a boolean essentially
					 * But could easily be a row of input text
					 */
					fieldset.forEach(f => {
						if (_ReactProps.value === f) {
							modelModel.checked = true;
						}
					});
				} else {
					Object.entries(fieldset).forEach(([key, value]) => {
						if (name === key) {
							model.value = value;
							if (['radio', 'checkbox'].includes(model.type)) {
								model.checked = true;
							}
						}
					})
				}
			} else {
				let dataModel = this.__resolveModelPath(name, hydrateData);

				// Allow for default values if the API returns null
				model.value = (dataModel != null) ? dataModel : '';
				if (['radio', 'checkbox'].includes(model.type)) {
					model.checked = (model.value === '') ? false : true;

					// DEALING WITH CHECKED ATTRIBUTE ON INITIAL LOAD!!!
					// Careful here, if there is no API value, and a checked attribute, the code
					// wants by default for it to be checked, so let's do that!
					if (_ReactProps.checked && model.value === '') {
						model.checked = true;
						model.value = _ReactProps.value;
					}
				}

				model.valid = this._isElementValid(model);
			}
		}

		let generateModel = (children, mergeParentProps) => {
			return React.Children.map(children, (child) => {
				// This is support for non-node elements (eg. pure text), they have no props
				if (!child || !child.props) {
					return child;
				}

				// Get the props off the child element, such as name, type etc
				let _ReactProps = this._getReactProps(child, mergeParentProps);

				// If current component has additional children, traverse through them as well!
				if (child.props.children) {
					let parentProps = mergeParentProps;

					// Don't care about error or conditionals here, just parse the children, find form elements

					// Get the fieldset and assign it to the child
					if (child.type === Fieldset) {
						parentProps = {};
						parentProps = Object.assign(mergeParentProps || {}, {
							fieldset: child.props.name,
							serialization: child.props.serialization
						});
					}

					/**
					 * TODO - Reset any values in conditionals if closed?
					 */

					updateModel(_ReactProps);
					generateModel(child.props.children, parentProps)
					return;
				}

				updateModel(_ReactProps);
			});
		}

		generateModel(this.props.children);

		this.setState({
			model: this.__Model
		}, cb);
	}

	render() {
		this._time = performance.now();

		let _tabIndex = 0; // Keep track of order of questions for summary

		this._progress = {
			total: {},
			completed: {},
			percentage: 0
		};

		if (this.props.listen) {
			this.__PreviousModel = JSON.stringify(this.__Model);
		}

		let updateModel = (_ReactProps) => {
			if (!_ReactProps) { return; }
			
			let name = this.generateFetchName(_ReactProps);

			_ReactProps.tabIndex =  _tabIndex++ + 1; // Keep track of order of questions for summary

			let existingModel = getModel(_ReactProps);

			// If model already exists we're not interested in going over it again
			// Onchange will deal with any updates to it
			if (Object.keys(existingModel || {}).length > 0) {
				// HACK - Conditional show states aren't being updated
				if (_ReactProps.shown !== existingModel.shown) {
					existingModel.shown = _ReactProps.shown;
				}
				return;
			}

			if (!name) {
				// A Field without a name is basically a prop passer
				if (_ReactProps.type !== Field) {
					console.error(`Element \`${_ReactProps.type}\` does not have a name or id`, _ReactProps);
				}
				return;
			}

			// Remove anything not needed
			let {children, ..._Props} = _ReactProps;

			this.updateModel(name, _Props, this.__Model);
		};

		let getModel = (_ReactProps) => {
			if (!_ReactProps) { return; }

			let name = this.generateFetchName(_ReactProps);

			return this.__resolveModelPath(name, this.__Model) || {};
		};

		let pruneModel = (parentKey) => {
			this.__Model = Object.entries(this.__Model).reduce((accumulator, currentValue, currentIndex, array) => {
				if (currentValue[1].parentKey !== parentKey) {
					accumulator[currentValue[0]] = currentValue[1];
				}
				return accumulator;
			}, {});
		}

		let generateModel = (children, mergeParentProps) => {
			return React.Children.map(children, (child) => {
				// This is support for non-node elements (eg. pure text), they have no props
				if (!child || !child.props) {
					return child;
				}

				// Get the props off the child element, such as name, type etc
				let _ReactProps = this._getReactProps(child, mergeParentProps);

				if (child.type === Field) {
					if (Array.isArray(child.props.elements)) {
						if (child.props.parentKey) {
							// Nuke any existing values associated with this key
							pruneModel(child.props.parentKey);
						}

						child.props.elements.forEach(el => {
							let _ReactProps = this._getReactProps({
								type: el.element,
								props: el
							}, {
								parentKey: child.props.parentKey,
								...mergeParentProps 
							});
							updateModel(_ReactProps);
						});
						return;
					}
				}

				// If current component has additional children, traverse through them as well!
				if (child.props.children) {
					let parentProps = mergeParentProps;

					// Don't care about error or conditionals here, just parse the children, find form elements
					
					// Get the fieldset and assign it to the child
					if (child.type === Fieldset) {
						parentProps = {};
						parentProps = Object.assign(parentProps || {}, {
							fieldset: child.props.name,
							serialization: child.props.serialization,
							meta: child.props.meta
						});
					}

					/**
					 * TODO - Reset any values in conditionals if closed?
					 */
					if (child.type === Conditional) {
						// If conditional prevents conditional's conditional children from passing their own tests and being shown = true
						let shown = (mergeParentProps && mergeParentProps.shown === false) ? false : child.props.condition(getModel({
							name: child.props.name
						}));

						parentProps = Object.assign(parentProps || {}, {
							shown: shown
						});
					}

					if (child.type === Field) {
						// Use a field as a prop driller
						if (child.props.meta) {
							parentProps = Object.assign(parentProps || {}, {
								meta: child.props.meta
							});
						}
					}

					updateModel(_ReactProps);
					generateModel(child.props.children, parentProps);
					return;
				}

				updateModel(_ReactProps);
			});
		}

		let renderWrappedChildren = (children, mergeParentProps) => {
			return React.Children.map(children, (child) => {
				
				// This is support for non-node elements (eg. pure text), they have no props
				if (!child || !child.props) {
					return child;
				}

				let _ReactProps = this._getReactProps(child);
				let _values = getModel(_ReactProps);

				let inputState = {};
				let customProps = {};
				let parentProps = mergeParentProps || {};

				if (_values) {
					// Do something if need be
					if (child.type === 'input' && ['radio', 'checkbox'].includes(child.props.type)) {
						if (child.props.type === 'radio' && _values.checked) {
							inputState.checked = (_values.value != null) ? (_values.value.toString() === child.props.value.toString()) : false;
						} else {
							inputState.checked = (_values.value != null) ? _values.checked || _ReactProps.checked : false;
						}
					} else {
						inputState.value = _values.value || '';
						inputState.checked = _values.checked;
					}
				}

				// Display Error && Conditional components
				if (child.type === Error || child.type === Conditional) {
					let _values = getModel({
						name: child.props.name
					});

					customProps.input = _values || {};

					let show = child.props.condition(customProps.input);

					if (show === false) {
						return null;
					}
				}

				// Work out progress
				if (_values) {
					if (_values.required === true) {
						this._progress.total[_values.name] = true;
						if (_values.valid === true) { this._progress.completed[_values.name] = true; }
					}

					if (this.props.seen || this.state.interacted[_values.name || _values.id]) {
						customProps.className = `${child.props.className || ''} seen`;
						customProps.className = `${customProps.className || ''} ${(_values.valid) ? 'valid' : 'invalid'}`.trim();
					}
				}

				if (child.type === Field) {
					// Make `updateForm` available to nested components
					parentProps = Object.assign(mergeParentProps || {}, {
						updateForm: this.onChange
					});
				}

				if (typeof child.type === 'function' && parentProps.updateForm) {
					customProps.updateForm = parentProps.updateForm;
				}

				let _props = {
					...customProps,
					...inputState
				};

				// Only assign onChange to form elements
				if (_values) {
					_props.onChange = child.props.onChange || (() => {});
				}

				/**
				 * TODO - fieldset with elements seems to not like children
				 */
				// Remove reserved props
				let {fieldset, meta, ...props} = child.props;

				if (child.props.children) {
					props.children = renderWrappedChildren(child.props.children, parentProps);

					return React.createElement(child.type, Object.assign({}, props, _props));
				}

				// Return new component with overridden `onChange` callback
				return React.createElement(child.type, Object.assign({}, props, _props));
			});
		}
		
		let children;

		if (this.props.children) {
			generateModel(this.props.children);
			children = renderWrappedChildren(this.props.children);
		}

		this._progress.completed = Object.keys(this._progress.completed).length;
		this._progress.total = Object.keys(this._progress.total).length;
		this._progress.percentage = Math.round((this._progress.completed / this._progress.total) * 100);
		this._progress.percentage = Number.isInteger(this._progress.percentage) ? this._progress.percentage : 100;

		// Remove any reserved props such as update
		let {update, persistEvents, onMount, visible, initialData, initialDataTransform, updateForm, seen, listen, ...props} = this.props;

		if (!this.props.children || this.props.visible === false) {
			return (null);
		}

		return (
			<form
				ref={this.$form}
				{...props}
				onChange={this.onChange}
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				onSubmit={this.onSubmit}
				//onInvalid={this.onChange}
				noValidate
			>
				{ children }
			</form>
		);
	}

	updateModel(path='', value, obj={}, separator='.') {
		var properties = Array.isArray(path) ? path : path.split(separator);

		properties.reduce((prev, curr, i) => {
			if (!prev[curr]) { prev[curr] = {}; }
			if (i === properties.length - 1) { prev[curr] = value; }
			return prev && prev[curr];
		}, obj);

		return obj;
	}

	generateFetchName = (_ReactProps) => {
		return (typeof _ReactProps === 'string') ? _ReactProps : _ReactProps.name || _ReactProps.id;
	}

	_parseSyntheticEvent(e) {
		return {
			currentTarget: e.currentTarget,
			defaultPrevented: e.defaultPrevented,
			isTrusted: e.isTrusted,
			target: e.target,
			timeStamp: e.timeStamp,
			type: e.type
		};
	}

	_parseDom() {
		let $form = this.$form.current;
		let $elements = [...$form.elements];

		$elements.forEach($el => {
			let attributes = this._getDOMAttributes($el);
			this._DOM = this.updateModel(attributes['name'], attributes, this._DOM);
		});
	}

	_getDOMAttributes($el) {
		let attributes = {};
		let attrs = $el.attributes;
		for(var i = attrs.length - 1; i >= 0; i--) {
			attributes[attrs[i].name] = attrs[i].value;
		}

		attributes['checked'] = $el.checked;
		attributes['value'] = $el.value;

		return attributes;
	}

	_getReactProps($el, parentProps) {
		if (this._formElementTypes.includes($el.type)) {
			let valid = true;
			let value = $el.props.defaultValue || ''; // Just concerning ourselves with 'default' props, values will assigned later

			valid = this._isElementValid($el.props);

			let attributes = {
				checked: $el.props.checked || false,
				type: $el.type,
				value: value,
				valid: valid,
				shown: true,
				...$el.props,
				...parentProps || {}
			}

			return attributes;
		}
	}

	_isElementValid(props) {
		/**
		 * TODO - Beef this up abit, possibly use pattern?
		 */

		let valid = true;
		let value = props.value;

		if (props.required) {
			if (value === '') {
				valid = false;
			}

			if (['radio', 'checkbox'].includes(props.type)) {
				valid = props.checked || false;
			}
		}

		if (props.type === 'number') {
			valid = !isNaN(value);
			if (valid) {
				if (props.min && value < props.min) {
					valid = false;
				}
				if (props.max && value > props.max) {
					valid = false;
				}
			}
		}

		return valid;
	}

	_parseDOMAttributesToReactProps(dom) {
		/**
		 * `required` attribute comes back as `required === ''`
		 */
		dom.required = (dom.required != null) ? true : dom.required;
		if (dom.value && ['true', 'false'].includes(dom.value)) {
			dom.value = JSON.parse(dom.value);
		}
		return dom;
	}

	_transformReactPropsToValues() {
		let model = Object.assign({}, this.__Model);
		let values = {};

		let fieldsets = {};

		Object.entries(model).forEach(([key, value]) => {
			let v;

			if (['radio', 'checkbox'].includes(value.type)) {
				v = (value.checked) ? value.value : null;
			} else {
				v = (value.value === '') ? null : value.value;
			}

			if (value.fieldset) {
				var starter = (value.serialization === 'array') ? [] : {};
				fieldsets[value.fieldset] = fieldsets[value.fieldset] || starter;

				if (value.serialization === 'array') {
					if (v) { fieldsets[value.fieldset].push(v); }
				} else {
					fieldsets[value.fieldset][this.generateFetchName(value)] = v;
				}
				

				return;
			}

			// Don't send invalid IDs to the API
			if (!value.valid) {
				v = null;
			}

			values[key] = v;
		});

		Object.keys(fieldsets).forEach(k => {
			values[k] = fieldsets[k];
		})

		return values;
	}

	__resolveModelPath(path='', obj={}, separator='.') {
		var properties = Array.isArray(path) ? path : path.split(separator);
		if (properties[0] === 'fieldset') { properties.shift(); }
		return properties.reduce((prev, curr) => prev && prev[curr], obj)
	}

	__mergeDeep(target, ...sources) {
		if (!sources.length) return target;

		function isObject(item) {
			return (item && typeof item === 'object' && !Array.isArray(item));
		}

		const source = sources.shift();

		if (isObject(target) && isObject(source)) {
			for (const key in source) {
				if (isObject(source[key])) {
					if (!target[key]) Object.assign(target, { [key]: {} });
					this.__mergeDeep(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}

		return this.__mergeDeep(target, ...sources);
	}
}

export default Form;

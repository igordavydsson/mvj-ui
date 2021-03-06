// @flow
import React, {Component} from 'react';
// $FlowFixMe
import {Async} from 'react-select';
import classNames from 'classnames';
import debounce from 'lodash/debounce';

import DropdownIndicator from '$components/inputs/DropdownIndicator';
import LoadingIndicator from '$components/inputs/SelectLoadingIndicator';
import {getContentContact} from '../../contacts/helpers';
import {addEmptyOption, sortByLabelAsc} from '$util/helpers';
import {fetchContacts} from '$src/contacts/requestsAsync';

type Props = {
  disabled?: boolean,
  displayError: boolean,
  input: Object,
  isDirty: boolean,
  onChange: Function,
  placeholder?: string,
}

type State = {
  inputValue: string,
}

class FieldTypeContactSelect extends Component<Props, State> {
  select: any

  static defaultProps = {
    disabled: false,
    value: '',
  };

  state = {
    inputValue: '',
  }

  handleBlur = () => {
    const {input: {onBlur, value}} = this.props;

    onBlur(value);
  };

  handleChange = (value: Object) => {
    const {input: {onChange}} = this.props;

    onChange(value);
  }

  handleInputChange = (value: string, meta: Object) => {
    const {action} = meta;
    switch (action) {
      case 'input-change':
        this.setState({inputValue: value});
        break;
    }
  }

  handleMenuOpen = () => {
    const {inputValue} = this.state;

    if(this.select.state.inputValue !== inputValue) {
      this.select.select.onInputChange(inputValue, {action: 'input-change'});
    }
  }

  getContacts = debounce(async(inputValue: string, callback: Function) => {
    const contacts = await fetchContacts({
      search: inputValue,
    });

    callback(addEmptyOption(contacts.map((lessor) => getContentContact(lessor)).sort(sortByLabelAsc)));
  }, 500);

  loadOptions = (inputValue: string, callback: Function) => {
    this.getContacts(inputValue, callback);
  };

  render() {
    const {
      disabled,
      displayError,
      input: {name, value},
      isDirty,
      placeholder,
    } = this.props;

    return(
      <div className={classNames(
        'form-field__select',
        {'has-error': displayError},
        {'is-dirty': isDirty})}
      >
        <Async
          ref={(ref) => this.select = ref}
          cacheOptions
          className='select-input'
          classNamePrefix='select-input'
          components={{
            DropdownIndicator,
            IndicatorSeparator: null,
            LoadingIndicator,
          }}
          defaultOptions
          disabled={disabled}
          id={name}
          loadingMessage={() => 'Ladataan...'}
          loadOptions={this.loadOptions}
          noOptionsMessage={() => 'Ei tuloksia'}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
          onMenuOpen={this.handleMenuOpen}
          options={[]}
          placeholder={placeholder || 'Valitse...'}
          value={value}
        />
      </div>
    );
  }
}

export default FieldTypeContactSelect;

// @flow
import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  disableTouched: boolean,
  input: Object,
  label: string,
  meta: Object,
  placeholder: string,
}

const getFormatedDate = (value: any) => {
  if(moment(value, 'DD.MM.YYYY')._isValid) {
    return moment(value, 'DD.MM.YYYY');
  }
  return null;
};

const FieldDatePicker = ({
  disableTouched = false,
  input,
  label,
  meta: {touched, error},
  placeholder,
}: Props) => {
  return (
    <div className='mvj-form-field'>
      {label && <label className='title'>{label}</label>}
      <div className='mvj-form-field__datepicker'>
        <DatePicker
          {...input}
          placeholder={placeholder}
          dateFormat="DD.MM.YYYY"
          disabledKeyboardNavigation
          selected={input.value ? getFormatedDate(input.value) : null}
        />
        {(touched || disableTouched) && error && <span className={'error'}>{error}</span>}
      </div>
    </div>
  );
};

export default FieldDatePicker;
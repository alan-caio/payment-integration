import React from 'react';
import fieldType from '../fieldType';

import './index.scss';

const errors = {
  password: 'Please enter a password',
  confirm: 'Please ensure that both passwords match'
};

const validate = value => value.length > 0;

const Password = props => {
  return (
    <div className={props.className} style={{
      ...props.style,
      width: props.width ? `${props.width}%` : null
    }}>
      {props.error}
      {props.label}
      <input
        value={props.value || ''}
        onChange={props.onChange}
        disabled={props.disabled}
        placeholder={props.placeholder}
        type="password"
        id={props.id ? props.id : props.name}
        name={props.name} />
    </div>
  );
}

export default fieldType(Password, 'password', validate, errors);

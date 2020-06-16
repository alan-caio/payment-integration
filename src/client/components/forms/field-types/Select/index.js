import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import withCondition from '../../withCondition';
import ReactSelect from '../../../elements/ReactSelect';
import useFieldType from '../../useFieldType';
import Label from '../../Label';
import Error from '../../Error';
import { select } from '../../../../../validation/validations';

import './index.scss';

const findFullOption = (value, options) => {
  const matchedOption = options.find(option => option?.value === value);

  if (matchedOption) {
    if (typeof matchedOption === 'object' && matchedOption.label && matchedOption.value) {
      return matchedOption;
    }
  }

  return {
    label: value,
    value,
  };
};

const formatFormValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((subValue) => {
      if (typeof subValue === 'object' && subValue.value) {
        return subValue.value;
      }

      return subValue;
    });
  }

  if (typeof value === 'object' && value !== null && value.value) {
    return value.value;
  }

  return value;
};

const formatRenderValue = (value, options) => {
  if (Array.isArray(value)) {
    return value.map((subValue) => {
      if (typeof subValue === 'string') {
        return findFullOption(subValue, options);
      }

      return subValue;
    });
  }

  if (typeof value === 'string') {
    return findFullOption(value, options);
  }

  return value;
};

const Select = (props) => {
  const {
    path: pathFromProps,
    name,
    required,
    defaultValue,
    initialData,
    validate,
    style,
    width,
    label,
    options,
    hasMany,
    readOnly,
  } = props;

  const path = pathFromProps || name;

  const memoizedValidate = useCallback((value) => {
    const validationResult = validate(value, { required });
    return validationResult;
  }, [validate, required]);

  const {
    value,
    showError,
    setValue,
    errorMessage,
  } = useFieldType({
    path,
    label,
    required,
    initialData,
    defaultValue,
    validate: memoizedValidate,
  });

  const classes = [
    'field-type',
    'select',
    showError && 'error',
    readOnly && 'read-only',
  ].filter(Boolean).join(' ');

  const valueToRender = formatRenderValue(value, options);

  return (
    <div
      className={classes}
      style={{
        ...style,
        width,
      }}
    >
      <Error
        showError={showError}
        message={errorMessage}
      />
      <Label
        htmlFor={path}
        label={label}
        required={required}
      />
      <ReactSelect
        onChange={!readOnly ? setValue : undefined}
        value={valueToRender}
        formatValue={formatFormValue}
        showError={showError}
        disabled={readOnly}
        options={options}
        isMulti={hasMany}
      />
    </div>
  );
};

Select.defaultProps = {
  style: {},
  required: false,
  validate: select,
  defaultValue: undefined,
  initialData: undefined,
  hasMany: false,
  width: undefined,
  path: '',
  readOnly: false,
};

Select.propTypes = {
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  style: PropTypes.shape({}),
  label: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  initialData: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  validate: PropTypes.func,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  width: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.string,
    ),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
      }),
    ),
  ]).isRequired,
  hasMany: PropTypes.bool,
};

export default withCondition(Select);

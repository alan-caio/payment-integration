const { ValidationError } = require('../errors');

exports.iterateFields = async (data, fields, path = '') => {
  const validationPromises = [];
  const validatedFields = [];

  fields.forEach((field) => {
    const dataToValidate = data || {};

    if ((field.required && !field.localized && !field.condition)) {
      // If this field does not have a name, it is for
      // admin panel composition only and should not be
      // validated against directly
      if (field.name === undefined && field.fields) {
        field.fields.forEach((subField) => {
          validationPromises.push(subField.validate(dataToValidate[subField.name], {
            ...subField,
            path: `${path}${subField.name}`,
          }));
          validatedFields.push(subField);
        });
      } else {
        validationPromises.push(field.validate(dataToValidate[field.name], field));
        validatedFields.push(field);
      }
    }
  });

  const validationResults = await Promise.all(validationPromises);

  const errors = validationResults.reduce((results, result, i) => {
    const field = validatedFields[i];
    if (Array.isArray(result)) {
      return [
        ...results,
        ...result,
      ];
    } if (result !== true) {
      return [
        ...results,
        {
          field: `${path}${field.name}`,
          message: result,
        },
      ];
    }

    return results;
  }, []);

  return errors;
};

exports.validateCreate = async (data, fields) => {
  try {
    const errors = await exports.iterateFields(data, fields);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  } catch (error) {
    throw error;
  }
};

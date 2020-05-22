const formatListFields = (config) => {
  let listFields = config.fields.reduce((formatted, field) => {
    if (field.hidden === true || field?.hidden?.admin === true) {
      return formatted;
    }

    return [
      ...formatted,
      field,
    ];
  }, [{ name: 'id', label: 'ID' }]);

  if (config.timestamps) {
    listFields = listFields.concat([{ name: 'createdAt', label: 'Created At' }, { name: 'updatedAt', label: 'Updated At' }]);
  }

  return listFields;
};

export default formatListFields;

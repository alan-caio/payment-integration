const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const mongooseHidden = require('mongoose-hidden');
const fieldToSchemaMap = require('../mongoose/schema/fieldToSchemaMap');
const localizationPlugin = require('../localization/plugin');

const registerSchema = (globalConfigs, config) => {
  const globalFields = {};
  const globalSchemaGroups = {};
  const globals = {
    config: {},
  };

  Object.values(globalConfigs).forEach((globalConfig) => {
    globals.config[globalConfig.label] = globalConfig;
    globalFields[globalConfig.slug] = {};

    globalConfig.fields.forEach((field) => {
      const fieldSchema = fieldToSchemaMap[field.type];
      if (fieldSchema) globalFields[globalConfig.slug][field.name] = fieldSchema(field, config);
    });
    globalSchemaGroups[globalConfig.slug] = globalFields[globalConfig.slug];
  });

  globals.model = mongoose.model(
    'globals',
    new mongoose.Schema({ ...globalSchemaGroups, timestamps: false })
      .plugin(localizationPlugin, config.localization)
      .plugin(autopopulate)
      .plugin(mongooseHidden()),
  );

  return globals;
};

module.exports = registerSchema;

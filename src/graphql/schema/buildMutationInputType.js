/* eslint-disable no-use-before-define */
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
} = require('graphql');
const { GraphQLJSON } = require('graphql-type-json');

const withNullableType = require('./withNullableType');
const formatName = require('../utilities/formatName');
const combineParentName = require('../utilities/combineParentName');

function buildMutationInputType(name, fields, parentName) {
  const fieldToSchemaMap = {
    number: field => ({ type: withNullableType(field, GraphQLFloat) }),
    text: field => ({ type: withNullableType(field, GraphQLString) }),
    email: field => ({ type: withNullableType(field, GraphQLString) }),
    textarea: field => ({ type: withNullableType(field, GraphQLString) }),
    richText: field => ({ type: withNullableType(field, GraphQLJSON) }),
    code: field => ({ type: withNullableType(field, GraphQLString) }),
    date: field => ({ type: withNullableType(field, GraphQLString) }),
    upload: field => ({ type: withNullableType(field, GraphQLString) }),
    'rich-text': field => ({ type: withNullableType(field, GraphQLString) }),
    html: field => ({ type: withNullableType(field, GraphQLString) }),
    radio: field => ({ type: withNullableType(field, GraphQLString) }),
    checkbox: () => ({ type: GraphQLBoolean }),
    select: (field) => {
      const formattedName = `${combineParentName(parentName, field.name)}_MutationInput`;
      let type = new GraphQLEnumType({
        name: formattedName,
        values: field.options.reduce((values, option) => {
          if (typeof option === 'object' && option.value) {
            return {
              ...values,
              [formatName(option.value)]: {
                value: option.value,
              },
            };
          }

          if (typeof option === 'string') {
            return {
              ...values,
              [option]: {
                value: option,
              },
            };
          }

          return values;
        }, {}),
      });

      type = field.hasMany ? new GraphQLList(type) : type;
      type = withNullableType(field, type);

      return { type };
    },
    relationship: (field) => {
      const isRelatedToManyCollections = Array.isArray(field.relationTo);
      let type = GraphQLString;

      if (isRelatedToManyCollections) {
        const fullName = `${combineParentName(parentName, field.label)}RelationshipInput`;
        type = new GraphQLInputObjectType({
          name: fullName,
          fields: {
            relationTo: {
              type: new GraphQLEnumType({
                name: `${fullName}RelationTo`,
                values: field.relationTo.reduce((values, option) => ({
                  ...values,
                  [formatName(option)]: {
                    value: option,
                  },
                }), {}),
              }),
            },
            value: { type: GraphQLString },
          },
        });
      }

      return { type: field.hasMany ? new GraphQLList(type) : type };
    },
    repeater: (field) => {
      const fullName = combineParentName(parentName, field.label);
      let type = buildMutationInputType(fullName, field.fields, fullName);
      type = new GraphQLList(withNullableType(field, type));
      return { type };
    },
    group: (field) => {
      const requiresAtLeastOneField = field.fields.some(subField => (subField.required && !subField.localized));
      const fullName = combineParentName(parentName, field.label);
      let type = buildMutationInputType(fullName, field.fields, fullName);
      if (requiresAtLeastOneField) type = new GraphQLNonNull(type);
      return { type };
    },
    flexible: () => ({ type: GraphQLJSON }),
    row: (field) => {
      return field.fields.reduce((acc, rowField) => {
        const getFieldSchema = fieldToSchemaMap[rowField.type];

        if (getFieldSchema) {
          const fieldSchema = getFieldSchema(rowField);

          return [
            ...acc,
            fieldSchema,
          ];
        }

        return null;
      }, []);
    },
  };

  const fieldTypes = fields.reduce((schema, field) => {
    const getFieldSchema = fieldToSchemaMap[field.type];

    if (getFieldSchema) {
      const fieldSchema = getFieldSchema(field);

      if (Array.isArray(fieldSchema)) {
        return fieldSchema.reduce((acc, subField, i) => {
          return {
            ...acc,
            [field.fields[i].name]: subField,
          };
        }, schema);
      }

      return {
        ...schema,
        [field.name]: fieldSchema,
      };
    }

    return schema;
  }, {});

  const fieldName = formatName(name);

  return new GraphQLInputObjectType({
    name: `mutation${fieldName}Input`,
    fields: {
      ...fieldTypes,
    },
  });
}

module.exports = buildMutationInputType;

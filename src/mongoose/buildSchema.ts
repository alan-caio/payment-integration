/* eslint-disable no-use-before-define */
import { Schema } from 'mongoose';
import { MissingFieldInputOptions } from '../errors';
import { ArrayField, BlockField, Field, RadioField, RelationshipField, SelectField, StandardField, UploadField } from '../fields/config/types';

const setBlockDiscriminators = (fields: Field[], schema) => {
  fields.forEach((field) => {
    const blockFieldType = field as BlockField;
    if (blockFieldType.type === 'blocks' && blockFieldType.blocks && blockFieldType.blocks.length > 0) {
      blockFieldType.blocks.forEach((blockItem: StandardField) => {
        let blockSchemaFields = {};

        // TODO: Would this blow up on a relationship since it doesn't have fields?
        blockItem.fields.forEach((blockField) => {
          const fieldSchema = fieldToSchemaMap[blockField.type];
          if (fieldSchema) {
            blockSchemaFields = fieldSchema(blockField, blockSchemaFields);
          }
        });

        const blockSchema = new Schema(blockSchemaFields, { _id: false });
        schema.path(field.name).discriminator(blockItem.slug, blockSchema);

        setBlockDiscriminators(blockItem.fields, blockSchema);
      });
    }
  });
};

const formatBaseSchema = (field: Field) => {
  const createAccess = field.access && field.access.create;

  const condition = field.admin && field.admin.condition;

  return {
    localized: field.localized || false,
    unique: field.unique || false,
    required: (field.required && !field.localized && !condition && !createAccess) || false,
    default: field.defaultValue || undefined,
    index: field.index || field.unique || false,
  };
};

const buildSchema = (configFields: Field[], options = {}): Schema => {
  let fields = {};

  configFields.forEach((field) => {
    const fieldSchema = fieldToSchemaMap[field.type];

    if (fieldSchema) {
      fields = fieldSchema(field, fields);
    }
  });

  const schema = new Schema(fields, options);

  setBlockDiscriminators(configFields, schema);

  return schema;
};

const fieldToSchemaMap = {
  number: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: Number },
  }),
  text: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: String },
  }),
  email: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: String },
  }),
  textarea: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: String },
  }),
  richText: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: Schema.Types.Mixed },
  }),
  code: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: String },
  }),
  radio: (field: RadioField, fields: Field[]) => {
    if (!field.options || field.options.length === 0) {
      throw new MissingFieldInputOptions(field);
    }

    const schema = {
      ...formatBaseSchema(field),
      type: String,
      enum: field.options.map((option) => {
        if (typeof option === 'object') return option.value;
        return option;
      }),
    };

    return {
      ...fields,
      [field.name]: field.hasMany ? [schema] : schema, // TODO: radio group with hasMany??
    };
  },
  checkbox: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: Boolean },
  }),
  date: (field: Field, fields: Field[]) => ({
    ...fields,
    [field.name]: { ...formatBaseSchema(field), type: Date },
  }),
  upload: (field: UploadField, fields: Field[]) => ({
    ...fields,
    [field.name]: {
      ...formatBaseSchema(field),
      type: Schema.Types.ObjectId,
      ref: field.relationTo,
    },
  }),
  relationship: (field: RelationshipField, fields: Field[]) => {
    let schema: { [key: string]: any } = {};

    if (Array.isArray(field.relationTo)) {
      schema.value = {
        type: Schema.Types.ObjectId,
        refPath: `${field.name}${field.localized ? '.{{LOCALE}}' : ''}.relationTo`,
      };
      schema.relationTo = { type: String, enum: field.relationTo };
    } else {
      schema = {
        ...formatBaseSchema(field),
      };

      schema.type = Schema.Types.ObjectId;
      schema.ref = field.relationTo;
    }

    if (field.hasMany) {
      schema = {
        type: [schema],
        localized: field.localized || false,
      };
    }

    return {
      ...fields,
      [field.name]: schema,
    };
  },
  row: (field: StandardField, fields: Field[]) => {
    const newFields = { ...fields };

    field.fields.forEach((rowField: Field) => {
      const fieldSchemaMap = fieldToSchemaMap[rowField.type];

      if (fieldSchemaMap) {
        const fieldSchema = fieldSchemaMap(rowField, fields);
        newFields[rowField.name] = fieldSchema[rowField.name];
      }
    });

    return newFields;
  },
  array: (field: ArrayField, fields: Field[]) => {
    const schema = buildSchema(field.fields, { _id: false, id: false });

    return {
      ...fields,
      [field.name]: {
        ...formatBaseSchema(field),
        type: [schema],
      },
    };
  },
  group: (field: StandardField, fields: Field[]) => {
    const schema = buildSchema(field.fields, { _id: false, id: false });

    return {
      ...fields,
      [field.name]: {
        ...formatBaseSchema(field),
        required: field.fields.some((subField) => subField.required === true),
        type: schema,
      },
    };
  },
  select: (field: SelectField, fields: Field[]) => {
    if (!field.options || field.options.length === 0) {
      throw new MissingFieldInputOptions(field);
    }

    const schema = {
      ...formatBaseSchema(field),
      type: String,
      enum: field.options.map((option) => {
        if (typeof option === 'object') return option.value;
        return option;
      }),
    };

    return {
      ...fields,
      [field.name]: field.hasMany ? [schema] : schema,
    };
  },
  blocks: (field: BlockField, fields: Field[]) => {
    const flexibleSchema = new Schema({ blockName: String }, { discriminatorKey: 'blockType', _id: false, id: false });

    return {
      ...fields,
      [field.name]: {
        type: [flexibleSchema],
        localized: field.localized || false,
      },
    };
  },
};

export default buildSchema;

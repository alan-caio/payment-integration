import joi from 'joi';
import fieldSchema from '../../fields/config/schema';

const collectionSchema = joi.object().keys({
  slug: joi.string().required(),
  labels: joi.object({
    singular: joi.string(),
    plural: joi.string(),
  }),
  preview: joi.func(),
  access: joi.object({
    create: joi.func(),
    read: joi.func(),
    update: joi.func(),
    delete: joi.func(),
    unlock: joi.func(),
    admin: joi.func(),
  }).default({}),
  timestamps: joi.boolean()
    .default(true),
  admin: joi.object({
    useAsTitle: joi.string().default('id'),
    defaultColumns: joi.array().items(joi.string()),
    enableRichTextRelationship: joi.boolean().default(false),
    components: joi.object()
      .keys({
        List: joi.func(),
        Edit: joi.func(),
      }).default({}),
  }).default(),
  fields: joi.array()
    .items(fieldSchema)
    .default([]),
  hooks: joi.object({
    beforeOperation: joi.array().items(joi.func()).default([]),
    beforeValidate: joi.array().items(joi.func()).default([]),
    beforeChange: joi.array().items(joi.func()).default([]),
    afterChange: joi.array().items(joi.func()).default([]),
    beforeRead: joi.array().items(joi.func()).default([]),
    afterRead: joi.array().items(joi.func()).default([]),
    beforeDelete: joi.array().items(joi.func()).default([]),
    afterDelete: joi.array().items(joi.func()).default([]),
    beforeLogin: joi.array().items(joi.func()).default([]),
    afterLogin: joi.array().items(joi.func()).default([]),
    afterForgotPassword: joi.array().items(joi.func()).default([]),
  }).default(),
  auth: joi.alternatives().try(
    joi.object({
      tokenExpiration: joi.number(),
      depth: joi.number().default(0),
      verify: joi.alternatives().try(
        joi.boolean(),
        joi.object().keys({
          generateEmailHTML: joi.func(),
          generateEmailSubject: joi.func(),
        }),
      ),
      lockTime: joi.number(),
      useAPIKey: joi.boolean(),
      cookies: joi.object().keys({
        secure: joi.boolean(),
        sameSite: joi.string(), // TODO: add further specificity with joi.xor
        domain: joi.string(),
      }),
      forgotPassword: joi.object().keys({
        generateEmailHTML: joi.func(),
        generateEmailSubject: joi.func(),
      }),
      maxLoginAttempts: joi.number(),
    }),
    joi.boolean(),
  ).default(false),
  upload: joi.alternatives().try(
    joi.object({
      staticURL: joi.string(),
      staticDir: joi.string(),
      adminThumbnail: joi.string(),
      imageSizes: joi.array().items(
        joi.object().keys({
          name: joi.string(),
          width: joi.number(),
          height: joi.number(),
          crop: joi.string(), // TODO: add further specificity with joi.xor
        }),
      ),
    }),
    joi.boolean(),
  ).default(false),
});

export default collectionSchema;

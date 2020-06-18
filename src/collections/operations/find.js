const merge = require('lodash.merge');
const executePolicy = require('../../auth/executePolicy');
const executeFieldPolicies = require('../../auth/executeFieldPolicies');
const executeFieldHooks = require('../../fields/executeHooks');

const find = async (args) => {
  try {
    // /////////////////////////////////////
    // 1. Retrieve and execute policy
    // /////////////////////////////////////

    const policyResults = await executePolicy(args, args.config.policies.read);
    const hasWherePolicy = typeof policyResults === 'object';

    const queryToBuild = {};
    if (args.where) queryToBuild.where = args.where;

    if (hasWherePolicy) {
      queryToBuild.where = merge(args.where, policyResults);
    }

    let options = {
      ...args,
      query: await args.Model.buildQuery(queryToBuild, args.req.locale),
    };

    // /////////////////////////////////////
    // 2. Execute before collection hook
    // /////////////////////////////////////

    const { beforeRead } = args.config.hooks;

    if (typeof beforeRead === 'function') {
      options = await beforeRead(options);
    }

    // /////////////////////////////////////
    // 3. Perform database operation
    // /////////////////////////////////////

    const {
      query,
      page,
      limit,
      sort,
      depth,
      Model,
      req: {
        locale,
        fallbackLocale,
        payloadAPI,
      },
    } = options;

    const optionsToExecute = {
      page: page || 1,
      limit: limit || 10,
      sort,
      collation: sort ? { locale: 'en' } : {}, // case-insensitive sort in MongoDB
      options: {},
    };

    // Only allow depth override within REST.
    // If allowed in GraphQL, it would break resolvers
    // as a full object will be returned instead of an ID string
    if (payloadAPI === 'REST') {
      if (depth && depth !== '0') {
        optionsToExecute.options.autopopulate = {
          maxDepth: parseInt(depth, 10),
        };
      } else {
        optionsToExecute.options.autopopulate = false;
      }
    }

    let result = await Model.paginate(query, optionsToExecute);

    // /////////////////////////////////////
    // 4. Execute field-level policies
    // /////////////////////////////////////

    result = {
      ...result,
      docs: await Promise.all(result.docs.map(async (doc) => {
        if (locale && doc.setLocale) {
          doc.setLocale(locale, fallbackLocale);
        }

        const json = doc.toJSON({ virtuals: true });
        return executeFieldPolicies(args, json, args.config.fields, 'read');
      })),
    };

    // /////////////////////////////////////
    // 5. Execute field-level afterRead hooks
    // /////////////////////////////////////

    result = {
      ...result,
      docs: await Promise.all(result.docs.map(async (doc) => {
        return executeFieldHooks(options, args.config.fields, doc, 'afterRead', doc);
      })),
    };

    // /////////////////////////////////////
    // 6. Execute afterRead collection hook
    // /////////////////////////////////////

    const { afterRead } = args.config.hooks;
    let afterReadResult = null;

    if (typeof afterRead === 'function') {
      afterReadResult = {
        ...result,
        docs: await Promise.all(result.docs.map(async (doc) => {
          return afterRead({
            options,
            doc,
          }) || doc;
        })),
      };
    }

    // /////////////////////////////////////
    // 7. Return results
    // /////////////////////////////////////

    return afterReadResult || result;
  } catch (err) {
    throw err;
  }
};

module.exports = find;

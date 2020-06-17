const { Forbidden, NotFound } = require('../../errors');
const executePolicy = require('../../auth/executePolicy');
const executeFieldHooks = require('../../fields/executeHooks');

const findByID = async (args) => {
  try {
    // /////////////////////////////////////
    // 1. Retrieve and execute policy
    // /////////////////////////////////////

    const policyResults = await executePolicy(args, args.config.policies.read);
    const hasWherePolicy = typeof policyResults === 'object';

    let options = {
      ...args,
      query: { _id: args.id },
    };

    if (hasWherePolicy) {
      options.query = await args.Model.buildQuery({
        where: {
          ...policyResults,
          _id: {
            equals: args.id,
          },
        },
      }, args.locale);
    }

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
      depth,
      Model,
      query,
      req: {
        locale,
        fallbackLocale,
        payloadAPI,
      },
    } = options;

    const queryOptionsToExecute = {
      options: {},
    };

    // Only allow depth override within REST.
    // If allowed in GraphQL, it would break resolvers
    // as a full object will be returned instead of an ID string
    if (payloadAPI === 'REST') {
      if (depth && depth !== '0') {
        queryOptionsToExecute.options.autopopulate = {
          maxDepth: parseInt(depth, 10),
        };
      } else {
        queryOptionsToExecute.options.autopopulate = false;
      }
    }

    let result = await Model.findOne(query, {}, queryOptionsToExecute);

    if (!result && !hasWherePolicy) throw new NotFound();
    if (!result && hasWherePolicy) throw new Forbidden();

    if (locale && result.setLocale) {
      result.setLocale(locale, fallbackLocale);
    }

    let json = result.toJSON({ virtuals: true });

    // /////////////////////////////////////
    // 4. Execute after collection field-level hooks
    // /////////////////////////////////////

    result = await executeFieldHooks(options, options.config.fields, result, 'afterRead', result);

    // /////////////////////////////////////
    // 5. Execute field-level policies
    // /////////////////////////////////////

    // Field-level policies here

    // /////////////////////////////////////
    // 6. Execute after collection hook
    // /////////////////////////////////////

    const { afterRead } = args.config.hooks;

    if (typeof afterRead === 'function') {
      json = await afterRead({
        ...options,
        result,
        doc: json,
      }) || json;
    }

    // /////////////////////////////////////
    // 7. Return results
    // /////////////////////////////////////

    return json;
  } catch (err) {
    throw err;
  }
};

module.exports = findByID;

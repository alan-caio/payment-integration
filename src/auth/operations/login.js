const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../../errors');

const login = async (args) => {
  // Await validation here

  let options = { ...args };

  // /////////////////////////////////////
  // 1. Execute before login hook
  // /////////////////////////////////////

  const beforeLoginHook = args.collection.config.hooks.beforeLogin;

  if (typeof beforeLoginHook === 'function') {
    options = await beforeLoginHook(options);
  }

  // /////////////////////////////////////
  // 2. Perform login
  // /////////////////////////////////////

  const {
    collection: {
      Model,
      config: collectionConfig,
    },
    config,
    data,
  } = options;

  const { email, password } = data;

  const user = await Model.findByUsername(email);

  if (!user) throw new AuthenticationError();

  const authResult = await user.authenticate(password);

  if (!authResult.user) {
    throw new AuthenticationError();
  }

  const fieldsToSign = collectionConfig.fields.reduce((signedFields, field) => {
    if (field.saveToJWT) {
      return {
        ...signedFields,
        [field.name]: user[field.name],
      };
    }
    return signedFields;
  }, {
    email,
    id: user.id,
  });

  fieldsToSign.collection = collectionConfig.slug;

  const token = jwt.sign(
    fieldsToSign,
    config.secret,
    {
      expiresIn: collectionConfig.auth.tokenExpiration,
    },
  );

  if (args.res) {
    const cookieOptions = {
      path: '/',
      httpOnly: true,
    };

    if (collectionConfig.auth.secureCookie) {
      cookieOptions.secure = true;
    }

    if (Array.isArray(collectionConfig.auth.cookieDomains)) {
      collectionConfig.auth.cookieDomains.forEach((domain) => {
        args.res.cookie(`${config.cookiePrefix}-token`, token, {
          ...cookieOptions,
          domain,
        });
      });
    } else {
      args.res.cookie(`${config.cookiePrefix}-token`, token, cookieOptions);
    }
  }

  // /////////////////////////////////////
  // 3. Execute after login hook
  // /////////////////////////////////////

  const afterLoginHook = args.collection.config.hooks.afterLogin;

  if (typeof afterLoginHook === 'function') {
    await afterLoginHook({ ...options, token, user });
  }

  // /////////////////////////////////////
  // 4. Return token
  // /////////////////////////////////////

  return token;
};

module.exports = login;

const jwt = require('jsonwebtoken');
const { AuthenticationError, LockedAuth } = require('../../errors');
const getCookieExpiration = require('../../utilities/getCookieExpiration');
const isLocked = require('../isLocked');

async function login(args) {
  const { config, operations } = this;

  const options = { ...args };

  // /////////////////////////////////////
  // 1. Execute before login hook
  // /////////////////////////////////////

  args.collection.config.hooks.beforeLogin.forEach((hook) => hook({ req: args.req }));

  // /////////////////////////////////////
  // 2. Perform login
  // /////////////////////////////////////

  const {
    collection: {
      Model,
      config: collectionConfig,
    },
    data,
    req,
  } = options;

  const { email: unsanitizedEmail, password } = data;

  const email = unsanitizedEmail ? unsanitizedEmail.toLowerCase() : null;

  const userDoc = await Model.findByUsername(email);

  if (!userDoc || (args.collection.config.auth.emailVerification && userDoc._verified === false)) {
    throw new AuthenticationError();
  }

  if (userDoc && isLocked(userDoc.lockUntil)) {
    throw new LockedAuth();
  }

  const authResult = await userDoc.authenticate(password);

  const maxLoginAttemptsEnabled = args.collection.config.auth.maxLoginAttempts > 0;

  if (!authResult.user) {
    if (maxLoginAttemptsEnabled) await userDoc.incLoginAttempts();
    throw new AuthenticationError();
  }

  if (maxLoginAttemptsEnabled) {
    await operations.collections.auth.unlock({
      collection: {
        Model,
        config: collectionConfig,
      },
      req,
      data,
      overrideAccess: true,
    });
  }

  const userQuery = await operations.collections.find({
    where: {
      email: {
        equals: email,
      },
    },
    collection: {
      Model,
      config: collectionConfig,
    },
    req,
    overrideAccess: true,
  });

  const user = userQuery.docs[0];

  const fieldsToSign = collectionConfig.fields.reduce((signedFields, field) => {
    const result = {
      ...signedFields,
    };

    if (!field.name && field.fields) {
      field.fields.forEach((subField) => {
        if (subField.saveToJWT) {
          result[subField.name] = user[subField.name];
        }
      });
    }

    if (field.saveToJWT) {
      result[field.name] = user[field.name];
    }

    return result;
  }, {
    email,
    id: user.id,
    collection: collectionConfig.slug,
  });

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
      expires: getCookieExpiration(collectionConfig.auth.tokenExpiration),
      secure: collectionConfig.auth.cookies.secure,
      sameSite: collectionConfig.auth.cookies.sameSite,
    };


    if (collectionConfig.auth.cookies.domain) cookieOptions.domain = collectionConfig.auth.cookies.domain;

    args.res.cookie(`${config.cookiePrefix}-token`, token, cookieOptions);
  }

  // /////////////////////////////////////
  // 3. Execute after login hook
  // /////////////////////////////////////

  args.collection.config.hooks.afterLogin.forEach((hook) => hook({ token, user, req: args.req }));

  // /////////////////////////////////////
  // 4. Return token
  // /////////////////////////////////////

  return {
    token,
    user,
    exp: jwt.decode(token).exp,
  };
}

module.exports = login;

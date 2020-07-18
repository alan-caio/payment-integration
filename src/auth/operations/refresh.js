const jwt = require('jsonwebtoken');
const { Forbidden } = require('../../errors');

const refresh = async (args) => {
  // Await validation here

  let options = { ...args };

  // /////////////////////////////////////
  // 1. Execute before refresh hook
  // /////////////////////////////////////

  const { beforeRefresh } = args.collection.config.hooks;

  if (typeof beforeRefresh === 'function') {
    options = await beforeRefresh(options);
  }

  // /////////////////////////////////////
  // 2. Perform refresh
  // /////////////////////////////////////

  const { secret, cookiePrefix } = options.config;
  const opts = {};
  opts.expiresIn = options.collection.config.auth.tokenExpiration;

  if (typeof options.token !== 'string') throw new Forbidden();

  const payload = jwt.verify(options.token, secret, {});
  delete payload.iat;
  delete payload.exp;
  const refreshedToken = jwt.sign(payload, secret, opts);

  if (args.res) {
    const cookieOptions = {
      path: '/',
      httpOnly: true,
    };

    if (options.collection.config.auth.secureCookie) {
      cookieOptions.secure = true;
    }

    if (args.req.headers.origin && args.req.headers.origin.indexOf('localhost') === -1) {
      let domain = args.req.headers.origin.replace('https://', '');
      domain = args.req.headers.origin.replace('http://', '');
      cookieOptions.domain = domain;
    }

    args.res.cookie(`${cookiePrefix}-token`, refreshedToken, cookieOptions);
  }


  // /////////////////////////////////////
  // 3. Execute after login hook
  // /////////////////////////////////////

  const { afterRefresh } = args.collection.config.hooks;

  if (typeof afterRefresh === 'function') {
    await afterRefresh(options, refreshedToken);
  }

  // /////////////////////////////////////
  // 4. Return refreshed token
  // /////////////////////////////////////

  payload.exp = jwt.decode(refreshedToken).exp;

  return {
    refreshedToken,
    user: payload,
  };
};

module.exports = refresh;

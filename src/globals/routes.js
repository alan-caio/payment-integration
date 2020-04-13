const express = require('express');
const requestHandlers = require('./requestHandlers');
const bindModelMiddleware = require('../express/middleware/bindModel');
const loadPolicy = require('../express/middleware/loadPolicy');
const getMiddleware = require('./middleware');

const { upsert, findOne } = requestHandlers;

const router = express.Router();

const registerGlobals = (globalConfigs, Globals) => {
  router.all('/globals*',
    bindModelMiddleware(Globals));

  globalConfigs.forEach((global) => {
    router.all(`/globals/${global.slug}`, getMiddleware(global));

    router
      .route(`/globals/${global.slug}`)
      .get(loadPolicy(global.policies.read), findOne)
      .post(loadPolicy(global.policies.create), upsert)
      .put(loadPolicy(global.policies.update), upsert);
  });

  return router;
};

module.exports = registerGlobals;

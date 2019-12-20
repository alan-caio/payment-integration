import mongoose from 'mongoose';
import passport from 'passport';
import express from 'express';
import path from 'path';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import fileUpload from 'express-fileupload';
import jwtStrategy from './auth/jwt';
import initRoutes from './routes/init.routes';
import bindModelMiddleware from './mongoose/bindModel.middleware';
import localizationMiddleware from './localization/localization.middleware';
import { query, create, findOne, destroy, update } from './mongoose/requestHandlers';
import { upsert, fetch } from './mongoose/requestHandlers/globals';
import { upload as uploadMedia, update as updateMedia } from './uploads/requestHandlers';
import setModelLocaleMiddleware from './mongoose/setModelLocale.middleware';
import getWebpackDevConfig from './client/config/getWebpackDevConfig';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import authRoutes from './routes/auth.routes';
import SchemaLoader from './mongoose/schema/schemaLoader';
import uploadRoutes from './uploads/upload.routes';

class Payload {
  constructor(options) {
    mongoose.connect(options.config.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, (err) => {
      if (err) {
        console.log('Unable to connect to the Mongo server. Please start the server. Error:', err);
      } else {
        console.log('Connected to Mongo server successfully!');
      }
    });

    this.schemaLoader = new SchemaLoader(options.config);

    options.app.use(fileUpload({}));
    const staticUrl = options.config.staticUrl ? options.config.staticUrl : `/${options.config.staticDir}`;
    options.app.use(staticUrl, express.static(options.config.staticDir));

    // Configure passport for Auth
    options.app.use(passport.initialize());
    options.app.use(passport.session());

    if (options.config.cors) {
      options.app.use((req, res, next) => {
        if (options.config.cors.indexOf(req.headers.origin) > -1) {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
          res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        }

        res.header('Access-Control-Allow-Headers',
          'Origin X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Content-Language', options.config.localization.locale);

        next();
      });
    }

    if (options.config.uploads) {
      options.app.use(fileUpload());

      options.router.use('', uploadRoutes(options.config)
      );
    }

    options.app.use(express.json());
    options.app.use(methodOverride('X-HTTP-Method-Override'));
    options.app.use(express.urlencoded({ extended: true }));
    options.app.use(bodyParser.urlencoded({ extended: true }));
    options.app.use(localizationMiddleware(options.config.localization));
    options.app.use(options.router);

    options.router.use('/config',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        res.json(options.config)
      });

    Object.values(this.schemaLoader.contentBlocks)
      .forEach(block => {
        const config = block.config;
        const model = block.Model;

        options.router.all(`/${config.slug}*`,
          bindModelMiddleware(model),
          setModelLocaleMiddleware()
        );
        options.router.route(`/${config.slug}`)
          .get(config.policies.read, query)
          .post(config.policies.create, create);

        options.router.route(`/${config.slug}/:id`)
          .get(config.policies.read, findOne)
          .put(config.policies.update, update)
          .delete(config.policies.destroy, destroy);
      });

    Object.values(this.schemaLoader.collections)
      .forEach(collection => {
        const config = collection.config;
        const model = collection.model;

        // register passport with model
        if (config.auth) {
          passport.use(model.createStrategy());
          if (config.auth.strategy === 'jwt') {
            passport.use(jwtStrategy(model));
            passport.serializeUser(model.serializeUser());
            passport.deserializeUser(model.deserializeUser());
          }

          options.router.use('', initRoutes(model));
          options.router.use('', authRoutes(config, model));
        }

        options.router.all(`/${config.slug}*`,
          bindModelMiddleware(model),
          setModelLocaleMiddleware()
        );

        // TODO: this feels sloppy, need to discuss media enabled collection handlers
        let createHandler = config.media ? (req, res, next) => uploadMedia(req, res, next, config.media) : create;
        let updateHandler = config.media ? (req, res, next) => updateMedia(req, res, next, config.media) : update;
        // TODO: Do we need a delete?

        options.router.route(`/${config.slug}`)
          .get(config.policies.read, query)
          .post(config.policies.create, createHandler);

        options.router.route(`/${config.slug}/:id`)
          .get(config.policies.read, findOne)
          .put(config.policies.update, updateHandler)
          .delete(config.policies.destroy, destroy);
      });

    options.router.all('/globals*',
      bindModelMiddleware(this.schemaLoader.globalModel),
      setModelLocaleMiddleware()
    );

    options.router
      .route('/globals')
      .get(fetch);

    options.router
      .route('/globals/:key')
      .get(fetch)
      .post(upsert)
      .put(upsert);

    const webpackDevConfig = getWebpackDevConfig(options.config);

    const compiler = webpack(webpackDevConfig);

    // options.app.use(webpackDevMiddleware(compiler, {
    //   publicPath: webpackDevConfig.output.publicPath,
    // }));

    options.app.get(`${options.config.routes.admin}*`, (req, res, next) => {
      const filename = path.resolve(compiler.outputPath, 'index.html');
      compiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) {
          return next(err)
        }
        res.set('content-type', 'text/html')
        res.send(result)
        res.end()
      })
    })

    options.app.use(webpackHotMiddleware(compiler));
  }
}

module.exports = Payload;

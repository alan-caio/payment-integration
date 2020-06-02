const buildModel = require('./buildModel');
const sanitize = require('./sanitize');
const routes = require('./routes');

function initGlobals() {
  if (this.config.globals) {
    this.globals = {
      Model: buildModel(this.config),
      config: this.config.globals,
    };

    this.router.use(routes(this.config.globals, this.globals.Model));
  }
}

module.exports = initGlobals;

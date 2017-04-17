'use strict';
var yeoman = require('yeoman-generator');
var configOptions;

module.exports = yeoman.extend({
  initializing: function () {
    configOptions = this.config.getAll();
  }, writing: function () {
    this.composeWith('cedrus-api-czar-lite:add-resource-node');
  }
});

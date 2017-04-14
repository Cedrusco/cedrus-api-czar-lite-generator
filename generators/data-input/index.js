'use strict';
var yeoman = require('yeoman-generator');
var configOptions;

module.exports = yeoman.extend({
  initializing: function () {
    configOptions = this.config.getAll();
  },
  prompting: function () {
    // console.log('DATA INPUT', configOptions);
    var prompts = [{
      type: 'list',
      name: 'dataInputType',
      message: 'What type of data input will you be providing?',
      choices: ['JSON Input']
    }];
    return this.prompt(prompts).then(function (props) {
      this.config.set({dataInput: props});
      if (props.dataInputType === 'JSON Input') {
        this.composeWith('cedrus-api-lite:json-extraction');
        this.composeWith('cedrus-api-lite:json-input');
        this.composeWith('cedrus-api-lite:http-status-codes', {runningThrough: 'generator'});
        this.composeWith('cedrus-api-lite:add-parameters');
        this.composeWith('cedrus-api-lite:query-api');
        this.composeWith('cedrus-api-lite:create-yaml');
        this.composeWith('cedrus-api-lite:extract-schema');
        this.composeWith('cedrus-api-lite:start-swagger-gen');
        this.composeWith('cedrus-api-lite:fake-data', {runningThrough: 'generator'});
      }
    }.bind(this));
  }
});

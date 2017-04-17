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
        this.composeWith('cedrus-api-czar-lite:json-extraction');
        this.composeWith('cedrus-api-czar-lite:json-input');
        this.composeWith('cedrus-api-czar-lite:http-status-codes', {runningThrough: 'generator'});
        this.composeWith('cedrus-api-czar-lite:add-parameters');
        this.composeWith('cedrus-api-czar-lite:query-api');
        this.composeWith('cedrus-api-czar-lite:create-yaml');
        this.composeWith('cedrus-api-czar-lite:extract-schema');
        this.composeWith('cedrus-api-czar-lite:start-swagger-gen');
        this.composeWith('cedrus-api-czar-lite:fake-data', {runningThrough: 'generator'});
      }
    }.bind(this));
  }
});

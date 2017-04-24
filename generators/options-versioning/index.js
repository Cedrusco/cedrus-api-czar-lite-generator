'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.extend({
  prompting: function () {
    this.log('\n# Versioning\n');

    var prompts = [{
      type: 'confirm',
      name: 'versioningEnabled',
      message: 'Would you like to enable versioning?',
      default: false
    }, {
      when: function (response) {
        return response.versioningEnabled;
      },
      type: 'list',
      name: 'versioningLocation',
      message: 'Where would you like to handle versioning?',
      choices: [{
        name: 'URI',
        value: 'uri'
      }, {
        name: 'Custom Header',
        value: 'custom-header'
      }, {
        name: 'Content Type Header',
        value: 'content-type'
      }]
    }, {
      when: function (response) {
        return (response.versioningEnabled && response.versioningLocation === 'custom-header');
      },
      type: 'input',
      name: 'customHeaderName',
      message: 'Please enter name of your custom header?',
      default: 'Version'
    }, {
      when: function (response) {
        return (response.versioningEnabled && response.versioningLocation === 'uri');
      },
      type: 'list',
      name: 'uriOrder',
      message: 'Please choose URI order.',
      choices: [{
        name: '{resource}/{versionNumber}',
        value: 'resourceFirst'
      }, {
        name: '{versionNumber}/{resource}',
        value: 'versionNumberFirst'
      }]
    }, {
      when: function (response) {
        return (response.versioningEnabled && response.versioningLocation === 'content-type');
      },
      type: 'list',
      name: 'contentTypeOrder',
      message: 'Please choose Content-type Header order.',
      choices: [{
        name: 'application/json+{versionNumber}',
        value: 'applicationFirst'
      }, {
        name: '{versionNumber}+application/json',
        value: 'versionNumberFirst'
      }]
    }, {
      when: function (response) {
        return response.versioningEnabled;
      },
      type: 'input',
      name: 'versionNumber',
      message: 'Please enter version number of your api?',
      default: 'v1'
    }];

    return this.prompt(prompts).then(function (props) {
      var versioning = {
        enabled: props.versioningEnabled,
        type: props.versioningLocation
      };
      if (props.versioningEnabled && props.versioningLocation === 'custom-header') {
        versioning.customHeaderName = props.customHeaderName;
      }
      if (props.versioningEnabled && props.versioningLocation === 'uri') {
        versioning.uriOrder = props.uriOrder;
      }
      if (props.versioningEnabled && props.versioningLocation === 'content-type') {
        versioning.contentTypeOrder = props.contentTypeOrder;
      }
      if (props.versioningEnabled) {
        versioning.versionNumber = [props.versionNumber];
      }
      this.config.set({
        detail: {
          versioning: versioning
        }
      });
      this.composeWith('cedrus-api-czar-lite:data-input');
    }.bind(this));
  }
});

'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.extend({
  prompting: function () {
    // console.log('CREATE JSON INPUT');
  },
  writing: function () {
    this.fs.copyTpl(
      this.templatePath('input.json'),
      this.destinationPath('swaggerConfig/input.json')
    );
  },
  end: function () {
    var cb = this.async();
    // console.log('options INPUT', this.config.getAll());
    var configOptions = this.config.getAll();
    createJsonInput(configOptions, cb);
  }
});

var createJsonInput = function (options, cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    inputJSON.info.title = options.apiOverview.apiName;
    inputJSON.info.description = options.apiOverview.apiDescription;
    if (options.detail.versioning.enabled) {
      inputJSON.info.version = options.detail.versioning.versionNumber[0];
    }
    inputJSON.basePath = options.apiOverview.apiBasePath;
    // inputJSON.consumes = options.discover.apiConsumes;
    inputJSON.produces = options.discover.apiProduces;
    /*
    ** saving final json file for future references
    */
    fs.writeFile('swaggerConfig/input.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
      cb();
    });
  });
};

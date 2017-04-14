'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.extend({
  prompting: function () {
    // console.log('ADD Parameters');
  },
  end: function () {
    var cb = this.async();
    // console.log('options', this.config.getAll());
    var configOptions = this.config.getAll();
    addParameters(configOptions, cb);
  }
});

var addParameters = function (options, cb) {
  /*
  **  Reading the copied json file and adding the required parameters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var versionNumber = null;
    if (options.detail.versioning.enabled) {
      versionNumber = options.detail.versioning.versionNumber[0];
    }
    // console.log('Adding parameters options', options);
    var inputJSON = JSON.parse(jsonObj);
    var apiPaths = options.JSONExtraction;
    apiPaths.forEach(function (apiPath) {
      var definitionName = apiPath.resourceName;
      var resourceName = apiPath.resourceName + 's';
      if (options.detail.versioning.type === 'uri' && versionNumber !== null) {
        if (options.detail.versioning.uriOrder === 'versionNumberFirst') {
          definitionName = versionNumber + apiPath.resourceName + 's';
          resourceName = versionNumber + '/' + apiPath.resourceName + 's';
        } else {
          definitionName = apiPath.resourceName + 's' + versionNumber;
          resourceName = apiPath.resourceName + 's/' + versionNumber;
        }
      }
      if (apiPath.isPublic) {
        var outline = {
          name: resourceName,
          in: 'body',
          schema: {
            $ref: '#/definitions/' + definitionName
          }
        };
        //
        // Adding parameters for Post if it exists
        //
        if (inputJSON.paths['/' + resourceName].post) {
          inputJSON.paths['/' + resourceName].post.parameters = [];
          inputJSON.paths['/' + resourceName].post.parameters.push(outline);
        }
        //
        // Adding parameters for Put if it exists
        //
        if (inputJSON.paths['/' + resourceName].put) {
          inputJSON.paths['/' + resourceName].put.parameters = [];
          inputJSON.paths['/' + resourceName].put.parameters.push(outline);
        }
        //
        // Adding parameters for Delete if it exists
        //
        if (inputJSON.paths['/' + resourceName].delete) {
          inputJSON.paths['/' + resourceName].delete.parameters = [];
          inputJSON.paths['/' + resourceName].delete.parameters.push(outline);
        }
      }
    });
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

'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var httpStatusCodes = ['204', '404', '500'];

module.exports = yeoman.extend({
  prompting: function () {
    // console.log('ADD HTTPCODES');
  },
  writing: function () {
    var runningThrough = this.options.runningThrough;
    var configOptions = this.config.getAll();
    if (runningThrough === 'AddResource') {
      // createJson(configOptions.addResource.resourceName, configOptions.addResource.paginationLimit, configOptions.addResource.jsonSchema);
      var cb = this.async();
      addHTTPCodes(configOptions, true, cb);
    }
  },
  end: function () {
    var cb = this.async();
    var runningThrough = this.options.runningThrough;
    var configOptions = this.config.getAll();
    if (runningThrough === 'generator') {
      // console.log('options', this.config.getAll());
      addHTTPCodes(configOptions, false, cb);
    } else if (runningThrough === 'AddResource') {
      // createJson(configOptions.addResource.resourceName, configOptions.addResource.recordsLimit, configOptions.addResource.jsonSchema);
      addHTTPCodes(configOptions, true, cb);
    } else {
      cb();
    }
  }
});

//
// FORMATING FUNCTIONS
//
var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
//
// JOB HANDELING FUNCTIONS
//
var addHTTPCodes = function (options, isAddResource, cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    // console.log('WE MADE IT', options);
    var inputJSON = JSON.parse(jsonObj);
    if (isAddResource) {
      var apiPaths = options.JSONExtraction;
      var configFileContents = JSON.parse(fs.readFileSync(path.resolve('.yo-rc.json'), 'utf8'));
      var count = 0;
      apiPaths.forEach(function (apiPath) {
        if (apiPath.isNewResource) {
          var jsonSchema = apiPath.jsonSchema;
          addToDefinitions(inputJSON, apiPath.resourceName, jsonSchema, options.detail.versioning);
          // console.log('------------------------------', apiPath.isPublic);
          if (apiPath.isPublic) {
            addToPaths(inputJSON, options.discover.apiProduces, options.discover.apiConsumes, apiPath.httpMethods, apiPath.resourceName, options.detail.versioning);
          }
        }
        configFileContents['generator-cedrus-api-czar-lite'].JSONExtraction[count].isNewResource = false;
        if(count === apiPaths.length-1){
          fs.writeFile('.yo-rc.json', JSON.stringify(configFileContents), function (err) {
            if (err) {
              return console.log(err);
            }
            console.log('The configFileContents Json file is saved!');
            cb();
          });
        }
        count++;
      });
      /* addToDefinitions(inputJSON, options.addResource.resourceName, options.addResource.jsonSchema);
      if (options.addResource.isPublic) {
        addToPaths(inputJSON, options.discover.apiProduces, options.discover.apiConsumes, options.addResource.APIHttpMethods, options.addResource.resourceName);
      } */
    } else {
      var apiPaths = options.JSONExtraction;
      var versionNumber = null;
      if (options.detail.versioning.enabled) {
        if (options.detail.versioning.type === 'uri') {
          versionNumber = options.detail.versioning.versionNumber[0];
        }
      }
      apiPaths.forEach(function (apiPath) {
        var jsonSchema = apiPath.jsonSchema;
        addToDefinitions(inputJSON, apiPath.resourceName, jsonSchema, options.detail.versioning);
        if (apiPath.isPublic) {
          addToPaths(inputJSON, options.discover.apiProduces, options.discover.apiConsumes, apiPath.httpMethods, apiPath.resourceName, options.detail.versioning);
        }
      });
    }
    // /*
    // ** saving final json file for future references
    // */
    fs.writeFile('swaggerConfig/input.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
      cb();
    });
  });
};

/*
** This method converts provider json to schema object and adds to definitions
*/
var addToDefinitions = function (inputJSON, resourceName, schemaObj, versioning) {
  var definitionName = resourceName;
  var versionNumber = null;
  if (versioning.enabled) {
    versionNumber = versioning.versionNumber[0];
  }
  if (versioning.type === 'uri' && versionNumber !== null) {
    if (versioning.uriOrder === 'versionNumberFirst') {
      definitionName = versionNumber + resourceName + 's';
      resourceName = versionNumber + '/' + resourceName + 's';
    } else {
      definitionName = resourceName + 's' + versionNumber;
      resourceName = resourceName + 's/' + versionNumber;
    }
  }
  inputJSON.definitions[definitionName] = {};
  inputJSON.definitions[definitionName] = schemaObj;
};
/*
** This method add's user selected paths with appropriate error codes
*/
var addToPaths = function (inputJSON, apiProduces, apiConsumes, httpMethodList, resourceName, versioning) {
  var resourceNameNew = resourceName + 's';
  var definitionName = resourceName;
  var versionNumber = null;
  if (versioning.enabled) {
    versionNumber = versioning.versionNumber[0];
  }
  if (versioning.type === 'uri' && versionNumber !== null) {
    if (versioning.uriOrder === 'versionNumberFirst') {
      definitionName = versionNumber + resourceName + 's';
      resourceNameNew = versionNumber + '/' + resourceName + 's';
    } else {
      definitionName = resourceName + 's' + versionNumber;
      resourceNameNew = resourceName + 's/' + versionNumber;
    }
  }
  if (inputJSON.paths === {} || typeof inputJSON.paths['/' + resourceNameNew] === 'undefined') {
    inputJSON.paths['/' + resourceNameNew] = {};
  }
  //
  // For each httpMethod
  //
  var httpMethods = httpMethodList;
  httpMethods.forEach(function (httpMethod) {
    inputJSON.paths['/' + resourceNameNew][httpMethod] = {};
    var httpOptions = {};
    httpOptions.tags = [capitalizeFirstLetter(resourceName)];
    httpOptions.description = capitalizeFirstLetter(httpMethod) + 's all ' + resourceName + 's from the system that the user has access to';
    httpOptions.operationId = httpMethod + capitalizeFirstLetter(resourceName);
    httpOptions.produces = apiProduces;
    if (httpMethod !== 'get') {
      httpOptions.consumes = apiConsumes;
    }
    httpOptions['x-swagger-router-controller'] = capitalizeFirstLetter(resourceName);
    httpOptions.responses = {};
    //
    // Adding HTTP Response Code
    //
    var responses = {};
    httpStatusCodes.forEach(function (httpStatusCode) {
      if (httpMethod === 'get' && httpStatusCode === '204') {
        httpStatusCode = '200';
      }
      responses[httpStatusCode] = {};
      responses[httpStatusCode].description = resourceName + ' response';
      responses[httpStatusCode].schema = {};
      if (httpStatusCode === '200' || httpStatusCode === '204') {
        responses[httpStatusCode].schema.type = 'array';
        responses[httpStatusCode].schema.items = {};
        responses[httpStatusCode].schema.items.$ref = '#/definitions/' + definitionName;
      } else {
        responses[httpStatusCode].schema.type = 'object';
      }
    });
    httpOptions.responses = responses;
    inputJSON.paths['/' + resourceNameNew][httpMethod] = httpOptions;
  });
};

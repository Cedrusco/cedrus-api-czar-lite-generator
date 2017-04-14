'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var GenerateSchema = require('generate-schema');
var path = require('path');
var configOptions;
var self;
var cb;
var apis = [];
var schemaObj;

var promptMe = function (prompts, configOptions, cb) {
  self.prompt(prompts).then(function (props) {
    // console.log('props JSON EXTRACTION', props);
    //
    // Extracting JSON Object from path
    //
    var contents = fs.readFileSync(path.resolve(props.jsonFilePath), 'utf8');
    if (props.jsonType === 'Data Object') {
      try {
        var jsonData = JSON.parse(contents);
        if (jsonData[0] !== undefined) {
          schemaObj = GenerateSchema.json(props.resource, jsonData[0]);
        } else {
          schemaObj = GenerateSchema.json(props.resource, jsonData);
        }
        delete schemaObj.$schema;
      } catch (error) {
        throw new Error('Your \'' + props.resource + '\' resource has a JSON error\n' + error.message);
      }
    // console.log('Type : \n' + typeof contents);
    // console.log('Output Content : \n' + contents);
    // console.log('apis', apis);
    } else {
      try {
        schemaObj = JSON.parse(contents);
        delete schemaObj.$schema;
      } catch (error) {
        throw new Error('Your \'' + props.resource + '\' resource has a JSON error\n' + error.message);
      }
    }
    //
    // Create temp object to push to API array
    //
    var temp = {
      resourceName: props.resource,
      jsonFilePath: props.jsonFilePath,
      jsonSchema: schemaObj,
      isPublic: props.isPublic,
      httpMethods: props.apiHttpMethods,
      httpStatusCodes: ['204', '404', '500'],
      requireTestDataType: props.requireTestDataType ? 'Test Data' : 'None',
      apiFakerMappingFileProvided: props.apiFakerMappingFileProvided,
      apiFakerMappingFileLocation: props.apiFakerMappingFileLocation,
      apiFakerMappingJsonType: props.apiFakerMappingJsonType,
      recordsLimit: props.recordsLimit,
      requireQuery: props.requireQuery,
      whichParameter: props.whichParameter
    };
    //
    // Push object of info to API array
    //
    apis.push(temp);
    //
    // If client has more resources continue asking questions if not save and break
    //
    if (props.ContinueBoolean) {
      promptMe(prompts, configOptions, cb);
    } else {
      self.config.set({JSONExtraction: apis});
      cb();
    }
  });
};

module.exports = yeoman.extend({
  initializing: function () {
    configOptions = this.config.getAll();
  },
  prompting: function () {
    self = this;
    cb = this.async();
    var prompts = [{
      name: 'jsonType',
      message: 'Do you have a Data Object or a Data Schema?',
      type: 'list',
      choices: ['Data Object', 'Data Schema']
    }, {
      type: 'input',
      name: 'resource',
      message: 'Enter name of your resource?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter resource name!!!';
        }
        var done = this.async();
        done(null, true);
      }
    }, {
      type: 'input',
      name: 'jsonFilePath',
      message: 'Enter path of your resource?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter resource location!!!';
        }
        var done = this.async();
        done(null, true);
      }
    }, {
      type: 'confirm',
      name: 'isPublic',
      message: 'Would you like this resource to be public?',
      default: true
    }, {
      when: function (response) {
        return response.isPublic;
      },
      type: 'checkbox',
      name: 'apiHttpMethods',
      message: 'Which http methods you would like to generate?',
      choices: [{
        name: 'GET',
        value: 'get',
        checked: true
      },
      {
        name: 'POST',
        value: 'post',
        checked: true
      },
      {
        name: 'PUT',
        value: 'put',
        checked: true
      },
      {
        name: 'PATCH',
        value: 'patch',
        checked: true
      },
      {
        name: 'DELETE',
        value: 'delete',
        checked: true
      }
      ]
    }, {
      when: function (response) {
        return response.isPublic;
      },
      name: 'requireTestDataType',
      type: 'confirm',
      message: 'Would you like to have test data for your API?'
    }, {
      when: function (response) {
        return response.requireTestDataType;
      },
      name: 'recordsLimit',
      type: 'number',
      message: 'How many records of test data would you like to have?',
      default: 10
    }, {
      when: function (response) {
        return response.requireTestDataType;
      },
      name: 'apiFakerMappingFileProvided',
      type: 'confirm',
      message: 'Do you have custom mapping file?'
    }, {
      when: function (response) {
        return response.apiFakerMappingFileProvided && response.requireTestDataType;
      },
      name: 'apiFakerMappingJsonType',
      message: 'Do you have a Data Schema or Mapping File?',
      type: 'list',
      choices: ['Data Schema', 'Mapping File']
    }, {
      when: function (response) {
        return response.apiFakerMappingFileProvided && response.requireTestDataType;
      },
      name: 'apiFakerMappingFileLocation',
      type: 'input',
      message: 'Enter path of your mapping file?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter mapping file location!!!';
        }
        var done = this.async();
        done(null, true);
      }
    }, {
      name: 'requireQuery',
      type: 'confirm',
      message: 'Would you like to query this API?'
    }, {
      when: function (response) {
        return response.requireQuery;
      },
      name: 'whichParameter',
      type: 'input',
      message: 'By which parameter?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter which parameter!!!';
        }
        var done = this.async();
        done(null, true);
      }
    }, {
      type: 'confirm',
      name: 'ContinueBoolean',
      message: 'Do you have more resources?'
    }];
    // Will ask questions about api until user is finished
    promptMe(prompts, configOptions, function () {
      // console.log('done');
      cb();
    });
  }
});

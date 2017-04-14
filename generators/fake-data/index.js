'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var jsonSchemaFaker = require('json-schema-faker');
var fakerMapping = require('./faker-mapping.json');

module.exports = yeoman.extend({
  prompting: function () {
    var runningThrough = this.options.runningThrough;
    if (typeof runningThrough === 'undefined') {
      var availableResourceList = [];
      var apiPaths = this.config.getAll().JSONExtraction;
      var configOptions = this.config.getAll();
      apiPaths.forEach(function (apiPath) {
        var resource = {};
        resource.name = apiPath.resourceName;
        resource.value = {};
        resource.value.name = apiPath.resourceName;
        resource.value.schema = apiPath.jsonSchema;
        availableResourceList.push(resource);
      });
      var prompts = [{
        type: 'list',
        name: 'selectedResource',
        message: 'Please select a resource to generate fake data',
        choices: availableResourceList
      }, {
        name: 'recordsLimit',
        type: 'number',
        message: 'How many records would you like to have?'
      }];

      return this.prompt(prompts).then(function (props) {
        // console.log('props APP', props);
        updateJsonSchemaForTestData(props.selectedResource.schema, function (updatedJsonSchema) {
          var jsonObj = updatedJsonSchema;
          var versionNumber = null;
          if (configOptions.detail.versioning.enabled) {
            versionNumber = configOptions.detail.versioning.versionNumber[0];
          }
          createJson(props.selectedResource.name, props.recordsLimit, jsonObj, versionNumber);
        });
      });
    }
  },
  end: function () {
    var runningThrough = this.options.runningThrough;
    var configOptions = this.config.getAll();
    if (runningThrough === 'generator') {
      var cb = this.async();
      createFakeData(configOptions, cb);
    } else if (runningThrough === 'AddResource') {
      var apiPath = this.options.apiPath;
      var apiFakerMappingFileLocation = null;
      if (typeof apiPath.apiFakerMappingFileProvided !== 'undefined' && apiPath.apiFakerMappingFileProvided) {
      // console.log('++++++++++++++++++++++++++++++++', apiPath.apiFakerMappingJsonType);
        if (apiPath.apiFakerMappingJsonType === 'Mapping File') {
          // fs.readFileSync(path.resolve(props.jsonFilePath), 'utf8');
          fakerMapping = fs.readFileSync(path.resolve(apiPath.apiFakerMappingFileLocation), 'utf8');
          // console.log('++++++++++++++++++++++++++++++++', JSON.stringify(fakerMapping));
          updateJsonSchemaForTestData(apiPath.jsonSchema, function (updatedJsonSchema) {
            var jsonObj = updatedJsonSchema;
            var versionNumber = null;
            if (configOptions.detail.versioning.enabled) {
              versionNumber = configOptions.detail.versioning.versionNumber[0];
            }
            createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
          });
        } else if (apiPath.apiFakerMappingJsonType === 'Data Schema') {
          var jsonObj = JSON.parse(fs.readFileSync(path.resolve(apiPath.apiFakerMappingFileLocation), 'utf8'));
          // console.log('++++++++++++++++++++++++++++++++', JSON.stringify(jsonObj));
          var versionNumber = null;
          if (configOptions.detail.versioning.enabled) {
            versionNumber = configOptions.detail.versioning.versionNumber[0];
          }
          createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
        }
      } else {
        updateJsonSchemaForTestData(apiPath.jsonSchema, function (updatedJsonSchema) {
          var jsonObj = updatedJsonSchema;
          var versionNumber = null;
          if (configOptions.detail.versioning.enabled) {
            versionNumber = configOptions.detail.versioning.versionNumber[0];
          }
          createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
        });
      }
    } else {
      cb();
    }
  }
});

var createFakeData = function (options, cb) {
  var apiPaths = options.JSONExtraction;
  apiPaths.forEach(function (apiPath) {
    if (apiPath.requireTestDataType === 'Test Data') {
      var apiFakerMappingFileLocation = null;
      if (typeof apiPath.apiFakerMappingFileProvided !== 'undefined' && apiPath.apiFakerMappingFileProvided) {
      // console.log('++++++++++++++++++++++++++++++++', apiPath.apiFakerMappingJsonType);
        if (apiPath.apiFakerMappingJsonType === 'Mapping File') {
          // fs.readFileSync(path.resolve(props.jsonFilePath), 'utf8');
          fakerMapping = fs.readFileSync(path.resolve(apiPath.apiFakerMappingFileLocation), 'utf8');
          // console.log('++++++++++++++++++++++++++++++++', JSON.stringify(fakerMapping));
          updateJsonSchemaForTestData(apiPath.jsonSchema, function (updatedJsonSchema) {
            var jsonObj = updatedJsonSchema;
            var versionNumber = null;
            if (options.detail.versioning.enabled) {
              versionNumber = options.detail.versioning.versionNumber[0];
            }
            createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
            /* if (options.detail.versioning.enabled) {
              createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, options.detail.versioning.versionNumber[0], options.deploy.apiApplicationType);
            } else {
              createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, null, options.deploy.apiApplicationType);
            } */
          });
        } else if (apiPath.apiFakerMappingJsonType === 'Data Schema') {
          var jsonObj = JSON.parse(fs.readFileSync(path.resolve(apiPath.apiFakerMappingFileLocation), 'utf8'));
          // console.log('++++++++++++++++++++++++++++++++', JSON.stringify(jsonObj));
          var versionNumber = null;
          if (options.detail.versioning.enabled) {
            versionNumber = options.detail.versioning.versionNumber[0];
          }
          createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
        }
      } else {
        updateJsonSchemaForTestData(apiPath.jsonSchema, function (updatedJsonSchema) {
          var jsonObj = updatedJsonSchema;
          var versionNumber = null;
          if (options.detail.versioning.enabled) {
            versionNumber = options.detail.versioning.versionNumber[0];
          }
          createJson(apiPath.resourceName, apiPath.recordsLimit, jsonObj, versionNumber);
        });
      }
    }
  });
  cb();
};

var updateJsonSchemaForTestData = function (inputSchema, cb) {
  var jsonObj = inputSchema;
  var jsonProperties = {};
  var keys = [];
  if (jsonObj.type === 'array') {
    jsonProperties = jsonObj.items.properties;
    keys = Object.keys(jsonObj.items.properties);
  } else if (jsonObj.type === 'object') {
    jsonProperties = jsonObj.properties;
    keys = Object.keys(jsonObj.properties);
  }
  if (keys.length > 0) {
    keys.forEach(function (key) {
      if(jsonProperties[key]['type'] === 'array' || jsonProperties[key]['type'] === 'object'){
        var subKeys = [];
        if(jsonProperties[key]['type'] === 'array'){
          if(jsonProperties[key]['items']['type'] === 'undefined'){
            subKeys = Object.keys(jsonProperties[key]['items']['properties']);
          }
        }else if(jsonProperties[key]['type'] === 'object'){
          subKeys = Object.keys(jsonProperties[key]['properties']);
        }
        if (subKeys.length > 0) {
          subKeys.forEach(function (subKey) {
            var subKeyLowerCase = subKey.toLowerCase();
            if (fakerMapping[subKeyLowerCase] !== undefined) {
              if (jsonObj.type === 'array') {
                if(jsonProperties[key]['type'] === 'array'){
                  if(jsonProperties[key]['items']['type'] === 'undefined'){
                  }
                  jsonObj.items.properties[key]['items']['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                }else if(jsonProperties[key]['type'] === 'object'){
                  jsonObj.items.properties[key]['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                }
              } else if (jsonObj.type === 'object') {
                if(jsonProperties[key]['type'] === 'array'){
                  jsonObj.properties[key]['items']['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                }else if(jsonProperties[key]['type'] === 'object'){
                  jsonObj.properties[key]['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                }
              }
            }
          });
          if (jsonObj.type === 'array') {
            jsonObj.items.properties[key]['required']=subKeys;
          } else if (jsonObj.type === 'object') {
            jsonObj.properties[key]['required'] = subKeys;
          }
        }
      } else {
        var keyLowerCase = key.toLowerCase();
        if (keyLowerCase === 'age') {
          if (jsonObj.type === 'array') {
            jsonObj.items.properties[key]['maximum'] = 150;
            jsonObj.items.properties[key]['minimum'] = 0;
          } else if (jsonObj.type === 'object') {
            jsonObj.properties[key]['maximum'] = 150;
            jsonObj.properties[key]['minimum'] = 0;
          }
        }
        if (fakerMapping[keyLowerCase] !== undefined) {
          if (jsonObj.type === 'array') {
            jsonObj.items.properties[key]['faker'] = fakerMapping[keyLowerCase];
          } else if (jsonObj.type === 'object') {
            jsonObj.properties[key]['faker'] = fakerMapping[keyLowerCase];
          }
        }
      }
    });
    jsonObj.required = keys;
  }
  cb(jsonObj);
};

var createJson = function (resourceName, numberOfRecords, schemaObj, versionNumber) {
  var inputJSONArray = [];
  for (var i = 0; i < numberOfRecords; i++) {
    var inputJSON = jsonSchemaFaker(schemaObj);
    inputJSONArray.push(inputJSON);
    if (i === (numberOfRecords - 1)) {
      var sampleDataFolderLocation = './sampleData/';
      if (!fs.existsSync(sampleDataFolderLocation)) {
        fs.mkdirSync(sampleDataFolderLocation);
      }
      if (versionNumber !== null) {
        sampleDataFolderLocation = sampleDataFolderLocation + '/' + versionNumber + '/';
        if (!fs.existsSync(sampleDataFolderLocation)) {
          fs.mkdirSync(sampleDataFolderLocation);
        }
      }
      var path = sampleDataFolderLocation + capitalizeFirstLetter(resourceName) + '.json';
      fs.writeFile(path, JSON.stringify(inputJSONArray), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('Fake Data has been generated for resource ' + resourceName + '!');
      });
    }
  }
};

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

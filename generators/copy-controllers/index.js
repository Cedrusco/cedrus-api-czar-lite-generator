'use strict';
var yeoman = require('yeoman-generator');
var del = require('del');
var controllerInfo, versioningInfo;

module.exports = yeoman.extend({
  prompting: function () {
    console.log('Inside copy controllers');
  },
  end: function () {
    var configOptions = this.config.getAll();
    var apiPaths = configOptions.JSONExtraction;
    var thisFunc = this;
    apiPaths.forEach(function (apiPath) {
      var controllersFolder = './controllers/';
      /*
      Gather Information
      */
      controllerInfo = {
        resourceName: capitalizeFirstLetter(apiPath.resourceName),
        httpMethods: apiPath.httpMethods,
        requireQuery: apiPath.requireQuery ? apiPath.requireQuery : null,
        dataType: apiPath.requireTestDataType
      };
      if (configOptions.detail.versioning.enabled) {
        versioningInfo = {
          versioning: configOptions.detail.versioning.enabled,
          versionNumber: configOptions.detail.versioning.versionNumber[0],
          versionType: configOptions.detail.versioning.type,
          customizeVersionSettings: configOptions.detail.versioning.type === 'content-type' ? configOptions.detail.versioning.contentTypeOrder : configOptions.detail.versioning.customHeaderName
        };
      } else {
        versioningInfo = {
          versioning: configOptions.detail.versioning.enabled,
          versionNumber: null,
          versionType: null,
          customizeVersionSettings: null
        };
      }

      /*
      Creating folder for versioning
      */
      if (configOptions.detail.versioning.enabled) {
        controllersFolder = './controllers/' + configOptions.detail.versioning.versionNumber[0] + '/';
      }
      /*
      Setup for Test Data
      */
      if (apiPath.requireTestDataType === 'Test Data') {
        del(['./controllers/' + capitalizeFirstLetter(apiPath.resourceName) + '.js', './controllers/' + capitalizeFirstLetter(apiPath.resourceName) + 'Service.js'], {force: true}).then(paths => {
          console.log('Files and folders that would be deleted:\n', paths.join('\n'));
          thisFunc.fs.copyTpl(
            thisFunc.templatePath('resource.js'),
            thisFunc.destinationPath(controllersFolder + capitalizeFirstLetter(apiPath.resourceName) + '.js'), {
              resourceName: capitalizeFirstLetter(apiPath.resourceName),
              httpMethods: apiPath.httpMethods,
              requireQuery: apiPath.requireQuery
            });
          /*
          Add Extra Options
          */
          controllerInfo.versioningInfo = versioningInfo;
          thisFunc.fs.copyTpl(
              thisFunc.templatePath('resourceService.js'),
              thisFunc.destinationPath(controllersFolder + capitalizeFirstLetter(apiPath.resourceName) + 'Service.js'), controllerInfo);
        });
      }
    });
  }
});

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

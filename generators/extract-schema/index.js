'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');

module.exports = yeoman.extend({
  prompting: function () {
  },
  end: function () {
    var cb = this.async();
    var configOptions = this.config.getAll();
    createJsonFiles(configOptions, cb);
  }
});

var createJsonFiles = function (options, cb) {
  var apiArray = options.JSONExtraction;
  if (!fs.existsSync('schemaFiles/')) {
    fs.mkdirSync('schemaFiles/');
  }
  //fs.mkdirSync('schemaFiles/');
  for (var i = 0; i < apiArray.length; i++) {
    fs.writeFile(('schemaFiles/' + apiArray[i].resourceName + '.json'), JSON.stringify(apiArray[i].jsonSchema), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Schema file is saved!');
      cb();
    });
  }
};

'use strict';
<% if (dataType === 'Test Data') { -%>
  <% if (versioningInfo.versioning) { -%>
var <%= resourceName %>FD = require('../../sampleData/<%= versioningInfo.versionNumber %>/<%= resourceName %>.json');
  <% }else{ -%>
var <%= resourceName %>FD = require('../sampleData/<%= resourceName %>.json');
  <% } -%>
var <%= resourceName %>Data = <%= resourceName %>FD;
<% } else { -%>
var <%= resourceName %>Data = {};
    <%= resourceName %>Data = [{}];
<% } -%>

<% if (httpMethods) { -%>
<% httpMethods.forEach(function(method){-%>
<% if (method === 'delete') { -%>

exports.delete<%= resourceName %> = function(args, res, next) {
/**
* Deletes all customers from the system that the user has access to
*
**/
  if (Object.keys(<%= resourceName %>Data).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
  } else {
      res.end();
  }
}
<% } -%>
<% if (method === 'get') { -%>

exports.get<%= resourceName %> = function(args, res, next) {
/**
 * Gets all customers from the system that the user has access to
 *
 * returns List
 **/
  if (Object.keys(<%= resourceName %>Data).length > 0) {
      <% if (versioningInfo.versionType === 'content-type') { -%>
      <% if (versioningInfo.customizeVersionSettings === 'applicationFirst') { -%>
      res.setHeader('Content-Type', 'application/json+<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', '<%= versioningInfo.versionNumber %>+application/json');
      <% } -%>
      <% } else if (versioningInfo.versionType === 'custom-header') { -%>
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('<%= versioningInfo.customizeVersionSettings %>', '<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', 'application/json');
      <% } -%> 
      res.end(JSON.stringify(<%= resourceName %>Data));
  } else {
      res.end();
  }
}
<% } -%>
<% if (method === 'patch') { -%>

exports.patch<%= resourceName %> = function(args, res, next) {
/**
 * Patchs all customers from the system that the user has access to
 *
 **/
  if (Object.keys(<%= resourceName %>Data).length > 0) {
      <% if (versioningInfo.versionType === 'content-type') { -%>
      <% if (versioningInfo.customizeVersionSettings === 'applicationFirst') { -%>
      res.setHeader('Content-Type', 'application/json+<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', '<%= versioningInfo.versionNumber %>+application/json');
      <% } -%>
      <% } else if (versioningInfo.versionType === 'custom-header') { -%>
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('<%= versioningInfo.customizeVersionSettings %>', '<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', 'application/json');
      <% } -%>
      res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
  } else {
      res.end();
  }
}
<% } -%>

<% if (method === 'post') { -%>

exports.post<%= resourceName %> = function(args, res, next) {
/**
 * Posts all customers from the system that the user has access to
 *
 **/
  if (Object.keys(<%= resourceName %>Data).length > 0) {
      <% if (versioningInfo.versionType === 'content-type') { -%>
      <% if (versioningInfo.customizeVersionSettings === 'applicationFirst') { -%>
      res.setHeader('Content-Type', 'application/json+<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', '<%= versioningInfo.versionNumber %>+application/json');
      <% } -%>
      <% } else if (versioningInfo.versionType === 'custom-header') { -%>
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('<%= versioningInfo.customizeVersionSettings %>', '<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', 'application/json');
      <% } -%>
      res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
  } else {
      res.end();
  }
}
<% } -%>

<% if (method === 'put') { -%>

exports.put<%= resourceName %> = function(args, res, next) {
/**
 * Puts all customers from the system that the user has access to
 *
 **/
  if (Object.keys(<%= resourceName %>Data).length > 0) {
      <% if (versioningInfo.versionType === 'content-type') { -%>
      <% if (versioningInfo.customizeVersionSettings === 'applicationFirst') { -%>
      res.setHeader('Content-Type', 'application/json+<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', '<%= versioningInfo.versionNumber %>+application/json');
      <% } -%>
      <% } else if (versioningInfo.versionType === 'custom-header') { -%>
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('<%= versioningInfo.customizeVersionSettings %>', '<%= versioningInfo.versionNumber %>');
      <% } else { -%>
      res.setHeader('Content-Type', 'application/json');
      <% } -%>
      res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
  } else {
      res.end();
  }
}
<% } -%>
<%}) -%>
<% } -%>
<% if (requireQuery) { -%>
exports.query<%= resourceName %> = function (args, res, next) {
    <% if (dataType === 'CloudantDB Data') { -%>
    <% } else if (dataType === 'MongoDB Data') { -%>
    <% }else{ -%>
    if (Object.keys(<%= resourceName %>Data).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
    }else{
      res.end(JSON.stringify(<%= resourceName %>Data));
    }
    <% } -%>
};
<% } -%>

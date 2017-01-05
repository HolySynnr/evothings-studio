/*
File: file-util.js
Description: File helper functions.
Author: Mikael Kindborg

License:

Copyright (c) 2013 Mikael Kindborg

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var PATH = require('path')
var URL = require('url')
var HTTP = require('http')
var FS = require('fs')

exports.readFileSync = function(path, options)
{
	try
	{
		return FS.readFileSync(path, options || {encoding: 'utf8'})
	}
	catch (err)
	{
		return null
	}
}

exports.writeFileSync = function(path, data, options)
{
	try
	{
		return FS.writeFileSync(path, data, options || {encoding: 'utf8'})
	}
	catch (err)
	{
		return null
	}
}

exports.pathExists = function(path) {
  // This is the new style of checking if a path exists
  try {
    FS.accessSync(path, FS.F_OK);
    return true
  } catch (e) {
    return null
  }
}

exports.statSync = function(path) {
	// This is the older style of checking if a path exists
	try {
		return FS.statSync(path)
	} catch (err) {
		return null
	}
}

exports.isPathAbsolute = function(path)
{
	// Check for Linux, OS X, and Windows.
	return (path[0] === '/') || (path[0] === PATH.sep) || (path[1] === ':')
}

// Note: Case insensitive.
exports.stringEndsWith = function(aString, subString)
{
	return subString.toLowerCase() == aString.toLowerCase().substr(-(subString.length))
}

exports.fileIsHTML = function(path)
{
	return exports.stringEndsWith(path, '.html') || exports.stringEndsWith(path, '.htm')
}

exports.fileIsDirectory = function(path)
{
	var stat = FS.statSync(path)
	return stat.isDirectory()
}

exports.directoryHasEvothingsJson = function(path)
{
	var jsonPath = PATH.join(path, 'evothings.json')
	var stat = exports.statSync(jsonPath)
	return !!stat
}

exports.fileIsEvothingsSettings = function(path)
{
	return exports.stringEndsWith(path, 'evothings.json')
}

// If path is an HTML file return the directory, else return path,
// assuming it is a directory.
exports.getAppDirectory = function(path)
{
	return exports.fileIsHTML(path) ? PATH.dirname(path) : path
}

// Download a document as a text string.
// callbackFun(resultCode, dataOrError)
// On error, resultCode is -1, on success the HTTP status code.
exports.downloadAsString = function(url, userAgent, callbackFun)
{
	uri = URL.parse(url);
	HTTP.get(
		{
			hostname:uri.hostname,
			path:uri.path,
			headers:{'user-agent':userAgent}
		},
		function(response)
		{
			response.setEncoding('utf8')
			var data = ''
			response.on('data', function (chunk)
			{
				data += chunk
			})
			response.on('end', function ()
			{
				callbackFun(response.statusCode, data)
			})
		}).on('error', function(err)
		{
			callbackFun(-1, err.message)
		})
}

exports.getEvothingsHomePath = function() {
	var evothingsHome
	try	{
		var home = exports.getHomeDir()
		if (home) {
			evothingsHome =	PATH.join(home, 'Evothings')
		}
	} catch (error) {
		HYPER.log('[fileutil.js] Failed to get Evothings home path')
	}
	return evothingsHome
}

exports.getOldEvothingsHomePath = function() {
	var evothingsHome
	try	{
		var home = exports.getHomeDir()
		if (home) {
			evothingsHome =	PATH.join(home, 'EvothingsStudio')
		}
	} catch (error) {
		HYPER.log('[fileutil.js] Failed to get old Evothings home path')
	}
	return evothingsHome
}

exports.getEvothingsMyAppsPath = function() {
	var myAppsDir
	try	{
		var home = exports.getEvothingsHomePath()
		if (home) {
			myAppsDir =	PATH.join(home, 'MyApps')
		}
	}
	catch (error)
	{
		HYPER.log('[fileutil.js] Failed to get MyApps path')
	}
	return myAppsDir
}

// Copied from https://github.com/sindresorhus/os-homedir
exports.getHomeDir = function() {
	var env = process.env;
	var home = env.HOME;
	var user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
	if (process.platform === 'win32') {
		return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null;
	}
	if (process.platform === 'darwin') {
		return home || (user ? '/Users/' + user : null);
	}
	if (process.platform === 'linux') {
		return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null));
	}
	return home || null;
}
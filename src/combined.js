(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":3}],2:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],4:[function(require,module,exports){
(function (process,Buffer){
var req = require('request')

module.exports = Nets

function Nets (opts, cb) {
  if (typeof opts === 'string') opts = { uri: opts }

  // in node, if encoding === null then response will be a Buffer. we want this to be the default
  if (!opts.hasOwnProperty('encoding')) opts.encoding = null

  // in browser, we should by default convert the arraybuffer into a Buffer
  if (process.browser && !opts.hasOwnProperty('json') && opts.encoding === null) {
    opts.responseType = 'arraybuffer'
    var originalCb = cb
    cb = bufferify
  }

  function bufferify (err, resp, body) {
    if (body) body = new Buffer(new Uint8Array(body))
    originalCb(err, resp, body)
  }

  return req(opts, cb)
}

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":28,"buffer":25,"request":7}],5:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":1,"trim":6}],6:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],7:[function(require,module,exports){
"use strict";
var window = require("global/window")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}

},{"global/window":2,"is-function":3,"parse-headers":5,"xtend":8}],8:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],9:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
ActivitySearch = function ActivitySearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

ActivitySearch.prototype.getTypes = function(activityUnit, page, pageSize, orderBy, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    activityUnit ? params['activity_unit'] = activityUnit : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pharmacology/filters/activities?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.getUnits = function(activityType, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    var unitsURL = null;
    activityType != null ? unitsURL = '/pharmacology/filters/units/' + activityType : unitsURL = '/pharmacology/filters/units';
    Utils.nets({
        url: this.baseURL + unitsURL + '?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.getAllUnits = function(page, pageSize, orderBy, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    Utils.nets({
        url: this.baseURL + '/pharmacology/filters/units?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.parseTypes = function(response) {
    var activityTypes = [];
	    Utils.arrayify(response.items).forEach(function(item, i) {
          activityTypes.push({uri: item["_about"], label: item.label});
	    });
	return activityTypes;
}

ActivitySearch.prototype.parseUnits = function(response) {
    var units = [];
	response.primaryTopic.unit.forEach(function(type, i) {
            units.push({uri: type["_about"], label: type.label});
	});
	return units;
}

ActivitySearch.prototype.parseAllUnits = function(response) {
    var units = [];
	response.items.forEach(function(item, i) {
            units.push({uri: item["_about"], label: item.label});
	});
	return units;
}

exports.ActivitySearch = ActivitySearch;

},{"./Constants":12,"./Utils":22,"nets":4}],10:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
CompoundSearch = function CompoundSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var compoundResult = searcher.parseCompoundResponse(response);
 * };
 * searcher.fetchCompound('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, callback);
 */
CompoundSearch.prototype.fetchCompound = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/compound?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch the compounds matching the list of URIs provided.
 * @param {Array} URIList - An array of URIs for the compounds of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var compoundResults = searcher.parseCompoundBatchResponse(response);
 * };
 * searcher.fetchCompoundBatch(['http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', 'http://www.conceptwiki.org/concept/dd758846-1dac-4f0d-a329-06af9a7fa413'], null, callback);
 */
CompoundSearch.prototype.fetchCompoundBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/compound/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Count the number of compounds classified with the class represented by the URI provided.
 * @param {string} URI - The URI for the class of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var result = searcher.parseCompoundClassMembersCountResponse(response);
 * };
 * searcher.compoundClassMembersCount('http://purl.obolibrary.org/obo/CHEBI_24431', null, callback);
 */
CompoundSearch.prototype.compoundClassMembersCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/compound/members/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch compounds for the class represented by the URI provided.
 * @param {string} URI - The URI for the compound class of interest
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var classMembersResult == searcher.parseCompoundClassMembersResponse(response);
 * };
 * searcher.compoundClassMembers('http://purl.obolibrary.org/obo/CHEBI_24431', 1, 20, null, null, callback);
 */
CompoundSearch.prototype.compoundClassMembers = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';

    Utils.nets({
        url: this.baseURL + '/compound/members/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch pharmacology records for the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseCompoundPharmacologyResponse(response);
 * };
 * searcher.compoundPharmacology('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 20, null, null, callback);
 */
CompoundSearch.prototype.compoundPharmacology = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';

    Utils.nets({
        url: this.baseURL + '/compound/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch a count of the pharmacology records belonging to the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseCompoundPharmacologyCountResponse(response);
 * };
 * searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, callback);
 */
CompoundSearch.prototype.compoundPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    lens ? params['_lens'] = lens : '';

    Utils.nets({
        url: this.baseURL + '/compound/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * The classes the given compound URI has been classified with eg ChEBI
 * @param {string} URI - The URI for the compound of interest
 * @param {string} tree - Restrict results by hierarchy eg chebi
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 */
CompoundSearch.prototype.compoundClassifications = function(URI, tree, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    params['tree'] = tree;

    Utils.nets({
        url: this.baseURL + '/compound/classifications?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompound}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompound}
 * @returns {FetchCompoundResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundResponse = function(response) {
    var constants = new Constants();
    var drugbankData = {},
        chemspiderData = {},
        chemblData = {},
        conceptWikiData = {};
    var URI = response.primaryTopic[constants.ABOUT];
    var id = URI.split("/").pop();
    var me = this;
    if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankData = me.parseDrugbankBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemspiderValue') {
        chemspiderData = me.parseChemspiderBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemblValue') {
        chemblData = me.parseChemblBlock(response.primaryTopic);
        //TODO more than 1 chembl block possible?
        //chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiData = me.parseConceptwikiBlock(response.primaryTopic);
    }
    Utils.arrayify(response.primaryTopic.exactMatch).forEach(function(match, i, allValues) {
        var src = match[constants.IN_DATASET];
        if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
            drugbankData = me.parseDrugbankBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
            chemspiderData = me.parseChemspiderBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
            chemblData = me.parseChemblBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
            conceptWikiData = me.parseConceptwikiBlock(match);
        }
    });
    return {
        "id": id,
        "cwURI": conceptWikiData.URI != null ? conceptWikiData.URI : null,
        "prefLabel": conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : null,
        "URI": URI,
        "description": drugbankData.description != null ? drugbankData.description : null,
        "biotransformationItem": drugbankData.biotransformationItem != null ? drugbankData.description : null,
        "toxicity": drugbankData.toxicity != null ? drugbankData.toxicity : null,
        "proteinBinding": drugbankData.proteinBinding != null ? drugbankData.proteinBinding : null,
        "drugbankURI": drugbankData.URI != null ? drugbankData.URI : null,
        "csURI": chemspiderData.URI != null ? chemspiderData.URI : null,
        "hba": chemspiderData.hba != null ? chemspiderData.hba : null,
        "hbd": chemspiderData.hbd != null ? chemspiderData.hbd : null,
        "inchi": chemspiderData.inchi != null ? chemspiderData.inchi : null,
        "logp": chemspiderData.logp != null ? chemspiderData.logp : null,
        "psa": chemspiderData.psa != null ? chemspiderData.psa : null,
        "ro5Violations": chemspiderData.ro5Violations != null ? chemspiderData.ro5Violations : null,
        "smiles": chemspiderData.smiles != null ? chemspiderData.smiles : null,
        "rtb": chemspiderData.rtb != null ? chemspiderData.rtb : null,
        "inchiKey": chemspiderData.inchiKey != null ? chemspiderData.inchiKey : null,
        "fullMWT": chemspiderData.fullMWT != null ? chemspiderData.fullMWT : null,
        "molform": chemspiderData.molform != null ? chemspiderData.molform : null,
        "chemblURI": chemblData.URI != null ? chemblData.URI : null,
        "mwFreebase": chemblData.mwFreebase != null ? chemblData.mwFreebase : null,

        "drugbankProvenance": drugbankData.drugbankProvenance != null ? drugbankData.drugbankProvenance : null,
        "chemspiderProvenance": chemspiderData.chemspiderProvenance != null ? chemspiderData.chemspiderProvenance : null,
        "chemblProvenance": chemblData.chemblProvenance != null ? chemblData.chemblProvenance : null,
        "conceptWikiProvenance": conceptWikiData.conceptwikiProvenance != null ? conceptWikiData.conceptwikiProvenance : null
    };
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompound} which have a lens applied
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompound}
 * @returns {FetchCompoundLensResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundLensResponse = function(response) {
    var constants = new Constants();
    var drugbankData, chemspiderData, chemblData, conceptWikiData;

    // There will be many different compounds due to the lens but at this stage there is no way of connecting
    // all the exactMatch blocks together. Later on we can use mapURI to link them
    var lensChemspider = [];
    var lensDrugbank = [];
    var lensCW = [];
    var lensChembl = [];
    var topLevelResponse = response.primaryTopic[constants.IN_DATASET];
    if (constants.SRC_CLS_MAPPINGS[topLevelResponse] === 'chemspiderValue') {
        var prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;

        csURI = response.primaryTopic["_about"] !== null ? response.primaryTopic["_about"] : csURI;
        hba = response.primaryTopic.hba != null ? response.primaryTopic.hba : hba;
        hbd = response.primaryTopic.hbd != null ? response.primaryTopic.hbd : hbd;
        inchi = response.primaryTopic.inchi != null ? response.primaryTopic.inchi : inchi;
        logp = response.primaryTopic.logp != null ? response.primaryTopic.logp : logp;
        psa = response.primaryTopic.psa != null ? response.primaryTopic.psa : psa;
        ro5Violations = response.primaryTopic.ro5_violations != null ? response.primaryTopic.ro5_violations : ro5Violations;
        smiles = response.primaryTopic.smiles != null ? response.primaryTopic.smiles : smiles;
        inchiKey = response.primaryTopic.inchikey != null ? response.primaryTopic.inchikey : inchikey;
        rtb = response.primaryTopic.rtb != null ? response.primaryTopic.rtb : rtb;
        fullMWT = response.primaryTopic.molweight != null ? response.primaryTopic.molweight : molweight;
        molform = response.primaryTopic.molformula != null ? response.primaryTopic.molformula : molformula;

        // provenance 
        chemspiderLinkOut = csURI;
        chemspiderProvenance = {};
        chemspiderProvenance['source'] = 'chemspider';
        chemspiderProvenance['hba'] = chemspiderLinkOut;
        chemspiderProvenance['hbd'] = chemspiderLinkOut;
        chemspiderProvenance['inchi'] = chemspiderLinkOut;
        chemspiderProvenance['logp'] = chemspiderLinkOut;
        chemspiderProvenance['psa'] = chemspiderLinkOut;
        chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
        chemspiderProvenance['smiles'] = chemspiderLinkOut;
        chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
        chemspiderProvenance['molform'] = chemspiderLinkOut;
        lensChemspider.push({
            "csURI": csURI,
            "hba": hba,
            "hbd": hbd,
            "inchi": inchi,
            "logp": logp,
            "psa": psa,
            "ro5Violations": ro5Violations,
            "smiles": smiles,
            "fullMWT": fullMWT,
            "molform": molform,
            "rtb": rtb,
            "inchiKey": inchiKey,
            "chemspiderProvenance": chemspiderProvenance
        })

    }
    response.primaryTopic.exactMatch.forEach(function(match, i, allMatches) {
        var src = match[constants.IN_DATASET];
        var prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;

        if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
            drugbankData = match;
            description = drugbankData.description != null ? drugbankData.description : description;
            biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
            toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
            proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
            drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

            // provenance
            drugbankLinkout = drugbankURI;
            drugbankProvenance = {};
            drugbankProvenance['source'] = 'drugbank';
            drugbankProvenance['description'] = drugbankLinkout;
            drugbankProvenance['biotransformation'] = drugbankLinkout;
            drugbankProvenance['toxicity'] = drugbankLinkout;
            drugbankProvenance['proteinBinding'] = drugbankLinkout;
            lensDrugbank.push({
                "description": description,
                "biotransformationItem": biotransformationItem,
                "toxicity": toxicity,
                "proteinBinding": proteinBinding,
                "drugbankURI": drugbankURI,
                "drugbankProvenance": drugbankProvenance
            });

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
            chemspiderData = match;
            csURI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : csURI;
            hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
            hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
            inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
            logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
            psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
            ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
            smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
            inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : inchikey;
            rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
            fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : molweight;
            molform = chemspiderData.molformula != null ? chemspiderData.molformula : molformula;

            // provenance 
            chemspiderLinkOut = csURI;
            chemspiderProvenance = {};
            chemspiderProvenance['source'] = 'chemspider';
            chemspiderProvenance['hba'] = chemspiderLinkOut;
            chemspiderProvenance['hbd'] = chemspiderLinkOut;
            chemspiderProvenance['inchi'] = chemspiderLinkOut;
            chemspiderProvenance['logp'] = chemspiderLinkOut;
            chemspiderProvenance['psa'] = chemspiderLinkOut;
            chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
            chemspiderProvenance['smiles'] = chemspiderLinkOut;
            chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
            chemspiderProvenance['molform'] = chemspiderLinkOut;
            lensChemspider.push({
                "csURI": csURI,
                "hba": hba,
                "hbd": hbd,
                "inchi": inchi,
                "logp": logp,
                "psa": psa,
                "ro5Violations": ro5Violations,
                "smiles": smiles,
                "fullMWT": fullMWT,
                "molform": molform,
                "rtb": rtb,
                "inchiKey": inchiKey,
                "chemspiderProvenance": chemspiderProvenance
            })

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
            chemblData = match;
            chemblURI = chemblData["_about"] != null ? chemblData["_about"] : chemblURI;
            mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

            // provenance
            chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblURI.split("/").pop();
            chemblProvenance = {};
            chemblProvenance['source'] = 'chembl';
            chemblProvenance['fullMWT'] = chemblLinkOut;
            chemblProvenance['mwFreebase'] = chemblLinkOut;
            chemblProvenance['rtb'] = chemblLinkOut;
            lensChembl.push({
                "chemblURI": chemblURI,
                "chemblProvenance": chemblProvenance
            });

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
            conceptWikiData = match;
            prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
            cwURI = conceptWikiData["_about"] != null ? conceptWikiData["_about"] : cwURI;
            lensCW.push({
                "cwURI": cwURI,
                "prefLabel": prefLabel
            });

        }
    });
    return {
        "lensChemspider": lensChemspider,
        "lensDrugbank": lensDrugbank,
        "lensChembl": lensChembl,
        "lensCW": lensCW
    };
}

CompoundSearch.prototype.parseDrugbankBlock = function(drugbankBlock) {
    var constants = new Constants();
    var URI = null,
        description = null,
        biotransformationItem = null,
        toxicity = null,
        proteinBinding = null,
        drugbankData = null,
        drugbankProvenance = {},
        drugbankLinkout = null;

    drugbankData = drugbankBlock;
    URI = drugbankData[constants.ABOUT] !== null ? drugbankData[constants.ABOUT] : null;
    description = drugbankData.description != null ? drugbankData.description : description;
    biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
    toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
    proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
    drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

    // provenance
    drugbankLinkout = URI;
    drugbankProvenance['source'] = 'drugbank';
    drugbankProvenance['description'] = drugbankLinkout;
    drugbankProvenance['biotransformation'] = drugbankLinkout;
    drugbankProvenance['toxicity'] = drugbankLinkout;
    drugbankProvenance['proteinBinding'] = drugbankLinkout;
    return {
        "description": description,
        "biotransformationItem": biotransformationItem,
        "toxicity": toxicity,
        "proteinBinding": proteinBinding,
        "URI": drugbankURI,
        "drugbankProvenance": drugbankProvenance,
    };

}

CompoundSearch.prototype.parseChemspiderBlock = function(chemspiderBlock) {
    var constants = new Constants();
    var URI = null,
        hba = null,
        hbd = null,
        inchi = null,
        logp = null,
        psa = null,
        ro5Violations = null,
        smiles = null,
        fullMWT = null,
        molform = null,
        rtb = null,
        inchiKey = null,
        molform = null;
    var chemspiderData = chemspiderBlock;
    var chemspiderProvenance = {};
    var chemspiderLinkOut = null;

    URI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : URI;
    hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
    hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
    inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
    logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
    psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
    ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
    smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
    inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : null;
    rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
    fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : null;
    molform = chemspiderData.molformula != null ? chemspiderData.molformula : null;

    // provenance 
    chemspiderLinkOut = URI;
    chemspiderProvenance = {};
    chemspiderProvenance['source'] = 'chemspider';
    chemspiderProvenance['hba'] = chemspiderLinkOut;
    chemspiderProvenance['hbd'] = chemspiderLinkOut;
    chemspiderProvenance['inchi'] = chemspiderLinkOut;
    chemspiderProvenance['logp'] = chemspiderLinkOut;
    chemspiderProvenance['psa'] = chemspiderLinkOut;
    chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
    chemspiderProvenance['smiles'] = chemspiderLinkOut;
    chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
    chemspiderProvenance['molform'] = chemspiderLinkOut;
    return {
        "URI": URI,
        "hba": hba,
        "hbd": hbd,
        "inchi": inchi,
        "logp": logp,
        "psa": psa,
        "ro5Violations": ro5Violations,
        "smiles": smiles,
        "fullMWT": fullMWT,
        "molform": molform,
        "rtb": rtb,
        "inchiKey": inchiKey,
        "chemspiderProvenance": chemspiderProvenance
    };

}

CompoundSearch.prototype.parseChemblBlock = function(chemblBlock) {
    var constants = new Constants();
    var mwFreebase = null;
    var chemblData = chemblBlock;
    var URI = chemblData[constants.ABOUT];
    var chemblProvenance = null;
    var chemblLinkOut = null;

    mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

    // provenance
    chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + URI.split("/").pop();
    chemblProvenance = {};
    chemblProvenance['source'] = 'chembl';
    chemblProvenance['mwFreebase'] = chemblLinkOut;
    return {
        "URI": URI,
        "mwFreebase": mwFreebase,
        "chemblProvenance": chemblProvenance
    };
}

CompoundSearch.prototype.parseConceptwikiBlock = function(conceptwikiBlock) {
    var constants = new Constants();
    var conceptWikiData = conceptwikiBlock;
    var prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
    var URI = conceptWikiData[constants.ABOUT] != null ? conceptWikiData[constants.ABOUT] : cwURI;

    var conceptwikiProvenance = {};
    // provenance
    conceptwikiProvenance['source'] = 'conceptwiki';
    conceptwikiProvenance['prefLabel'] = URI;

    return {
        "URI": URI,
        "prefLabel": prefLabel,
        "conceptwikiProvenance": conceptwikiProvenance
    };


}

/**
 * Parse the results from {@link CompoundSearch#fetchCompoundBatch}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompoundBatch}
 * @returns {FetchCompoundBatchResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundBatchResponse = function(response) {
    var constants = new Constants();
    var compounds = [];
    response.items.forEach(function(item, index, items) {
        var id = null,
            prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;
        var drugbankData, chemspiderData, chemblData, conceptWikiData;
        var uri = item[constants.ABOUT];

        // check if we already have the CS URI
        var possibleURI = 'http://' + uri.split('/')[2];
        //var uriLink = document.createElement('a');
        //uriLink.href = uri;
        //var possibleURI = 'http://' + uriLink.hostname;
        csURI = constants.SRC_CLS_MAPPINGS[possibleURI] === 'chemspiderValue' ? uri : null;

        var drugbankProvenance, chemspiderProvenance, chemblProvenance;
        var descriptionItem, toxicityItem, proteinBindingItem, hbaItem, hbdItem, inchiItem, logpItem, psaItem, ro5VioloationsItem, smilesItem, inchiKeyItem, molformItem, fullMWTItem, mwFreebaseItem;
        var drugbankLinkout, chemspiderLinkOut, chemblLinkOut;

        // this id is not strictly true since we could have searched using a chemspider id etc
        id = uri.split("/").pop();
        prefLabel = item.prefLabel ? item.prefLabel : null;
        cwURI = constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] == 'conceptWikiValue' ? item[constants.ABOUT] : cwURI;
        //if an ops.rsc.org uri is used then the compound chemistry details are found in the top level
        hba = item.hba != null ? item.hba : null;
        hbd = item.hbd != null ? item.hbd : null;
        inchi = item.inchi != null ? item.inchi : null;
        inchiKey = item.inchikey != null ? item.inchikey : null;
        logp = item.logp != null ? item.logp : null;
        molform = item.molformula != null ? item.molformula : null;
        fullMWT = item.molweight != null ? item.molweight : null;
        psa = item.psa != null ? item.psa : null;
        ro5Violations = item.ro5_violations != null ? item.ro5_violations : null;
        rtb = item.rtb != null ? item.rtb : rtb;
        smiles = item.smiles != null ? item.smiles : null;
        if (Array.isArray(item.exactMatch)) {
            item.exactMatch.forEach(function(match, i, allValues) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                    drugbankData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    chemspiderData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
                    chemblData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    conceptWikiData = match;
                }
            });
        }
        if (drugbankData) {
            description = drugbankData.description != null ? drugbankData.description : description;
            biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
            toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
            proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
            drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

            // provenance
            drugbankLinkout = drugbankURI;
            drugbankProvenance = {};
            drugbankProvenance['source'] = 'drugbank';
            drugbankProvenance['description'] = drugbankLinkout;
            drugbankProvenance['biotransformation'] = drugbankLinkout;
            drugbankProvenance['toxicity'] = drugbankLinkout;
            drugbankProvenance['proteinBinding'] = drugbankLinkout;

        }
        if (chemspiderData) {
            csURI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : csURI;
            hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
            hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
            inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
            logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
            psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
            ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
            smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
            inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : inchikey;
            rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
            fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : molweight;
            molform = chemspiderData.molformula != null ? chemspiderData.molformula : molformula;

            // provenance 
            chemspiderLinkOut = csURI;
            chemspiderProvenance = {};
            chemspiderProvenance['source'] = 'chemspider';
            chemspiderProvenance['hba'] = chemspiderLinkOut;
            chemspiderProvenance['hbd'] = chemspiderLinkOut;
            chemspiderProvenance['inchi'] = chemspiderLinkOut;
            chemspiderProvenance['logp'] = chemspiderLinkOut;
            chemspiderProvenance['psa'] = chemspiderLinkOut;
            chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
            chemspiderProvenance['smiles'] = chemspiderLinkOut;
            chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
            chemspiderProvenance['molform'] = chemspiderLinkOut;

        }
        if (chemblData) {
            chemblURI = chemblData["_about"] != null ? chemblData["_about"] : chemblURI;
            mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

            // provenance
            chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblURI.split("/").pop();
            chemblProvenance = {};
            chemblProvenance['source'] = 'chembl';
            chemblProvenance['fullMWT'] = chemblLinkOut;
            chemblProvenance['mwFreebase'] = chemblLinkOut;
            chemblProvenance['rtb'] = chemblLinkOut;
        }
        if (conceptWikiData) {
            prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
            cwURI = conceptWikiData["_about"] != null ? conceptWikiData["_about"] : cwURI;
        }
        compounds.push({
            "id": id,
            "cwURI": cwURI,
            "prefLabel": prefLabel,
            "URI": uri,
            "description": description,
            "biotransformationItem": biotransformationItem,
            "toxicity": toxicity,
            "proteinBinding": proteinBinding,
            "csURI": csURI,
            "hba": hba,
            "hbd": hbd,
            "inchi": inchi,
            "logp": logp,
            "psa": psa,
            "ro5Violations": ro5Violations,
            "smiles": smiles,
            "chemblURI": chemblURI,
            "fullMWT": fullMWT,
            "molform": molform,
            "mwFreebase": mwFreebase,
            "rtb": rtb,
            "inchiKey": inchiKey,
            "drugbankURI": drugbankURI,

            "drugbankProvenance": drugbankProvenance,
            "chemspiderProvenance": chemspiderProvenance,
            "chemblProvenance": chemblProvenance

        });
    });
    return compounds;
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompoundPharmacology}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompoundPharmacology}
 * @returns {FetchCompoundPharmacologyResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundPharmacologyResponse = function(response) {
    var drugbankProvenance, chemspiderProvenance, chemblProvenance, conceptwikiProvenance;
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item[constants.ABOUT];
        var chembl_src = item[constants.IN_DATASET];
        // according to the API docs pmid can be an array but an array of what?
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        var activity_unit_block = item['activity_unit'];
        var activity_standard_units = activity_unit_block ? activity_unit_block.prefLabel : null;
        //var activity_standard_units = item['standardUnits'] ? item['standardUnits'] : null;
        var activity_standard_value = item['standardValue'] ? item['standardValue'] : null;
        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        //TODO seems to be some confusion about what the value is called
        var activity_activity_value = item['activity_value'] ? item['activity_value'] : null;
        var pChembl = item['pChembl'] ? item['pChembl'] : null;

        var compound_full_mwt_item = null;
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';
        var chembl_compound_uri = null;
        var compound_full_mwt = null;
        var em = null;
        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_smiles_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_pref_label_item = null;

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule[constants.ABOUT];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            //compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }
        //during testing there have been cases where em is null
        var chemblMolecule = em != null ? em[constants.ABOUT] : null;
        if (em != null) {
            // the exact match block may only have 1 entry
            Utils.arrayify(em).forEach(function(match, index, matches) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match[constants.ABOUT];
                    compound_pref_label = match[constants.PREF_LABEL];
                    compound_pref_label_item = cw_compound_uri;
                    cw_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match[constants.ABOUT];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match['molweight'] != null ? match['molweight'] : compound_full_mwt;
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_smiles_item = chemSpiderLink;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_full_mwt_item = chemSpiderLink;
                    cs_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                    drugbank_compound_uri = match[constants.ABOUT];
                    compound_drug_type = match['drugType'];
                    compound_generic_name = match['genericName'];
                    drugbank_src = match[constants.ABOUT];
                }
            });
        }

        var target_title_item = null,
            target_organism_item = null,
            activity_activity_type_item = null,
            activity_standard_value_item = null,
            activity_standard_units_item = null,
            activity_relation_item = null,
            assay_description = null,
            assay_description_item = null,
            assay_organism = null,
            assay_organism_src = null,
            assay_organism_item = null;
        var target_organism = {};
        var onAssay = item[constants.ON_ASSAY];
        if (onAssay != null) {
            var chembl_assay_uri = onAssay[constants.ABOUT];
            var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';
            assay_description = onAssay['description'];
            var chembleAssayLink = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description_item = chembleAssayLink;
            assay_organism = onAssay['assayOrganismName'] ? onAssay['assayOrganismName'] : null;
            assay_organism_item = chembleAssayLink;
            chemblProvenance['assayOrganism'] = chembleAssayLink;
            chemblProvenance['assayDescription'] = chembleAssayLink;

            var target = onAssay[constants.ON_TARGET];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.targetOrganismName != null ? target.targetOrganismName : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        }
        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        activity_activity_type_item = chemblActivityLink;
        activity_standard_value_item = chemblActivityLink;
        activity_standard_units_item = chemblActivityLink;
        activity_relation_item = chemblActivityLink;
        records.push({
            //for compound
            compoundInchikey: compound_inchikey,
            compoundDrugType: compound_drug_type,
            compoundGenericName: compound_generic_name,
            compoundInchikeySrc: cs_src,
            compoundDrugTypeSrc: drugbank_src,
            compoundGenericNameSrc: drugbank_src,
            targetTitleSrc: chembl_src,
            //for target
            chemblActivityUri: chembl_activity_uri,
            chemblCompoundUri: chembl_compound_uri,
            compoundFullMwt: compound_full_mwt,
            cwCompoundUri: cw_compound_uri,
            compoundPrefLabel: compound_pref_label,
            csCompoundUri: cs_compound_uri,
            csid: csid,
            compoundInchi: compound_inchi,
            compoundSmiles: compound_smiles,
            chemblAssayUri: chembl_assay_uri,
            targetTitle: target_title,
	    targetOrganismName: target_organism_name,
	    targetComponents: target_components,
	    targetURI: target_uri,
	    targetProvenance: target_provenance,
            assayOrganism: assay_organism,
            assayDescription: assay_description,
            activityRelation: activity_relation,
            activityStandardUnits: activity_standard_units,
            activityStandardValue: activity_standard_value,
            activityActivityType: activity_activity_type,
            activityValue: activity_activity_value,

            compoundFullMwtSrc: chembl_src,
            compoundPrefLabel_src: cw_src,
            compoundInchiSrc: cs_src,
            compoundSmilesSrc: cs_src,
            targetOrganismSrc: chembl_src,
            assayOrganismSrc: chembl_src,
            assayDescriptionSrc: chembl_src,
            activityRelationSrc: chembl_src,
            activityStandardUnitsSrc: chembl_src,
            activityStandardValueSrc: chembl_src,
            activityActivityTypeSrc: chembl_src,
            activityPubmedId: activity_pubmed_id,
            assayDescriptionItem: assay_description_item,
            assayOrganismItem: assay_organism_item,
            activityActivityTypeItem: activity_activity_type_item,
            activityRelationItem: activity_relation_item,
            activityStandardValueItem: activity_standard_value_item,
            activityStandardUnitsItem: activity_standard_units_item,
            compoundFullMwtItem: compound_full_mwt_item,
            compoundSmilesItem: compound_smiles_item,
            compoundInchiItem: compound_inchi_item,
            compoundInchikeyItem: compound_inchikey_item,
            compoundPrefLabelItem: compound_pref_label_item,
            pChembl: pChembl,
            chemblProvenance: chemblProvenance
        });
    });
    return records;
}

/**
 * Parse the results from {@link CompoundSearch#compoundPharmacologyCount}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundPharmacologyCount}
 * @returns {Number} Count of the number of pharmacology entries for the compound
 * @method
 */
CompoundSearch.prototype.parseCompoundPharmacologyCountResponse = function(response) {
    return response.primaryTopic.compoundPharmacologyTotalResults;
}

/**
 * Parse the results from {@link CompoundSearch#compoundClassMembersCount}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundClassMembersCount}
 * @returns {Number} Count of the number of compounds classified for a particular class
 * @method
 */
CompoundSearch.prototype.parseCompoundClassMembersCountResponse = function(response) {
    return response.primaryTopic.memberCount;
}

/**
 * Parse the results from {@link CompoundSearch#compoundClassMembers}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundClassMembers}
 * @returns {Number} Compounds classified for a particular class
 * @method
 */
CompoundSearch.prototype.parseCompoundClassMembersResponse = function(response) {
    var constants = new Constants();
    var compounds = [];
    response.items.forEach(function(item, index, array) {
        compounds.push({
            "label": item.exactMatch.prefLabel,
            "URI": item[constants.ABOUT]
        });
    });
    return compounds;
}
exports.CompoundSearch = CompoundSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],11:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
ConceptWikiSearch = function(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

/**
 * Performs a free text search to resolve the identity of an entity as specified by the given type
 * in a certain branch.
 * @param {string} query - Query of at least three characters.
 * @param {string} limit - The maximum number of search results.
 * @param {string} branch - The branch of ConceptWiki to search in: 1 = Community, 2 = UMLS, 3 = SwissProt,
 *                          4 = ChemSpider, 5 = Computer Inferred, 6 = Pathway Ontology, 7 = WikiPathways.
 * @param {string} type - The type of entity for which is search: 07a84994-e464-4bbf-812a-a4b96fa3d197 for
 *                        'Chemical Viewed Structurally', eda73945-b112-407e-811a-88448966834f for
 *                        'Disease or Syndrome', or eeaec894-d856-4106-9fa1-662b1dc6c6f1 for
 *                        'Amino Acid, Peptide, or Protein'
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
ConceptWikiSearch.prototype.byTag = function(query, limit, branch, type, callback) {
	params={};
	params['_format'] = "json";
	params['app_key'] = this.appKey;
	params['app_id'] = this.appID;
	params['q'] = query;
	limit ? params['limit'] = limit : '';
	branch ? params['branch'] = branch : '';
	params['uuid'] = type;
	Utils.nets({
        url: this.baseURL + '/search/byTag?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Performs a free text search to resolve the identity of an entity in a certain branch.
 * @param {string} query - Query of at least three characters.
 * @param {string} limit - The maximum number of search results.
 * @param {string} branch - The branch of ConceptWiki to search in: 1 = Community, 2 = UMLS, 3 = SwissProt,
 *                          4 = ChemSpider, 5 = Computer Inferred, 6 = Pathway Ontology, 7 = WikiPathways.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
ConceptWikiSearch.prototype.freeText = function(query, limit, branch, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    limit ? params['limit'] = limit : '';
    branch ? params['branch'] = branch : '';
    Utils.nets({
        url: this.baseURL + '/search/freetext?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

ConceptWikiSearch.prototype.findCompounds = function(query, limit, branch, callback) {
	params = {};
	params['uuid'] = '07a84994-e464-4bbf-812a-a4b96fa3d197';
	params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    limit ? params['limit'] = limit : '';
    branch ? params['branch'] = branch : '';
    Utils.nets({
        url: this.baseURL + '/search/byTag?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

	
}

ConceptWikiSearch.prototype.findTargets = function(query, limit, branch, callback) {
	params = {};
	params['uuid'] = 'eeaec894-d856-4106-9fa1-662b1dc6c6f1';
	params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    limit ? params['limit'] = limit : '';
    branch ? params['branch'] = branch : '';
    Utils.nets({
        url: this.baseURL + '/search/byTag?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ConceptWikiSearch.prototype.findConcept = function(uuid, branch, callback) {
	params = {};
	params['uuid'] = uuid;
	branch != null ? params['branch'] = branch : '';
	params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    Utils.nets({
        url: this.baseURL + '/getConceptDescription?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ConceptWikiSearch.prototype.parseResponse = function(response) {
	var uris = [];
	//response can be either array or singleton.
    if (response.primaryTopic.result) {
		    Utils.arrayify(response.primaryTopic.result).forEach(function(match, i) {
			    uris.push({
				   'uri': match["_about"],
				   'prefLabel': match["prefLabel"],
				   'match': match["match"]
			    });
		    });
    }
	return uris;
}

ConceptWikiSearch.prototype.parseFindConceptResponse = function(response) {
	var prefLabel = response.primaryTopic.prefLabel_en;
	var definition = response.primaryTopic.definition != null ? response.primaryTopic.definition : null;
	var altLabels = [];
	if (response.primaryTopic.altLabel_en) {
		response.primaryTopic.altLabel_en.forEach(function(altLabel, index) {
			altLabels.push(altLabel);
		});
	}
	return {
		prefLabel: prefLabel,
		definition: definition,
		altLabels: altLabels
	};
}

},{"./Constants":12,"./Utils":22,"nets":4}],12:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details
Constants = function() {};

Constants.prototype.SRC_CLS_MAPPINGS = {
  'http://www.conceptwiki.org': 'conceptWikiValue',
  'http://www.conceptwiki.org/': 'conceptWikiValue',
  'http://ops.conceptwiki.org': 'conceptWikiValue',
  'http://ops.conceptwiki.org/': 'conceptWikiValue',
  'http://data.kasabi.com/dataset/chembl-rdf': 'chemblValue',
  'http://rdf.ebi.ac.uk/resource/chembl/molecule' : 'chemblValue',
  'http://www.ebi.ac.uk/chembl' : 'chemblValue',
  'http://www4.wiwiss.fu-berlin.de/drugbank': 'drugbankValue',
  'http://linkedlifedata.com/resource/drugbank': 'drugbankValue',
  'http://www.openphacts.org/bio2rdf/drugbank' : 'drugbankValue',
  'http://www.chemspider.com': 'chemspiderValue',
  'http://www.chemspider.com/': 'chemspiderValue',
  'http://ops.rsc-us.org': 'chemspiderValue',
  'http://ops.rsc.org': 'chemspiderValue',
  'http://rdf.chemspider.com': 'chemspiderValue',
  'http://rdf.chemspider.com/': 'chemspiderValue',
  'http://ops.rsc-us.org' : 'chemspiderValue',
  'http://purl.uniprot.org' : 'uniprotValue',
  'http://purl.uniprot.org/' : 'uniprotValue'
};

Constants.prototype.IN_DATASET =  'inDataset';
Constants.prototype.ABOUT = '_about';
Constants.prototype.LABEL = 'label';
Constants.prototype.PREF_LABEL = 'prefLabel';
Constants.prototype.COMPOUND_PHARMACOLOGY_COUNT = 'compoundPharmacologyTotalResults';
Constants.prototype.TARGET_PHARMACOLOGY_COUNT = 'targetPharmacologyTotalResults';
Constants.prototype.ENZYME_FAMILY_COUNT = 'enzymePharmacologyTotalResults';
Constants.prototype.ON_ASSAY = 'hasAssay';
Constants.prototype.ON_TARGET = 'hasTarget';
Constants.prototype.EXACT_MATCH = 'exactMatch';
Constants.prototype.PRIMARY_TOPIC = 'primaryTopic';
Constants.prototype.RESULT = 'result';
Constants.prototype.ACTIVITY = 'activity';
Constants.prototype.FOR_MOLECULE = 'hasMolecule';
Constants.prototype.ASSAY_TARGET = 'target';
Constants.prototype.ITEMS = 'items';
Constants.prototype.PAGINATED_NEXT = 'next';
Constants.prototype.PAGINATED_PREVIOUS = 'prev';
Constants.prototype.PAGINATED_PAGE_SIZE = 'itemsPerPage';
Constants.prototype.PAGINATED_START_INDEX = 'startIndex';
Constants.prototype.TARGET_OF_ASSAY = 'targetOfAssay';
Constants.prototype.ASSAY_OF_ACTIVITY = 'assayOfActivity';
Constants.prototype.HAS_TARGET_COMPONENT = 'hasTargetComponent';
Constants.prototype.MOLFORM = 'molformula';
Constants.prototype.FULL_MWT = 'full_mwt';
Constants.prototype.INCHI = 'inchi';
Constants.prototype.INCHIKEY = 'inchikey';
Constants.prototype.RO5_VIOLATIONS = 'ro5_violations';
Constants.prototype.SMILES = 'smiles';
Constants.prototype.RELEVANCE = 'relevance';
Constants.prototype.PATHWAY_COUNT = 'pathway_count';
Constants.prototype.MOLWT = 'molweight';
Constants.prototype.EBILINK = 'http://www.ebi.ac.uk';


module.exports = Constants;;

},{}],13:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 * @author [Egon Willighagen]{@link http://orcid.org/0000-0001-7542-0286}
 */
DataSources = function DataSources(baseURL, appID, appKey) {
        this.baseURL = baseURL;
        this.appID = appID;
        this.appKey = appKey;
}

/**
 * Fetch a list of data sources used in the Open PHACTS linked data cache.
 *
 * @param {requestCallback} callback - Function that will be called with success, status, and JSON response values.
 * @method
 * @example
 * var datasources = new DataSources("https://beta.openphacts.org/2.1", appID, appKey);
 * var callback = function(success, status, response) {
 *    var subsets = response.primaryTopic.subset;
 *    for (i=0; subsets.length; i++) {
 *      console.log("Subset: " + subsets[i].title);
 *    }
 * };
 * datasources.getSources(callback);
 */
DataSources.prototype.getSources = function(callback) {
	params={};
	params['_format'] = "json";
	params['app_key'] = this.appKey;
	params['app_id'] = this.appID;
	Utils.nets({
        url: this.baseURL + '/sources?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

exports.DataSources = DataSources;

},{"./Constants":12,"./Utils":22,"nets":4}],14:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
DiseaseSearch = function DiseaseSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseaseResponse(response);
 * };
 * searcher.fetchDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.fetchDisease = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
	Utils.nets({
        url: this.baseURL + '/disease?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Fetch multiple diseases represented by the URIs provided.
 * @param {Array} URIList - A list of URIs for multiple diseases.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseaseBatchResponse(response);
 * };
 * searcher.fetchDiseaseBatch('http://linkedlifedata.com/resource/umls/id/C0004238|http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.fetchDiseaseBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
	Utils.nets({
        url: this.baseURL + '/disease/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}
/**
 * Count the number of diseases for a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseasesByTargetCountResponse(response);
 * };
 * searcher.diseasesByTargetCount('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, callback);
 */
DiseaseSearch.prototype.diseasesByTargetCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
	Utils.nets({
        url: this.baseURL + '/disease/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Fetch the diseases for a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseases = searcher.parseDiseasesByTargetResponse(response);
 * };
 * searcher.diseasesByTarget('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, null, null, null, callback);
 */
DiseaseSearch.prototype.diseasesByTarget = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
	Utils.nets({
        url: this.baseURL + '/disease/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Count the number of targets for a disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetsByDiseaseCountResponse(response);
 * };
 * searcher.targetsByDiseaseCount('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.targetsByDiseaseCount = function(URI, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/getTargets/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Fetch the targets for a disease represented by the URI provided.
     * @param {string} URI - The URI for the disease of interest.
     * @param {string} [page=1] - Which page of records to return.
     * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
     * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
     * @param {string} [lens] - An optional lens to apply to the result.
     * @param {requestCallback} callback - Function that will be called with the result.
     * @method
     * @example
     * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
     * var callback=function(success, status, response){
     *    var targets = searcher.parseTargetsByDiseaseResponse(response);
     * };
     * searcher.targetsByDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, null, null, null, callback);
     */
DiseaseSearch.prototype.targetsByDisease = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/getTargets?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Count the number of diseases associated with a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associationsCount = searcher.parseAssociationsByTargetCountResponse(response);
 * };
 * searcher.associationsByTargetCount('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, callback);
 */
DiseaseSearch.prototype.associationsByTargetCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/assoc/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the disease-target associations for a particular target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associations = searcher.parseAssociationsByTargetResponse(response);
 * };
 * searcher.associationsByTarget('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, null, null, null, callback);
 */
DiseaseSearch.prototype.associationsByTarget = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/assoc/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the disease-target associations for a particular disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associations = searcher.parseAssociationsByDiseaseResponse(response);
 * };
 * searcher.associationsByDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, null, null, null, callback);
 */
DiseaseSearch.prototype.associationsByDisease = function(URI, page, pageSize, orderBy, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        page ? params['_page'] = page : '';
        pageSize ? params['_pageSize'] = pageSize : '';
        orderBy ? params['_orderBy'] = orderBy : '';
        lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/assoc/byDisease?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Count the number of targets associated with a disease represented by the URI provided.
     * @param {string} URI - The URI for the disease of interest.
     * @param {string} [lens] - An optional lens to apply to the result.
     * @param {requestCallback} callback - Function that will be called with the result.
     * @method
     * @example
     * var searcher = new DiseaseSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
     * var callback=function(success, status, response){
     *    var associationsCount = searcher.parseAssociationsByDiseaseCountResponse(response);
     * };
     * searcher.associationsByDiseaseCount('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
     */
DiseaseSearch.prototype.associationsByDiseaseCount = function(URI, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        lens ? params['_lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/disease/assoc/byDisease/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Parse the results from {@link DiseaseSearch#fetchDisease}
     * @param {Object} response - the JSON response from {@link DiseaseSearch#fetchDisease}
     * @returns {FetchDiseaseResponse} Containing the flattened response
     * @method
     */
DiseaseSearch.prototype.parseDiseaseResponse = function(response) {
    var constants = new Constants();
    var URI = null,
        name = null,
        diseaseClass = [];
    URI = response.primaryTopic[constants.ABOUT];
    name = response.primaryTopic.name;
    if (response.primaryTopic.diseaseClass != null) {
            Utils.arrayify(response.primaryTopic.diseaseClass).forEach(function(item, index) {
                diseaseClass.push({
                    "name": item.name,
                    "URI": item[constants.ABOUT]
                });
            });
    }
    return {
        "URI": URI,
        "name": name,
        "diseaseClass": diseaseClass
    };
}

/**
     * Parse the results from {@link DiseaseSearch#fetchDiseaseBatch}
     * @param {Object} response - the JSON response from {@link DiseaseSearch#fetchDiseaseBatch}
     * @returns {Array.FetchDiseaseResponse} Containing the flattened response
     * @method
     */
DiseaseSearch.prototype.parseDiseaseBatchResponse = function(response) {
    var constants = new Constants();
    var items = [];
    response.items.forEach(function(item, index) {
    var URI = null,
        name = null,
        diseaseClass = [];
    URI = item[constants.ABOUT];
    name = item.name;
    if (item.diseaseClass != null) {
        Utils.arrayify(item.diseaseClass).forEach(function(diseaseClassItem, index) {
                diseaseClass.push({
                    "name": diseaseClassItem.name,
                    "URI": diseaseClassItem[constants.ABOUT]
                });
            });
        }
    items.push({
        "URI": URI,
        "name": name,
        "diseaseClass": diseaseClass
    });
    });
    return items;
}

/**
 * Parse the results from {@link DiseaseSearch#diseasesByTargetCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#diseasesByTargetCount}
 * @returns {Number} Count of the number of diseases for the target
 * @method
 */
DiseaseSearch.prototype.parseDiseasesByTargetCountResponse = function(response) {
    return response.primaryTopic.diseaseCount;
}

/**
 * Parse the results from {@link DiseaseSearch#diseasesByTarget}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#diseasesByTarget}
 * @returns {DiseasesByTargetResponse} List of disease items
 * @method
 */
DiseaseSearch.prototype.parseDiseasesByTargetResponse = function(response) {
    var constants = new Constants();
    var diseases = [];
    response.items.forEach(function(item, index) {
        var name = null,
            URI = null,
            gene = null,
            encodes = null,
            encodeURI = null,
            encodeLabel = null;
        name = item.name;
        URI = item[constants.ABOUT];
        gene = {};
        gene["URI"] = item.forGene[constants.ABOUT];
	gene["encodes"] = [];
	Utils.arrayify(item.forGene.encodes).forEach(function(encode, i) {
               var about = encode[constants.ABOUT];
	    	if (encode.exactMatch != null) {
               var provenance = encode.exactMatch[constants.ABOUT] != null ? item.forGene.encodes.exactMatch[constants.ABOUT] : null;
               var label = encode.exactMatch.prefLabel != null ? item.forGene.encodes.exactMatch.prefLabel : null;
	       gene["encodes"].push({"uri": about, "provenance": provenance, "label": label});
        } else {
		gene["encodes"].push({"uri": about});
               gene["provenance"] = null;
               gene["label"] = null;
        }
	});
        diseases.push({
            "name": name,
            "URI": URI,
            "gene": gene
        });
    });
    return diseases;
}

/**
 * Parse the results from {@link DiseaseSearch#targetsByDiseaseCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#targetsByDiseaseCount}
 * @returns {Number} Count of the number of diseases for the target
 * @method
 */
DiseaseSearch.prototype.parseTargetsByDiseaseCountResponse = function(response) {
    return response.primaryTopic.targetCount;
}

/**
 * Parse the results from {@link DiseaseSearch#targetsByDisease}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#targetsByDisease}
 * @returns {TargetsByDiseaseResponse} List of disease items
 * @method
 */
DiseaseSearch.prototype.parseTargetsByDiseaseResponse = function(response) {
    var constants = new Constants();
    var targets = [];
        Utils.arrayify(response.items).forEach(function(item, index, array) {
            var dataset = null,
                URI = null;
            URI = item[constants.ABOUT];
            dataset = item[constants.IN_DATASET];
            targets.push({
                "dataset": dataset,
                "URI": URI
            });
        });
    return targets;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByTargetCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByTargetCount}
 * @returns {Number} Total count of disease-target associations which correspond to a target
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByTargetCountResponse = function(response) {
    return response.primaryTopic.associationsCount;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByTarget}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByTarget}
 * @returns {AssociationsResponse} List of disease-target associations
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByTargetResponse = function(response) {
    var constants = new Constants();
    var diseaseTargetAssociations = [];
        Utils.arrayify(response.items).forEach(function(diseaseTargetAssociation, index, array) {
            var dta = {};
            dta.about = diseaseTargetAssociation[constants.ABOUT];
            dta.dataset = diseaseTargetAssociation[constants.IN_DATASET];
            dta.gene = {};
            dta.gene["URI"] = diseaseTargetAssociation.gene[constants.ABOUT];
            dta.gene["encodes"] = diseaseTargetAssociation.gene.encodes[constants.ABOUT];
            dta.gene["encodesProvenance"] = diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] != null ? diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] : null;
            dta.gene["encodesLabel"] = diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel != null ? diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel : null;
            dta.pmid = [];
            if (diseaseTargetAssociation.pmid != null) {
                Utils.arrayify(diseaseTargetAssociation.pmid).forEach(function(pmid, index, array) {
                    dta.pmid.push(pmid);
                });
            }
            dta.type = [];
                Utils.arrayify(diseaseTargetAssociation.assoc_type).forEach(function(type, index, array) {
                    dta.type.push({
                        "about": type[constants.ABOUT],
                        "label": type.label
                    });
                });

            dta.description = [];
            if (diseaseTargetAssociation.description != null) {
                Utils.arrayify(diseaseTargetAssociation.description).forEach(function(description, index, array) {
                    dta.description.push(description);
                });
            }
            dta.primarySource = [];
                Utils.arrayify(diseaseTargetAssociation.primarySource).forEach(function(primarySource, index, array) {
                    dta.primarySource.push(primarySource);
                });
            dta.disease = {};
            dta.disease.diseaseClasses = [];
            dta.disease.URI = diseaseTargetAssociation.disease[constants.ABOUT];
            dta.disease.dataset = diseaseTargetAssociation.disease[constants.IN_DATASET];
            if(diseaseTargetAssociation.disease.diseaseClass != null) {
	    Utils.arrayify(diseaseTargetAssociation.disease.diseaseClass).forEach(function(diseaseClass, index, array) {
                    var URI = diseaseClass[constants.ABOUT];
                    var name = diseaseClass.name;
                    var dataset = diseaseClass[constants.IN_DATASET];
                    dta.disease.diseaseClasses.push({
                        "URI": URI,
                        "name": name,
                        "dataset": dataset
                    });
            });
	    }
            diseaseTargetAssociations.push(dta);
        });
    return diseaseTargetAssociations;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByDiseaseCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByDiseaseCount}
 * @returns {Number} Total count of disease-target associations which correspond to a disease
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByDiseaseCountResponse = function(response) {
    return response.primaryTopic.associationsCount;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByDisease}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByDisease}
 * @returns {AssociationsResponse} List of disease-target associations
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByDiseaseResponse = function(response) {
    var constants = new Constants();
    var diseaseTargetAssociations = [];
        Utils.arrayify(response.items).forEach(function(diseaseTargetAssociation, index, array) {
            var dta = {};
            dta.about = diseaseTargetAssociation[constants.ABOUT];
            dta.dataset = diseaseTargetAssociation[constants.IN_DATASET];
            dta.gene = {};
            dta.gene["URI"] = diseaseTargetAssociation.gene[constants.ABOUT];
            // TODO API contract not being fulfilled for gene encodes
            if (diseaseTargetAssociation.gene.encodes != null) {
                dta.gene["encodes"] = diseaseTargetAssociation.gene.encodes[constants.ABOUT];
                dta.gene["encodesProvenance"] = diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] != null ? diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] : null;
                dta.gene["encodesLabel"] = diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel != null ? diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel : null;
            } else {
                dta.gene.encodes = null;
                dta.gene.encodesProvenance = null;
                dta.gene.encodesLabel = null;
            }
            dta.pmid = [];
            if (diseaseTargetAssociation.pmid != null) {
                Utils.arrayify(diseaseTargetAssociation.pmid).forEach(function(pmid, index, array) {
                    dta.pmid.push(pmid);
                });
            }
            dta.type = [];
                Utils.arrayify(diseaseTargetAssociation.type).forEach(function(type, index, array) {
                    dta.type.push({
                        "about": type[constants.ABOUT],
                        "label": type.label
                    });
                });

            dta.description = [];
            if (diseaseTargetAssociation.description != null) {
                Utils.arrayify(diseaseTargetAssociation.description).forEach(function(description, index, array) {
                    dta.description.push(description);
                });
            }
            dta.primarySource = [];
                Utils.arrayify(diseaseTargetAssociation.primarySource).forEach(function(primarySource, index, array) {
                    dta.primarySource.push(primarySource);
                });
            dta.disease = {};
            dta.disease.diseaseClasses = [];
            dta.disease.URI = diseaseTargetAssociation.disease[constants.ABOUT];
            dta.disease.dataset = diseaseTargetAssociation.disease[constants.IN_DATASET];
                Utils.arrayify(diseaseTargetAssociation.disease.diseaseClass).forEach(function(diseaseClass, index, array) {
                    var URI = diseaseClass[constants.ABOUT];
                    var name = diseaseClass.name;
                    var dataset = diseaseClass[constants.IN_DATASET];
                    dta.disease.diseaseClasses.push({
                        "URI": URI,
                        "name": name,
                        "dataset": dataset
                    });
                });
            diseaseTargetAssociations.push(dta);
        });
    return diseaseTargetAssociations;
}

exports.DiseaseSearch = DiseaseSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],15:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
MapSearch = function MapSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

MapSearch.prototype.mapURL = function(URI, targetUriPattern, graph, lens, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['Uri'] = URI;
        targetUriPattern ? params['targetUriPattern'] = targetUriPattern : '';
        graph ? params['graph'] = graph : '';
        lens ? params['lensUri'] = lens : '';
	Utils.nets({
        url: this.baseURL + '/mapUri?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

MapSearch.prototype.parseMapURLResponse = function(response) {
        var constants = new Constants();
        var items = response.primaryTopic[constants.EXACT_MATCH];
        var urls = [];
	        Utils.arrayify(items).forEach(function(item, i) {
              urls.push(item);
	        });
	return urls;
}

exports.MapSearch = MapSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],16:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
/**
 * Main container of the OPS.js library. It is the parent class for all the components.
 *
 * @namespace
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */

var Openphacts = {} || Openphacts;
Openphacts.CompoundSearch = require("./CompoundSearch");
Openphacts.TargetSearch = require("./TargetSearch");
Openphacts.ConceptWikiSearch = require("./ConceptWikiSearch");
Openphacts.TreeSearch = require("./TreeSearch");
Openphacts.PathwaySearch = require("./PathwaySearch");
Openphacts.StructureSearch = require("./StructureSearch");
Openphacts.TissueSearch = require("./TissueSearch");
Openphacts.ActivitySearch = require("./ActivitySearch");
Openphacts.DataSources = require("./DataSources");
Openphacts.DiseaseSearch = require("./DiseaseSearch");
Openphacts.MapSearch = require("./MapSearch");
Openphacts.Version = require("./Version");

module.exports = Openphacts;

/**
 * General callback for any request
 * @callback requestCallback
 * @param {Boolean} success - True or False
 * @param {Number} status - HTTP status code
 * @param {string} response - Response message
 */
/**
 * Contains data for a compound fetched with {@link CompoundSearch#fetchCompound}
 * @typedef {Object} FetchCompoundResponse
 * @property {string} cwURI - Concept Wiki URI which represents the compound
 * @property {string} prefLabel - The preferred label for the compound
 * @property {string} URI - The URI for the compound
 * @property {string} description - A description of the compound
 * @property {string} biotransformationItem - The biotransformation item for the compound
 * @property {string} toxicity - The toxicity of the compound
 * @property {string} proteinBinding - The protein binding for the compound
 * @property {string} csURI - ChemSpider URI
 * @property {string} hba - hba
 * @property {string} hbd -hbd
 * @property {string} inchi - inchi
 * @property {string} logp - logp
 * @property {string} psa - psa
 * @property {string} ro5Violations - ro5Violations
 * @property {string} smiles - smiles
 * @property {string} chemblURI - chemblURI
 * @property {string} fullMWT - fullMWT
 * @property {string} molform - molform
 * @property {string} mwFreebase - mwFreebase
 * @property {string} rtb - rtb
 * @property {string} inchiKey - inchiKey
 * @property {string} drugbankURI - drugbankURI
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} chemspiderProvenance - chemspiderProvenance
 * @property {string} chemblProvenance - chemblProvenance
 */
/**
 * Contains data for compounds fetched with {@link CompoundSearch#fetchCompoundBatch}
 * @typedef {Array.<Object>} FetchCompoundBatchResponse
 * @property {string} cwURI - Concept Wiki URI which represents the compound
 * @property {string} prefLabel - The preferred label for the compound
 * @property {string} URI - The URI for the compound
 * @property {string} description - A description of the compound
 * @property {string} biotransformationItem - The biotransformation item for the compound
 * @property {string} toxicity - The toxicity of the compound
 * @property {string} proteinBinding - The protein binding for the compound
 * @property {string} csURI - ChemSpider URI
 * @property {string} hba - hba
 * @property {string} hbd -hbd
 * @property {string} inchi - inchi
 * @property {string} logp - logp
 * @property {string} psa - psa
 * @property {string} ro5Violations - ro5Violations
 * @property {string} smiles - smiles
 * @property {string} chemblURI - chemblURI
 * @property {string} fullMWT - fullMWT
 * @property {string} molform - molform
 * @property {string} mwFreebase - mwFreebase
 * @property {string} rtb - rtb
 * @property {string} inchiKey - inchiKey
 * @property {string} drugbankURI - drugbankURI
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} chemspiderProvenance - chemspiderProvenance
 * @property {string} chemblProvenance - chemblProvenance
 */

/**
 * An array of pharmacology records for a compound returned from {@link CompoundSearch#compoundPharmacology}
 * @typedef {Array.<Object>} FetchCompoundPharmacologyResponse
 * @property {string} compoundInchikey - compound_inchikey
 * @property {string} compoundDrugType - compound_drug_type
 * @property {string} compoundGenericName - compound_generic_name
 * @property {Array} targets - targets
 * @property {string} compoundInchikeySrc - cs_src
 * @property {string} compoundDrugTypeSrc - drugbank_src
 * @property {string} compoundGenericNameSrc - drugbank_src
 * @property {string} targetTitleSrc - chembl_src
 * @property {string} chemblActivityUri - chembl_activity_uri
 * @property {string} chemblCompoundUri - chembl_compound_uri
 * @property {string} compoundFullMwt - compound_full_mwt
 * @property {string} cwCompoundUri - cw_compound_uri
 * @property {string} compoundPrefLabel - compound_pref_label
 * @property {string} csCompoundUri - cs_compound_uri
 * @property {string} csid - csid
 * @property {string} compoundInchi - compound_inchi
 * @property {string} compoundSmiles - compound_smiles
 * @property {string} chemblAssayUri - chembl_assay_uri
 * @property {Array} targetOrganisms - target_organisms
 * @property {string} assayOrganism - assay_organism
 * @property {string} assayDescription - assay_description
 * @property {string} activityRelation - activity_relation
 * @property {string} activityStandardUnits - activity_standard_units
 * @property {string} activityStandardValue - activity_standard_value
 * @property {string} activityActivityType - activity_activity_type
 * @property {string} activityValue - activity_activity_value
 * @property {string} compoundFullMwtSrc - chembl_src
 * @property {string} compoundPrefLabel_src - cw_src
 * @property {string} compoundInchiSrc - cs_src
 * @property {string} compoundSmilesSrc - cs_src
 * @property {string} targetOrganismSrc - chembl_src
 * @property {string} assayOrganismSrc - chembl_src
 * @property {string} assayDescriptionSrc - chembl_src
 * @property {string} activityRelationSrc - chembl_src
 * @property {string} activityStandardUnitsSrc - chembl_src
 * @property {string} activityStandardValueSrc - chembl_src
 * @property {string} activityActivityTypeSrc - chembl_src
 * @property {string} activityPubmedId - activity_pubmed_id
 * @property {string} assayDescriptionItem - assay_description_item
 * @property {string} assayOrganismItem - assay_organism_item
 * @property {string} activityActivityTypeItem - activity_activity_type_item
 * @property {string} activityRelationItem - activity_relation_item
 * @property {string} activityStandardValueItem - activity_standard_value_item
 * @property {string} activityStandardUnitsItem - activity_standard_units_item
 * @property {string} compoundFullMwtItem - compound_full_mwt_item
 * @property {string} compoundSmilesItem - compound_smiles_item
 * @property {string} compoundInchiItem - compound_inchi_item
 * @property {string} compoundInchikeyItem - compound_inchikey_item
 * @property {string} compoundPrefLabelItem - compound_pref_label_item
 * @property {string} pChembl - pChembl
 * @property {string} chemblProvenance - chemblProvenance
 */
/**
 * Contains data for a target fetched with {@link TargetSearch#fetchTarget}
 * @typedef {Object} FetchTargetResponse
 * @property {string} cellularLocation - cellularLocation
 * @property {string} molecularWeight - molecularWeight
 * @property {string} numberOfResidues - numberOfResidues
 * @property {string} theoreticalPi - theoreticalPi
 * @property {string} drugbankURI - drugbankURI
 * @property {Array} keywords- keywords
 * @property {string} functionAnnotation - functionAnnotation
 * @property {string} alternativeName - alternativeName
 * @property {string} existence - existence
 * @property {string} organism - organism
 * @property {string} sequence - sequence
 * @property {Array} classifiedWith - classifiedWith
 * @property {Array} seeAlso - seeAlso
 * @property {string} prefLabel - prefLabel
 * @property {string} chemblItems - chemblItems
 * @property {string} cwURI - cwURI
 * @property {string} URI - URI
 * @property {string} chemblProvenance - chemblProvenance
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} uniprotProvenance - uniprotProvenance
 * @property {string} conceptwikiProvenance - conceptwikiProvenance
 */
/**
 * Contains data for targets fetched with {@link TargetSearch#fetchTargetBatch}
 * @typedef {Array.<Object>} FetchTargetBatchResponse
 * @property {string} cellularLocation - cellularLocation
 * @property {string} molecularWeight - molecularWeight
 * @property {string} numberOfResidues - numberOfResidues
 * @property {string} theoreticalPi - theoreticalPi
 * @property {string} drugbankURI - drugbankURI
 * @property {Array} keywords- keywords
 * @property {string} functionAnnotation - functionAnnotation
 * @property {string} alternativeName - alternativeName
 * @property {string} existence - existence
 * @property {string} organism - organism
 * @property {string} sequence - sequence
 * @property {Array} classifiedWith - classifiedWith
 * @property {Array} seeAlso - seeAlso
 * @property {string} prefLabel - prefLabel
 * @property {string} chemblItems - chemblItems
 * @property {string} cwURI - cwURI
 * @property {string} URI - URI
 * @property {string} chemblProvenance - chemblProvenance
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} uniprotProvenance - uniprotProvenance
 * @property {string} conceptwikiProvenance - conceptwikiProvenance
 */
/**
 * Contains information about a single disease fetched with {@link DiseaseSearch#fetchDisease}
 * @typedef {Object} FetchDiseaseResponse
 * @property {string} URI - URI
 * @property {string} name - name
 * @property {Array} diseaseClass - diseaseClass
 */
/**
 * Contains list of diseases for a single target fetched with {@link DiseaseSearch#diseasesByTarget}
 * @typedef {Array.<Object>} DiseasesByTargetResponse
 * @property {string} URI - URI
 * @property {string} name - name
 * @property {Array.<object>} gene - containing URI for the gene and an array of encoded genes with link to the gene it encodes, label and provenance link to where the label came from
 */
/** 
 * Contains list of targets for a particular disease fetched with {@link DiseaseSearch#targetsByDisease}
 * @typedef {Array.<Object>} TargetsByDiseaseResponse
 * @property {string} URI - URI
 * @property {string} dataset - dataset
 */
/**
 * Contains list of disease target associations for a target fetched with {@link DiseaseSearch#associationsByTarget} or disease fetched with {@link DiseaseSearch#associationsByDisease}
 * @typedef {Array.<Object>} AssociationsResponse
 * @property {string} about - link to source files describing the disease-target associations
 * @property {string} dataset - link to the void dataset describing the links between the diseases and other datasets
 * @property {Array.<string>} description - description
 * @property {Array.<DiseaseResponse>} disease - disease
 * @property {Array.<object>} gene - containing URI for the gene, link to the gene it encodes, encodesLabel and encodesProvenance link to where the label came from
 * @property {Array.<string>} pmid - pubmed ID
 * @property {Array.<string>} primarySource - primarySource
 * @property {Array.<Object>} type - containing URI and label
 */
/**
 * Contains list of diseases contained within a {@link AssociationsResponse}
 * @typedef {Array.<Object>} DiseaseResponse
 * @property {string} URI - link to the disease
 * @property {string} dataset - source of the data
 * @property {Array.<Object>} diseaseClasses - containing URI, source dataset and name
 */
/**
 * Contains various types of data about the compounds matching a source compound when a lens is applied using {@link CompoundSearch#fetchCompound}
 * Note that the items in each list cannot be linked together but you can use the {@link MapSearch#mapURL} call to discover which items are about the same compound.
 * @typedef {Array.<Object>} FetchCompoundLensResponse
 * @property {Array} lensChemspider - List of compounds from chemspider
 * @property {Array} lensDrugbank - list of drugbank info items relating to the chemspider compounds
 * @property {Array} lensCW - list of conceptwiki info about the compounds
 * @property {Array} lensChembl - list of chembl info items about the compounds
 */

},{"./ActivitySearch":9,"./CompoundSearch":10,"./ConceptWikiSearch":11,"./DataSources":13,"./DiseaseSearch":14,"./MapSearch":15,"./PathwaySearch":17,"./StructureSearch":18,"./TargetSearch":19,"./TissueSearch":20,"./TreeSearch":21,"./Version":23}],17:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
PathwaySearch = function PathwaySearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

PathwaySearch.prototype.information = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathway?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a list of pathways in which the given compound is active.
 * @param {string} URI - URI of the compound (e.g.: "http://purl.obolibrary.org/obo/CHEBI_57305")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.byCompound = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? params['_orderBy'] = orderBy : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byCompound?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a count of the list of pathways in which the given compound is active.
 * @param {string} URI - URI of the compound (e.g.: "http://purl.obolibrary.org/obo/CHEBI_57305")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.countPathwaysByCompound = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byCompound/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a list of pathways in which the given target is active.
 * @param {string} URI - URI of the target (e.g.: "http://identifiers.org/ncbigene/282478")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.byTarget = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a count of the list of pathways in which the given target is active.
 * @param {string} URI - URI of the target (e.g.: "http://identifiers.org/ncbigene/282478")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.countPathwaysByTarget = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a list of targets that are part of the pathway specified
 * @param {string} URI - URI of the pathway (e.g.: "http://identifiers.org/wikipathways/WP1008")
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new PathwaySearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targets = searcher.parseGetTargetsResponse(response);
 * };
 * searcher.getTargets('http://identifiers.org/wikipathways/WP1008', null, callback);
 */
PathwaySearch.prototype.getTargets = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathway/getTargets?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a list of compounds that are part of the pathway specified
 * @param {string} URI - URI of the pathway (e.g.: "http://identifiers.org/wikipathways/WP1008")
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new PathwaySearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var compounds = searcher.parseGetCompoundsResponse(response);
 * };
 * searcher.getCompounds('http://identifiers.org/wikipathways/WP1008', null, callback);
 */
PathwaySearch.prototype.getCompounds = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathway/getCompounds?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Give a list of interactions for the given pathway.
 *
 * @param {string} URI - URI of the pathway (e.g.: "http://identifiers.org/wikipathways/WP1015")
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.getInteractions = function(URI, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    Utils.nets({
        url: this.baseURL + '/pathway/getInteractions?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        // Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
        }
    });

}

PathwaySearch.prototype.byReference = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byReference?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

PathwaySearch.prototype.countPathwaysByReference = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathways/byReference/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.getReferences = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathway/getReferences?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a count of the pathways
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.countPathways = function(organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/pathways/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Give the count of interactions of the given entity (metabolite, gene, protein).
 *
 * @param {string} URI - URI of the compound (e.g.: "http://purl.obolibrary.org/obo/CHEBI_57305")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [direction] - Only interactions of this direction (values: "up", "down").
 * @param {string} [interaction_type] - Only interactions of this type (values: "directed" "undirected").
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.countInteractionsByEntity = function(URI, organism, direction, interaction_type, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    organism ? params['organism'] = organism : '';
    organism ? params['direction'] = direction : '';
    organism ? params['interaction_type'] = interaction_type : '';
    Utils.nets({
        url: this.baseURL + '/pathways/interactions/byEntity/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        // Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
        }
    });

}

/**
 * Get a list of interactions of the given entity (metabolite, gene, protein).
 *
 * @param {string} URI - URI of the compound (e.g.: "http://purl.obolibrary.org/obo/CHEBI_57305")
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [direction] - Only interactions of this direction (values: "up", "down").
 * @param {string} [interaction_type] - Only interactions of this type (values: "directed" "undirected").
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.getInteractionsByEntity = function(URI, organism, direction, interaction_type, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    direction ? params['direction'] = direction : '';
    interaction_type ? params['interaction_type'] = interaction_type : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    Utils.nets({
        url: this.baseURL + '/pathways/interactions/byEntity?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        // Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
        }
    });

}

/**
 * Get the pathways
 * @param {string} [organism] - Restricts to pathways in this organism, if given
 * @param {string} [lens] - The Lens name
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.list = function(organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    Utils.nets({
        url: this.baseURL + '/pathways?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get the organisms
 * @param {string} [lens] - The Lens name
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
PathwaySearch.prototype.organisms = function(lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    Utils.nets({
        url: this.baseURL + '/pathways/organisms?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.parseInformationResponse = function(response) {
    var constants = new Constants();
    var latest_version, identifier, revision, title, description, parts, inDataset, pathwayOntology, organism, organismLabel, about, URI = null;
    latest_version = response.primaryTopic.latest_version;
    identifier = response.primaryTopic[constants.ABOUT];
    URI = response.primaryTopic[constants.ABOUT];;
    title = latest_version.title ? latest_version.title : null;
    organism = latest_version.organism[constants.ABOUT] ? latest_version.organism[constants.ABOUT] : null;
    organismLabel = latest_version.organism.label ? latest_version.organism.label : null;
    pathwayOntology = latest_version.pathwayOntology ? latest_version.pathwayOntology : null;
    var pathwayOntologies = [];
    if (pathwayOntology) {
            Utils.arrayify(pathwayOntology).forEach(function(ontology, i) {
                pathwayOntologies.push(ontology);
            });
    }
    description = latest_version.description ? latest_version.description : null;
    revision = latest_version[constants.ABOUT] ? latest_version[constants.ABOUT] : null;
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var parts = [];
    partsComplete.forEach(function(part,  i) {
        parts.push({
            about: part["_about"],
            type: part.type
        });
    });
    // provenance
    var wikipathwaysProvenance = {};
    wikipathwaysProvenance['source'] = 'wikipathways';
    wikipathwaysProvenance['title'] = identifier;
    wikipathwaysProvenance['description'] = identifier;
    wikipathwaysProvenance['organismLabel'] = organism;
    return {
        'URI': URI,
        'title': title,
        'description': description,
        'identifier': identifier,
        'revision': revision,
        'pathwayOntologies': pathwayOntologies,
        'organism': organism,
        'organismLabel': organismLabel,
        'parts': parts,
        'wikipathwaysProvenance': wikipathwaysProvenance
    };
}

PathwaySearch.prototype.parseByCompoundResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, about, type, prefLabel, description, pathwayOntology, geneProductLabel, geneProductURI, geneProductCWURI;
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        about = parts[constants.ABOUT];
        type = parts.type;
        geneProductLabel = parts.exactMatch != null ? parts.exactMatch.prefLabel : null;
        geneProductURI = parts[constants.ABOUT];
        geneProductCWURI = parts.exactMatch != null ? parts.exactMatch[constants.ABOUT] : null;
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'geneProductLabel': geneProductLabel,
            'geneProductURI': geneProductURI,
            'geneProductCWURI': geneProductCWURI,
            'about': about
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByCompoundResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseByTargetResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, about, type, prefLabel, description, pathwayOntology, geneProductLabel, geneProductURI, geneProductCWURI;
        var geneProducts = [];
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        about = parts[constants.ABOUT];
        type = parts.type;
            Utils.arrayify(parts).forEach(function(part, index, array) {
                var geneProduct = {};
                geneProducts.push(geneProduct);
                geneProduct['URI'] = part[constants.ABOUT];
                var exactMatches = [];
                geneProduct['exactMatch'] = exactMatches;
                    Utils.arrayify(part.exactMatch).forEach(function(exactMatch, index, array) {
                        exactMatches.push({'label': exactMatch.prefLabel, 'URI': exactMatch[constants.ABOUT]});
                    });
            });
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'geneProducts': geneProducts,
            'about': about
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByTargetResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseGetTargetsResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var geneProducts = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            geneProducts.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'geneProducts': geneProducts
    };
}

PathwaySearch.prototype.parseGetCompoundsResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var metabolites = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            metabolites.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'metabolites': metabolites
    };
}

PathwaySearch.prototype.parseGetInteractionsResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var interactions = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            about = part._about;
            type  = part.type;
            sources = part.source
            if (Array.isArray(sources)) {
                collapsed = []
                sources.forEach(function(source) {
                    collapsed.push(source._about)
                });
                sources = collapsed
            } else {
                iri = sources._about
                sources = [];
                sources[0] = iri
            }
            targets = part.target
            if (Array.isArray(targets)) {
                collapsed = []
                targets.forEach(function(target) {
                    collapsed.push(target._about)
                });
                targets = collapsed
            } else {
                iri = targets._about
                targets = [];
                targets[0] = iri
            }
            interactions.push({
                'type': type,
                 'source': sources,
                 'target': targets,
                'about': about
            });
        });
    return {
        'title': title,
        'revision': revision,
        'interactions': interactions
    };
}

PathwaySearch.prototype.parseByReferenceResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, publication, prefLabel, description, pathwayOntology;
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        publication = parts[constants.ABOUT];
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'publication': publication,
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByReferenceResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseGetReferencesResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var references = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            references.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'references': references
    };
}
PathwaySearch.prototype.parseCountPathwaysResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseInteractionsByEntityResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var interactions = [];
    items.forEach(function(part, i) {
        about = part._about;
        type  = part.type;
        sources = part.source
        if (Array.isArray(sources)) {
            collapsed = []
            sources.forEach(function(source) {
                collapsed.push(source._about)
            });
            sources = collapsed
        } else {
            iri = sources._about
            sources = [];
            sources[0] = iri
        }
        targets = part.target
        if (Array.isArray(targets)) {
            collapsed = []
            targets.forEach(function(target) {
                collapsed.push(target._about)
            });
            targets = collapsed
        } else {
            iri = targets._about
            targets = [];
            targets[0] = iri
        }
        interactions.push({
            'type': type,
              'source': sources,
              'target': targets,
            'about': about
        });
    });
    return interactions;
}

PathwaySearch.prototype.parseCountInteractionsByEntityResponse = function(response) {
    return response.primaryTopic["interactions_count"];
}

PathwaySearch.prototype.parseListResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, publication, prefLabel, description, pathwayOntology;
        title = item.title;
        identifier = item.identifier;
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseOrganismsResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var organisms = [];
        Utils.arrayify(items).forEach(function(item, i) {
            var URI, count, label;
            URI = item[constants.ABOUT];;
            count = item.pathway_count;
            label = item.label;
            organisms.push({
                'URI': URI,
                'count': count,
                'label': label
            });
        });
    return organisms;
}

exports.PathwaySearch = PathwaySearch;

},{"./Constants":12,"./Utils":22,"nets":4}],18:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
StructureSearch = function StructureSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

StructureSearch.prototype.exact = function(smiles, matchType, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        matchType != null ? params['searchOptions.MatchType'] = matchType : '';
    Utils.nets({
        url: this.baseURL + '/structure/exact?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.substructure = function(smiles, molType, start, count, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['searchOptions.Molecule'] = smiles;
    molType != null ? params['searchOptions.MolType'] = molType : '';
    start != null ? params['resultOptions.Start'] = start : '';
    count != null ? params['resultOptions.Count'] = count : '';
    Utils.nets({
        url: this.baseURL + '/structure/substructure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.inchiKeyToURL = function(inchiKey, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['inchi_key'] = inchiKey;   
    Utils.nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.inchiToURL = function(inchi, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['inchi'] = inchi;   
 
    Utils.nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.similarity = function(smiles, type, threshold, alpha, beta, start, count, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        type != null ? params['searchOptions.SimilarityType'] = type : params['searchOptions.SimilarityType'] = 0;
        threshold != null ? params['searchOptions.Threshold'] = threshold : params['searchOptions.Threshold'] = 0.99;
        alpha != null ? params['searchOptions.Alpha'] = alpha : '';
        beta != null ? params['searchOptions.Beta'] = beta : '';
        start != null ? params['resultOptions.Start'] = start : '';
        count != null ? params['resultOptions.Count'] = count : '';
    Utils.nets({
        url: this.baseURL + '/structure/similarity?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.smilesToURL = function(smiles, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['smiles'] = smiles;   
 
    Utils.nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

StructureSearch.prototype.parseExactResponse = function(response) {
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push(result);
        });
	return results;
}

StructureSearch.prototype.parseSubstructureResponse = function(response) {
    var constants = new Constants();
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push({"about": result[constants.ABOUT], "relevance": result[constants.RELEVANCE]});
        });
	return results;
}

StructureSearch.prototype.parseInchiKeyToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

StructureSearch.prototype.parseInchiToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

StructureSearch.prototype.parseSimilarityResponse = function(response) {
    var constants = new Constants();
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push({"about": result[constants.ABOUT], "relevance": result[constants.RELEVANCE]});
        });
	return results;
}

StructureSearch.prototype.parseSmilesToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

exports.StructureSearch = StructureSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],19:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TargetSearch = function TargetSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetResponse(response);
 * };
 * searcher.fetchTarget('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, callback);
 */
TargetSearch.prototype.fetchTarget = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/target?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch the targets represented by the URIs provided.
 * @param {string} URIList - The URIs for the targets of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targets = searcher.parseTargetBatchResponse(response);
 * };
 * searcher.fetchTargetBatch(['http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', 'http://www.conceptwiki.org/concept/7b21c06f-0343-4fcc-ab0f-a74ffe871ade'], null, callback);
 */
TargetSearch.prototype.fetchTargetBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';

    Utils.nets({
        url: this.baseURL + '/target/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * The hierarchy classes for the different Compounds that interact with a given Target.
 * @param {string} URI - The URI for the target of interest.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetResponse(response);
 * };
 * searcher.compoundsForTarget('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', callback);
 */
TargetSearch.prototype.compoundsForTarget = function(URI, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;

    Utils.nets({
        url: this.baseURL + '/target/classificationsForCompounds?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch pharmacology records for the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseTargetPharmacologyResponse(response);
 * };
 * searcher.targetPharmacology('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 20, null, null, callback);
 */
TargetSearch.prototype.targetPharmacology = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/target/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch a count of the pharmacology records belonging to the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseTargetPharmacologyCountResponse(response);
 * };
 * searcher.targetPharmacologyCount('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, callback);
 */
TargetSearch.prototype.targetPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    lens ? params['_lens'] = lens : '';

    Utils.nets({
        url: this.baseURL + '/target/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * A list of target types
 * @param {string} lens - Which chemistry lens to apply to the result
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 */
TargetSearch.prototype.targetTypes = function(lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;

    Utils.nets({
        url: this.baseURL + '/types?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Parse a block of uniprot data for a target
 * @param {Object} uniprotBlock - JSON containing some Uniprot data for a target
 * @returns {Object} Flattened uniprot response
 * @method
 */
TargetSearch.prototype.parseUniprotBlock = function(uniprotBlock) {
    var constants = new Constants();
    var uniprotData = uniprotBlock;
    var uniprotURI = uniprotData[constants.ABOUT];
    var classifiedWith = [];
    var seeAlso = [];
    if (uniprotData.classifiedWith) {
        Utils.arrayify(uniprotData.classifiedWith).forEach(function(classified, j, allClassified) {
            classifiedWith.push(classified);
        });
    }
    if (uniprotData.seeAlso) {
        Utils.arrayify(uniprotData.seeAlso).forEach(function(see, j, allSee) {
            seeAlso.push(see);
        });
    }
    var molecularWeight = uniprotData.molecularWeight ? uniprotData.molecularWeight : null;
    var functionAnnotation = uniprotData.Function_Annotation ? uniprotData.Function_Annotation : null;
    var alternativeName = uniprotData.alternativeName ? Utils.arrayify(uniprotData.alternativeName) : [];
    var existence = uniprotData.existence ? uniprotData.existence : null;
    var organism = uniprotData.organism ? uniprotData.organism : null;
    var sequence = uniprotData.sequence ? uniprotData.sequence : null;
    var mass = uniprotData.mass ? uniprotData.mass : null;
    var uniprotProvenance = {};
    var uniprotLinkOut = uniprotURI;
    uniprotProvenance['source'] = 'uniprot';
    uniprotProvenance['classifiedWith'] = uniprotLinkOut;
    uniprotProvenance['seeAlso'] = uniprotLinkOut;
    uniprotProvenance['molecularWeight'] = uniprotLinkOut;
    uniprotProvenance['functionAnnotation'] = uniprotLinkOut;
    uniprotProvenance['alternativeName'] = uniprotLinkOut;
    uniprotProvenance['existence'] = uniprotLinkOut;
    uniprotProvenance['organism'] = uniprotLinkOut;
    uniprotProvenance['sequence'] = uniprotLinkOut;
    uniprotProvenance['mass'] = uniprotLinkOut;

    return {
        'alternativeName': alternativeName,
        'molecularWeight': molecularWeight,
        'functionAnnotation': functionAnnotation,
        'mass': mass,
        'existence': existence,
        'organism': organism,
        'sequence': sequence,
        'classifiedWith': classifiedWith,
        'seeAlso': seeAlso,
        'uniprotProvenance': uniprotProvenance
    };
}

/**
 * Parse a block of concept wiki data for a target
 * @param {Object} conceptWikiBlock - JSON containing some Concept Wiki data for a target
 * @returns {Object} Flattened Concept Wiki response
 * @method
 */
TargetSearch.prototype.parseConceptWikiBlock = function(conceptWikiBlock) {
    var constants = new Constants();
    var cwUri = conceptWikiBlock[constants.ABOUT];
    var label = conceptWikiBlock[constants.PREF_LABEL];
    var conceptWikiLinkOut = conceptWikiBlock[constants.ABOUT];
    var conceptwikiProvenance = {};
    conceptwikiProvenance['source'] = 'conceptwiki';
    conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
    return {
        'prefLabel': label,
        'URI': cwUri,
        'conceptwikiProvenance': conceptwikiProvenance
    };
}

/**
 * Parse a block of ChEMBL data for a target
 * @param {Object} chemblBlock - JSON containing some ChEMBL data for a target
 * @returns {Object} Flattened ChEMBL response
 * @method
 */
TargetSearch.prototype.parseChemblBlock = function(chemblBlock) {
    var constants = new Constants();
    // there can be multiple proteins per target response
    var chemblData = chemblBlock;
    var chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
    var chemblDataItem = {};
    chemblDataItem['chembl_src'] = chemblData[constants.IN_DATASET];
    chemblUri = chemblData[constants.ABOUT];
    chemblLinkOut += chemblUri.split('/').pop();
    chemblDataItem['linkOut'] = chemblLinkOut;
    var synonymsData;
    if (chemblData[constants.LABEL]) {
        synonymsData = chemblData[constants.LABEL];
    }
    chemblDataItem['synonyms'] = synonymsData;
    var targetComponents = {};
    if (chemblData[constants.HAS_TARGET_COMPONENT]) {
        Utils.arrayify(chemblData[constants.HAS_TARGET_COMPONENT]).forEach(function(targetComponent, index, allTargetComponents) {
            targetComponents[targetComponent[constants.ABOUT]] = targetComponent.description;
        });
    }
    chemblDataItem['targetComponents'] = targetComponents;
    chemblDataItem['type'] = chemblData.type;

    var chemblProvenance = {};
    chemblProvenance['source'] = 'chembl';
    chemblProvenance['synonymsData'] = chemblLinkOut;
    chemblProvenance['targetComponents'] = chemblLinkOut;
    chemblProvenance['type'] = chemblLinkOut;
    return {
        'chemblDataItem': chemblDataItem,
        'chemblProvenance': chemblProvenance
    };
}

/**
 * Parse a block of drugbank data for a target
 * @param {Object} drugbankBlock - JSON containing some drugbank data for a target
 * @returns {Object} Flattened drugbank response
 */
TargetSearch.prototype.parseDrugbankBlock = function(drugbankBlock) {
    var constants = new Constants();
    var drugbankData = drugbankBlock;
    var cellularLocation = drugbankData.cellularLocation ? drugbankData.cellularLocation : null;
    var numberOfResidues = drugbankData.numberOfResidues ? drugbankData.numberOfResidues : null;
    var theoreticalPi = drugbankData.theoreticalPi ? drugbankData.theoreticalPi : null;
    var drugbankURI = drugbankData[constants.ABOUT] ? drugbankData[constants.ABOUT] : null;

    var drugbankLinkOut = drugbankURI;
    var drugbankProvenance = {};
    drugbankProvenance['source'] = 'drugbank';
    drugbankProvenance['cellularLocation'] = drugbankLinkOut;
    drugbankProvenance['numberOfResidues'] = drugbankLinkOut;
    drugbankProvenance['theoreticalPi'] = drugbankLinkOut;
    return {
        'cellularLocation': cellularLocation,
        'numberOfResidues': numberOfResidues,
        'theoreticalPi': theoreticalPi,
        'drugbankURI': drugbankURI,
        'drugbankProvenance': drugbankProvenance
    };
}

/**
 * Parse the results from {@link TargetSearch#fetchTarget}
 * @param {Object} response - the JSON response from {@link TargetSearch#fetchTarget}
 * @returns {FetchTargetResponse} Containing the flattened response
 * @method
 */
TargetSearch.prototype.parseTargetResponse = function(response) {
    var me = this;
    var constants = new Constants();
    var uniprotBlock = {};
    var conceptWikiBlock = {};
    var chemblBlock = {};
    var drugbankBlock = {};
    var URI = response.primaryTopic[constants.ABOUT];
    var id = URI.split("/").pop();
    var chemblItems = [];
    // depending on the URI used the info block for that object will be on the top level rather than in exactMatch
    // We need to check what the URI represents and pull the appropriate info out 
    if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankBlock = me.parseDrugbankBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemblValue') {
    	    chemblBlock = me.parseChemblBlock(response.primaryTopic);
        chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'uniprotValue') {
        uniprotBlock = me.parseUniprotBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiBlock = me.parseConceptWikiBlock(response.primaryTopic);
    }
    var exactMatches = response.primaryTopic[constants.EXACT_MATCH];
    Utils.arrayify(exactMatches).forEach(function(exactMatch, i, allMatches) {
        var src = exactMatch[constants.IN_DATASET];
        if (src) {
            if (constants.SRC_CLS_MAPPINGS[src] === 'drugbankValue') {
                drugbankBlock = me.parseDrugbankBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'chemblValue') {
                chemblBlock = me.parseChemblBlock(exactMatch);
                chemblItems.push(chemblBlock);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'uniprotValue') {
                uniprotBlock = me.parseUniprotBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'conceptWikiValue') {
                conceptWikiBlock = me.parseConceptWikiBlock(exactMatch);
            }
        }
    });
    // each chemblItem has its own provenance
    return {
        'id': id,
        'URI': URI,
        'cellularLocation': drugbankBlock.cellularLocation != null ? drugbankBlock.cellularLocation : null,
        'numberOfResidues': drugbankBlock.numberOfResidues != null ? drugbankBlock.numberOfResidues : null,
        'theoreticalPi': drugbankBlock.theoreticalPi != null ? drugbankBlock.theoreticalPi : null,
        'drugbankURI': drugbankBlock.drugbankURI != null ? drugbankBlock.drugbankURI : null,
        'molecularWeight': uniprotBlock.molecularWeight != null ? uniprotBlock.molecularWeight : null,
        'functionAnnotation': uniprotBlock.functionAnnotation != null ? uniprotBlock.functionAnnotation : null,
        'alternativeName': uniprotBlock.alternativeName != null ? uniprotBlock.alternativeName : null,
        'mass': uniprotBlock.mass != null ? uniprotBlock.mass : null,
        'existence': uniprotBlock.existence != null ? uniprotBlock.existence : null,
        'organism': uniprotBlock.organism != null ? uniprotBlock.organism : null,
        'sequence': uniprotBlock.sequence != null ? uniprotBlock.sequence : null,
        'classifiedWith': uniprotBlock.classifiedWith != null ? uniprotBlock.classifiedWith : null,
        'seeAlso': uniprotBlock.seeAlso != null ? uniprotBlock.seeAlso : null,
        'chemblItems': chemblItems,
        'cwURI': conceptWikiBlock.URI != null ? conceptWikiBlock.URI : null,
        'prefLabel': conceptWikiBlock.prefLabel != null ? conceptWikiBlock.prefLabel : null,
        'drugbankProvenance': drugbankBlock.drugbankProvenance != null ? drugbankBlock.drugbankProvenance : null,
        'uniprotProvenance': uniprotBlock.uniprotProvenance != null ? uniprotBlock.uniprotProvenance : null,
        'conceptwikiProvenance': conceptWikiBlock.conceptwikiProvenance != null ? conceptWikiBlock.conceptwikiProvenance : null
    };
}

/**
 * Parse the results from {@link TargetSearch#fetchTargetBatch}
 * @param {Object} response - the JSON response from {@link TargetSearch#fetchTargetBatch}
 * @returns {FetchTargetBatchResponse} Containing the flattened response
 * @method
 */
TargetSearch.prototype.parseTargetBatchResponse = function(response) {
    var constants = new Constants();
    var targets = [];
    var me = this;
    var constants = new Constants();
    response.items.forEach(function(item, index, items) {

    var uniprotBlock = {};
    var conceptWikiBlock = {};
    var chemblBlock = {};
    var drugbankBlock = {};
    var URI = item[constants.ABOUT];
    var id = URI.split("/").pop();
    var chemblItems = [];
    // depending on the URI used the info block for that object will be on the top level rather than in exactMatch
    // We need to check what the URI represents and pull the appropriate info out 
    if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankBlock = me.parseDrugbankBlock(item);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'chemblValue') {
    	    chemblBlock = me.parseChemblBlock(item);
        chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'uniprotValue') {
        uniprotBlock = me.parseUniprotBlock(item);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiBlock = me.parseConceptWikiBlock(item);
    }
    var exactMatches = item[constants.EXACT_MATCH];
    Utils.arrayify(exactMatches).forEach(function(exactMatch, i, allMatches) {
        var src = exactMatch[constants.IN_DATASET];
        if (src) {
            if (constants.SRC_CLS_MAPPINGS[src] === 'drugbankValue') {
                drugbankBlock = me.parseDrugbankBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'chemblValue') {
                chemblBlock = me.parseChemblBlock(exactMatch);
                chemblItems.push(chemblBlock);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'uniprotValue') {
                uniprotBlock = me.parseUniprotBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'conceptWikiValue') {
                conceptWikiBlock = me.parseConceptWikiBlock(exactMatch);
            }
        }
    });
targets.push({
        'id': id,
        'URI': URI,
        'cellularLocation': drugbankBlock.cellularLocation != null ? drugbankBlock.cellularLocation : null,
        'numberOfResidues': drugbankBlock.numberOfResidues != null ? drugbankBlock.numberOfResidues : null,
        'theoreticalPi': drugbankBlock.theoreticalPi != null ? drugbankBlock.theoreticalPi : null,
        'drugbankURI': drugbankBlock.drugbankURI != null ? drugbankBlock.drugbankURI : null,
        'molecularWeight': uniprotBlock.molecularWeight != null ? uniprotBlock.molecularWeight : null,
        'functionAnnotation': uniprotBlock.functionAnnotation != null ? uniprotBlock.functionAnnotation : null,
        'alternativeName': uniprotBlock.alternativeName != null ? uniprotBlock.alternativeName : null,
        'mass': uniprotBlock.mass != null ? uniprotBlock.mass : null,
        'existence': uniprotBlock.existence != null ? uniprotBlock.existence : null,
        'organism': uniprotBlock.organism != null ? uniprotBlock.organism : null,
        'sequence': uniprotBlock.sequence != null ? uniprotBlock.sequence : null,
        'classifiedWith': uniprotBlock.classifiedWith != null ? uniprotBlock.classifiedWith : null,
        'seeAlso': uniprotBlock.seeAlso != null ? uniprotBlock.seeAlso : null,
        'chemblItems': chemblItems,
        'cwURI': conceptWikiBlock.URI != null ? conceptWikiBlock.URI : null,
        'prefLabel': conceptWikiBlock.prefLabel != null ? conceptWikiBlock.prefLabel : null,
        'drugbankProvenance': drugbankBlock.drugbankProvenance != null ? drugbankBlock.drugbankProvenance : null,
        'uniprotProvenance': uniprotBlock.uniprotProvenance != null ? uniprotBlock.uniprotProvenance : null,
        'conceptwikiProvenance': conceptWikiBlock.conceptwikiProvenance != null ? conceptWikiBlock.conceptwikiProvenance : null
    });
    });
    return targets;
}

TargetSearch.prototype.parseTargetPharmacologyResponse = function(response) {
    var constants = new Constants();
    var records = [];

    response.items.forEach(function(item, index, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item["_about"];
        var chembl_src = item["inDataset"];

        //big bits
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembl_compound_uri;
        var compound_full_mwt = null;
        var compound_full_mwt_item;

        var em;
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule["_about"];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }

        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_pref_label_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_smiles_item = null,
            assay_description = null,
            assay_description_item = null,
            compound_ro5_violations = null;
        if (em != null) {
            em.forEach(function(match, index, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match["_about"];
                    compound_pref_label = match['prefLabel'];
                    cw_src = match["inDataset"];
                    compound_pref_label_item = cw_compound_uri;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match["_about"];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match.molweight;
                    compound_ro5_violations = match.ro5_violations;
                    cs_src = match["inDataset"];
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_smiles_item = chemSpiderLink;
                } // else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                //   drugbank_compound_uri = match["_about"];
                //   compound_drug_type = match['drugType'];
                //   compound_generic_name = match['genericName'];
                //   drugbank_src = match["_about"];
                //}
            });
        }

        var onAssay = item[constants.ON_ASSAY];
        var chembl_assay_uri;
        var assay_organism;
        var assay_organism_item;
        var target;
        var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';

        if (onAssay != null) {
            chembl_assay_uri = onAssay[constants.ABOUT];
            assay_organism = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
            assay_organism_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description = onAssay['description'] ? onAssay['description'] : null;
            //assay_description_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            target = onAssay[constants.ON_TARGET];
        }
        var target_pref_label;
        var target_pref_label_item;
        var targetMatch;
        var target_title = null;
        var target_organism;
        var target_organism_item;
        var target_concatenated_uris;
        var chemblTargetLink = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
        var target_organisms = [];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.targetOrganismName != null ? target.targetOrganismName : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
	tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;		
				}
				target_components.push(tc);
			});
		}
            }

        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        var activity_activity_type_item, activity_standard_value_item, activity_standard_units_item, activity_relation_item;

        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        activity_activity_type_item = chemblActivityLink;
        var activity_standard_value = item['activity_value'] ? item['activity_value'] : null;
        activity_standard_value_item = chemblActivityLink;
        var activity_standard_units = item.activity_unit ? item.activity_unit.prefLabel : null;
        activity_standard_units_item = chemblActivityLink;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        activity_relation_item = chemblActivityLink;
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var pChembl = item.pChembl;
        var documents = [];
        if (item.hasDocument) {
            Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                documents.push(document);
            });
        }
        records.push({ //for compound
            'compoundInchikey': compound_inchikey,
            //compoundDrugType: compound_drug_type,
            //compoundGenericName: compound_generic_name,
            //targetConcatenatedUris: target_concatenated_uris,

            'compoundInchikeySrc': cs_src,
            //compoundDrugTypeSrc: drugbank_src,
            //compoundGenericNameSrc: drugbank_src,
            'targetTitleSrc': chembl_src,
            //targetConcatenatedUrisSrc: chembl_src,
	    'targetTitle': target_title,
	    'targetOrganismName': target_organism_name,
	    'targetComponents': target_components,
	    'targetURI': target_uri,
	    'targetProvenance': target_provenance,

            //for target
            'chemblActivityUri': chembl_activity_uri,
            'chemblCompoundUri': chembl_compound_uri,
            'compoundFullMwt': compound_full_mwt,
            'cwCompoundUri': cw_compound_uri,
            'compoundPrefLabel': compound_pref_label,
            'csCompoundUri': cs_compound_uri,
            'csid': csid,
            'compoundInchi': compound_inchi,
            'compoundSmiles': compound_smiles,
            'chemblAssayUri': chembl_assay_uri,


            'assayOrganism': assay_organism,
            'assayDescription': assay_description,
            'activityRelation': activity_relation,
            'activityStandardUnits': activity_standard_units,
            'activityStandardValue': activity_standard_value,
            'activityActivityType': activity_activity_type,
            'activityPubmedId': activity_pubmed_id,
            'activityComment': activity_comment,

            'compoundFullMwtSrc': chembl_src,
            'compoundPrefLabelSrc': cw_src,
            'compoundInchiSrc': cs_src,
            'compoundSmilesSrc': cs_src,
            //targetOrganismSrc: chembl_src,
            'targetPrefLabelSrc': cw_src,
            'assayOrganismSrc': chembl_src,
            'assayDescriptionSrc': chembl_src,
            'activityRelationSrc': chembl_src,
            'activityStandardUnits_src': chembl_src,
            'activityStandardValue_src': chembl_src,
            'activityActivityType_src': chembl_src,

            'compoundPrefLabelItem': compound_pref_label_item,
            'activityActivityTypeItem': activity_activity_type_item,
            'activityRelationItem': activity_relation_item,
            'activityStandardValueItem': activity_standard_value_item,
            'activityStandardUnitsItem': activity_standard_units_item,
            'compoundFullMwtItem': compound_full_mwt_item,
            'compoundSmilesItem': compound_smiles_item,
            'compoundInchiItem': compound_inchi_item,
            'compoundInchikeyItem': compound_inchikey_item,
            //targetPrefLabelItem: target_pref_label_item,
            'assayOrganismItem': assay_organism_item,
            //assayDescriptionItem: assay_description_item,
            //targetOrganismItem: target_organism_item,
            'pChembl': pChembl,
            'compoundRO5Violations': compound_ro5_violations,
            'chemblProvenance': chemblProvenance,
            'chemblDOIs': documents
        });
    });
    return records;
}

TargetSearch.prototype.parseTargetPharmacologyCountResponse = function(response) {
    return response.primaryTopic.targetPharmacologyTotalResults;
}

},{"./Constants":12,"./Utils":22,"nets":4}],20:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TissueSearch = function TissueSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the tissue represented by the URI provided.
 * @param {string} URI - The URI for the tissue of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TissueSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var tissueResult = searcher.parseTissueResponse(response);
 * };
 * searcher.fetchTissue('ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0171', null, callback);
 */
TissueSearch.prototype.fetchTissue = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/tissue?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the mutiple tissues represented by the URIs provided.
 * @param {Array.<string>} URIList - A list of URIs for the tissue of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TissueSearch("https://beta.openphacts.org/2.1", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var tissueResult = searcher.parseTissueBatchResponse(response);
 * };
 * searcher.fetchTissueBatch(['ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0171', 'ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0173'], null, callback);
 */
TissueSearch.prototype.fetchTissueBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/tissue/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Parse the results from {@link TissueSearch#fetchTissue}
 * @param {Object} response - the JSON response from {@link TissueSearch#fetchTissue}
 * @returns {FetchTissueResponse} Containing the flattened response
 * @method
 */
TissueSearch.prototype.parseTissueResponse = function(response) {
    var constants = new Constants();
    var uri = response.primaryTopic[constants.ABOUT];
    var label = response.primaryTopic.label;
    var definition = response.primaryTopic.definition != null ? response.primaryTopic.definition : null;
    var dataset = response.primaryTopic[constants.IN_DATASET] != null ? response.primaryTopic[constants.IN_DATASET] : null;
    var dbXrefs = [];
    if (response.primaryTopic.hasDbXref != null) {
        Utils.arrayify(response.primaryTopic.hasDbXref).forEach(function(dbXref, index) {
            dbXrefs.push(dbXref);
        });
    }
    return {
        "uri": uri,
        "label": label,
        "definition": definition,
        "dataset": dataset,
        "dbXrefs": dbXrefs
    };
}

/**
 * Parse the results from {@link TissueSearch#fetchTissueBatch}
 * @param {Object} response - the JSON response from {@link TissueSearch#fetchTissueBatch}
 * @returns {Array.<FetchTissueResponse>} Containing the flattened response
 * @method
 */
TissueSearch.prototype.parseTissueBatchResponse = function(response) {
    var constants = new Constants();
    var tissues = [];
    response.items.forEach(function(tissue, index) {
    var uri = tissue[constants.ABOUT];
    var label = tissue.label;
    var definition = tissue.definition != null ? tissue.definition : null;
    var dataset = tissue[constants.IN_DATASET] != null ? tissue[constants.IN_DATASET] : null;
    var dbXrefs = [];
    if (tissue.hasDbXref != null) {
        arrayify(tissue.hasDbXref).forEach(function(dbXref, index) {
            dbXrefs.push(dbXref);
        });
    }
    tissues.push({
        "uri": uri,
        "label": label,
        "definition": definition,
        "dataset": dataset,
        "dbXrefs": dbXrefs
    });
    });
    return tissues;
}

exports.TissueSearch = TissueSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],21:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TreeSearch = function TreeSearch(baseURL, appID, appKey) {
    	this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

TreeSearch.prototype.getRootNodes = function(root, callback) {
	var params = {};
	params['root'] = root;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
 
    Utils.nets({
        url: this.baseURL + '/tree?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getChildNodes = function(URI, callback) {
	var params = {};
	params['uri'] = URI;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    Utils.nets({
        url: this.baseURL + '/tree/children?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getParentNodes = function(URI, callback) {
	var params = {};
	params['uri'] = URI;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;

    Utils.nets({
        url: this.baseURL + '/tree/parents?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}


TreeSearch.prototype.getTargetClassPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
    Utils.nets({
        url: this.baseURL + '/target/tree/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

TreeSearch.prototype.getTargetClassPharmacologyPaginated = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
    page != null ? params['_page'] = page : '';
    pageSize != null ? params['_pageSize'] = pageSize : '';
    orderBy != null ? params['_orderBy'] = orderBy : '';
    //console.log(this.baseURL + '/target/tree/pharmacology/pages?' + Utils.encodeParams(params));
    Utils.nets({
        url: this.baseURL + '/target/tree/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
	//Handle responses where there is no resp/status code
        if (resp != null && resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else if (resp != null) {
            callback.call(this, false, resp.statusCode);
        } else {
            callback.call(this, false, null);
	}
    });

}

TreeSearch.prototype.getCompoundClassPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
Utils.nets({
        url: this.baseURL + '/compound/tree/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getCompoundClassPharmacologyPaginated = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType != null ? params['target_type'] = targetType : '';
    lens != null ? params['lens'] = lens : '';
    page != null ? params['_page'] = page : '';
    pageSize != null ? params['_pageSize'] = pageSize : '';
    orderBy != null ? params['_orderBy'] = orderBy : '';
Utils.nets({
        url: this.baseURL + '/compound/tree/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 60000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

TreeSearch.prototype.parseRootNodes = function(response) {
    var enzymeRootClasses = [];
    var prefLabel = response.primaryTopic.hasPart.prefLabel;
        Utils.arrayify(response.primaryTopic.hasPart.rootNode).forEach(function(member, i) {
            enzymeRootClasses.push({
                uri: member["_about"],
                name: member.prefLabel
            });
        });
    return {
        'label': prefLabel,
        'rootClasses': enzymeRootClasses
    };
}

TreeSearch.prototype.parseChildNodes = function(response) {
    var constants = new Constants();
    var childResponse = {};
    var treeClasses = [];
    var label = response.primaryTopic.prefLabel;
    //label = Utils.arrayify(label)[0];
    childResponse['label'] = label;
    // The childNode might be inside an exactMatch block in 1.5
    if (response.primaryTopic.childNode == null) {
        response.primaryTopic.childNode = response.primaryTopic.exactMatch.childNode;
    }
        Utils.arrayify(response.primaryTopic.childNode).forEach(function(member, i) {
            var about;
            var names = [];
            if (member[constants.ABOUT] != null) {
                about = member["_about"];

                    Utils.arrayify(member.prefLabel).forEach(function(label, j) {
                        names.push(label);
                    });
            }
            treeClasses.push({
                uri: about,
                names: names
            });
        });
    childResponse['children'] = treeClasses;
    return childResponse;
}

TreeSearch.prototype.parseParentNodes = function(response) {
    var constants = new Constants();
    var parentResponse = {};
    var treeClasses = [];
    var label = response.primaryTopic.prefLabel;
    label = Utils.arrayify(label)[0];
    parentResponse['label'] = label;
        Utils.arrayify(response.primaryTopic.parentNode).forEach(function(member, i) {
            var about = member["_about"];
            var names = [];
                Utils.arrayify(member.prefLabel).forEach(function(label, j) {
                    names.push(label);
                });
            treeClasses.push({
                uri: about,
                names: names
            });
        });
    parentResponse['parents'] = treeClasses;
    return parentResponse;
}


TreeSearch.prototype.parseTargetClassPharmacologyCount = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.TARGET_PHARMACOLOGY_COUNT];
}

TreeSearch.prototype.parseTargetClassPharmacologyPaginated = function(response) {
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }
        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
        if (forMolecule[constants.EXACT_MATCH] != null) {
            forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cwURI = match[constants.ABOUT];
                    prefLabel = match[constants.PREF_LABEL];
                    var conceptWikiLinkOut = cwURI;
                    conceptwikiProvenance['source'] = 'conceptwiki';
                    conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    csURI = match[constants.ABOUT];
                    inchi = match[constants.INCHI];
                    inchiKey = match[constants.INCHIKEY];
                    smiles = match[constants.SMILES];
                    ro5Violations = match[constants.RO5_VIOLATIONS] != null ? match[constants.RO5_VIOLATIONS] : null;
                    fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                    var chemspiderLinkOut = csURI;
                    chemspiderProvenance['source'] = 'chemspider';
                    chemspiderProvenance['hba'] = chemspiderLinkOut;
                    chemspiderProvenance['hbd'] = chemspiderLinkOut;
                    chemspiderProvenance['inchi'] = chemspiderLinkOut;
                    chemspiderProvenance['logp'] = chemspiderLinkOut;
                    chemspiderProvenance['psa'] = chemspiderLinkOut;
                    chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                    chemspiderProvenance['smiles'] = chemspiderLinkOut;
                    chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                    chemspiderProvenance['molform'] = chemspiderLinkOut;
                }
            });
        }
        var target = item.hasAssay.hasTarget;
var target_organisms = [];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
                Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                    documents.push(document);
                });
            }
        records.push({
            'targetComponents': target_components,
		'targetTitle': target_title,
		'targetURI': target_uri,
		'targetOrganismName': target_organism_name,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            //targetURI: targetURI,
            //targetTitle: targetTitle,
            //targetOrganism: targetOrganism,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}

TreeSearch.prototype.parseCompoundClassPharmacologyCount = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.COMPOUND_PHARMACOLOGY_COUNT];
}

TreeSearch.prototype.parseCompoundClassPharmacologyPaginated = function(response) {
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            qudtURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }
        qudtURI = item.qudt_uri ? item.qudt_uri : null;
        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
if (forMolecule[constants.EXACT_MATCH] != null) {
        forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
            var src = match[constants.IN_DATASET];
            if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                cwURI = match[constants.ABOUT];
                prefLabel = match[constants.PREF_LABEL];
                var conceptWikiLinkOut = cwURI;
                conceptwikiProvenance['source'] = 'conceptwiki';
                conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                csURI = match[constants.ABOUT];
                inchi = match[constants.INCHI];
                inchiKey = match[constants.INCHIKEY];
                smiles = match[constants.SMILES];
                ro5Violations = match[constants.RO5_VIOLATIONS] !== null ? match[constants.RO5_VIOLATIONS] : null;
                fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                var chemspiderLinkOut = csURI;
                chemspiderProvenance['source'] = 'chemspider';
                chemspiderProvenance['hba'] = chemspiderLinkOut;
                chemspiderProvenance['hbd'] = chemspiderLinkOut;
                chemspiderProvenance['inchi'] = chemspiderLinkOut;
                chemspiderProvenance['logp'] = chemspiderLinkOut;
                chemspiderProvenance['psa'] = chemspiderLinkOut;
                chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                chemspiderProvenance['smiles'] = chemspiderLinkOut;
                chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                chemspiderProvenance['molform'] = chemspiderLinkOut;
            }
        });
}
        var target = item.hasAssay.hasTarget;
        var assayTargets = [];
var target_organism_name = null;
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
                Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                    documents.push(document);
                });
        }

        records.push({
            'qudtURI': qudtURI,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            'targetURI': target_uri,
            'targetTitle': target_title,
            'targetOrganismName': target_organism_name,
	    'targetComponents': target_components,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}
exports.TreeSearch = TreeSearch;

},{"./Constants":12,"./Utils":22,"nets":4}],22:[function(require,module,exports){
(function (process){
var nets = require("nets");

/**
 * Set to true to debug http requests
 */
var debug = false;
if (typeof process !== 'undefined') {
  debug = process.env.debug == "true";
}

/**
 * Check if some data is an array and return either itself if it is an array
 * or an array with it as the first member if it is not. Used for the cases where
 * the API returns either an array or a singleton.
 * @param {Object}
 * @returns {Array}
 * @method
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
exports.arrayify = function(data) {
    if (!Array.isArray(data)) {
        return [data];
    } else {
        return data;;
    }
}

/**
 * Turns an object containing key/value pairs into URI encoded 'key1=value1&key2=value2...' parameters for
 * an http request.
 * @param {Object}
 * @returns {String}
 * @method
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
exports.encodeParams = function(params) {
    var requestParams = "";
    Object.keys(params).forEach(function(key, index) {
        requestParams += key + "=" + encodeURIComponent(params[key]) + "&";
    });
    requestParams = requestParams.substr(0, requestParams.length - 1);
    return requestParams;
}

/**
  * Perform HTTP(S) request using nets.
  * Optional debugging of URL and results.
  */
exports.nets = function(options, callback) {
  if (debug) {
      console.log(options.method + " " + options.url);
      return nets(options, function(err, resp, body) {
        if (err != null) {
          console.log(err);
        } else {
          console.log(resp.statusCode);
        }
        return callback(err, resp, body);
      });
  } else {
    return nets(options, callback);
  }
}

}).call(this,require('_process'))
},{"_process":28,"nets":4}],23:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.

/**
 * @constructor
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
Version = function Version() {
 
};

/**
 * Provides metadata and version information about this release of OPS.js.
 * @method
 * @example
 * new Version().information();
 */
Version.prototype.information = function() {
	return {
               "version": "6.1.3", 
               "author": "Ian Dunlop",
	       "ORCID": "http://orcid.org/0000-0001-7066-3350",
               "title": "OPS.js",
               "description": "Javascript library for accessing the Open PHACTS Linked Data API",
               "project": "Open PHACTS",
               "organization": "School of Computer Science",
               "address": "University of Manchester, UK",
               "year": "2015",
               "month": "August",
               "url": "http://github.com/openphacts/ops.js",
               "LDA-version": "1.5"
           }; 
};

exports.Version = Version;

},{}],24:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],25:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":24,"ieee754":26,"isarray":27}],26:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],27:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],28:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[16]);

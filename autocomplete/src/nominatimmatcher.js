/*
 * Copyright (C) 2011 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview Class that retrieves autocomplete matches from Nominatim
 * geocoder service.
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 */

goog.provide('goog.ui.AutoComplete.NominatimMatcher');

goog.require('goog.net.Jsonp');



/**
 * An array matcher that requests matches via JSONP.
 * @param {string=} opt_url The Uri of the web service.
 * @param {Object.<string, string>=} opt_payload The list of extra parameters
     for the Jsonp request.
 * @constructor
 */
goog.ui.AutoComplete.NominatimMatcher = function(opt_url, opt_payload) {

  /**
   * The url of the Nominatim instance
   * @type {string}
   * @private
   */
  //this.url_ = opt_url || 'http://open.mapquestapi.com/nominatim/v1/search';
  //this.url_ = opt_url || 'http://nominatim.mzk.cz?q';
  this.url_ = opt_url || 'http://nominatim.mzk.cz/?q';

  /**
   * The list of extra parameters for the Jsonp request
   * @type {!Object}
   * @private
   */
  this.payload_ = opt_payload || {};

  /**
   * The Jsonp object used for making remote requests.  When a new request
   * is made, the current one is aborted and the new one sent instead.
   * @type {!goog.net.Jsonp}
   * @private
   */
  this.jsonp_ = new goog.net.Jsonp(this.url_, 'json_callback');
};


/**
 * Retrieve a set of matching rows from the server via JSONP and convert them
 * into rich rows.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
goog.ui.AutoComplete.NominatimMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler) {

  var suffix = window['GAZETTEER_SUFFIX'] || '';
  this.payload_['q'] = token + suffix;
  this.payload_['format'] = 'json';
  this.payload_['addressdetails'] = 1;
  this.payload_['limit'] = maxMatches;

  // Ignore token which is empty or just one letter
  if (!token || token.length == 1) {
    matchHandler(token, []);
    return;
  }

  // If you find london

  // After direct request cancel autocomplete
  if (maxMatches == 1) this.oldtoken_ = token;
  if (maxMatches > 1 && token === this.oldtoken_) return;

  // Cancel old request when we have a new one
  if (this.request_ !== null) this.jsonp_.cancel(this.request_);
  

  this.request_ = this.jsonp_.send(this.payload_, function(e) {

  var uniqueArray = new Array();      
  var newArray = new Array();
  var index = 0;

  for(var i = 0; i < e.length; i++) {
    if(uniqueArray.indexOf(e[i]['display_name']) < 0) {
      uniqueArray[index] = e[i]['display_name'];
      newArray[index] = e[i];
      index++;
    }
  }
  matchHandler(token, newArray);
  });
};

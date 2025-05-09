/*!
 * @original-license
 * jQuery Mobile Framework 1.1.0 db342b1f315c282692791aa870455901fdb46a55
 * http://jquerymobile.com
 *
 * Copyright 2011 (c) jQuery Project
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function (window, undefined) {
  var jimMain,
      $navigationTree = jQuery("#navigationtree"),
      defaults = {
        "canvasContainer": jQuery("#simulation"),
        "activePageClass": "ui-page-active"
      },
      path;

  /* START NAVIGATION */
  path = {
    "urlParseRE": /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,
    "parseUrl": function(url) {
      var matches;
      if(typeof(url) === "string") {
        /*
         * [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
         * [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
         * [2]: http://jblas:password@mycompany.com:8080/mail/inbox
         * [3]: http://jblas:password@mycompany.com:8080
         * [4]: http:
         * [5]: //
         * [6]: jblas:password@mycompany.com:8080
         * [7]: jblas:password
         * [8]: jblas
         * [9]: password
         * [10]: mycompany.com:8080
         * [11]: mycompany.com
         * [12]: 8080
         * [13]: /mail/inbox
         * [14]: /mail/
         * [15]: inbox
         * [16]: ?msg=1234&type=unread
         * [17]: #msg-content
         */
        matches = path.urlParseRE.exec(url ||"") || [];
        return {
          "href":         matches[0] || "",
          "hrefNoHash":   matches[1] || "",
          "hrefNoSearch": matches[2] || "",
          "domain":       matches[3] || "",
          "protocol":     matches[4] || "",
          "doubleSlash":  matches[5] || "",
          "authority":    matches[6] || "",
          "username":     matches[8] || "",
          "password":     matches[9] || "",
          "host":         matches[10] || "",
          "hostname":     matches[11] || "",
          "port":         matches[12] || "",
          "pathname":     matches[13] || "",
          "directory":    matches[14] || "",
          "filename":     matches[15] || "",
          "search":       matches[16] || "",
          "hash":         matches[17] || ""
        };
      }
    },
    "stripHash": function(url) {
      return url.replace(/^#\//, "");
    },
    "set": function(url) {
      location.hash = "#/" + path.stripHash(url);
    }
  };

  function getMainWindow(windowRef) {
    var w = windowRef || window;
    return (jimMain.isPopup(w)) ? jimMain.getMainWindow(w.opener) : w;
  }

  function isPopup(window) {
    try {
      return window && window.opener && window.opener.jim;
    } catch (error) {
      window.jim = true;
      return false;
    }
  }


  function stopTransition($page,settings){
	//avoid transitions between devices
	settings.transition="none";

	var $from = (jQuery("."+settings.activePageClass).length) ? jQuery("."+settings.activePageClass) : undefined;
	if($from !== undefined)
		$from.css({"visibility": "hidden"});
  }

  function scaleContent($page){
  	if((jimUtil.scale && jimUtil.scale!=100) || jimUtil.fitted){
        if($page.find('#zoomDiv').length<=0){
        	//if master ONLY
        	if($page.find('.template, .screen').length<=0){
        		$page.find('.master').wrapAll(jQuery('<div id="zoomDiv"/>'));
        	}
        	else{
        		$page.find('.template, .screen').wrapAll(jQuery('<div id="zoomDiv"/>'));
        	}
        }
	}
  }
  
  function loadJS(src, cb, ordered) {
		"use strict";
		var tmp;
		var ref = document.getElementsByTagName( "script" )[ 0 ];
		var script = document.createElement( "script" );

		if (typeof(cb) === 'boolean') {
			tmp = ordered;
			ordered = cb;
			cb = tmp;
		}

		script.src = src;
		script.async = !ordered;
		ref.parentNode.insertBefore( script, ref );

		if (cb && typeof(cb) === "function") {
			script.onload = cb;
		}
		return script;
  }

  function doneContent(html, settings) {
	  var deferred = jQuery.Deferred();
      var $page = jQuery(html).children();
      if($page) {		  
    	setupDevice($page,settings);
    	scaleContent($page);
        settings.canvasContainer
          .append($page)
          .trigger("canvasload", {"$page": $page});
        deferred.resolve($page, settings);
      } else {
        deferred.reject("no data");
      }
      return deferred.promise();
  }

  function getContent(url, settings) {
	    var deferred = jQuery.Deferred();
	    settings.url = lookUpURL(url);
	    var doneMethod = function() {
	    	var promise = doneContent($("#chromeTransfer"), settings)
	    		.done(function(target, args) {
	    	        	 deferred.resolve(target, args);
	    	        	 document.getElementById('chromeTransfer').innerHTML="";
	    	    })
	    	    .fail(function(target, args) {
	    	    	deferred.reject("no data");
	    	    });
	   	}
	    
	    loadJS("./review/" + settings.url + ".js", doneMethod, true);
	    
	    return deferred.promise();
  }

  function handleNavigation(target, args) {
	if(target && typeof(target)==="string") {
	  if(target.indexOf("!")>0) {
		var suffix = target.substring(target.indexOf("!")+1);
		if (suffix.match("^reqID")) {//starts with req
			if(suffix.indexOf("&elemID")>0){
				jimRequirements.openRequirementByID = target.substring(target.indexOf("!reqID")+6,target.indexOf("&elemID="));
				jimRequirements.showComponentByID = target.substring(target.indexOf("&elemID=")+8);
				if(target.indexOf("screens/")>=0)
					jimRequirements.showScreen = "s-" +target.substring(target.indexOf("screens/")+8,target.indexOf("!reqID"));
				else if(target.indexOf("templates/")>=0)
					jimRequirements.showScreen = "t-" +target.substring(target.indexOf("templates/")+10,target.indexOf("!reqID"));
				else if(target.indexOf("masters/")>=0)
					jimRequirements.showScreen = "m-" +target.substring(target.indexOf("masters/")+8,target.indexOf("!reqID"));
				else if(target.indexOf("scenarios/")>=0)
					jimRequirements.showScreen = target.substring(target.indexOf("scenarios/")+10,target.indexOf("!reqID"));
			}
			else
				jimRequirements.openRequirementByID = target.substring(target.indexOf("!reqID")+6);
		}else{
			jimComments.openCommentByID = target.substring(target.indexOf("!")+1);
		}
		target = target.substring(0, target.indexOf("!"));
	  }

	  if(!target.match(/(screens|scenarios)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)) {
		jQuery("#sidepanel").find("#navigationtree").find("a").each(function(index) {
		  if( "/screens/".concat($(this).text())===target || "screens/".concat($(this).text())===target) {
		    target=$(this).attr("href");
		    return false;
		  }
	    });
	  }
	}

    if($.browser.msie && $.browser.version<=8 && target==="") {
      return;
    }

    var settings = jQuery.extend({}, defaults, args), triggerData = args, promise;

    /* clear pause stack on navigation: by action, timeouts, back button, etc. */
    if(jimEvent) {
      jimEvent.clearPauseStack();
    }

    /* If the caller passed us a url, call loadPage() to make sure it is loaded into the DOM. We'll listen to the promise object it returns so we know when it is done loading or if an error ocurred. */
    if(typeof(target) === "string") {
      /* If we are in the midst of a transition, queue the current request. We'll call changePage() once we're done with the current transition to service the request. */
      if(transition.isTransitioning) {
        transition.queue.unshift(arguments);
        return;
      }
      transition.isTransitioning = true;
      settings.canvasContainer.trigger("canvasunload", triggerData);
      promise = getContent(target, settings)
        .done(function(target, args) {
          transition.isTransitioning = false;
          handleNavigation(target, args);

          //load integration tools
          var urlPath = "#/"+args.url;
          var title = args.url;
          if(window.externalTools){
        	  window.externalTools.load(urlPath,title);
          }
        })
        .fail(function(target, args) {
          /*jimUtil.debug(errorThrown);*/
          transition.releaseLock();
          window.location.replace("resources/jim/html/error.html");
        });
    } else {
      var url = settings.url || "",
          $from = (jQuery("."+settings.activePageClass).length) ? jQuery("."+settings.activePageClass) : undefined,
          historyDir = settings.historyDir || (settings.isbackward) ? -1 : (settings.isforward) ? 1 : 0;

      if (historyDir === -1 && jimScenarios.currentNode != -1)
      	if (!jimScenarios.isValidLink(url)) jimScenarios.deleteFilter();
      if (historyDir === 0) {
        urlHistory.addNew(url);
      } else if(settings.isbackward || settings.isforward) {
        urlHistory.ignoreNextHashChange = true;
        path.set(url);
        urlHistory.update({"currentUrl": url}); /* updates urlHistory.activeIndex */
      }
      promise = transition.start(target, $from, settings.transition, settings.reverse);
    }
    return promise;
  }
  
  function getDomain(url, subdomain) {
    	subdomain = subdomain || false;
		url = url.replace(/(https?:\/\/)?(www.)?(cloud.)?/i, '');

    	if (!subdomain) {
        	url = url.split('.');
        	url = url.slice(url.length - 2).join('.');
    	}

    	if (url.indexOf('/') !== -1) {
        	return url.split('/')[0];
    	}

    	return url;
	}

  /*
   *
   * @param {Object} target
   * @param {Object} args
   * @param {Object} forced
   * 	-1 : Event-triggered transition
   *     1 : Click on scenario triggered transition
   *     2 : Click on sidepanel triggered transition
   * @return {Object}
   */
  function navigate(target, args, forced) {
	forced = typeof forced !== 'undefined' ? forced : -1;
	var url, options, popup, deferred;

    if(typeof(target) === "string") { /* called as url with optional options */
      options = jQuery.extend({}, args);
    } else if (typeof(target) === "object") { /* called with action parameters or urlHistory stack entry */
      options = jQuery.extend({}, target, args);
      target = target.target || target.url;
    }
    if(target) {
	  var showExternalWarning=false;
	  if(options.isexternal){
	 	if(!$('body').hasClass("onsite") && !$('body').hasClass("offline") && $('body').hasClass("public")) {
	 		var currentUrl = getDomain(window.location.href, true);
	 		var targetUrl = getDomain(target, true);
			if(currentUrl !== targetUrl && targetUrl !== "#") { //avoid same domain and '#' url
				var trustedDomainsCookie=getCookie('jim-trusted-domains');
				showExternalWarning=true;
				if(trustedDomainsCookie!=null){
					var domainsArray = trustedDomainsCookie.split(',');
    				domainsArray.forEach(function (item, index) {
						if(item===targetUrl){
							showExternalWarning=false;
						}
	        		});
				}
				
				if(showExternalWarning){
					window.location.href = "resources/jim/html/external.html?url="+target+"&tab="+((options.tab)?"true":"false");
				}
				
			}
		}
	  }
	  
	  if (!$("body").hasClass("offline")) {
	  	checkUpdatedVersion();
	  }
	  
      if (options.popup) {
        url = (options.isexternal) ? target : "index.html#/" + target;
        if(options.popup.iscentered) {
          options.popup.left = (screen.availWidth - options.popup.width) / 2;
          options.popup.top = (screen.availHeight - options.popup.height) / 2;
        }
        popup = window.open(url, "", "width=" + options.popup.width + ",height=" + options.popup.height + ",top=" + options.popup.top + ",left=" + options.popup.left + ",scrollbars=" + options.popup.hasscrollbars + ",resizable=" + options.popup.isresizable);
        window.jim = true;
        popup.focus();
        window.popups.push(popup);
      } else if (options.tab) {
        url = (options.isexternal) ? target : "index.html#/" + target;
        jQuery(".pageunload").trigger("pageunload");
       	if(!showExternalWarning){
			popup = window.open(url, "_blank");
	        window.jim = true;
	        popup.window.jimData = window.jimData;
	        popup.focus();
		}
      } else {
        if(options.isexternal) {
          if(!showExternalWarning)
          	window.location.href = target;
        } else {
          if (jimMain.isPopup(window)) {
            deferred = jimMain.getMainWindow().jimMain.handleNavigation(target, options);
            window.close();
          } else {
        	var valid = true;

        	if (jimScenarios.currentNode != -1 && forced == -1)
        	  valid = jimScenarios.isValidLink(target);
        	else if (forced == 2) {
        	  jimScenarios.currentNode = -1;
        	  $("#infoContent .filterText").css({"display": ""});
        	  $("#scenarioThumbnail #scenarioWrapper").remove();
        	}

        	if (valid) {
			  deferred = handleNavigation(target, options);
        	}
        	else jimHighlight.highLightAll();
          }
          return deferred; /* returns deferred object to attach third-party callbacks, e.g. highlight comment-related component */
        }
      }
    }
  }
  
  function setupDevice($page,settings){
	  var oldDeviceName = jimDevice.name;
	  var deviceName = "";
	  var deviceType = "";
	  if($page.hasClass("ui-scenario")){
		deviceName = "scenario";
		deviceType = "scenario";
	  }
	  else if($page.hasClass("ui-component")){
		deviceName = "component";
		deviceType = "component";
	  }
	 else{
	  deviceName = $page.attr("devicename").toLowerCase();
	  deviceType = $page.attr("devicetype").toLowerCase();
     }

      var deviceWidth = $page.attr("devicewidth");
      var deviceHeight = $page.attr("deviceheight");
      var deviceSize = "s"+deviceWidth+"x"+deviceHeight;

	  var $body = $("body");
      var deviceClasses = $body.data("deviceClasses");

	  //Change device
	  if((deviceName !== oldDeviceName) || ((jimDevice.isAndroidPhone() || jimDevice.isAndroidTablet() || jimDevice.isCustom()) &&($.inArray(deviceSize,deviceClasses))<0)){
		  if(!jimUtil.isMobileDevice())
		  	stopTransition($page,settings);
		  //unload old device simulator
		  jimDevice.unloadDeviceSimulator();

		  var $simulation = $("#simulation");
		  var $jimBody = $("#jim-body");
		  //remove old classes
		  $body.removeClass("devMobile devIOS devAndroid devAndroidPhone devAndroidTablet devCustom iphone-device ipad-device android-device pixel-device galaxy-device");
		  var cName;
		  if(deviceClasses){
			  for (var n = 0; n < deviceClasses.length; n++){
				  cName = deviceClasses[n];
				 $body.removeClass(cName);
			  }
		  }

		  //load new device simulator
		  jimDevice.name = deviceName;
		  jimDevice.type = deviceType;

		  if(jimUtil.isMobileDevice()){
			        if(!$simulation.parent().is("#jim-body")){
			          //inside mobile // move out
			          $simulation.appendTo($("#jim-body"));
			        }
			        jimWebDevice.hideWebdeviceOption();
		  }else{
			       //add classes to body
			       deviceClasses = [];
			       $body.addClass(deviceName);
			       deviceClasses.push(deviceName);
			       if(jimDevice.isMobile())
			         $body.addClass("devMobile");
			       if(jimDevice.isIOS()) {
			         $body.addClass("devIOS");
			       	 if(jimDevice.isiPhone())
			       	   $body.addClass("iphone-device");  
			         else $body.addClass("ipad-device");
			       }
			       else if(jimDevice.isAndroidNamed()) {
			         $body.addClass("devAndroid");
			         if(jimDevice.isAndroidGalaxy())
			       	   $body.addClass("galaxy-device");  
			         else if(jimDevice.isAndroidPixel())
			           $body.addClass("pixel-device");
			       }
			       else if(jimDevice.isAndroid() || jimDevice.isCustom()) {
			         var deviceWidth = $page.attr("devicewidth");
			         var deviceHeight = $page.attr("deviceheight");
			         var deviceSize = "s"+deviceWidth+"x"+deviceHeight;
			         $body.addClass(deviceSize);
			         deviceClasses.push(deviceSize);
			         if(jimDevice.isAndroidPhone())
			         	$body.addClass("devAndroidPhone");
			         else if(jimDevice.isAndroidTablet())
			         	$body.addClass("devAndroidTablet");
			         else if(jimDevice.isCustom())
			           $body.addClass("devCustom");
			       }
			       if(jimDevice.isAndroid()) {
			         $body.addClass("android-device");
			       }
			       
			       $body.data("deviceClasses",deviceClasses);

			        /* change DOM Structure */
					$jimBody.removeClass("component");
					
					if($page.hasClass("ui-component")){
						//remove from jim-mobile
			  			  if(!$simulation.parent().is("#jim-comp-container .pin-transform-layer")){
			  				  //not inside mobile // insert
			  				  $simulation.appendTo($("#jim-comp-container .pin-transform-layer"));
			  			  }
				         $jimBody.addClass("component");
						 jimWebDevice.hideWebdeviceTopControls();
					}
			        else if(jimDevice.isMobile()){
			  			  //add simulation in jim-mobile - jim-container
			  			  if(!$simulation.parent().is("#jim-container .pin-transform-layer")){
			  				  //not inside mobile // insert
			  				  $simulation.appendTo($("#jim-container .pin-transform-layer"));
			  			  }
			  			  $jimBody.addClass("mobile");
			  			  jimWebDevice.hideWebdeviceOption();
			  		}
			  		else if($page.hasClass("ui-scenario")){
				         //remove from jim-mobile
				         if(!$simulation.parent().is("#jim-web .pin-transform-layer")){
				           //inside mobile // move out
				           $simulation.appendTo($("#jim-web .pin-transform-layer"));
				         }
				         $jimBody.addClass("scenario");
				         jimWebDevice.hideWebdeviceOption();
			        }else{
			  			  //remove from jim-mobile
			  			  if(!$simulation.parent().is("#jim-web .pin-transform-layer")){
			  				  //inside mobile // move out
			  				  $simulation.appendTo($("#jim-web .pin-transform-layer"));
			  			  }
			  			  $jimBody.addClass("web");

			          jimWebDevice.showWebdeviceOption();
			  		  }
		  }

	      jimLayout.resizeTopInfo($page);

	      //set cursors
		  jimDevice.isMobile() ? jimDevice.tool = "touch" : jimDevice.tool="cursor";
	  }
	  
	  //get rotation from original canvas
	  var landscape = $("#jim-mobile").hasClass("landscape");
	  var $canvas = $page.find(".screen");
	  if($canvas.length > 0){
	  	var toLandscape = $page.find(".screen").hasClass("LANDSCAPE");
		if(landscape != toLandscape){
			  if(!jimUtil.isMobileDevice() && jimDevice.isMobile()){
				stopTransition($page,settings);
				jimDevice.rotateDevice(true);
			  }
		 }
	  }

      if(!jimUtil.isMobileDevice()){
    	if(jimDevice.isMobile())
    	  jQuery("body").css("display", "block");
        else if($page.hasClass("ui-component")){
          var deviceWidth = $page.attr("devicewidth");
          var deviceHeight = $page.attr("deviceHeight");
		  var translateX = parseInt($page.attr("offsetX"))*(-1);
		  var translateY = parseInt($page.attr("offsetY"))*(-1);
          $("#jim-comp-container").css("width",(Math.round(parseFloat(deviceWidth))+3)+"px");
          $("#jim-comp-container").css("height",(Math.round(parseFloat(deviceHeight))+3)+"px");
		  //$page.children().css("transform","translate("+translateX+"px,"+translateY+"px");
		}
        else if($page.hasClass("ui-scenario")){
		  $("#web-clip-left").css("display", "none");
		  $("#web-clip-right").css("display", "none");
		  $("#jim-web").css("width", "100%");
		  $("#jim-web").css("height", "100%");
        }
        else{
          jimWebDevice.updateCanvasWidth($page);
          jimWebDevice.setCurrentWebDeviceWidth($page);
        }
    }
  }
  /* END NAVIGATION */

  /*
   * HTML5 proposes native pickers for inputs. We must disable them to use the jQuery ones,
   * but mobile devices should use them to open the native widgets.
   */
  function changeInputType() {
	  $('#simulation').find('input[type="date"], input[type="time"], input[type="datetime-local"], input[type="email"], input[type="url"], input[type="number"]').each(function() {
		if(jQuery(this).attr("readonly"))
		  $("<input type='text' />").attr({ name: this.name, value: this.defaultValue, tabindex: this.tabIndex, placeholder: this.placeholder, readonly:"readonly" }).insertBefore(this);
		else $("<input type='text' />").attr({ name: this.name, value: this.defaultValue, tabindex: this.tabIndex, placeholder: this.placeholder }).insertBefore(this);
	  }).remove();
  }
  
  function checkUpdatedVersion() {
  	if(!$("#newProjectVersion").is(":visible")) {
	    var timestamp = $("body").attr("timestamp");
	    $.getJSON('doGetUpdateStatus.action?timestamp=' + timestamp, function(data) {
	    	if (data.newTimestamp!=='-1' && data.newTimestamp > timestamp) {
	        	$("#newProjectVersion").show(); 
	        }
		});
	}
  }
  
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  function Settings() {
	  this.bubbles = true;
	  this.cancelable = true;
	  this.view = window;
	  this.screenX = 0;
	  this.screenY = 0;
	  this.clientX = 1;
	  this.clientY = 1;
	  this.ctrlKey = false;
	  this.altKey = false;
	  this.shiftKey = false;
	  this.metaKey = false;
	  this.button = 0;
	  this.relatedTarget = null;
	  return this;
	}

  /* START MAIN */
  window.popups = [];
  jimMain = {
    "path": path,
    "defaults": defaults,
    "init": function(home) {
      if(window.location.hash === "") {
        jimData.clearData();
        urlHistory.ignoreNextHashChange = true;
        path.set(home);
      }
    },
    "getMainWindow": getMainWindow,
    "isPopup": isPopup,
    "navigate": navigate,
    "handleNavigation": handleNavigation,
    "unload": function() {
      jQuery(".pageunload").trigger("pageunload");
      defaults.canvasContainer.attr("class", "firer");
    }
  };

  window.jimMain = jimMain; /* expose to the global object */
  /* END MAIN */

  /* START EVENTS */
  jQuery(window)
    .bind("load", function() {
      jimLayout.load();
      jimDevice.init();
      jimData.load(window);
      if(jimUtil.isMobileDevice()){
    	  jQuery("body").removeClass("showComments");
    	  var topBar = jQuery("#topBarInfo");
    	  topBar.css("display","none");
    	  topBar.addClass("close");
      }
      else{
    	  window.jimComments.load();
      }
      if(window.location.hash !== "") {
	    handleNavigation(path.stripHash(location.hash));
      }

    })
    .bind("unload", function() {
      for(var p=0, pLen=window.popups.length; p<pLen; p+=1) {
        window.popups[p].close();
      }
      jimMain.unload();
      jimData.unload(window);
    });

    window.overTargets = [];
    $(document).ready(function() {
        $("*").mouseover(function(e) {
        		if (window.overTargets.length > 0) {
        			var $target = $(e.target);
              if (!$target.is(".firer"))
              	$target = $target.closest(".firer");
        			var overToRemove = [];
        			if ($target.length > 0) {
                window.overTargets.forEach(function(elem) {		
        					if ($target[0] != elem && $(elem).has($target).length == 0) {
        						overToRemove.push($(elem));
        						var e = document.createEvent("MouseEvents");
        						var s = new Settings();
        						e.initMouseEvent("mouseleave", s.bubbles, s.cancelable, s.view, 0, s.screenX, s.screenY, s.clientX, s.clientY, s.ctrlKey, s.altKey, s.shiftKey, s.metaKey, s.button, elem);
        						var jEvent = jimEvent(e);
        						jEvent.undoCases($(elem));
        					}
                });
                overToRemove.forEach(function(elem) {
                	if (window.overTargets.indexOf($(elem).get(0)) !== -1)
      							window.overTargets.splice(window.overTargets.indexOf($(elem).get(0)), 1);
                })
              }
          	}
        });
    });

  defaults.canvasContainer
    /*.bind("pagebeforechange", function(event, data) {}).bind("pagechangefailed", function(event, data) {})*/
    .bind("canvasunload", function(event, data) {
       jimMain.unload();
       if(jimDevice.isMobile() && !jimUtil.isMobileDevice()) {
    	 jimDevice.unload();
       }
       if(typeof(annotation) !== "undefined") { annotation.unload(); }
    })
    .bind("canvasload", function(event, data) {
       if(!jimUtil.isMobileDevice())
         changeInputType();
       //load specific details of iOS Safari browser
       if(jimUtil.isiOSDevice() && jQuery(".web, .mobilecustom").length>0) {
    	   var fileref=document.createElement("link");
    	   fileref.setAttribute("rel", "stylesheet");
    	   fileref.setAttribute("type", "text/css");
    	   fileref.setAttribute("href", "./resources/jim/css/function-jim-common-ios.css");
    	   document.getElementsByTagName("head")[0].appendChild(fileref);
       }
    })
    .bind("aftertransition", function(event, data) {
      var $target = jQuery(event.target || event.srcElement);
	  $("#simulation").css("background-color", "");
	  $("#simulation").css("background-image", "");
	  
      if($target.is(".ui-page")) {
    	$target = defaults.canvasContainer;
    	defaults.canvasContainer.find(".ui-page:not(."+defaults.activePageClass+")").remove();
    	/* TODO ensure all resources are loaded and effective */
    	defaults.canvasContainer.addClass(jimUtil.getCanvases().join(" "));
      }
	  
	  jimUtil.setMasterPinTransforms();
	  
      setTimeout(function() {
	  	window.jimComments.updateComments();
    	if($target.is("#simulation")) {  
		  $("#simulation").addClass("blockRefresh");
    	  $target.trigger("loadcomponent");
		  $("#simulation").removeClass("blockRefresh");
		  
		  jimUtil.refreshDynamicPanelResponsiveSize($("#simulation"));
    	  
    	  jimUtil.wrapAllDataVerticalLayouts(); // Wrap vertical layouts in datagrids/datalists
    	  jimUtil.wrapAllDataHorizontalLayouts();
       	  $navigationTree.trigger("load", [urlHistory.getActive().url]);
          jimDevice.loadDeviceSimulator();

    	  $target.find(".pageload").trigger("pageload");
    	  //jimUtil.calculateMasterMinSize($target);
      	  if(typeof(annotation) !== "undefined") { annotation.load(); }
      	  if(!jimUtil.isMobileDevice() && jimComments.openCommentByID.length > 0) {
			jimComments.showComments(jimComments.openCommentByID);
			jimComments.openCommentByID = "";
		  }
		  else if(!jimUtil.isMobileDevice() && jimRequirements.openRequirementByID.length > 0) {
			jimRequirements.showRequirement(jimRequirements.openRequirementByID,jimRequirements.showComponentByID,jimRequirements.showScreen);
			jimRequirements.openRequirementByID = "";
			jimRequirements.showComponentByID = "";
			jimRequirements.showScreen = "";
		  }
	      if (!jimUtil.isMobileDevice()) jimRequirements.filterRequirements();
	      if (jimUtil.isMobileDevice()) $("span").on("click", function(event){ event.preventDefault();});

	      jimResponsive.refreshResponsiveCanvas(undefined, false, false, undefined, false);
	      jimResponsive.refreshResponsiveComponents(undefined, undefined, false, undefined, true);
	      jimDevelopers.triggerNavigation();
    	}

    	var sidepanel = $("#sidepanel");
    	if (sidepanel.hasClass("toClose")) {
    	  $("#toggle-panel-btn > span").trigger('click');
          sidepanel.removeClass("toClose");
        }

        var sim = $("#simulation");
        var toHighlight = sim.attr("toHighlight");
        if (toHighlight != undefined && toHighlight != ""){
            jimUtil.showElementThroughParentPanes($("#"+toHighlight))
            jimHighlight.highlightElement($("#"+toHighlight));
        }
        sim.attr("toHighlight","");

      }, 100);

      jimScenarios.bindScreenEvents();
      jimScenarios.initializeScenarios();
    });
  /* END EVENTS */
})(window);

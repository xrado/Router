/*
---

name: Router

license: MIT-style license.

authors: [Radovan Lozej, DimitarChristoff]

requires:
 - Core/DOMEvent
 - Core/Class

provides: Router

inspiration: http://documentcloud.github.com/backbone/#Router

...
*/
;(function() {

	var hc = 'hashchange',
		hcSupported = !!(('on' + hc) in window),
		eventHosts = [window, document],
		getQueryString = function(queryString) {
			var result = {},
				re = /([^&=]+)=([^&]*)/g,
				m;

			while (m = re.exec(queryString)) {
				result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}

			return result;
		};

	Element.Events.hashchange = {
		// Cross browser support for onHashChange event - http://github.com/greggoryhz/MooTools-onHashChange-Event/
		onAdd: function () {
			var hash = location.hash,
				check = function () {
					if (hash == location.hash)
						return;

					hash = location.hash;
					eventHosts.invoke('fireEvent', hc, hash.indexOf('#') == 0 ? hash.substr(1) : hash);
				};

			(hcSupported && (window.onhashchange = check)) || check.periodical(100);
		}
	};


	// Router
	this.Router = new Class({

		Implements: [Options, Events],

		options: {
			triggerOnLoad : true // check route on load
		},

		routes: {
			// '#!path/:query/:id?': 'eventname',
		},

		boundEvents: {},

		preventTrigger: false,

		initialize: function(options) {
			var self = this;

			this.setOptions(options);
			this.options.routes && (this.routes = this.options.routes);

			window.addEvent(hc, this.routing.bind(this,[false]));

			this.fireEvent('ready');
			this.options.triggerOnLoad && window.fireEvent(hc);
		},

		routing: function(_return) {
			
			if(this.preventTrigger && !_return){
				this.preventTrigger = false;
				return;
			}

			var hash = location.hash,
				path = hash.split('?')[0],
				query = hash.split('?')[1] || '',
				notfound = true,
				route;

			for(route in this.routes) {
				var keys = [],
					regex = this.normalize(route, keys, true, false),
					found = regex.exec(path),
					routeEvent = false;

				if (found) {
					notfound = false;
					this.req = found[0];

					var args = found.slice(1),
						param = {};

					Array.each(args, function(a, i) {
						typeof keys[i] !== 'undefined' && (param[keys[i].name] = a);
					});

					this.route = route;
					this.param = param || {};
					this.query = query && getQueryString(query);

					if(_return) return this;

					// find referenced events
					routeEvent = this.routes[route];

					// generic before route, pass route id, if avail
					this.fireEvent('before', routeEvent);

					// if there is an identifier and an event added
					if (routeEvent && this.$events[routeEvent]) {
						// route event was defined, fire specific before pseudo
						this.fireEvent(routeEvent + ':before');
						// call the route event handler itself, pass params as arguments
						this.fireEvent(routeEvent, Object.values(this.param));
					}
					else {
						// requested route was expected but not found or event is missing
						this.fireEvent('error', ['Route', routeEvent, 'is undefined'].join(' '));
					}

					// fire a generic after event
					this.fireEvent('after', routeEvent);

					// if route is defined, also fire a specific after pseudo
					routeEvent && this.fireEvent(routeEvent + ':after');
					break;
				}
			}

			if(_return) return false;
			notfound && this.fireEvent('undefined');
			this.fireEvent('complete');

		},

		// get route params after navigate with prevent triggering
		getRoute: function(){
			return this.routing(true);
		},

		navigate: function(route, trigger) {
			typeof trigger !== 'undefined' && !trigger && (this.preventTrigger = true);
			
			if (location.hash == route && trigger) {
				window.fireEvent(hc);
			}
			else {
				location.hash = route;
			}
		},

		normalize: function(path, keys, sensitive, strict) {
			// normalize by https://github.com/visionmedia/express
			if (path instanceof RegExp) return path;

			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {

				keys.push({
					name: key,
					optional: !! optional
				});

				slash = slash || '';

				return [
					(optional ? '' : slash),
					'(?:',
					(optional ? slash : ''),
					(format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')',
					(optional || '')
				].join('');
			}).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		},

		addRoute: function(obj) {
			// adds a new route, expects keys @route (string), @id (string), @events (object)
			if (!obj || !obj.route || !obj.id || !obj.events)
				return this.fireEvent('error', 'Please include route, id and events in the argument object when adding a route');

			if (!obj.id.length)
				return this.fireEvent('error', 'Route id cannot be empty, aborting');

			if (this.routes[obj.route])
				return this.fireEvent('error', 'Route "{route}" or id "{id}" already exists, aborting'.substitute(obj));


			this.routes[obj.route] = obj.id;
			this.addEvents(this.boundEvents[obj.route] = obj.events);

			return this.fireEvent('route:add', obj);
		},

		removeRoute: function(route) {
			if (!route || !this.routes[route] || !this.boundEvents[route])
				return this.fireEvent('error', 'Could not find route or route is not removable');

			this.removeEvents(this.boundEvents[route]);

			delete this.routes[route];
			delete this.boundEvents[route];

			return this.fireEvent('route:remove', route);
		}

	});

}());
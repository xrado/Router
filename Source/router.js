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

			window.onhashchange = hcSupported ? check : check.periodical(100);
		},
		onRemove: function(){
			(hcSupported && (window.onhashchange = null)) || clearInterval(window.onhashchange);
		}
	};

	// Hash monitor
	var Monitor = new Class({

		Implements: [Events],

		start: function(){
			this.boundChange = this.change.bind(this);
			window.addEvent('hashchange',this.boundChange);
		},

		stop: function(){
			window.removeEvent('hashchange',this.boundChange);
		},

		change: function(hash){
			this.fireEvent('change',hash);
		}
	});

	this.HashMonitor = new Monitor();


	// Router
	this.Router = new Class({

		Implements: [Options, Events],

		options: {
			prefix: '',
			triggerOnLoad : true // check route on load
		},

		routes: {
			// '#!path/:query/:id?': 'eventname',
		},

		boundEvents: {},

		initialize: function(options) {
			var self = this
			this.setOptions(options);

			if(this.options.prefix && this.options.prefix.substr(-1) !== '/') this.options.prefix += "/";
			this.options.routes && (this.routes = this.options.routes);

			if(this.options.prefix) {
				var _routes = {};
				Object.each(this.routes,function(name,route){
					var newroute;

					if(route.substr(0,1) == '/') newroute = self.options.prefix.slice(0,-1) + route;
					else newroute = route ? self.options.prefix + route : self.options.prefix.slice(0,-1);

					_routes[newroute] = name;
				});
				this.routes = _routes;
			}

			this.boundRouting = this.routing.bind(this,[false]);
			HashMonitor.addEvent('change',this.boundRouting);

			this.fireEvent('ready');

			this.options.triggerOnLoad && this.routing(false);
		},

		routing: function(_return) {
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
					this.query = query && getQueryString(query) || {};

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

		normalize: function(path, keys, sensitive, strict) {
			if (toString.call(path) == '[object RegExp]') return path;
			if (Array.isArray(path)) path = '(' + path.join('|') + ')';
			path = path
				.concat(strict ? '' : '/?')
				.replace(/\/\(/g, '(?:/')
				.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
					keys.push({ name: key, optional: !! optional });
					slash = slash || '';
					return ''
						+ (optional ? '' : slash)
						+ '(?:'
						+ (optional ? slash : '')
						+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
						+ (optional || '')
						+ (star ? '(/*)?' : '');
				})
				.replace(/([\/.])/g, '\\$1')
				.replace(/\*/g, '(.*)');
			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		},

		navigate: function(route, trigger) {
			var self = this;
			if(this.options.prefix){
				if(route.substr(0,1) == '/') route = this.options.prefix.slice(0,-1) + route;
				else route = route ? this.options.prefix + route : this.options.prefix.slice(0,-1);
			}

			if(typeof trigger !== 'undefined' && !trigger) {
				HashMonitor.removeEvent('change',this.boundRouting);
			}

			if (location.hash == route && trigger) {
				window.fireEvent('hashchange');
			} else {
				location.hash = route;
			}

			if(typeof trigger !== 'undefined' && !trigger) {
				this.routing(true);
				(function(){
					HashMonitor.addEvent('change',self.boundRouting);
				}).delay(0);
			}
		},

		addRoute: function(obj) {
			// adds a new route, expects keys @route (string), @id (string), @events (object)
			if (!obj || !obj.route || !obj.id || !obj.events)
				return this.fireEvent('error', 'Please include route, id and events in the argument object when adding a route');

			if (!obj.id.length)
				return this.fireEvent('error', 'Route id cannot be empty, aborting');

			if(this.options.prefix){
				var newroute;
				if(route.substr(0,1) == '/') newroute = this.options.prefix.slice(0,-1) + route;
				else newroute = route ? this.options.prefix + route : this.options.prefix.slice(0,-1);
				obj.route = newroute;
			}

			if (this.routes[obj.route])
				return this.fireEvent('error', 'Route "{route}" or id "{id}" already exists, aborting'.substitute(obj));

			this.routes[obj.route] = obj.id;
			this.addEvents(this.boundEvents[obj.route] = obj.events);

			return this.fireEvent('route:add', obj);
		},

		removeRoute: function(route) {
			if(this.options.prefix){
				var newroute;
				if(route.substr(0,1) == '/') newroute = this.options.prefix.slice(0,-1) + route;
				else newroute = route ? this.options.prefix + route : this.options.prefix.slice(0,-1);
				route = newroute;
			}

			if (!route || !this.routes[route] || !this.boundEvents[route])
				return this.fireEvent('error', 'Could not find route or route is not removable');

			this.removeEvents(this.boundEvents[route]);

			delete this.routes[route];
			delete this.boundEvents[route];

			return this.fireEvent('route:remove', route);
		},

		destroy: function(){
			HashMonitor.removeEvent('change',this.boundRouting);
		}

	});

}());
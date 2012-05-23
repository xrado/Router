/*
---

name: Router

license: MIT-style license.

authors: [Radovan Lozej, DimitarChristoff]

requires:
 - Core/DOMEvent
 - Core/Class
 - More/String.QueryString

provides: Router

...
*/


;(function() {
    /*

     inspiration:

     http://documentcloud.github.com/backbone/#Router
     Element.Events.hashchange by http://github.com/greggoryhz/MooTools-onHashChange-Event/
     _normalize by https://github.com/visionmedia/express

    */

    Element.Events.hashchange = {
        // Cross browser support for onHashChange event
        onAdd: function () {
            var hash = location.hash,
                hashchange = function () {
                    if (hash == location.hash) {
                        return;
                    }
                    else {
                        hash = location.hash;
                    }
                    var value = (hash.indexOf('#') == 0 ? hash.substr(1) : hash);

                    window.fireEvent('hashchange', value);
                    document.fireEvent('hashchange', value);
                };

            if ("onhashchange" in window) {
                window.onhashchange = hashchange;
            }
            else {
                hashchange.periodical(100);
            }
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

        initialize: function(options) {
            var self = this;

            this.setOptions(options);
            this.options.routes && (this.routes = this.options.routes);

            window.addEvent('hashchange', function(e) {
                var hash = location.hash,
                    path = hash.split('?')[0],
                    query = hash.split('?')[1] || '',
                    notfound = true,
                    route;

                for(route in self.routes) {
                    var keys = [],
                        regex = self._normalize(route, keys, true, false),
                        found = regex.exec(path),
                        routeEvent = false;

                    if (found) {
                        notfound = false;
                        self.req = found[0];

                        var args = found.slice(1),
                            param = {};

                        Array.each(args, function(a, i) {
                            typeof keys[i] !== 'undefined' && (param[keys[i].name] = a);
                        });

                        self.route = route;
                        self.param = param || {};
                        self.query = query ? query.parseQueryString() : {};

                        // find referenced events
                        routeEvent = self.routes[route];

                        // generic before route, pass route id, if avail
                        self.fireEvent('before', routeEvent);

                        // if there is an identifier and an event added
                        if (routeEvent && self.$events[routeEvent]) {
                            // route event was defined, fire specific before pseudo
                            self.fireEvent(routeEvent + ':before');
                            // call the route event handler itself, pass params as arguments
                            self.fireEvent(routeEvent, Object.values(self.param));
                        }
                        else {
                            // requested route was expected but not found or event is missing
                            self.fireEvent('error', ['Route', routeEvent, 'is undefined'].join(' '));
                        }

                        // fire a generic after event
                        self.fireEvent('after', routeEvent);

                        // if route is defined, also fire a specific after pseudo
                        routeEvent && self.fireEvent(routeEvent + ':after');
                        break;
                    }
                }

                notfound && self.fireEvent('undefined');

            });

            this.fireEvent('ready');
            this.options.triggerOnLoad && window.fireEvent('hashchange');
        },

        navigate: function(route, trigger) {
            if (location.hash == route && trigger) {
                window.fireEvent('hashchange');
            }
            else {
                location.hash = route;
            }
        },

        _normalize : function (path, keys, sensitive, strict) {
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
        }

    });

}());
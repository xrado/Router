/* 
 * 
 * description: Router provides methods for routing client-side pages, and connecting them to actions and events based on hashchange event.
 * 
 * author: xrado (radovan.lozej@gmail.com) 
 * 
 * license: MIT-style
 * 
 * inspiration:
 * http://documentcloud.github.com/backbone/#Router
 * Element.Events.hashchange by http://github.com/greggoryhz/MooTools-onHashChange-Event/
 * _normalize by https://github.com/visionmedia/express
 * 
 * requires:
 *   core: '*'
 *   more: 'String.QueryString'
 * 
 * provides:
 *   - Router
 * 
 */

// Cross browser support for onHashChange event

Element.Events.hashchange = {
	onAdd: function () {
		var hash = location.hash;
		var hashchange = function () {
			if (hash == location.hash) return;
			else hash = location.hash;
			var value = (hash.indexOf('#') == 0 ? hash.substr(1) : hash);
			window.fireEvent('hashchange', value);
			document.fireEvent('hashchange', value);
		};
		if ("onhashchange" in window) window.onhashchange = hashchange;
		else hashchange.periodical(100);
	}
};

// Router

var Router = new Class({
	
	Implements: [Options, Events],
	
	options: {
		triggerOnLoad : true // check route on load
	},
	
	routes: {
		// '#!path/:query/:id?': 'method',
	},
	
	initialize: function (options) {
		var self = this
		window.addEvent('hashchange',function(e){
			var hash = location.hash;
			var path = hash.split('?')[0]
			var query = hash.split('?')[1] || '';
			var notfound = true;
			for(route in self.routes) {
				var keys = []
				var regex = self._normalize(route,keys,true,false)
				var found = regex.exec(path)
				if(found){
					notfound = false;
					self.req = found[0]
					var args = found.slice(1)
					var param = {}
					Array.each(args,function(a,i){
						param[keys[i].name] = a
					});
					self.route = route;
					self.param = param || {};
					self.query = query ? query.parseQueryString() : {};
					self.before()
					self[self.routes[route]]()
					self.after()
				} 
			}
			if(notfound) self.notfound()

		})
		this.init();
		if(this.options.triggerOnLoad) window.fireEvent('hashchange');
	},
	
	init: function(){},
	before: function(){},
	after: function(){},
	notfound: function(){},
	
	navigate: function(route,trigger){
		if(location.hash == route && trigger) window.fireEvent('hashchange');
		else location.hash = route;
	},
	
	_normalize : function (path, keys, sensitive, strict) {
		if (path instanceof RegExp) return path;
		path = path
		.concat(strict ? '' : '/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
			keys.push({ name: key, optional: !! optional });
			slash = slash || '';
			return ''
				+ (optional ? '' : slash)
				+ '(?:'
				+ (optional ? slash : '')
				+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
				+ (optional || '');
		})
		.replace(/([\/.])/g, '\\$1')
		.replace(/\*/g, '(.*)');
		return new RegExp('^' + path + '$', sensitive ? '' : 'i');
	}
	
});




Router
===========

Router provides methods for routing client-side pages, and connecting them to actions and events based on hashchange event, written in MooTools.

How to use
----------

	var App = Router.implement({
		// routes definition
		routes: {
			''						: 'index',
			'#!help'				: 'help',
			'#!test1/:query/:id?'	: 'test1',
			'#!test2/:query/*'		: 'test2',
		},
		
		// runned on router init
		init: function(){  
			console.log('init')
		},
		
		// runned before route method
		before: function(){ 
			console.log('before')
		},
		
		// routes methods
		index: function(){
			console.log('index')
		},
		
		help: function(){
			console.log('help')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		test1: function(){
			console.log('test1')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		test2: function(){
			console.log('test2')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		// runned after route method
		after: function(){
			console.log('after')
		},
		
		// runned if no route match
		notfound: function(){
			alert('notfound')
			window.app.navigate('');
		}
	});
	
	window.app = new App();

Requires
-----------------
 * Mootools-Core
 * Mootools-More/String.QueryString

Inspiration
-----------------
 * http://documentcloud.github.com/backbone/#Router
 * Element.Events.hashchange by http://github.com/greggoryhz/MooTools-onHashChange-Event/
 * _normalize by https://github.com/visionmedia/express

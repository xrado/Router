window.addEvent('domready',function(){
	
	var App = Router.implement({
		// routes definition
		routes: {
			''						: 'index',
			'#!help'				: 'help',
			'#!search/:query/:id?'	: 'search',
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
		
		search: function(){
			console.log('search')
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
	
});

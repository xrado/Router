window.addEvent('domready',function(){
	
    var App = new Router({
		// routes definition
		routes: {
			''						: 'index',
			'#!help'				: 'help',
			'#!test1/:query/:id?'	: 'test1',
			'#!test2/:query/*'		: 'test2',
            '#!error'               : 'dummyerror'
		},
		
		// router init
		onReady: function(){
			console.log('init')
		},
		
		// before route method
		onBefore: function(routeId){
            console.log('before', routeId)
		},

        'onIndex:before': function() {
            console.log('we are about to go to the index route');
        },

        'onIndex:after': function() {
            console.log('navigated already to index route');
        },
		
		// routes methods
		onIndex: function(){
			console.log('index')
		},
		
		onHelp: function(){
			console.log('help')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		onTest1: function(query, id){
			console.log('test1')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		onTest2: function(query){
			console.log('test2')
			console.log(this.route,this.req,this.param,this.query)
		},
		
		// after route method
		onAfter: function(){
			console.log('after')
		},
		
		// no route match
		onError: function(error){
			alert(error);
			this.navigate('');
		},

        onUndefined: function() {

        }

	});
	

});

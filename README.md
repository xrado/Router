Router
===========

Router provides methods for routing client-side pages, and connecting them to actions and events based on hashchange event, written in MooTools.

How to use
----------

	var App = {};

	App.Router = new Router({
        // routes definition
        routes: {
            ''						: 'index',
            '#!help'				: 'help',
            '#!test1/:query/:id?'	: 'test1',
            '#!test2/:query/*'		: 'test2',
            '#!sub(?:/*)?'	        : 'sub',
            '#!error'               : 'dummyerror'
        },

        // router init
        onReady: function(){
            console.log('init');
        },

        // before route method
        onBefore: function(routeId){
            console.log('before', routeId)
        },

        // specific pseudos for before
        'onIndex:before': function() {
            console.log('we are about to go to the index route');
        },

        // specific pseudos for after
        'onIndex:after': function() {
            console.log('navigated already to index route, update breadcrumb?');
        },

        // after route method
        onAfter: function(route){
            console.info('after', route)
        },


        // routes events callbacks
        onIndex: function() {
            console.log('index')
        },

        onHelp: function() {
            console.log('help');
            console.log(this.route, this.req, this.param, this.query)
        },

        onTest1: function(query, id) {
            console.info('test1', query, id);
            console.log(this.route, this.req, this.param, this.query)
        },

        onTest2: function(query) {
            console.info('test2', query);
            console.log(this.route, this.req, this.param, this.query)
        },

        // no route event was found, though route was defined
        onError: function(error){
            console.error(error);
            // recover by going default route
            this.navigate('');
        },

        onUndefined: function() {
            console.log('this is an undefined route');
        },


        /// Sub router - prefixed router

        onSub: function(){
            console.log('root sub');
            if(App.SubRouter) return;

            App.SubRouter = new Router({
                prefix: '#!sub/',
                routes: {
                    ''					: 'index',
                    'help'				: 'help'

                },

                onIndex: function(){
                    console.log('sub index');
                },

                onHelp: function(){
                    console.log('sub help');
                }

            });

        },


        'onRoute:remove': function(route) {
            alert(route + ' was removed by popular demand');
        },

        'onRoute:add': function(constructorObject) {
            console.log(constructorObject.id + ' was added as a new route');
        }

    });

    App.Router.addRoute({
        route: '#!dynamicRoute',
        id: 'dynamic',
        events: {
            onDynamic: function() {
                alert('you found the blowfish');
                if (confirm('remove this route?'))
                    this.removeRoute('#!dynamicRoute');
            }
        }
    });

Requires
-----------------
 * Mootools-Core
 * Mootools-More/String.QueryString

Inspiration
-----------------
 * http://documentcloud.github.com/backbone/#Router
 * Element.Events.hashchange by http://github.com/greggoryhz/MooTools-onHashChange-Event/
 * _normalize by https://github.com/visionmedia/express

Router
===========

Router provides methods for routing client-side pages, and connecting them to actions and events based on hashchange event, written in MooTools.

How to use
----------

	var App = new Router({
        // routes definition
        routes: {
            ''						: 'index',
            '#!help'				: 'help',
            '#!test1/:query/:id?'	: 'test1',
            '#!test2/:query/*'		: 'test2',
        },

        // router init
        onReady: function(){
            console.log('init')
        },

        // before route method
        onBefore: function(){
            console.log('before')
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
            window.app.navigate('');
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

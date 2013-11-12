describe("Router tests", function(){

	var router;

	beforeEach(function() {
		window.location.href = '#!';
		HashMonitor.start();
		router = new Router({
			routes: {
				'#!dummy': 'dummy'
			}
		});
	});

	afterEach(function() {
		router.destroy();
		HashMonitor.stop();
	});

	it('Expect to be able to create an instance', function() {
		expect(router).to.be.instanceof(Router);
	});

	it('Expect router to fire onRoute when hash changes', function(done) {
		router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: function() {
					expect(true).to.be.ok;
					done();
				}
			}
		});

		window.location.href = '#!dynamicRoute';
	});

	it('Expect router to fire onAfter when hash changes and passes route id', function(done) {

		router.addEvent('after', function(routeId) {
			expect(routeId).to.be.equal('dynamic');
			done();
		});

		router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	});

	it('Expect router to fire route:before pseudo when hash changes', function(done) {

		router.addEvent('dynamic:before', function() {
			expect(true).to.be.ok;
			done();
		});

		router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	});

	it('Expect router to fire route:after pseudo when hash changes', function(done) {

		router.addEvent('dynamic:after', function() {
			expect(true).to.be.ok;
			done();
		});

		router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	});

	it('Expect onUndefined to fire on an unknown route', function(done) {
		router.addEvent('undefined', function() {
			expect(true).to.be.ok;
			done();
		});

		window.location.href = '#!dummyCrash';
	});

	it('Expect onError to fire on a declared route w/o a handler', function(done) {
		router.addEvent('error', function(message) {
			expect(message.contains('dummy')).to.be.ok;
			done();
		});

		window.location.href = '#!dummy';
	});

});

describe("Sub Router tests", function(){

	var router;

	beforeEach(function() {
		window.location.href = '#!';
		HashMonitor.start();
	});

	afterEach(function() {
		if(router) router.destroy();
		HashMonitor.stop();
	});

	it('Prefixed router #sub', function(done){
		router = new Router({
			prefix: '#sub/',
			routes: {
				'': 'index'
			},
			onIndex: function(){
				expect(true).to.be.ok;
				done();
			}
		});

		window.location.href = '#sub/';
	});

	it('Prefixed router #sub/test', function(done){
		router = new Router({
			prefix: '#sub/',
			routes: {
				'test/:id': 'test'
			},
			onTest: function(id){
				expect(id).to.be.equal('12');
				done();
			}
		});

		router.navigate('test/12');
	});

	it('Navigate without trigger', function(done){
		router = new Router({
			triggerOnLoad: false,
			prefix: '#sub/',
			routes: {
				'test/:id': 'test'
			},
			onTest: function(id){
				expect(true).to.be.false; // must not run
				done();
			}
		});

		router.navigate('test/12',false);

		(function(){
			done();
		}).delay(100);

	});

});
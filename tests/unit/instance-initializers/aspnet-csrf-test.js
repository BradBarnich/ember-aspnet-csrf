import Ember from 'ember';
import { initialize } from '../../../instance-initializers/aspnet-csrf';
import config from '../../../config/environment';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import Pretender from 'pretender';

const token = 'OJr6Dfr17XZ0rRiTz123LZLNQBcgct5X';
const header = '__RequestVerificationToken';

module('Unit | Instance Initializer | aspnet csrf', {
  beforeEach: function() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });

    Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
      jqXHR.setRequestHeader(header, undefined);
    });

    Ember.$('body').append(`<input name="__RequestVerificationToken" value="${token}">`);
  },
  afterEach: function() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('it sends token if no configuration is provided', function(assert) {
  assert.expect(1);

  initialize(this.appInstance);

  let server = new Pretender(function() {
    this.post('/api/posts', function(request) {
      assert.equal(request.requestHeaders[header], token);
      return [201, {}, ""];
    });
  });

  Ember.$.ajax({
    url: 'api/posts',
    method: 'POST'
  });

  server.shutdown();
});

test('it sends token if protection is explictly enabled', function(assert) {
  assert.expect(1);

  config.aspnet = {
     csrf: true
  };

  initialize(this.appInstance);

  let server = new Pretender(function() {
    this.post('/api/posts', function(request) {
      assert.equal(request.requestHeaders[header], token);
      return [201, [], ""];
    });
  });

  Ember.$.ajax({
    url: 'api/posts',
    method: 'POST'
  });

  server.shutdown();
});

test('it skips if protection is explictly disabled', function(assert) {
  assert.expect(1);

  config.aspnet = {
     csrf: false
  };

  initialize(this.appInstance);

  let server = new Pretender(function() {
    this.post('/api/posts', function(request) {
      assert.equal(request.requestHeaders[header], undefined);
      return [200, [], ""];
    });
  });

  Ember.$.ajax({
    url: 'api/posts',
    method: 'POST'
  });

  server.shutdown();
});



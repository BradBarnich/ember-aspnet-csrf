import config from '../config/environment';

export function initialize() {
  let aspnet = config.aspnet || {};

  let enabled = true;
  if (Ember.typeOf(aspnet.csrf) === 'boolean' && !aspnet.csrf) {
    enabled = false;
  }

  let header = '__RequestVerificationToken';
  if (Ember.typeOf(aspnet.header) === 'string') {
    header = aspnet.header;
  }
  if (!enabled) { return; }

  const token = Ember.$('input[name=__RequestVerificationToken]').val() || null;

  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (options.crossDomain) { return; }
    jqXHR.setRequestHeader(header, token);
  });
}

export default {
  name: 'aspnet-csrf',
  initialize
};

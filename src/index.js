import Alexa from 'alexa-sdk';

const handlers = {
  LaunchRequest: function() {
    this.emit('HelloWorldIntent');
  },

  HelloWorldIntent: function() {
    this.emit(':tell', 'Hello World!');
  },
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

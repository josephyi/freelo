import Alexa from 'alexa-sdk'

const handlers = {
    'LaunchRequest': function () {
        this.emit('HelloWorldIntent');
    },

    'HelloWorldIntent': function () {
        this.emit(':tell', 'Hello World!');
    }
 };

 const asyncFun = async  () => {
  const value = await Promise
    .resolve(1)
    .then(x => x * 3)
    .then(x => x + 5)
    .then(x => x / 2);
  return value;
}

exports.handler = (event, context) => {
  asyncFun().then(x => console.log(`x: ${x}`));
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
}

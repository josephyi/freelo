import Alexa from 'alexa-sdk';
import RiotAPI from './integration/RiotAPI';

const handlers = {
  LaunchRequest: function() {
    this.emit('FreeToPlayIntent');
  },

  FreeToPlayIntent: async function() {
    const api = new RiotAPI('RGAPI-662ebe32-5363-4299-9ae0-485342bfd504');
    const [freeChamps, staticChamps] = await Promise.all([api.freeChampions(), api.staticChamps()]);
    const names = freeChamps['champions'].map( (freeChamp) => staticChamps['data'][freeChamp['id']]['name']);
    this.emit(':tell', `Here's who's free to play: ${names.join(', ')}.`);
  }
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

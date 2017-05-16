import Alexa from 'alexa-sdk';
import RiotAPI from './integration/RiotAPI';

const api = new RiotAPI(process.env.RIOT_API_KEY);

const namesToIds = async () => {
  const staticChamps = await api.staticChamps();
  return Object.assign(...Object.keys(staticChamps['data']).map( key => ({[`${normalizeName(staticChamps['data'][key]['name'])}`]: key})));
}

const championSlotToId = async ({championName}) => {
  const ids = await namesToIds();
  console.log(ids);
  console.log(championName.value);
  return ids[championName.value];
}

const normalizeName = (name) => {
  return name.toLowerCase();
}

const sanitizeLore = (lore) => {
  return lore.replace(/<br>/g, ' ');
}

const championLoreHandler = async function() {
  console.log('championLoreHandler', this.event.request.intent.slots);
  const id = await championSlotToId(this.event.request.intent.slots);
  console.log('championLoreHandler ID', id);
  if (id) {
    const champion = await api.staticChampById(id, 'lore');
    const lore = sanitizeLore(champion['lore'])
    this.emit(':tellWithCard', lore, `${champion['name']}'s Lore`, lore);
  } else {
    this.emit(':tell', 'Handle unknown slot');
  }
}

const freeToPlayHandler = async function() {
  const [freeChamps, staticChamps] = await Promise.all([api.freeChampions(), api.staticChamps()]);
  const names = freeChamps['champions'].map( (freeChamp) => staticChamps['data'][freeChamp['id']]['name']);
  this.emit(':tell', `Here's who's free to play: ${names.join(', ')}.`);
}

const launchRequestHandler = function() {
  this.emit(':ask', 'what would you like?');
}

const handlers = {
  "LaunchRequest": launchRequestHandler,
  "FreeToPlayIntent": freeToPlayHandler,
  "ChampionLoreIntent": championLoreHandler
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

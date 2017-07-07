import Alexa from 'alexa-sdk';
import RiotAPI from './integration/RiotAPI';

const api = new RiotAPI(process.env.RIOT_API_KEY);

const delegateSlotCollection = function() {
      const { dialogState, intent} = this.event.request;
      console.log("in delegateSlotCollection");
      console.log("current dialogState: "+dialogState);
        if (dialogState === "STARTED") {
          console.log("in Beginning");
          var updatedIntent= intent;
          //optionally pre-fill slots: update the intent object with slot values for which
          //you have defaults, then return Dialog.Delegate with this updated intent
          // in the updatedIntent property
          this.emit(":delegate", updatedIntent);
        } else if (dialogState !== "COMPLETED") {
          console.log("in not completed");
          // return a Dialog.Delegate directive with no updatedIntent property.
          this.emit(":delegate");
        } else {
          console.log("in completed");
          console.log("returning: "+ JSON.stringify(intent));
          // Dialog is now complete and all required slots should be filled,
          // so call your normal intent handler.
          return intent;
        }
}

const namesToIds = async () => {
  const staticChamps = await api.staticChamps();
  return Object.assign(...Object.keys(staticChamps['data']).map( key => ({[`${normalizeName(staticChamps['data'][key]['name'])}`]: key})));
}

const championNameToId = async (championName) => {
  const ids = await namesToIds();
  return ids[normalizeName(championName)];
}

const normalizeName = (name) => {
  return name.toLowerCase().replace(/'/g, ' ');
}

const sanitizeLore = (lore) => {
  return lore.replace(/<br>/g, ' ');
}

const champImage = (image, version) => {
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${image}`;
  console.log(imageUrl);
  return {
    smallImageUrl: imageUrl,
    largeImageUrl: imageUrl
  }
}

const responseFor = function(champion, champDataType, version) {
  const reprompt = ' Anything else?';
  switch(champDataType) {
    case 'lore':
    case 'story':
      const lore = sanitizeLore(champion['lore']) + reprompt;
      this.emit(':askWithCard', lore, reprompt, `${champion['name']}'s Lore`, champion['lore'], champImage(champion['image']['full'], version));
      break;
    case 'passive':
      const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${champion['passive']['image']['full']}`
      const speechOutput = champion['passive']['sanitizedDescription'] + reprompt;
      const cardTitle = champion['passive']['name'];
      const cardContent = champion['passive']['description'];
      const cardImage = { smallImageUrl: imageUrl, largeImageUrl: imageUrl };
      this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardContent, cardImage);
      break;
  }

}

const championInfoHandler = async function() {
  const filledSlots = delegateSlotCollection.apply(this);
  if(filledSlots) {
    const {championName, champDataType} = filledSlots.slots;
    console.log('championInfoHandler', filledSlots.slots);
    console.log('championInfoHandler', championName);
    console.log('championInfoHandler', championName.value);
    const id = await championNameToId(championName.value);
    const [champion, versions] = await Promise.all([api.staticChampById(id, 'all'), api.versions()]);
    responseFor.apply(this, [champion, champDataType.value, versions[0]]);
  }
}

const freeToPlayHandler = async function() {
  const [freeChamps, staticChamps] = await Promise.all([api.freeChampions(), api.staticChamps()]);
  const names = freeChamps['champions'].map( (freeChamp) => staticChamps['data'][freeChamp['id']]['name']);
  this.emit(':tell', `Here's who's free to play: ${names.join(', ')}.`);
}

const launchRequestHandler = function() {
  this.emit(':ask', 'Greetings summoner. How may I be of service?');
}

const handlers = {
  "LaunchRequest": launchRequestHandler,
  "FreeToPlayIntent": freeToPlayHandler,
  "ChampionLoreIntent": championLoreHandler,
  "ChampionInfoIntent": championInfoHandler
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const rp = require('request-promise-native');
const fs = require('fs');

const RIOT_API_KEY = process.env.RIOT_API_KEY;

rp({
  uri: 'https://na1.api.riotgames.com/lol/static-data/v3/champions',
  qs: {
    dataById: true
  },
  json: true,
  headers: {'X-Riot-Token': RIOT_API_KEY}
}).
  then((response) => Promise.resolve(
      Object.keys(response.data).
        map((id) => `{ "name": {"value": "${response.data[id]['name'].toLowerCase().replace(/'/g, ' ')}"}}`).
        join(',\n')
    )).
  then((list) => {
    fs.writeFile('../speech-assets/ChampionNameSlot.txt', list);
  }).
  catch((err) => {
    console.error(err);
  });

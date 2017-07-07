const rp = require('request-promise-native');

export default class RiotAPI {
  constructor(key) {
    this.headers = { 'X-Riot-Token': key };
  }

  freeChampions() {
    return rp({
      uri: 'https://na1.api.riotgames.com/lol/platform/v3/champions',
      qs: {
        freeToPlay: true
      },
      headers: this.headers,
      json: true
    });
  }

  staticChamps() {
    return rp({
      uri: 'https://na1.api.riotgames.com/lol/static-data/v3/champions',
      qs: {
        dataById: true
      },
      headers: this.headers,
      json: true
    })
  }

  staticChampById(id, champData) {
    return rp({
      uri: `https://na1.api.riotgames.com/lol/static-data/v3/champions/${id}`,
      qs: {
        champData: champData
      },
      headers: this.headers,
      json: true
    })
  }

  versions() {
    return rp({
      uri: `https://na1.api.riotgames.com/lol/static-data/v3/versions`,
      headers: this.headers,
      json: true
    })
  }
}

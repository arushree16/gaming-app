const axios = require('axios');

class RiotService {
  constructor() {
    this.apiKey = process.env.RIOT_API_KEY;
    this.baseUrl = {
      americas: 'https://americas.api.riotgames.com',
      asia: 'https://asia.api.riotgames.com',
      europe: 'https://europe.api.riotgames.com',
      valorant: 'https://api.henrikdev.xyz/valorant/v1'
    };
  }

  // Get account details by Riot ID and tagline
  async getAccountByRiotId(gameName, tagLine) {
    try {
      const response = await axios.get(
        `${this.baseUrl.americas}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        {
          headers: {
            'X-Riot-Token': this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Riot API Error:', error);
      throw new Error('Failed to fetch Riot account');
    }
  }

  // Check if player is in active game (League of Legends)
  async checkActiveLoLGame(summonerId, region) {
    try {
      const response = await axios.get(
        `https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`,
        {
          headers: {
            'X-Riot-Token': this.apiKey
          }
        }
      );
      return {
        isPlaying: true,
        gameType: 'LeagueOfLegends',
        gameData: response.data
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { isPlaying: false };
      }
      throw error;
    }
  }

  // Check Valorant status
  async checkValorantStatus(username, tagLine) {
    try {
      const response = await axios.get(
        `${this.baseUrl.valorant}/account/${username}/${tagLine}`
      );
      
      if (response.data.data.card) {
        const matchResponse = await axios.get(
          `${this.baseUrl.valorant}/matches/${username}/${tagLine}/1`
        );
        
        const lastMatch = matchResponse.data.data[0];
        const isCurrentlyPlaying = 
          lastMatch && 
          new Date(lastMatch.metadata.game_start) > new Date(Date.now() - 1800000); // Within last 30 minutes
        
        return {
          isPlaying: isCurrentlyPlaying,
          gameType: 'Valorant',
          lastMatch: lastMatch
        };
      }
      return { isPlaying: false };
    } catch (error) {
      console.error('Valorant API Error:', error);
      return { isPlaying: false };
    }
  }
}

module.exports = new RiotService(); 
import { RequestHandler } from '@builder.io/qwik-city';

type Player = {
  uuid: string;
  name: string;
  foreign: boolean;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

const playersJSON = {
  players: [] as Player[],
  lastUpdated: 0,
};

export const onGet: RequestHandler = async ({ json }) => {
  // get live data if not cached
  if (playersJSON.lastUpdated < Date.now() - 1000) {
    console.log('Fetching live players data...', playersJSON.lastUpdated);
    const liveData = await fetch('https://r2.mineplace.me/world/live/players.json');
    const players: Player[] = await liveData.json();

    playersJSON.players = players;
    playersJSON.lastUpdated = Date.now();
  }

  json(200, playersJSON.players);
};
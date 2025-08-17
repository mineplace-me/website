import { RequestHandler } from '@builder.io/qwik-city';

const markersJSON = {
  markers: {} as any,
  lastUpdated: 0,
};

export const onGet: RequestHandler = async ({ json }) => {
  // get live data if not cached
  if (markersJSON.lastUpdated < Date.now() - 5000) {
    console.log('Fetching live markers data...', markersJSON.lastUpdated);
    const liveData = await fetch('https://r2.mineplace.me/world/live/markers.json');
    const markers: any = await liveData.json();

    markersJSON.markers = markers;
    markersJSON.lastUpdated = Date.now();
  }

  json(200, markersJSON.markers);
};
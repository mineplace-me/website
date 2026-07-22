export type LeaderboardResponse = {
  data: LeaderboardData;
  success: boolean;
  timestamp: string;
};

export type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
};

export type LeaderboardEntry = {
  rank: number;
  uuid: string;
  username: string;
  totalActions: number;
  availableActions: number;
  maxActions: number;
  online: boolean;
  lastLogin: string;
};

export type MapStore = {
  zoom: number;
  position: { x: number; y: number; z: number };
  viewMode: 'flat' | 'perspective' | 'free';
  players: {
    uuid: string;
    name: string;
    position: { x: number; y: number; z: number };
    rotation: { pitch: number; yaw: number; roll: number };
  }[];
  settings: Partial<{
    hiresDistance: number;
    lowresDistance: number;
    sunlightStrength: number;
    pauseTileLoading: boolean;
    invertMouse: boolean;
    mouseSensitivity: number;
    showChunkBorders: boolean;
    showDebug: boolean;
    superSampling: number;
  }>;
  sidebar: 'player' | 'settings' | 'leaderboard' | null;
};

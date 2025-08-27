// Global types for BlueMap bridge exposed by bluemap package
export interface BlueMapBridgeApi {
  setPerspectiveView: (transition?: number, minDistance?: number) => void;
  setFlatView: (transition?: number, minDistance?: number) => void;
  setFreeFlight: (transition?: number, targetY?: number) => void;
  getMode: () => string | undefined;
  getPosition: () => { x?: number; y?: number; z?: number };
  updateMap: () => void;
  setSuperSampling: (v: number) => void;
  setHiresDistance: (v: number) => void;
  setLowresDistance: (v: number) => void;
  setMouseSensitivity: (v: number) => void;
  setInvertMouse: (flag: boolean) => void;
  setPauseTileLoading: (flag: boolean) => void;
  setChunkBorders: (flag: boolean) => void;
  setDebug: (flag: boolean) => void;
  setSunlightStrength: (v: number) => void;
  cycleSunlightStrength: () => void;
  getSettings: () => {
    superSampling: number;
    hiresDistance: number;
    lowresDistance: number;
    mouseSensitivity: number;
    invertMouse: boolean;
    pauseTileLoading: boolean;
    showChunkBorders: boolean;
    showDebug: boolean;
    sunlightStrength: number;
  };
}

declare global {
  interface Window {
    BlueMapBridge?: BlueMapBridgeApi;
  }
}

export {};

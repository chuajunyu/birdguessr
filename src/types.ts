export interface Recording {
  id: string;
  gen: string;
  sp: string;
  en: string;
  cnt: string;
  loc: string;
  type: string;
  q: string;
  length: string;
  url: string;
  file: string;
  sono: {
    small: string;
    med: string;
    large: string;
    full: string;
  };
}

export interface XCResponse {
  numRecordings: string;
  numSpecies: string;
  page: number;
  numPages: number;
  recordings: Recording[];
}

export interface Species {
  gen: string;
  sp: string;
  en: string;
}

export interface GameState {
  pool: Map<string, Recording[]>;
  current: Recording | null;
  streak: number;
  best: number;
  answered: boolean;
}

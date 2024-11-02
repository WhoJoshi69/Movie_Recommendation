export interface Movie {
  id: string;
  title: string;
  year: string;
  genres: string[];
  posterUrl: string;
  overview: string;
}

export interface AutocompleteSuggestion {
  label: string;
  url: string;
}

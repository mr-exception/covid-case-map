import { analyzeFileForInjectables } from '@angular/compiler';

export interface ICountryLayout {
  type: string;
  geometry: {
    type: string;
    coordinates: Array<Array<Array<number>>>;
  };
}
export interface ICountryFullLayout extends ICountryLayout {
  properties: {
    sov_a3: string;
    sovereignt: string;
  };
}
export interface ICountrySummaryLayout extends ICountryLayout {
  properties: {
    title: string;
    code: string;
  };
}
export interface ICase {
  data: Array<{
    date: string;
    total_cases?: number;
    new_cases?: number;
    total_deaths?: number;
    new_deaths?: number;
  }>;
  location: string;
  population: number;
}
export interface ICaseCollection {
  [key: string]: ICase;
}
export interface ICountryFinalLayout extends ICountryLayout {
  properties: {
    title: string;
    code: string;
    date: string;
    total_cases: number;
    new_cases: number;
    total_deaths: number;
    new_deaths: number;
    population: number;
    danger: number;
  };
}

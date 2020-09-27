import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concatAll, map } from 'rxjs/operators';
import {
  ICase,
  ICaseCollection,
  ICountryFinalLayout,
  ICountryFullLayout,
  ICountrySummaryLayout,
} from '../assets/interfaces';
import { combineLatest, concat, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CovidService {
  constructor(private http: HttpClient) {}

  public getCases(): Observable<ICaseCollection> {
    return this.http.get<ICaseCollection>(
      'https://covid.ourworldindata.org/data/owid-covid-data.json'
    );
  }
  public getCountriesGeometry(): Observable<ICountryFullLayout[]> {
    return this.http.get<ICountryFullLayout[]>(`/assets/countries.json`);
  }
  public getCountriesGeometryCleaned(): Observable<ICountrySummaryLayout[]> {
    return this.getCountriesGeometry().pipe(
      map((countries: ICountryFullLayout[]) =>
        countries.map(
          (country: ICountryFullLayout): ICountrySummaryLayout => ({
            type: country.type,
            properties: {
              title: country.properties.sovereignt,
              code: country.properties.sov_a3,
            },
            geometry: country.geometry,
          })
        )
      )
    );
  }
  private getCaseByLocation(
    location: string,
    cases: ICaseCollection
  ): ICase | undefined {
    return Object.values(cases).find((caseInfo: ICase) => {
      if (location.toLowerCase() === caseInfo.location.toLowerCase())
        return caseInfo;
    });
  }
  public getCountriesLayoutByCases(): Observable<ICountryFinalLayout[]> {
    return combineLatest([
      this.getCountriesGeometryCleaned(),
      this.getCases(),
    ]).pipe(
      map(
        ([layouts, cases]: [
          ICountrySummaryLayout[],
          ICaseCollection
        ]): ICountryFinalLayout[] => {
          return layouts
            .filter(
              (layout: ICountrySummaryLayout) =>
                !!this.getCaseByLocation(layout.properties.title, cases)
            )
            .map(
              (layout: ICountrySummaryLayout): ICountryFinalLayout | null => {
                const todayCase: ICase = this.getCaseByLocation(
                  layout.properties.title,
                  cases
                );
                let data = undefined;
                for (let i = todayCase.data.length - 1; i >= 0; i--) {
                  if (todayCase.data[i].new_cases) {
                    data = todayCase.data[i];
                    break;
                  }
                }
                if (!data) return null;

                const result: ICountryFinalLayout = {
                  type: layout.type,
                  geometry: layout.geometry,
                  properties: {
                    ...layout.properties,
                    date: data.date,
                    total_cases: data.new_cases,
                    new_cases: data.new_cases,
                    total_deaths: data.total_deaths,
                    new_deaths: data.new_deaths,
                    population: todayCase.population,
                    danger:
                      (1000 * (data.new_cases + data.new_deaths * 50)) /
                      todayCase.population,
                  },
                };
                return result;
              }
            );
          // .filter((layout: ICountryFinalLayout | null) => !!layout);
        }
      )
    );
  }
  public getCountriesLayout() {
    return this.getCountriesGeometryCleaned().pipe(
      map((countries) => ({
        type: 'FeatureCollection',
        features: countries,
      }))
    );
  }
}

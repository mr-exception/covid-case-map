import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ICountryFinalLayout } from 'src/assets/interfaces';
import { CovidService } from '../covid.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map;
  constructor(private covidApi: CovidService) {}
  private initMap(): void {
    this.map = L.map('map', {
      center: [20, 30],
      zoom: 3,
    });
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }
  ngOnInit(): void {
    this.initMap();
    this.covidApi
      .getCountriesLayoutByCases()
      .subscribe((layouts: ICountryFinalLayout[]) => {
        layouts.forEach((layout) => {
          const lyt = L.geoJson(layout, {
            clickable: false,
            fillColor: 'red',
            fillOpacity: layout.properties.danger,
            weight: 1,
          });

          // create popup contents
          var customPopup = `
            <p><b>${layout.properties.title}</b> <i>(${
            layout.properties.date
          })</i></p>
            <p>new cases: <b>${layout.properties.new_cases}</b></p>
            <p>new deaths: <b>${layout.properties.new_deaths}</b></p>
            <p>total deaths: <b>${layout.properties.total_deaths}</b></p>
            <p>danger rate: <b>${Math.floor(
              layout.properties.danger * 100
            )}%</b></p>
            `;

          // specify popup options
          var customOptions = {
            maxWidth: '400',
            width: '200',
            className: 'popupCustom',
          };

          lyt.bindPopup(customPopup, customOptions);
          lyt.addTo(this.map);
        });
      });
  }
}

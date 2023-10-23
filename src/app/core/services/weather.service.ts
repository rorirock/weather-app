import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class WeatherService {

    private getEnvironment = environment

    constructor(
      private httpclient: HttpClient,
      ) { }


    getWeather(code:string){
      const url = this.getEnvironment.service.replace(':code',code)
        return this.httpclient.get(url)
    }

}
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiKey } from "src/schema/apikey.schema";
import { Model } from "mongoose";
import axios from 'axios';

@Injectable()
export class WeatherProvider {
  private weatherKey = process.env.WEATHER_API;

  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>,
  ){
    this.loadWeatherKey()
  }

  private async loadWeatherKey() {
    try {
      const apiKeyData = await this.apiKeyModel.findOne({});
      if (apiKeyData) {
        this.weatherKey = apiKeyData.weather_api;
        console.log(this.weatherKey); // Now it's updated
      } else {
        console.log("No API key found");
      }
    } catch (err) {
      console.log(err);
      console.log("Error");
    }
  }

  async getWeather(city:string) {
    if (!city) {
      return "error"
    }
    console.log(this.weatherKey);
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherKey}&units=metric&lang=en`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return "error"
    })
  }

  async updateLocalWeatherKey(key:string){
    console.log('Local',key);
    this.weatherKey = key;
    await this.loadWeatherKey();
    return;
  }
    
}
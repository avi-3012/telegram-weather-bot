import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SubscribedUser } from "src/schema/subscribeduser.schema";
import { WeatherProvider } from "src/weather/weather.provider";
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BlockedUser } from "src/schema/blockeduser.schema";
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramProvider {
    private readonly telegramBot: any;
    private readonly logger = new Logger(TelegramProvider.name);
    private blockedUsers = <any>[];

    
    constructor(
        @InjectModel(SubscribedUser.name) private readonly subscribedUserModel: Model<SubscribedUser>,
        @InjectModel(BlockedUser.name) private readonly blockedUserModel: Model<BlockedUser>,
        private readonly weatherProvider: WeatherProvider,
    ) {
        this.telegramBot = new TelegramBot(process.env.TELEGRAM_API, { polling : true });
        this.telegramBot.on('message', this.onMessage.bind(this));
        this.telegramBot.onText(/\/weather( (.+))?$/, this.onWeather.bind(this));
        this.telegramBot.onText(/\/subscribe/, this.onSubscribe.bind(this));
        this.telegramBot.onText(/\/unsubscribe/, this.onUnsubscribe.bind(this));
        this.telegramBot.onText(/\/setCity( (.+))?$/, this.onSetCity.bind(this));
        this.telegramBot.on('polling_error', (error:any) => {
            this.logger.error(`Polling Error: ${error.message}`);
        });
        this.loadBlockedUsers();
    }

    async loadBlockedUsers(){
        const temp = [];
        (await this.blockedUserModel.find({}).select('user_id').exec()).forEach((user) =>{
            temp.push(user.user_id);
        })
        this.blockedUsers = temp;
        console.log(this.blockedUsers);
        return;
    }

    async onMessage (message:any): Promise<void> {
        console.log('message received:', message);
        if ( message.text.startsWith('/') ) {
            return;
        }
        if (await this.checkUser(message.from.id)) {
            this.telegramBot.sendMessage(message.chat.id, 'You are blocked from using Weather Bot!');
            return;
        }
        this.telegramBot.sendMessage(message.chat.id, ('Welcome to Weather Bot!' + '\n' + 'Please enter your city name to get weather information.'+'\n'+'For example: "/weather Delhi"' + '\n' + '\n' + 'OR' + '\n' + '\n' + 'Use one of the given commands:' + '\n' + '\n' + '/subscribe - Subscribe to Weather Bot for daily updates.' + '\n' + '/unsubscribe - Unsubscribe from Weather Bot.' + '\n' + '/setCity - Save your city name.'));
        return;

    }

    async onWeather (message:any, match:any): Promise<void> {
        console.log('weather received:', message);
        if (await this.checkUser(message.from.id)) {
            this.telegramBot.sendMessage(message.chat.id, 'You are blocked from using Weather Bot!');
            return;
        }
        const chatId = message.chat.id;
        const city = match[1];
        if (!city) {
            this.telegramBot.sendMessage(chatId, 'Please enter your city name to get weather information.'+'\n'+'For example: "/weather Delhi"');
            return;
        }
        if (city.length > 50) {
            this.telegramBot.sendMessage(chatId, 'City name is too long! Please enter a valid city name.');
            return;
        }
        if (city.length < 3) {
            this.telegramBot.sendMessage(chatId, 'City name is too short! Please enter a valid city name.');
            return;
        }
        this.telegramBot.sendMessage(chatId, 'Getting weather information for ' + city + '...');
        const weather = await this.weatherProvider.getWeather(city);
        if (weather === 'error') {
            this.telegramBot.sendMessage(chatId, 'Something went wrong! Please try again.');
            return;
        }
        this.telegramBot.sendMessage(chatId, 'Weather information for ' + city + ':' + '\n' + '\n' + 'Temperature: ' + weather.main.temp + '°C' + '\n' + 'Feels Like: ' + weather.main.feels_like + '°C' + '\n' + 'Humidity: ' + weather.main.humidity + '%' + '\n' + 'Wind Speed: ' + weather.wind.speed + 'm/s' + '\n' + 'Description: ' + weather.weather[0].description);
        return;

    }

    async onSubscribe (message:any): Promise<void> {
        console.log('subscribe received:', message);
        if (await this.checkUser(message.from.id)) {
            this.telegramBot.sendMessage(message.chat.id, 'You are blocked from using Weather Bot!');
            return;
        }
        const chatId = message.chat.id;
        if(!chatId) {
            this.telegramBot.sendMessage(chatId, 'Something went wrong!');
            return;
        }
        // check if user is already subscribed
        const alreadySubscribedUser = await this.subscribedUserModel.findOne({ user_id: chatId });
        if (alreadySubscribedUser) {
            this.telegramBot.sendMessage(chatId, 'You are already subscribed to Weather Bot for daily updates!');
            return;
        }

        // create subscribed user
        const newSubscribedUser = new this.subscribedUserModel({
            user: message.from.first_name,
            user_id: chatId,
        });
        await newSubscribedUser.save();
        this.telegramBot.sendMessage(chatId, 'You have been subscribed to Weather Bot for daily updates!'+'\n'+'Please use "/setCity" command to save your city.');
        return;

    }

    async onUnsubscribe (message:any): Promise<void> {
        console.log('unsubscribe received:', message);
        if (await this.checkUser(message.from.id)) {
            this.telegramBot.sendMessage(message.chat.id, 'You are blocked from using Weather Bot!');
            return;
        }
        const chatId = message.chat.id;
        if(!chatId) {
            this.telegramBot.sendMessage(chatId, 'Something went wrong!');
            return;
        }
        // check if user is already not subscribed
        const alreadySubscribedUser = await this.subscribedUserModel.findOne({ user_id: chatId });
        if (!alreadySubscribedUser) {
            this.telegramBot.sendMessage(chatId, 'You are not subscribed to Weather Bot!');
            return;
        }

        // delete subscribed user
        await this.subscribedUserModel.deleteOne({ user_id: chatId });
        this.telegramBot.sendMessage(chatId, 'You have been unsubscribed from Weather Bot!');
        return;

    }

    async onSetCity (message:any, match:any): Promise<void> {
        console.log('set city received:', message);
        if (await this.checkUser(message.from.id)) {
            this.telegramBot.sendMessage(message.chat.id, 'You are blocked from using Weather Bot!');
            return;
        }
        const chatId = message.chat.id;
        const city = match[1];
        const alreadySubscribedUser = await this.subscribedUserModel.findOne({ user_id: chatId });
        if (!alreadySubscribedUser) {
            this.telegramBot.sendMessage(chatId, 'You are not subscribed to Weather Bot! Please subscribe first. Use "/subscribe" command.');
            return;
        }
        if (!city) {
            this.telegramBot.sendMessage(chatId, 'Please enter your city name to save.'+'\n'+'For example: "/setCity Delhi"');
            return;
        }
        if (city.length > 50) {
            this.telegramBot.sendMessage(chatId, 'City name is too long! Please enter a valid city name.');
            return;
        }
        if (city.length < 3) {
            this.telegramBot.sendMessage(chatId, 'City name is too short! Please enter a valid city name.');
            return;
        }
        alreadySubscribedUser.city = city;
        await alreadySubscribedUser.save();
        this.telegramBot.sendMessage(chatId, 'Your city has been saved!');
        return;
    }

    async setBotName(name:string) {
        try {
            
            this.telegramBot.setMyName({name: name})
        } catch (error) {
            return "error";
        }
    }

    async checkUser(id:number) {
        try {
            this.blockedUsers.forEach((user:number) => {
            if(user.toString() === id.toString()){
                console.log('true');
                throw new Error('User blocked');
            } else {}
        })
        } catch (error) {
            return true;
        };
        return false;
    }
 
    async blockUser(id:number) {
        this.blockedUsers.push(id);
        return;
    }

    @Cron('0 0 9 * * *')
    async sendDailyWeather() {
        const subscribedUsers = await this.subscribedUserModel.find();
        if (subscribedUsers.length === 0) {
            return;
        }
        subscribedUsers.forEach(async (user) => {
            if (await this.checkUser(user.user_id)) {
                return;
            }
            this.telegramBot.sendMessage(user.user_id, 'Good Morning ' + user.user + '!' + '\n' + 'Here is your daily weather update:')
            if (!user.city){
                this.telegramBot.sendMessage(user.user_id, 'Please use "/setCity" command to save your city for daily weather update!');
                return;
            }
            const weather = await this.weatherProvider.getWeather(user.city)
            if (weather === 'error') {
                this.telegramBot.sendMessage(user.user_id, 'Something went wrong with daily weather update!');
                return;
            }
            this.telegramBot.sendMessage(user.user_id, 'Weather information for ' + user.city + ':' + '\n' + '\n' + 'Temperature: ' + weather.main.temp + '°C' + '\n' + 'Feels Like: ' + weather.main.feels_like + '°C' + '\n' + 'Humidity: ' + weather.main.humidity + '%' + '\n' + 'Wind Speed: ' + weather.wind.speed + 'm/s' + '\n' + 'Description: ' + weather.weather[0].description);
            return;
        });
    }
}
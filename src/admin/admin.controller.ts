import { Controller, Post, Req, Get } from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { WeatherProvider } from 'src/weather/weather.provider';
import { TelegramProvider } from 'src/telegram/telegram.provider';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminProvider: AdminProvider,
    private readonly weatherProvider: WeatherProvider,
    private readonly telegramProvider: TelegramProvider,
  ) {}

  @Get('subscribedusers')
  async getSubscribedUsers() {
    const response = this.adminProvider.getSubscribedUsers();
    if (typeof response === 'string') {
      return 'null';
    }
    return response;
  }

  @Post('signin')
  async adminSignIn(@Req() req) {
    const response = this.adminProvider.signIn(req);
    return response;
  }

  @Post('deletesubscribeduser')
  async deleteSubscribedUser(@Req() req) {
    const response = this.adminProvider.deleteSubscribedUser(req.body.id);
    return response;
  }

  @Post('updateweatherkey')
  async updateWeatherKey(@Req() req) {
    const response = await this.adminProvider.updateWeatherKey(req.body.key);
    if (response === 'error') {
      return 'null';
    } else {
      this.weatherProvider.updateLocalWeatherKey(req.body.key);
    }
    return;
  }

  @Post('setbotname')
  async setBotName(@Req() req) {
    const response = await this.telegramProvider.setBotName(req.body.name);
    if (response === 'error') {
      return 'null';
    }
    return;
  }

  @Post('blockuser')
  async blockUser(@Req() req) {
    const check = await this.telegramProvider.checkUser(req.body.id);
    console.log(check);
    if (check) {
        console.log('User already blocked');
      return 'null';
    } else {
      const response = await this.adminProvider.blockUser(req.body.id);
      if (response === 'error') {
        return 'null';
      }
      this.telegramProvider.loadBlockedUsers();
      return;
    }
  }

  @Post('unblockuser')
  async unblockUser(@Req() req) {
    const response = await this.adminProvider.unblockUser(req.body.id);
    if (response === 'error') {
      return 'null';
    } else {
      this.telegramProvider.loadBlockedUsers();
      return;
    }
  }

  @Get('blockedusers')
  async getBlockedUsers() {
    const response = this.adminProvider.getBlockedUsers();
    if (typeof response === 'string') {
      return 'null';
    }
    return response; 
  }
}

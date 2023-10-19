import { Injectable } from '@nestjs/common';
import jwt_decode from 'jwt-decode';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from '../schema/admin.schema';
import { SubscribedUser } from 'src/schema/subscribeduser.schema';
import { Model } from 'mongoose';
import { ApiKey } from 'src/schema/apikey.schema';
import { BlockedUser } from 'src/schema/blockeduser.schema';

@Injectable()
export class AdminProvider {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(SubscribedUser.name)
    private readonly subscribedUserModel: Model<SubscribedUser>,
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>,
    @InjectModel(BlockedUser.name)
    private readonly blockedUserModel: Model<BlockedUser>,
  ) {}

  async signIn(req: any) {
    if (req.body.key) {
      const key = req.body.key;
      var decoded: any = jwt_decode(key);
      if (decoded.aud !== process.env.GOOGLE_CLIENT_ID)
        return { name: 'error', email: 'error', picture: 'error' };

      // check if admin exists
      const getAdmin = await this.adminModel.findOne({ email: decoded.email });
      if (getAdmin) return decoded;

      // create admin
      const createAdmin = new this.adminModel({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      await createAdmin.save();
      return decoded;
    } else {
      return {
        name: 'error',
        email: 'error',
        picture: 'error',
      };
    }
  }

  async getSubscribedUsers() {
    const subscribedUsers = await this.subscribedUserModel.find();
    console.log(subscribedUsers);
    if (!subscribedUsers) return 'No subscribed users found!';
    return subscribedUsers;
  }

  async deleteSubscribedUser(id: string) {
    const subscribedUser = await this.subscribedUserModel.findOneAndDelete({
      user_id: id,
    });
    console.log(subscribedUser);
    if (!subscribedUser) return 'No subscribed user found!';
    return subscribedUser;
  }

  async updateWeatherKey(key: string) {
    try {
      const getApiKey = await this.apiKeyModel
        .findOneAndDelete({})
        .then((res) => {})
        .catch((err) => {});
    } catch (error) {
      console.log(error);
    }
    try {
      const createApiKey = new this.apiKeyModel({
        weather_api: key,
      });
      await createApiKey.save();
      return 'success';
    } catch (error) {
      return 'error';
    }
  }

  async blockUser(id: number) {
    console.log(id);
    try {
      const createBlockedUser = new this.blockedUserModel({
        user_id: id,
      });
      await createBlockedUser.save();
      return;
    } catch (error) {
      return 'error';
    }
  }

  async unblockUser(id: number) {
    try {
      const getBlockedUser = await this.blockedUserModel
        .findOneAndDelete({ user_id: id })
        .then((res) => {})
        .catch((err) => {});
    } catch (error) {
      return 'error';
    }
  }

  async getBlockedUsers() {
    const blockedUsers = await this.blockedUserModel.find();
    console.log(blockedUsers);
    if (!blockedUsers) return 'No blocked users found!';
    return blockedUsers;
  }
}

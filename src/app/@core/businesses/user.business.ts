import { Injectable } from '@angular/core';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserBusiness {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers() {
    const users = await this.userRepository.getAllAsync();
    return users.sort((a, b) => a.userName.localeCompare(b.userName));
  }
}

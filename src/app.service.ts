import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'online-shop-backend',
      timestamp: new Date().toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'hola soy neutro shorty y me gusta el pito!';
  }
}

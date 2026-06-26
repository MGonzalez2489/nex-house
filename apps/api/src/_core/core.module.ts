import { Module } from '@nestjs/common';
import { CryptoService } from './services';

@Module({
  providers: [CryptoService],
})
export class CoreModule {}

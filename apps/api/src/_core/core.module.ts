import { Module } from '@nestjs/common';
import { CryptoService } from './services';

@Module({
  providers: [CryptoService],
  imports: [],
})
export class CoreModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StellarService } from './stellar.service';
import stellarConfig from '../../config/stellar.config';

@Module({
  imports: [ConfigModule.forFeature(stellarConfig)],
  providers: [StellarService],
  exports: [StellarService],
})
export class StellarModule {}

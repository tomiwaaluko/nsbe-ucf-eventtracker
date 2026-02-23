import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // Make CacheService available globally without imports
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}

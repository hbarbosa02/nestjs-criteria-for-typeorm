import { Module, Global } from '@nestjs/common';
import { TypeOrmCriteriaConverter } from '../data-access/converter/typeorm-criteria-converter';

/**
 * A standalone module for the Criteria pattern implementation.
 * It provides the TypeOrmCriteriaConverter to be used across the application.
 * Marked as @Global() to make the converter available everywhere without needing to import this module repeatedly.
 */
@Global()
@Module({
  providers: [TypeOrmCriteriaConverter],
  exports: [TypeOrmCriteriaConverter],
})
export class CriteriaModule {}

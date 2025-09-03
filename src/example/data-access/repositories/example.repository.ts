import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../core/database/repositories/base.repository';
import { Example } from '../../../core/database/entities/example.entity';
import { TypeOrmCriteriaConverter } from '../../../core/criteria/data-access/converter/typeorm-criteria-converter';

@Injectable()
export class ExampleRepository extends BaseRepository<Example> {

    constructor(
        @InjectDataSource() dataSource: DataSource,
        private readonly typeOrmCriteriaConverter: TypeOrmCriteriaConverter<Example>
    ) {
    super(dataSource.getRepository(Example),typeOrmCriteriaConverter);
    }


  async findMostPopular(): Promise<Example | null> {
    return this.repository
      .createQueryBuilder('example')
      .orderBy('example.name', 'DESC')
      .getOne();
  }
}


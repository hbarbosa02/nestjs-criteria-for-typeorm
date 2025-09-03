import { Repository, ObjectLiteral } from 'typeorm';
import { Criteria } from '../../criteria/util/types/criteria';
import { TypeOrmCriteriaConverter } from '../../criteria/data-access/converter/typeorm-criteria-converter';
import { Base } from '../entities/base.entity';

/**
 * An abstract generic repository that provides base functionality for all entity repositories.
 * It includes methods for finding and counting entities based on the Criteria pattern.
 * @template T The entity type.
 */
export abstract class BaseRepository<T extends Base> {
  constructor(
    // The specific TypeORM repository for the entity (e.g., Repository<Product>)
    protected readonly repository: Repository<T>,
    // The criteria converter, which is globally available.
    protected readonly criteriaConverter: TypeOrmCriteriaConverter<T>,
  ) {}

  /**
   * Finds entities that match the given criteria. This logic is now centralized here.
   * @param criteria The criteria to apply.
   * @returns A promise that resolves to an array of entities.
   */
  async findByCriteria(criteria: Criteria): Promise<T[]> {
    // We use the repository's metadata to get the table name for the alias, making it truly generic.
    const alias = this.repository.metadata.tableName;
    const queryBuilder = this.repository.createQueryBuilder(alias);

    this.criteriaConverter.apply(queryBuilder, criteria);

    return queryBuilder.getMany();
  }

  /**
   * Counts entities that match the given criteria, ignoring pagination.
   * @param criteria The criteria to apply.
   * @returns A promise that resolves to the total count of matching entities.
   */
  async countByCriteria(criteria: Criteria): Promise<number> {
    const alias = this.repository.metadata.tableName;
    const queryBuilder = this.repository.createQueryBuilder(alias);
    
    // Create a new criteria without pagination to ensure we get the total count.
    const countCriteria = new Criteria(criteria.filters, undefined, undefined, undefined);

    this.criteriaConverter.apply(queryBuilder, countCriteria);

    return queryBuilder.getCount();
  }

  // You can also add other common repository methods here:
  async findById(id: any): Promise<T | null> {
    // Note: findOneBy requires a specific type, so we cast `id`
    return this.repository.findOneBy({ id } as Record<string, unknown>);
  }
}

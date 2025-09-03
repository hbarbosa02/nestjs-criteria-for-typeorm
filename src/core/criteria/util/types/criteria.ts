import { Filter } from './filter';
import { Order } from './order';

/**
 * Aggregates all query conditions: filters, ordering, and pagination.
 * This object is the input for the criteria converter.
 */
export class Criteria {
  constructor(
    public readonly filters: Filter[],
    public readonly order?: Order,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}

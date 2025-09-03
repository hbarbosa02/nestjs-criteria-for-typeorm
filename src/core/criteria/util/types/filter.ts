import { FilterOperator } from "../enums/filter-operator.enum";

/**
 * Represents a single filter condition to be applied to a query.
 * For example: new Filter('name', FilterOperator.CONTAINS, 'Laptop')
 */
export class Filter {
  constructor(
    public readonly field: string,
    public readonly operator: FilterOperator,
    public readonly value: any,
  ) {}
}

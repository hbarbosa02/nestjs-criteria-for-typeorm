import { OrderDirection } from '../enums/order-direction.enum';

/**
 * Represents the ordering criteria for a query.
 * For example: new Order('price', OrderDirection.DESC)
 */
export class Order {
  constructor(
    public readonly orderBy: string,
    public readonly orderDirection: OrderDirection,
  ) {}
}

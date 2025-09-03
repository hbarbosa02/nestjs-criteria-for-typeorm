import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ExampleService } from '../data-access/services/example.service.ts'; // not implemented
import { OrderDirection } from '../../core/criteria/util/enums/order-direction.enum.ts';
import { Filter } from '../../core/criteria/util/types/filter.ts';
import { FilterOperator } from '../../core/criteria/util/enums/filter-operator.enum.ts';
import { Order } from '../../core/criteria/util/types/order.ts';
import { Criteria } from '../../core/criteria/util/types/criteria.ts';

@Controller('examples')
export class ExampleController {
  constructor(private readonly examplesService: ExampleService) {}

  /**
   * GET /examples
   * An endpoint to search for examples using query parameters.
   * Example: /examples?name=computer&orderBy=name&orderDirection=DESC&limit=20
   */
  @Get()
  async search(
    // Filters
    @Query('name') name?: string,

    // Ordering
    @Query('orderBy', new DefaultValuePipe('id')) orderBy?: string,
    @Query('orderDirection', new DefaultValuePipe(OrderDirection.ASC)) orderDirection?: OrderDirection,

    // Pagination
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const filters: Filter[] = [];

    if (name) {
      filters.push(new Filter('name', FilterOperator.CONTAINS, name));
    }

    const order = orderBy ? new Order(orderBy, orderDirection) : undefined;

    const criteria = new Criteria(filters, order, limit, offset);

    return this.examplesService.search(criteria);
  }
}

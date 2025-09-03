import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { Criteria } from '../../util/types/criteria';
import { Filter } from '../../util/types/filter';
import { FilterOperator } from '../../util/enums/filter-operator.enum';

/**
 * A service that translates a Criteria object into a TypeORM SelectQueryBuilder.
 * This is the bridge between the domain-agnostic Criteria and the TypeORM implementation.
 */
@Injectable()
export class TypeOrmCriteriaConverter<T> {
  /**
   * Applies a Criteria object to a given TypeORM SelectQueryBuilder.
   * @param queryBuilder The QueryBuilder to modify.
   * @param criteria The Criteria object containing the query rules.
   * @returns The modified SelectQueryBuilder.
   */
  public apply(
    queryBuilder: SelectQueryBuilder<T>,
    criteria: Criteria,
  ): SelectQueryBuilder<T> {
    if (criteria.filters.length > 0) {
      this.applyFilters(queryBuilder, criteria.filters);
    }

    if (criteria.order) {
      const orderBy = criteria.order.orderBy.includes('.')
        ? criteria.order.orderBy
        : `${queryBuilder.alias}.${criteria.order.orderBy}`;

      queryBuilder.orderBy(orderBy, criteria.order.orderDirection);
    }

    if (criteria.limit) {
      queryBuilder.take(criteria.limit);
    }

    if (criteria.offset) {
      queryBuilder.skip(criteria.offset);
    }

    return queryBuilder;
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Filter[],
  ): void {
    filters.forEach((filter, index) => {
      // Use a unique parameter name for each filter to avoid conflicts.
      const paramName = `${filter.field.replace('.', '_')}_${index}`;
      const whereClause = this.buildWhereClause(
        queryBuilder.alias,
        filter,
        paramName,
      );

      // Use 'andWhere' to chain multiple filter conditions.
      queryBuilder.andWhere(whereClause.clause, whereClause.parameters);
    });
  }

  private buildWhereClause(
    alias: string,
    filter: Filter,
    paramName: string,
  ): { clause: string; parameters: object } {
    const { field, operator, value } = filter;
    
    // Allow filtering on related entities (e.g., 'user.name')
    const fieldName = field.includes('.') ? field : `${alias}.${field}`;

    switch (operator) {
      case FilterOperator.EQUALS:
        return {
          clause: `${fieldName} = :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.NOT_EQUAL:
        return {
          clause: `${fieldName} != :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.GT:
        return {
          clause: `${fieldName} > :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.LT:
        return {
          clause: `${fieldName} < :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.GTE:
        return {
          clause: `${fieldName} >= :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.LTE:
        return {
          clause: `${fieldName} <= :${paramName}`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.CONTAINS:
        return {
          // Using LOWER for case-insensitive search in PostgreSQL.
          clause: `LOWER(${fieldName}) LIKE LOWER(:${paramName})`,
          parameters: { [paramName]: `%${value}%` },
        };
      case FilterOperator.NOT_CONTAINS:
        return {
          clause: `LOWER(${fieldName}) NOT LIKE LOWER(:${paramName})`,
          parameters: { [paramName]: `%${value}%` },
        };
      case FilterOperator.IN:
        // TypeORM handles array parameters automatically with (:...paramName)
        return {
          clause: `${fieldName} IN (:...${paramName})`,
          parameters: { [paramName]: value },
        };
      case FilterOperator.NOT_IN:
        return {
          clause: `${fieldName} NOT IN (:...${paramName})`,
          parameters: { [paramName]: value },
        };
      default:
        throw new Error(`Operator ${operator} is not supported.`);
    }
  }
}

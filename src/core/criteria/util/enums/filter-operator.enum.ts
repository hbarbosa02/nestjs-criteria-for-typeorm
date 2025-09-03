/**
 * Defines the supported filter operators for building queries.
 */
export enum FilterOperator {
  EQUALS = '=',
  NOT_EQUAL = '!=',
  GT = '>',
  LT = '<',
  GTE = '>=',
  LTE = '<=',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

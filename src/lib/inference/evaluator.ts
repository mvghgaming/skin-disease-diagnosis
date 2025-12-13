import { Condition, ComparisonOperator } from '@/types/rule';
import { WorkingMemory } from '@/types/diagnosis';

/**
 * Evaluates a single condition against the working memory
 * @param condition The condition to evaluate
 * @param workingMemory The current state of facts
 * @returns true if the condition is satisfied, false otherwise
 */
export function evaluateCondition(
  condition: Condition,
  workingMemory: WorkingMemory
): boolean {
  const actualValue = workingMemory[condition.variable];

  // Special handling for IS_NOT_NULL operator
  if (condition.operator === 'IS_NOT_NULL') {
    return actualValue !== undefined && actualValue !== null;
  }

  // Special handling for IS_NULL operator
  if (condition.operator === 'IS_NULL') {
    return actualValue === undefined || actualValue === null;
  }

  // If the variable is not in working memory, condition fails
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  return compareValues(actualValue, condition.operator, condition.value);
}

/**
 * Compare two values using the specified operator
 * @param actual The actual value from working memory
 * @param operator The comparison operator
 * @param expected The expected value from the condition
 * @returns true if the comparison is satisfied
 */
function compareValues(actual: any, operator: ComparisonOperator, expected: any): boolean {
  switch (operator) {
    case '=':
      return actual === expected;

    case '!=':
      return actual !== expected;

    case 'IN':
      // Check if actual value is in the expected array
      if (!Array.isArray(expected)) {
        console.warn('IN operator requires an array value');
        return false;
      }
      return expected.includes(actual);

    case 'NOT_IN':
      // Check if actual value is not in the expected array
      if (!Array.isArray(expected)) {
        console.warn('NOT_IN operator requires an array value');
        return false;
      }
      return !expected.includes(actual);

    case '>':
      return Number(actual) > Number(expected);

    case '<':
      return Number(actual) < Number(expected);

    case '>=':
      return Number(actual) >= Number(expected);

    case '<=':
      return Number(actual) <= Number(expected);

    case 'CONTAINS_ANY':
      // Check if actual array contains any value from expected array
      if (!Array.isArray(actual)) {
        console.warn('CONTAINS_ANY operator requires actual value to be an array');
        return false;
      }
      if (!Array.isArray(expected)) {
        console.warn('CONTAINS_ANY operator requires expected value to be an array');
        return false;
      }
      return expected.some(expectedItem => actual.includes(expectedItem));

    case 'IS_NOT_NULL':
      // Already handled above
      return actual !== undefined && actual !== null;

    case 'IS_NULL':
      // Already handled above
      return actual === undefined || actual === null;

    case 'LIKE':
      // String pattern matching (case-insensitive)
      if (typeof actual !== 'string' || typeof expected !== 'string') {
        return false;
      }
      // Convert SQL LIKE pattern to regex (% becomes .*, _ becomes .)
      const regexPattern = expected
        .replace(/%/g, '.*')
        .replace(/_/g, '.');
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      return regex.test(actual);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluates all conditions in a rule with the specified logic (AND/OR)
 * @param conditions Array of conditions
 * @param logic AND or OR
 * @param workingMemory Current working memory
 * @returns true if conditions are satisfied according to logic
 */
export function evaluateConditions(
  conditions: Condition[],
  logic: 'AND' | 'OR',
  workingMemory: WorkingMemory
): boolean {
  if (conditions.length === 0) {
    return false;
  }

  const results = conditions.map(condition => evaluateCondition(condition, workingMemory));

  if (logic === 'AND') {
    return results.every(result => result === true);
  } else {
    return results.some(result => result === true);
  }
}

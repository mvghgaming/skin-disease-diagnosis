import { Rule, Conclusion } from '@/types/rule';
import { WorkingMemory, FiredRule } from '@/types/diagnosis';
import { evaluateConditions } from './evaluator';

/**
 * Rule category priority for ordering rule execution
 * Lower numbers are processed first
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  'diagnosis': 1,
  'diagnosis_support': 2,
  'risk': 3,
  'treatment': 4,
  'symptom_support': 5,
  'differential': 6,
  'complication': 7,
};

/**
 * Main inference engine using forward-chaining algorithm
 * @param userFacts Initial facts provided by the user
 * @param rules All applicable rules
 * @returns Object containing final working memory and fired rules
 */
export function runInference(
  userFacts: WorkingMemory,
  rules: Rule[]
): { workingMemory: WorkingMemory; firedRules: FiredRule[] } {
  // Initialize working memory with user-provided facts
  const workingMemory: WorkingMemory = { ...userFacts };

  // Track which rules have fired
  const firedRules: FiredRule[] = [];
  const firedRuleIds = new Set<string>();

  // Sort rules by priority
  const sortedRules = sortRulesByPriority(rules);

  // Forward-chaining loop: iterate until no new rules can fire
  let changed = true;
  let iterations = 0;
  const MAX_ITERATIONS = 100; // Prevent infinite loops

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (const rule of sortedRules) {
      // Skip if rule has already fired
      if (firedRuleIds.has(rule.id)) {
        continue;
      }

      // Evaluate rule conditions
      const satisfied = evaluateConditions(
        rule.conditions,
        rule.logic,
        workingMemory
      );

      if (satisfied) {
        // Apply rule conclusions
        applyConclusions(rule.conclusions, workingMemory);

        // Mark rule as fired
        firedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          explanation: rule.explanation,
          conclusions: rule.conclusions,
        });
        firedRuleIds.add(rule.id);

        // Mark that working memory has changed
        changed = true;
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn('Inference engine reached maximum iterations');
  }

  return {
    workingMemory,
    firedRules,
  };
}

/**
 * Sort rules by category priority and then by rule priority
 * @param rules Array of rules to sort
 * @returns Sorted array of rules
 */
function sortRulesByPriority(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => {
    // First, sort by category priority
    const categoryPriorityA = CATEGORY_PRIORITY[a.category] || 999;
    const categoryPriorityB = CATEGORY_PRIORITY[b.category] || 999;

    if (categoryPriorityA !== categoryPriorityB) {
      return categoryPriorityA - categoryPriorityB;
    }

    // If same category, sort by rule priority (higher priority first)
    const rulePriorityA = a.priority || 0;
    const rulePriorityB = b.priority || 0;

    return rulePriorityB - rulePriorityA;
  });
}

/**
 * Apply rule conclusions to the working memory
 * Handles both scalar values and array merging
 * @param conclusions Array of conclusions to apply
 * @param workingMemory Current working memory (mutated)
 */
function applyConclusions(
  conclusions: Conclusion[],
  workingMemory: WorkingMemory
): void {
  for (const conclusion of conclusions) {
    const existingValue = workingMemory[conclusion.variable];

    // Handle array values - merge with existing arrays
    if (Array.isArray(conclusion.value)) {
      if (Array.isArray(existingValue)) {
        // Merge arrays and remove duplicates
        workingMemory[conclusion.variable] = [
          ...new Set([...existingValue, ...conclusion.value])
        ];
      } else {
        // Set new array
        workingMemory[conclusion.variable] = conclusion.value;
      }
    }
    // Handle scalar values - overwrite
    else {
      workingMemory[conclusion.variable] = conclusion.value;
    }
  }
}

/**
 * Evaluate a single rule without modifying working memory
 * Useful for testing and validation
 * @param rule The rule to evaluate
 * @param workingMemory Current working memory
 * @returns true if the rule would fire
 */
export function evaluateRule(rule: Rule, workingMemory: WorkingMemory): boolean {
  return evaluateConditions(rule.conditions, rule.logic, workingMemory);
}

/**
 * Apply conclusions from a rule and return the new working memory
 * Does not mutate the input working memory
 * @param conclusions Conclusions to apply
 * @param workingMemory Current working memory
 * @returns New working memory with conclusions applied
 */
export function applyRuleConclusions(
  conclusions: Conclusion[],
  workingMemory: WorkingMemory
): WorkingMemory {
  const newWorkingMemory = { ...workingMemory };
  applyConclusions(conclusions, newWorkingMemory);
  return newWorkingMemory;
}

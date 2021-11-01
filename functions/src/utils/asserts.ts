/**
 * Describes the type of the assertion.
 * Don't run in the production environment. Because can stop the flow of some tasks.
 * 
 * @param condition - A boolean value is rather than other value
 * @param message - A message to show if the condition is false
 */
function assert(condition: unknown, message: string | undefined): asserts condition {
    if (!condition) throw new Error(message ?? 'Assertion failed. Please check: ' + condition);
}

export { assert }

// NOTE: Check the section: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html

function assert(condition: unknown, message: string | undefined): asserts condition {
    if (!condition) throw new Error(message ?? 'Assertion failed. Please check: ' + condition);
}

export { assert }

// NOTE: Check the section: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html
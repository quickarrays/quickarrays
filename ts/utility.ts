function assert_eq(a: any, b: any, message: string) {
    if(a !== b) {
        throw new Error(`Assertion Failed: ${message}. Expected "${a}", but got "${b}"`);
    }
}

/**
 * Counts the number of "runs" of consecutive identical characters in a string.
 * A run is a sequence of one or more identical characters.
 * For example, "aaabbc" has 3 runs: "aaa", "bb", "c".
 *
 * @param text The input string.
 * @returns The total number of runs in the string. Returns 0 for an empty string.
 */
function number_of_runs(text: string): number {
    /* Handle the edge case of an empty string. An empty string has no runs. */
    if (text.length === 0) {
        return 0;
    }

    let runs: number = 1; /* Initialize runs to 1 because the first character always starts a run. */
    let runchar: string = text[0]; /* Store the character of the current run. */

    /* Iterate through the string starting from the second character. */
    for (let i: number = 1; i < text.length; ++i) {
        /* If the current character is different from the character of the current run,
           it means a new run has started. */
        if (text[i] !== runchar) {
            runs++; /* Increment the count of runs. */
            runchar = text[i]; /* Update runchar to the new character starting the new run. */
        }
    }

    return runs;
}

/* Assume the following function is available for testing: */
/*
declare function assert_eq(a: any, b: any, message: string): void;
*/

/**
 * Tests the `number_of_runs` function with various cases, including border cases.
 * Assumes an `assert_eq` function is available for asserting equality.
 */
export function test_number_of_runs(): void {
    console.log("Running tests for number_of_runs...");

    // Border cases
    assert_eq(number_of_runs(""), 0, "Test 1: Empty string should return 0 runs.");
    assert_eq(number_of_runs("a"), 1, "Test 2: Single character string should return 1 run.");
    assert_eq(number_of_runs("aaaaa"), 1, "Test 3: String with all same characters should return 1 run.");

    // Usual cases
    assert_eq(number_of_runs("abc"), 3, "Test 4: String with all unique characters should return length.");
    assert_eq(number_of_runs("aaabbc"), 3, "Test 5: Mixed runs (aaa, bb, c).");
    assert_eq(number_of_runs("ababa"), 5, "Test 6: Alternating characters (a, b, a, b, a).");
    assert_eq(number_of_runs("mississippi"), 8, "Test 7: Complex word (m, i, ss, i, ss, i, pp, i).");
    assert_eq(number_of_runs("Hello World"), 9, "Test 8: String with spaces and mixed cases (H, e, ll, o, , W, o, r, l, d)."); // H, e, ll, o, ' ', W, o, r, l, d -> 10. Wait, ' ' is one run. My example is wrong.
    // 'H', 'e', 'll', 'o', ' ', 'W', 'o', 'r', 'l', 'd' = 10 runs
    // Let's re-evaluate "Hello World":
    // H (1)
    // e (1)
    // ll (1) -> 3
    // o (1)
    // ' ' (1)
    // W (1)
    // o (1)
    // r (1)
    // l (1)
    // d (1)
    // Total: 1+1+1+1+1+1+1+1+1+1 = 10 runs
    assert_eq(number_of_runs("Hello World"), 10, "Test 8: String with spaces and mixed cases.");


    assert_eq(number_of_runs("112233"), 3, "Test 9: Numeric string with runs.");
    assert_eq(number_of_runs("$$$$"), 1, "Test 10: Special characters all same.");
    assert_eq(number_of_runs("!@#$"), 4, "Test 11: Special characters all different.");
    assert_eq(number_of_runs("  a b  c"), 6, "Test 12: Multiple spaces and single characters."); // ' ', 'a', ' ', 'b', ' ', 'c' -> 6. No, '  ' (2), 'a' (1), ' ' (1), 'b' (1), '  ' (2), 'c' (1) -> 6 runs. Correct.

    console.log("All tests passed for number_of_runs!");
}

/**
 * Calculates the size of a factorization.
 * Factor ends are marked with '1's (represented as `true` booleans) in the factorization.
 *
 * @param factorization An array of booleans representing the factorization, where `true` marks a factor end.
 * @returns The total count of `true` booleans (factor ends) found in the factorization.
 */
function number_of_factors(factorization: ReadonlyArray<boolean>): number {
    /*
     * Suggestion: The type `[boolean]` in the original JavaScript, if interpreted as an array of booleans,
     * should be `boolean[]` or `ReadonlyArray<boolean>` in TypeScript.
     * `[boolean]` in TypeScript denotes a tuple type with exactly one boolean element.
     *
     * Suggestion: The spread operator `[...factorization]` is unnecessary here if `factorization` is already an array.
     * `filter` can be called directly on the array. Using `ReadonlyArray` ensures that the function does not
     * modify the input array, adhering to functional programming principles and improving predictability.
     *
     * Suggestion: For very large arrays, a `reduce` operation might be slightly more performant as it avoids
     * creating an intermediate array like `filter` does.
     * Example: `return factorization.reduce((count, value) => count + (value ? 1 : 0), 0);`
     */
    return factorization.filter((value: boolean) => value).length;
}

/* Assume the following function `assert_eq` is available in the test environment. */
// declare function assert_eq(a: any, b: any, message: string): void;

/**
 * Tests the `number_of_factors` function for various scenarios.
 * Covers border cases and usual cases to ensure correctness.
 */
export function test_number_of_factors(): void {
    // Border cases
    assert_eq(number_of_factors([]), 0, "Test Case 1: Empty array should return 0.");
    assert_eq(number_of_factors([false, false, false]), 0, "Test Case 2: Array with all false should return 0.");
    assert_eq(number_of_factors([true, true, true]), 3, "Test Case 3: Array with all true should return the count of elements.");
    assert_eq(number_of_factors([true]), 1, "Test Case 4: Single true element should return 1.");
    assert_eq(number_of_factors([false]), 0, "Test Case 5: Single false element should return 0.");

    // Usual cases
    assert_eq(number_of_factors([true, false, true, true, false]), 3, "Test Case 6: Mixed values (true, false) should count only true.");
    assert_eq(number_of_factors([false, true, false, true, false, true, false]), 3, "Test Case 7: Alternating values should count true correctly.");
    assert_eq(number_of_factors([true, false, false, false, false]), 1, "Test Case 8: True at the beginning of the array.");
    assert_eq(number_of_factors([false, false, false, false, true]), 1, "Test Case 9: True at the end of the array.");
    assert_eq(number_of_factors([false, true, false, false, false]), 1, "Test Case 10: True in the middle of the array.");
    assert_eq(number_of_factors([true, true, false, true, true, false, true]), 5, "Test Case 11: Multiple blocks of true values.");
}

/**
 * Pads the given string on the right with a specified character until it reaches the desired length.
 * If the padding character is an empty string and the current string length is less than the desired length,
 * the original string is returned to prevent an infinite loop.
 * If the string is already equal to or longer than the desired length, the original string is returned.
 *
 * @param {string} text - The input string to pad.
 * @param {string} c - The character (or string) to use for padding. If this is an empty string, no padding will occur if `text.length < len`.
 * @param {number} len - The desired total length of the string.
 * @returns {string} The padded string.
 */
function padRight(text: string, padChar: string, length: number): string {
    if(text.length >= length || padChar.length === 0) { return text; }
    return text + padChar.repeat(length - text.length);
}

/**
 * Pads the given string on the left with a specified character until it reaches the desired length.
 * If the padding character is an empty string and the current string length is less than the desired length,
 * the original string is returned to prevent an infinite loop.
 * If the string is already equal to or longer than the desired length, the original string is returned.
 *
 * @param {string} text - The input string to pad.
 * @param {string} c - The character (or string) to use for padding. If this is an empty string, no padding will occur if `text.length < len`.
 * @param {number} len - The desired total length of the string.
 * @returns {string} The padded string.
 */
function padLeft(text: string, padChar: string, length: number): string {
    if(text.length >= length || padChar.length === 0) { return text; }
    return padChar.repeat(length - text.length) + text;
}

/**
 * Executes a series of tests for padRight and padLeft functions using assert_eq.
 * Assumes `assert_eq(a, b, message)` is available, which throws an error if `a != b`.
 */
export function test_padFunctions(): void {
    console.log("Running padRight tests...");
    // Basic padding cases
    assert_eq(padRight("abc", "x", 5), "abcxx", "padRight - basic padding");
    assert_eq(padRight("", "x", 3), "xxx", "padRight - empty string, basic padding");
    assert_eq(padRight("abc", "xy", 7), "abcxyxy", "padRight - multi-character padding");
    assert_eq(padRight("abc", " ", 5), "abc  ", "padRight - space character padding");

    // Cases where no padding is needed
    assert_eq(padRight("abc", "x", 3), "abc", "padRight - no padding needed (exact length)");
    assert_eq(padRight("abc", "x", 2), "abc", "padRight - no padding needed (already longer)");
    assert_eq(padRight("hello", "-", 5), "hello", "padRight - already at target length");
    assert_eq(padRight("hello", "-", 3), "hello", "padRight - string longer than target");
    assert_eq(padRight("a", "b", 1), "a", "padRight - single char, target 1");
    assert_eq(padRight("", "0", 0), "", "padRight - empty string, target 0");

    // Border cases related to the 'char' argument (bug fix for empty char)
    assert_eq(padRight("abc", "", 5), "abc", "padRight - empty char, padding needed (should return original due to fix)");
    assert_eq(padRight("", "", 3), "", "padRight - empty str, empty char, padding needed (should return original due to fix)");
    assert_eq(padRight("test", "", 4), "test", "padRight - empty char, exact length (no padding needed anyway)");
    assert_eq(padRight("test", "", 2), "test", "padRight - empty char, already longer (no padding needed anyway)");


    console.log("Running padLeft tests...");
    // Basic padding cases
    assert_eq(padLeft("abc", "x", 5), "xxabc", "padLeft - basic padding");
    assert_eq(padLeft("", "x", 3), "xxx", "padLeft - empty string, basic padding");
    assert_eq(padLeft("abc", "xy", 7), "xyxyabc", "padLeft - multi-character padding");
    assert_eq(padLeft("abc", " ", 5), "  abc", "padLeft - space character padding");

    // Cases where no padding is needed
    assert_eq(padLeft("abc", "x", 3), "abc", "padLeft - no padding needed (exact length)");
    assert_eq(padLeft("abc", "x", 2), "abc", "padLeft - no padding needed (already longer)");
    assert_eq(padLeft("hello", "-", 5), "hello", "padLeft - already at target length");
    assert_eq(padLeft("hello", "-", 3), "hello", "padLeft - string longer than target");
    assert_eq(padLeft("a", "b", 1), "a", "padLeft - single char, target 1");
    assert_eq(padLeft("", "0", 0), "", "padLeft - empty string, target 0");

    // Border cases related to the 'char' argument (bug fix for empty char)
    assert_eq(padLeft("abc", "", 5), "abc", "padLeft - empty char, padding needed (should return original due to fix)");
    assert_eq(padLeft("", "", 3), "", "padLeft - empty str, empty char, padding needed (should return original due to fix)");
    assert_eq(padLeft("test", "", 4), "test", "padLeft - empty char, exact length (no padding needed anyway)");
    assert_eq(padLeft("test", "", 2), "test", "padLeft - empty char, already longer (no padding needed anyway)");
    
}

/**
 * Increments each number in an array by a specified amount.
 *
 * @param array The array of numbers to increment.
 * @param inc The amount by which to increment each number. Defaults to 1.
 * @returns A new array with each number incremented.
 */
function increment_array(array: number[], inc: number = 1): number[] {
    return array.map((x: number) => x + inc);
}
export function test_increment_array(): void {
    // Test case 1: Basic increment
    assert_eq(increment_array([1, 2, 3], 1), [2, 3, 4], "Test Case 1 Failed: Basic increment by 1");

    // Test case 2: Default increment (inc = 1)
    assert_eq(increment_array([10, 20]), [11, 21], "Test Case 2 Failed: Default increment");

    // Test case 3: Increment by a different positive number
    assert_eq(increment_array([1, 2, 3], 5), [6, 7, 8], "Test Case 3 Failed: Increment by 5");

    // Test case 4: Increment by a negative number (decrement)
    assert_eq(increment_array([5, 6, 7], -2), [3, 4, 5], "Test Case 4 Failed: Decrement by 2");

    // Test case 5: Increment by zero
    assert_eq(increment_array([1, 2, 3], 0), [1, 2, 3], "Test Case 5 Failed: Increment by zero");

    // Test case 6: Empty array
    assert_eq(increment_array([], 10), [], "Test Case 6 Failed: Empty array");

    // Test case 7: Array with floating-point numbers
    assert_eq(increment_array([1.5, 2.5, 3.0], 0.5), [2.0, 3.0, 3.5], "Test Case 7 Failed: Floating point numbers");

    // Test case 8: Array with mixed positive and negative numbers
    assert_eq(increment_array([-5, 0, 5], 2), [-3, 2, 7], "Test Case 8 Failed: Mixed positive and negative numbers");

    // Test case 9: Increment leading to large numbers (using Number.MAX_SAFE_INTEGER)
    /* Consider edge cases with Number.MAX_VALUE or Number.MIN_VALUE if `inc` can cause overflow/underflow,
       though for standard integer arithmetic, `Number.MAX_SAFE_INTEGER` is more relevant for precision. */
    const largeNumberArray = [Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER];
    const expectedLargeNumberArray = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1];
    assert_eq(increment_array(largeNumberArray, 1), expectedLargeNumberArray, "Test Case 9 Failed: Large numbers");
    
    // Test case 10: Array with only one element
    assert_eq(increment_array([7], 3), [10], "Test Case 10 Failed: Single element array");
}


/**
 * Replaces numbers in an array that are greater than or equal to `max_length` with a hyphen ('-').
 *
 * @param array The input array of numbers.
 * @param max_length The maximum allowed value for elements in the array.
 * @returns A new array where invalid positions are replaced with a hyphen.
 */
function replace_invalid_position(array: number[], max_length: number): (number | string)[] {
    return array.map((x) => (x >= max_length) ? '-' : x);
}

export function test_replace_invalid_position(): void {
    // Test case 1: No invalid positions
    assert_eq(replace_invalid_position([1, 2, 3], 5), [1, 2, 3], "Test Case 1 Failed: No invalid positions.");

    // Test case 2: All invalid positions
    assert_eq(replace_invalid_position([5, 6, 7], 5), ['-', '-', '-'], "Test Case 2 Failed: All invalid positions.");

    // Test case 3: Mixed valid and invalid positions
    assert_eq(replace_invalid_position([1, 5, 3, 6, 0], 5), [1, '-', 3, '-', 0], "Test Case 3 Failed: Mixed positions.");

    // Test case 4: Empty array
    assert_eq(replace_invalid_position([], 5), [], "Test Case 4 Failed: Empty array.");

    // Test case 5: max_length is 0, all positive numbers should be invalid
    assert_eq(replace_invalid_position([1, 2, 0], 0), ['-', '-', '-'], "Test Case 5 Failed: max_length is 0.");

    // Test case 6: max_length is negative
    assert_eq(replace_invalid_position([1, 2, -1], -5), [1, 2, -1], "Test Case 6 Failed: max_length is negative.");

    // Test case 7: Array contains negative numbers, max_length is positive
    assert_eq(replace_invalid_position([-1, -5, 0, 5, 10], 5), [-1, -5, 0, '-', '-'], "Test Case 7 Failed: Negative numbers in array.");

    // Test case 8: Numbers that are exactly max_length should be replaced
    assert_eq(replace_invalid_position([4, 5, 6], 5), [4, '-', '-'], "Test Case 8 Failed: Exact match with max_length.");

    // Test case 9: Floating point numbers
    assert_eq(replace_invalid_position([1.5, 4.2, 5.0, 5.1], 5.0), [1.5, 4.2, '-', '-'], "Test Case 9 Failed: Floating point numbers.");

    // Test case 10: Large numbers
    assert_eq(replace_invalid_position([1000, 99999, 100000], 100000), [1000, 99999, '-'], "Test Case 10 Failed: Large numbers.");
}

/**
 * Prettifies a given string by replacing null characters, optionally
 * padding each character to a uniform width, and joining them with a separator.
 *
 * The `width` for padding is determined by the number of digits in `(text.length + base - 1)`.
 * For example, if `text.length + base - 1` is 9, `width` is 1. If it's 10, `width` is 2.
 * This can lead to characters not being padded if their length is already equal to or greater than `width`.
 *
 * @param {string} text The input string to prettify.
 * @param {string} [sep=" "] The separator to use between characters. Defaults to a space.
 *                           If `doTabularize` is false, this is overridden to an empty string.
 * @param {number} [base=0] A base number used in calculating the padding width.
 *                          The padding width is `String(text.length + base - 1).length`.
 * @param {boolean} [doTabularize=true] If true, each character is padded to a uniform width
 *                                      and `sep` is used. If false, `sep` is ignored (becomes '')
 *                                      and no padding is applied (width becomes 0).
 * @returns {string} The prettified string.
 */
function prettify_string(text: string, sep: string = " ", base: number = 0, do_tabularize: boolean = true): string {
    text = text.replace("\0", "$");

    // Calculate the width for padding.
    // If do_tabularize is true, width is the length of the string representation of (text.length + base - 1).
    // If do_tabularize is false, width is 0, meaning no padding will be applied effectively.
    // Example: if (text.length + base - 1) is 123, then String(123).length is 3. So width will be 3.
    const width: number = do_tabularize ? String(text.length + base - 1).length : 0;

    // Determine the effective separator. If do_tabularize is false, the separator is always an empty string.
    let effectiveSep: string = sep;
    if (!do_tabularize) {
        effectiveSep = '';
    }

    // Split the text into individual characters.
    // For each character, pad it on the left with a space up to the calculated width.
    // Finally, join the padded characters using the effective separator.
    return text.split('').map((x: string) => padLeft(x, ' ', width)).join(effectiveSep);
}

/**
 * Test function for prettify_string.
 * Covers border cases and usual cases.
 */
export function test_prettify_string(): void {
    console.log("Running tests for prettify_string...");

    // Test Case 1: Basic functionality with default parameters
    // text="abc", length=3. base=0. width = String(3+0-1).length = String(2).length = 1.
    // padLeft(char, ' ', 1) -> char itself. sep=" ".
    assert_eq(prettify_string("abc"), "a b c", "Test Case 1 Failed: Basic default");
    assert_eq(prettify_string("hello"), "h e l l o", "Test Case 1.1 Failed: Basic default 2");

    // Test Case 2: `doTabularize = false` - sep should be ignored and no padding (width=0)
    assert_eq(prettify_string("abc", "-", 0, false), "abc", "Test Case 2 Failed: doTabularize=false, sep ignored");
    assert_eq(prettify_string("hello", "---", 10, false), "hello", "Test Case 2.1 Failed: doTabularize=false with custom sep");

    // Test Case 3: Custom separator with `doTabularize = true`
    assert_eq(prettify_string("abc", "_"), "a_b_c", "Test Case 3 Failed: Custom separator");
    assert_eq(prettify_string("12345", "--"), "1--2--3--4--5", "Test Case 3.1 Failed: Custom separator multiple chars");

    // Test Case 4: `base` affecting `width` (padding)
    // text="abc", length=3. base=0. width = String(3+0-1).length = String(2).length = 1.
    // padLeft(char, ' ', 1) -> char itself
    assert_eq(prettify_string("abc", " ", 0), "a b c", "Test Case 4 Failed: base=0, width=1");

    // text="abc", length=3. base=10. width = String(3+10-1).length = String(12).length = 2.
    // padLeft(char, ' ', 2) -> " char"
    assert_eq(prettify_string("abc", " ", 10), " a  b  c", "Test Case 4.1 Failed: base=10, width=2");

    // text="abc", length=3. base=100. width = String(3+100-1).length = String(102).length = 3.
    // padLeft(char, ' ', 3) -> "  char"
    assert_eq(prettify_string("abc", " ", 100), "  a   b   c", "Test Case 4.2 Failed: base=100, width=3");

    // Test Case 5: Empty string
    // width calculation for empty string (length=0, base=0): String(0+0-1).length = String(-1).length = 2.
    // However, map is called on an empty array, so join still returns an empty string.
    assert_eq(prettify_string(""), "", "Test Case 5 Failed: Empty string");
    assert_eq(prettify_string("", "_", 10, true), "", "Test Case 5.1 Failed: Empty string with params");
    assert_eq(prettify_string("", "_", 10, false), "", "Test Case 5.2 Failed: Empty string, no tabularize");

    // Test Case 6: String with null characters (`\0`)
    // The original JS only replaces the first `\0`.
    assert_eq(prettify_string("a\0b\0c"), "a$ b\0 c", "Test Case 6 Failed: String with null characters (first replaced)");
    assert_eq(prettify_string("\0test"), "$ t e s t", "Test Case 6.1 Failed: Null at start");
    assert_eq(prettify_string("test\0"), "t e s t$", "Test Case 6.2 Failed: Null at end");
    assert_eq(prettify_string("\0\0\0"), "$ \0 \0", "Test Case 6.3 Failed: Multiple nulls (only first replaced)");


    // Test Case 7: Single character string
    assert_eq(prettify_string("a"), "a", "Test Case 7 Failed: Single character");
    // length=1, base=10. String(1+10-1).length = String(10).length = 2. So width=2.
    // padLeft("a", ' ', 2) -> " a"
    assert_eq(prettify_string("a", "-", 10), " a", "Test Case 7.1 Failed: Single character with base=10 (width=2)");
    assert_eq(prettify_string("a", "-", 0, false), "a", "Test Case 7.2 Failed: Single character, no tabularize");

    // Test Case 8: `width` calculation with unusual `base`
    // text="a", length=1. base=-10. (1 + (-10) - 1) = -10. String(-10).length = 3. So width=3.
    // padLeft("a", ' ', 3) -> "  a"
    assert_eq(prettify_string("a", " ", -10, true), "  a", "Test Case 8 Failed: Single char, negative base, width=3");

    // Test Case 9: Multi-character string where a character is longer than calculated width
    // This is not directly possible with single chars, but if `padLeft` was more complex.
    // For single characters, `padLeft("xy", ' ', 1)` would result in "xy" as length > width.
    // Let's ensure a 'double' character (like emoji) is handled.
    // text="😊b", length=2. base=0. String(2+0-1).length = String(1).length = 1. width=1.
    // padLeft("😊", ' ', 1) -> "😊"
    assert_eq(prettify_string("😊b"), "😊 b", "Test Case 9 Failed: Emoji character");
}

/**
 * Formats an array of values into a neatly aligned string.
 * Each element is converted to a string and then left-padded to ensure uniform width,
 * based on the number of digits in the largest possible index (array.length + base - 1).
 *
 * @template T The type of elements in the array, must be convertible to string.
 * @param array The array of values to prettify.
 * @param sep The separator string to use between prettified array elements. Defaults to a single space.
 * @param base The base offset for calculating the maximum index width. Defaults to 0.
 *             For example, if you want indices to start from 1, pass base = 1.
 * @returns A string with the prettified and joined array elements.
 */
function prettify_array<T extends { toString(): string }>(
    array: T[],
    sep: string = " ",
    base: number = 0
): string {
    const maxIndexValue = Math.max(0, array.length + base - 1);
    const width = ("" + maxIndexValue).toString().length;
    return array.map((x) => padLeft("" + x, ' ', width)).join(sep);
}

/**
 * Test function for prettify_array.
 * Assumes `assert_eq(a, b, message)` is available globally or imported.
 */
export function test_prettify_array(): void {
    console.log("Running test_prettify_array...");

    // Test Case 1: Basic array of numbers with default separator and base
    assert_eq(prettify_array([1, 22, 333]), "  1  22 333", "Test 1 Failed: Basic numbers");

    // Test Case 2: Array with different separator
    assert_eq(prettify_array([1, 22, 333], "-"), "  1-  22- 333", "Test 2 Failed: Custom separator");

    // Test Case 3: Array with different base (should affect width calculation)
    // For [1, 22, 333] with base=1, max index is (3+1-1) = 3. Width of "3" is 1.
    assert_eq(prettify_array([1, 22, 333], " ", 1), "  1 22 333", "Test 3 Failed: Custom base 1");
    // For [1, 22, 333] with base=10, max index is (3+10-1) = 12. Width of "12" is 2.
    assert_eq(prettify_array([1, 22, 333], " ", 10), "  1 22333", "Test 3.1 Failed: Custom base 10");

    // Test Case 4: Array of mixed types (numbers and strings)
    assert_eq(prettify_array([10, "hello", 3]), " 10 hello  3", "Test 4 Failed: Mixed types");

    // Test Case 5: Empty array
    assert_eq(prettify_array([]), "", "Test 5 Failed: Empty array");
    assert_eq(prettify_array([], "-", 10), "", "Test 5.1 Failed: Empty array with custom params");

    // Test Case 6: Single element array
    assert_eq(prettify_array([123]), "123", "Test 6 Failed: Single element");
    // Max index (1+0-1) = 0. Width "0".length = 1.
    assert_eq(prettify_array([5]), "5", "Test 6.1 Failed: Single digit single element");
    // Max index (1+10-1) = 10. Width "10".length = 2.
    assert_eq(prettify_array([5], " ", 10), " 5", "Test 6.2 Failed: Single element with custom base");


    // Test Case 7: Array with negative numbers
    assert_eq(prettify_array([-1, -10, -100]), " -1 -10-100", "Test 7 Failed: Negative numbers");
    // Max index (3+0-1) = 2. Width "2".length = 1. This means numbers like -100 will be truncated relative to padding.
    // The current padLeft implementation pads to `width`, which is based on index length, not content length.
    // Example: width=1. `padLeft("-1", ' ', 1)` => "-1" (since "-1".length >= 1)
    // The output ` -1 -10-100` makes sense with a width of 1 based on index length.

    // Test Case 8: Array with zero
    assert_eq(prettify_array([0, 0, 0]), "0 0 0", "Test 8 Failed: Zeros");

    // Test Case 9: Array with large numbers / many digits (to test width calculation robustness)
    // Max index (3+0-1) = 2. Width "2".length = 1.
    assert_eq(prettify_array([12345, 67890, 1000000]), "12345 67890 1000000", "Test 9 Failed: Large numbers, small width");
    // Max index (3+0-1) = 2. If we want padding for the numbers themselves, this logic might need adjustment.
    // The current logic correctly pads based on index width.

    // Test Case 10: Array where content length is greater than index-based width
    // maxIndexValue = (3+0-1) = 2. width = "2".length = 1.
    assert_eq(prettify_array(["a", "bc", "def"]), "a bc def", "Test 10 Failed: Content length > index width");

    // Test Case 11: Array where content length is less than index-based width
    // maxIndexValue = (3+0-1) = 2. width = "2".length = 1. (This implies it won't pad much for small items)
    // Let's create a scenario where width is larger.
    // For [1, 2, 3], if base is 100, then maxIndexValue = (3+100-1) = 102. width = "102".length = 3.
    assert_eq(prettify_array([1, 2, 3], " ", 100), "  1   2   3", "Test 11 Failed: Content length < index width");
}



/**
 * Prettifies a factorization array by formatting its elements and indicating factor boundaries.
 * Each element is padded to a consistent width, and a separator is added.
 * A special separator is used if a factor ends at the current position.
 *
 * @param text An array of strings representing the factors or elements.
 *             The special string `'\0'` (null character) at the last position can be replaced by `'$'`.
 * @param factorization An array of booleans indicating where factors end.
 *                      `factorization[i] = true` means a factor ends at position `i`.
 * @param sep The default separator string to use between elements. Defaults to " ".
 *            When `factorization[i]` is true, the first character of `sep` is replaced by `'|'`,
 *            e.g., if `sep` is `" X"`, it becomes `"|X"`.
 *            If `sep` is an empty string `""`, `substring(1)` will correctly yield `""`.
 * @param base A base number used to influence the calculation of the padding width. Defaults to 0.
 *             The width is determined by the length of the string representation of `(factorization.length + base - 1)`.
 * @returns A formatted string representing the prettified factorization.
 */
function prettify_factorization(text: string[], factorization: boolean[], sep: string = " ", base: number = 0): string {
    const n: number = text.length;
    /* The width calculation ensures a minimum width of 1 (for String(0).length) even if n + base - 1 is negative. */
    const width: number = String(Math.max(0, n + base - 1)).length;

    let result: string = "";
    for (let i: number = 0; i < n; ++i) {
        // Determine the element to display. If it's the last element and the string '\0', replace with '$'.
        const elementToDisplay: string = (i === n - 1 && text[i] === '\0') ? '$' : text[i];
        result += padLeft(elementToDisplay, ' ', width);
        // Append separator. If `factorization[i]` is true, use '|' followed by the rest of `sep`.
        // `sep.substring(1)` is safe even if `sep` is an empty string, returning `""`.
        result += (factorization[i] === true) ? ('|' + sep.substring(1)) : sep;
    }
    return result;
}

export function test_prettify_factorization(): void {
    /* A dummy assert_eq for local testing purposes. In a real environment, this would be provided. */
    function assert_eq(a: any, b: any, message: string): void {
        if (a !== b) {
            throw new Error(`Assertion Failed: ${message}\nExpected: ${b}\nReceived: ${a}`);
        }
        console.log(`Test Passed: ${message}`);
    }

    // Case 1: Basic functionality
    assert_eq(prettify_factorization(["a", "b", "c"], [false, true, false]), "a b|c ", "Case 1: Basic functionality");

    // Case 2: All factors end
    assert_eq(prettify_factorization(["x", "y", "z"], [true, true, true]), "x|y|z|", "Case 2: All factors end");

    // Case 3: No factors end
    assert_eq(prettify_factorization(["1", "2", "3"], [false, false, false]), "1 2 3 ", "Case 3: No factors end");

    // Case 4: Single element, factor ends
    assert_eq(prettify_factorization(["single"], [true]), "single|", "Case 4: Single element, factor ends");

    // Case 5: Single element, factor does not end
    assert_eq(prettify_factorization(["single"], [false]), "single ", "Case 5: Single element, factor does not end");

    // Case 6: Empty text array
    assert_eq(prettify_factorization([], []), "", "Case 6: Empty text array");

    // Case 7: `\0` character at the last position
    assert_eq(prettify_factorization(["a", "b", "\0"], [false, false, true]), "a b $|", "Case 7: Null character at last position");

    // Case 8: `\0` character not at the last position
    assert_eq(prettify_factorization(["a", "\0", "c"], [false, true, false]), "a \0|c ", "Case 8: Null character not at last position");

    // Case 9: Custom separator (multi-character)
    assert_eq(prettify_factorization(["x", "y"], [false, true], " -=- "), "x -=- y|-=- ", "Case 9: Custom multi-character separator");

    // Case 10: Custom separator (single character)
    assert_eq(prettify_factorization(["p", "q"], [false, true], "x"), "p x q|", "Case 10: Custom single-character separator");

    // Case 11: Empty separator
    assert_eq(prettify_factorization(["m", "n"], [false, true], ""), "m n|", "Case 11: Empty separator");

    // Case 12: Custom base for padding width (larger width)
    // n=3, base=5 -> Math.max(0, 3+5-1) = 7 -> String(7).length = 1.
    // The width calculation `String(Math.max(0, n + base - 1)).length` means:
    // for n=3, base=0: width = String(2).length = 1
    // for n=3, base=5: width = String(7).length = 1
    // This padding seems to be for very small numbers of elements,
    // if `n+base-1` is large enough to need more digits.
    // Let's try `n=10, base=0`, then `width = String(9).length = 1`
    // Let's try `n=11, base=0`, then `width = String(10).length = 2`
    assert_eq(prettify_factorization(["a", "b", "c"], [false, true, false], " ", 10), " a  b | c  ", "Case 12: Custom base for padding width (n=3, base=10 -> width for String(3+10-1)=String(12).length=2)");
    // Let's check the width for Case 12 carefully.
    // n = 3, base = 10
    // width = String(Math.max(0, 3 + 10 - 1)).length = String(12).length = 2.
    // So "a" becomes " a", "b" becomes " b", "c" becomes " c".
    assert_eq(prettify_factorization(["a", "b", "c"], [false, true, false], " ", 10), " a  b | c  ", "Case 12: Custom base (n=3, base=10 -> width=2)");


    // Case 13: Elements longer than calculated width
    // n=2, base=0 => width = String(Math.max(0, 2+0-1)).length = String(1).length = 1.
    // "long" is longer than 1. padLeft should not truncate.
    assert_eq(prettify_factorization(["long", "word"], [true, false]), "long|word ", "Case 13: Elements longer than calculated width");

    // Case 14: All elements are `\0` and last is `\0`
    assert_eq(prettify_factorization(["\0", "\0"], [false, true]), "\0 $ |", "Case 14: All elements `\\0`, last is `\\0`");

    // Case 15: `base` causes width to be 0 (Math.max(0, ...) handles this to 1)
    // n=1, base=-5 => Math.max(0, 1-5-1) = Math.max(0, -5) = 0. String(0).length = 1.
    assert_eq(prettify_factorization(["x"], [true], " ", -5), "x|", "Case 15: Negative base, width defaults to 1");

    // Case 16: More complex mix
    assert_eq(prettify_factorization(["A", "B", "\0", "D", "E"], [true, false, true, false, true], "X", 0), "A|B X \0|D X E|", "Case 16: Complex mix with `\\0` and custom sep");
    // n=5, base=0 => width = String(Math.max(0, 5+0-1)).length = String(4).length = 1.
    // Expected output: "A|B X \0|D X E|"
}


/**
 * Replaces newline characters (`\n`) with the unicode character U+21B5 (downwards arrow with corner leftwards)
 * and other whitespace characters (`\s`, excluding newlines, which are handled first) with U+23B5 (top half integral).
 * This is useful for making whitespaces visible in text.
 *
 * @param {string} text The input string to encode.
 * @returns {string} The string with encoded whitespace characters.
 */
function encodeWhitespaces(text: string): string {
  return text.replace(/\n/g, '\u21b5').replace(/\s/g, '\u23b5');
}

/**
 * Decodes strings that have had their newline characters (`\u21b5`) converted back to `\n`
 * and other encoded whitespace characters (`\u23b5`) back to a standard space (` `).
 * This reverses the operation performed by `encodeWhitespaces`.
 *
 * @param {string} text The input string to decode.
 * @returns {string} The string with decoded whitespace characters.
 */
function decodeWhitespaces(text: string): string {
  /* The decoding order should mirror the encoding order for proper round-tripping.
   * First, replace the newline marker, then the general whitespace marker.
   */
  return text.replace(/\u21b5/g, '\n').replace(/\u23b5/g, ' ');
}

export function test_whitespace_encoding_decoding(): void {
  // Test 1: Empty string
  assert_eq(decodeWhitespaces(""), "", "Test 1: Empty string decode");

  // Test 2: String with no whitespaces
  const noWhitespaceText = "HelloWorld";
  assert_eq(encodeWhitespaces(noWhitespaceText), noWhitespaceText, "Test 2: No whitespaces encode");

  // Test 3: String with only spaces
  const spacesText = "   ";
  assert_eq(encodeWhitespaces(spacesText), "\u23b5\u23b5\u23b5", "Test 3: Only spaces encode");
  assert_eq(decodeWhitespaces("\u23b5\u23b5\u23b5"), spacesText, "Test 3: Only spaces decode");

  // Test 4: String with only newlines
  const newlinesText = "\n\n";
  assert_eq(encodeWhitespaces(newlinesText), "\u21b5\u21b5", "Test 4: Only newlines encode");
  assert_eq(decodeWhitespaces("\u21b5\u21b5"), newlinesText, "Test 4: Only newlines decode");

  // Test 5: String with mixed spaces and newlines
  const mixedText = "hello world\nthis is a test\n";
  const encodedMixedText = "hello\u23b5world\u21b5this\u23b5is\u23b5a\u23b5test\u21b5";
  assert_eq(encodeWhitespaces(mixedText), encodedMixedText, "Test 5: Mixed spaces and newlines encode");
  assert_eq(decodeWhitespaces(encodedMixedText), mixedText, "Test 5: Mixed spaces and newlines decode");

  // Test 6: String with tabs and carriage returns
  const complexWhitespaceText = "line1\tline2\r\nline3\vline4\f";
  // Expected: \t, \r, \v, \f should become \u23b5. \n should become \u21b5.
  const encodedComplexWhitespaceText = "line1\u23b5line2\u23b5\u21b5line3\u23b5line4\u23b5";
  assert_eq(encodeWhitespaces(complexWhitespaceText), encodedComplexWhitespaceText, "Test 6: Tabs, carriage returns, vertical tabs, form feeds encode");

  // Test 7: Round-trip test
  const originalText = "This is a sentence with spaces and a newline.\nAnd another line with\ttabs and \r carriage returns.";
  const encodedText = encodeWhitespaces(originalText);
  const decodedText = decodeWhitespaces(encodedText);
  assert_eq(decodedText, originalText, "Test 7: Round-trip correctness");

  // Test 8: Input containing the encoding characters themselves
  // These functions interpret \u21b5 and \u23b5 as encoded whitespaces if they appear in the input.
  const trickyInput = "Normal text and a \u21b5 newline symbol, and a \u23b5 space symbol.";
  const encodedTricky = encodeWhitespaces(trickyInput);
  // Original spaces turn into \u23b5. Original \u21b5 and \u23b5 are preserved by encodeWhitespaces.
  assert_eq(encodedTricky, "Normal\u23b5text\u23b5and\u23b5a\u23b5\u21b5\u23b5newline\u23b5symbol,\u23b5and\u23b5a\u23b5\u23b5\u23b5space\u23b5symbol.", "Test 8: Encoding input with special symbols");
  const decodedTricky = decodeWhitespaces(encodedTricky);
  // The original \u21b5 becomes \n, original \u23b5 becomes ' '.
  assert_eq(decodedTricky, "Normal text and a \n newline symbol, and a   space symbol.", "Test 8: Decoding input with special symbols");
}


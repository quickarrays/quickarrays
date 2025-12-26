function assert_eq(a: any, b: any, message: string): void {
    let equal = false;
    if (Array.isArray(a) && Array.isArray(b)) {
        equal = a.length === b.length && a.every((v, i) => v === b[i]);
    } else {
        equal = a === b;
    }
    
    if (!equal) {
        const aStr = Array.isArray(a) ? `[${a}]` : a;
        const bStr = Array.isArray(b) ? `[${b}]` : b;
        throw new Error(`Assertion Failed: ${message}. Expected "${bStr}", but got "${aStr}"`);
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
    if(!text.length) { return 0; }

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

export function test_number_of_runs(): void {
    // Border cases
    assert_eq(number_of_runs(""), 0, "Test 1: Empty string should return 0 runs.");
    assert_eq(number_of_runs("a"), 1, "Test 2: Single character string should return 1 run.");
    assert_eq(number_of_runs("aaaaa"), 1, "Test 3: String with all same characters should return 1 run.");

    // Usual cases
    assert_eq(number_of_runs("abc"), 3, "Test 4: String with all unique characters should return length.");
    assert_eq(number_of_runs("aaabbc"), 3, "Test 5: Mixed runs (aaa, bb, c).");
    assert_eq(number_of_runs("ababa"), 5, "Test 6: Alternating characters (a, b, a, b, a).");
    assert_eq(number_of_runs("mississippi"), 8, "Test 7: Complex word (m, i, ss, i, ss, i, pp, i).");
    assert_eq(number_of_runs("Hello World"), 10, "Test 8: String with spaces and mixed cases.");
    assert_eq(number_of_runs("112233"), 3, "Test 9: Numeric string with runs.");
    assert_eq(number_of_runs("$$$$"), 1, "Test 10: Special characters all same.");
    assert_eq(number_of_runs("!@#$"), 4, "Test 11: Special characters all different.");
    assert_eq(number_of_runs("  a b  c"), 6, "Test 12: Multiple spaces and single characters."); 
}

/**
 * Calculates the size of a factorization.
 * Factor ends are marked with '1's (represented as `true` booleans) in the factorization.
 *
 * @param factorization An array of booleans representing the factorization, where `true` marks a factor end.
 * @returns The total count of `true` booleans (factor ends) found in the factorization.
 */
function number_of_factors(factorization: readonly boolean[]): number {
    if(!factorization) { return 0; }
    return factorization.reduce((count, value) => count + (value ? 1 : 0), 0);
}


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
function pad_right(text: string, pad_char: string, length: number): string {
    if(text.length >= length || pad_char.length === 0) { return text; }
    const times = Math.ceil((length - text.length) / pad_char.length);
    return text + pad_char.repeat(times);
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
function pad_left(text: string, pad_char: string, length: number): string {
    if(text.length >= length || pad_char.length === 0) { return text; }
    const times = Math.ceil((length - text.length) / pad_char.length);
    return pad_char.repeat(times) + text;
}

/**
 * Executes a series of tests for pad_right and pad_left functions using assert_eq.
 * Assumes `assert_eq(a, b, message)` is available, which throws an error if `a != b`.
 */
export function test_padFunctions(): void {
    // Basic padding cases
    assert_eq(pad_right("abc", "x", 5), "abcxx", "pad_right - basic padding");
    assert_eq(pad_right("", "x", 3), "xxx", "pad_right - empty string, basic padding");
    assert_eq(pad_right("abc", "xy", 7), "abcxyxy", "pad_right - multi-character padding");
    assert_eq(pad_right("abc", " ", 5), "abc  ", "pad_right - space character padding");

    // Cases where no padding is needed
    assert_eq(pad_right("abc", "x", 3), "abc", "pad_right - no padding needed (exact length)");
    assert_eq(pad_right("abc", "x", 2), "abc", "pad_right - no padding needed (already longer)");
    assert_eq(pad_right("hello", "-", 5), "hello", "pad_right - already at target length");
    assert_eq(pad_right("hello", "-", 3), "hello", "pad_right - string longer than target");
    assert_eq(pad_right("a", "b", 1), "a", "pad_right - single char, target 1");
    assert_eq(pad_right("", "0", 0), "", "pad_right - empty string, target 0");

    // Border cases related to the 'char' argument (bug fix for empty char)
    assert_eq(pad_right("abc", "", 5), "abc", "pad_right - empty char, padding needed (should return original due to fix)");
    assert_eq(pad_right("", "", 3), "", "pad_right - empty str, empty char, padding needed (should return original due to fix)");
    assert_eq(pad_right("test", "", 4), "test", "pad_right - empty char, exact length (no padding needed anyway)");
    assert_eq(pad_right("test", "", 2), "test", "pad_right - empty char, already longer (no padding needed anyway)");

    // Basic padding cases
    assert_eq(pad_left("abc", "x", 5), "xxabc", "pad_left - basic padding");
    assert_eq(pad_left("", "x", 3), "xxx", "pad_left - empty string, basic padding");
    assert_eq(pad_left("abc", "xy", 7), "xyxyabc", "pad_left - multi-character padding");
    assert_eq(pad_left("abc", " ", 5), "  abc", "pad_left - space character padding");

    // Cases where no padding is needed
    assert_eq(pad_left("abc", "x", 3), "abc", "pad_left - no padding needed (exact length)");
    assert_eq(pad_left("abc", "x", 2), "abc", "pad_left - no padding needed (already longer)");
    assert_eq(pad_left("hello", "-", 5), "hello", "pad_left - already at target length");
    assert_eq(pad_left("hello", "-", 3), "hello", "pad_left - string longer than target");
    assert_eq(pad_left("a", "b", 1), "a", "pad_left - single char, target 1");
    assert_eq(pad_left("", "0", 0), "", "pad_left - empty string, target 0");

    // Border cases related to the 'char' argument (bug fix for empty char)
    assert_eq(pad_left("abc", "", 5), "abc", "pad_left - empty char, padding needed (should return original due to fix)");
    assert_eq(pad_left("", "", 3), "", "pad_left - empty str, empty char, padding needed (should return original due to fix)");
    assert_eq(pad_left("test", "", 4), "test", "pad_left - empty char, exact length (no padding needed anyway)");
    assert_eq(pad_left("test", "", 2), "test", "pad_left - empty char, already longer (no padding needed anyway)");
    
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
    assert_eq(replace_invalid_position([1, 2, -1], 5), [1, 2, -1], "Test Case 6 Failed: max_length is negative.");

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
    text = text.split('\0').join("$");

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
    return text.split('').map((x: string) => pad_left(x, ' ', width)).join(effectiveSep);
}

/**
 * Test function for prettify_string.
 * Covers border cases and usual cases.
 */
export function test_prettify_string(): void {
    // Test Case 1: Basic functionality with default parameters
    // text="abc", length=3. base=0. width = String(3+0-1).length = String(2).length = 1.
    // pad_left(char, ' ', 1) -> char itself. sep=" ".
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
    // pad_left(char, ' ', 1) -> char itself
    assert_eq(prettify_string("abc", " ", 0), "a b c", "Test Case 4 Failed: base=0, width=1");

    // text="abc", length=3. base=10. width = String(3+10-1).length = String(12).length = 2.
    // pad_left(char, ' ', 2) -> " char"
    assert_eq(prettify_string("abc", " ", 10), " a  b  c", "Test Case 4.1 Failed: base=10, width=2");

    // text="abc", length=3. base=100. width = String(3+100-1).length = String(102).length = 3.
    // pad_left(char, ' ', 3) -> "  char"
    assert_eq(prettify_string("abc", " ", 100), "  a   b   c", "Test Case 4.2 Failed: base=100, width=3");

    // Test Case 5: Empty string
    // width calculation for empty string (length=0, base=0): String(0+0-1).length = String(-1).length = 2.
    // However, map is called on an empty array, so join still returns an empty string.
    assert_eq(prettify_string(""), "", "Test Case 5 Failed: Empty string");
    assert_eq(prettify_string("", "_", 10, true), "", "Test Case 5.1 Failed: Empty string with params");
    assert_eq(prettify_string("", "_", 10, false), "", "Test Case 5.2 Failed: Empty string, no tabularize");

    // Test Case 6: String with null characters (`\0`)
    // The original JS only replaces the first `\0`.
    assert_eq(prettify_string("a\0b\0c"), "a $ b $ c", "Test Case 6 Failed: String with null characters (first replaced)");
    assert_eq(prettify_string("\0test"), "$ t e s t", "Test Case 6.1 Failed: Null at start");
    assert_eq(prettify_string("test\0"), "t e s t $", "Test Case 6.2 Failed: Null at end");
    assert_eq(prettify_string("\0\0\0"), "$ $ $", "Test Case 6.3 Failed: Multiple nulls");


    // Test Case 7: Single character string
    assert_eq(prettify_string("a"), "a", "Test Case 7 Failed: Single character");
    // length=1, base=10. String(1+10-1).length = String(10).length = 2. So width=2.
    // pad_left("a", ' ', 2) -> " a"
    assert_eq(prettify_string("a", "-", 10), " a", "Test Case 7.1 Failed: Single character with base=10 (width=2)");
    assert_eq(prettify_string("a", "-", 0, false), "a", "Test Case 7.2 Failed: Single character, no tabularize");

    // Test Case 8: `width` calculation with unusual `base`
    // text="a", length=1. base=-10. (1 + (-10) - 1) = -10. String(-10).length = 3. So width=3.
    // pad_left("a", ' ', 3) -> "  a"
    assert_eq(prettify_string("a", " ", -10, true), "  a", "Test Case 8 Failed: Single char, negative base, width=3");

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
    return array.map((x) => pad_left("" + x, ' ', width)).join(sep);
}

/**
 * Test function for prettify_array.
 * Assumes `assert_eq(a, b, message)` is available globally or imported.
 */
export function test_prettify_array(): void {
    // Test Case 1: Basic array of numbers with default separator and base
    assert_eq(prettify_array([1, 22, 333]), "1 22 333", "Test 1 Failed: Basic numbers");

    // Test Case 2: Array with different separator
    assert_eq(prettify_array([1, 22, 333], "-"), "1-22-333", "Test 2 Failed: Custom separator");

    // Test Case 3: Array with different base (should affect width calculation)
    // For [1, 22, 333] with base=1, max index is (3+1-1) = 3. Width of "3" is 1.
    assert_eq(prettify_array([1, 22, 333], " ", 1), "1 22 333", "Test 3 Failed: Custom base 1");
    // For [1, 22, 333] with base=10, max index is (3+10-1) = 12. Width of "12" is 2.
    assert_eq(prettify_array([1, 22, 333], " ", 10), " 1 22 333", "Test 3.1 Failed: Custom base 10");

    assert_eq(prettify_array([]), "", "Test 5 Failed: Empty array");
    assert_eq(prettify_array([], "-", 10), "", "Test 5.1 Failed: Empty array with custom params");

    assert_eq(prettify_array([123]), "123", "Test 6 Failed: Single element");
    assert_eq(prettify_array([5]), "5", "Test 6.1 Failed: Single digit single element");
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
        result += pad_left(elementToDisplay, ' ', width);
        // Append separator. If `factorization[i]` is true, use '|' followed by the rest of `sep`.
        // `sep.substring(1)` is safe even if `sep` is an empty string, returning `""`.
        result += (factorization[i] === true) ? ('|' + sep.substring(1)) : sep;
    }
    return result;
}

export function test_prettify_factorization(): void {
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
    assert_eq(prettify_factorization(["p", "q"], [false, true], "x"), "pxq|", "Case 10: Custom single-character separator");

    // Case 11: Empty separator
    assert_eq(prettify_factorization(["m", "n"], [false, true], ""), "mn|", "Case 11: Empty separator");
}


/**
 * Replaces whitespace characters in a string with visible symbols.
 * This is useful for making whitespaces visible in text.
 *
 * @param {string} text The input string to encode.
 * @returns {string} The string with encoded whitespace characters.
 */
function encodeWhitespaces(text: string): string {
  return text
    .replace(/\r/g, '\u240d')  // CR
    .replace(/\n/g, '\u21b5')  // LF
    .replace(/\t/g, '\u2409')  // Tab
    .replace(/\v/g, '\u240b')  // VT
    .replace(/\f/g, '\u240c')  // FF
    .replace(/ /g, '\u23b5');  // Space
}

/**
 * Decodes visible whitespace symbols back to their original whitespace characters.
 *
 * @param {string} text The input string to decode.
 * @returns {string} The string with decoded whitespace characters.
 */
function decodeWhitespaces(text: string): string {
    return text
    .replace(/\u240d/g, '\r')  // CR
    .replace(/\u21b5/g, '\n')  // LF
    .replace(/\u2409/g, '\t')  // Tab
    .replace(/\u240b/g, '\v')  // VT
    .replace(/\u240c/g, '\f')  // FF
    .replace(/\u23b5/g, ' ');  // Space
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

  // Test 4: String with mixed whitespaces
  const mixedWhitespaceText = "Line1\r\nLine2\tTabbed\vVertical\fFormFeed ";
  const encodedMixed = encodeWhitespaces(mixedWhitespaceText);
  const expectedEncoded = "Line1\u240d\u21b5Line2\u2409Tabbed\u240bVertical\u240cFormFeed\u23b5";
  assert_eq(encodedMixed, expectedEncoded, "Test 4: Mixed whitespaces encode");
  assert_eq(decodeWhitespaces(expectedEncoded), mixedWhitespaceText, "Test 4: Mixed whitespaces decode");

  // Test 5: String with consecutive whitespace characters
  const consecutiveWhitespaceText = " \t\n\r\v\f ";
  const encodedConsecutive = encodeWhitespaces(consecutiveWhitespaceText);
  const expectedEncodedConsecutive = "\u23b5\u2409\u21b5\u240d\u240b\u240c\u23b5";
  assert_eq(encodedConsecutive, expectedEncodedConsecutive, "Test 5: Consecutive whitespaces encode");
  assert_eq(decodeWhitespaces(expectedEncodedConsecutive), consecutiveWhitespaceText, "Test 5: Consecutive whitespaces decode");

  // Test 6: Round-trip encoding and decoding
  const originalText = "Sample text with \r\n various \t whitespace \v characters\f.";
  const encodedText = encodeWhitespaces(originalText);
  const decodedText = decodeWhitespaces(encodedText);
  assert_eq(decodedText, originalText, "Test 6: Round-trip encoding and decoding");
}

/**
 * Edge case tests for utility functions
 */
export function test_utility_edge_cases() {
    // Test number_of_runs with very long string
    const longString = "a".repeat(10000);
    assert_eq(number_of_runs(longString), 1, "Long string of same character");

    // Test number_of_runs with alternating pattern
    const alternating = "ababababab";
    assert_eq(number_of_runs(alternating), 10, "Alternating characters");

    // Test number_of_factors with very large array
    const largeArray = new Array(10000).fill(false);
    largeArray[100] = true;
    largeArray[500] = true;
    largeArray[9999] = true;
    assert_eq(number_of_factors(largeArray), 3, "Large array with few true values");

    // Test pad_right with empty pad character
    assert_eq(pad_right("hello", "", 10), "hello", "pad_right with empty char");

    // Test pad_left with empty pad character
    assert_eq(pad_left("hello", "", 10), "hello", "pad_left with empty char");

    // Test pad_right with multi-character padding
    assert_eq(pad_right("hi", "ab", 6), "hiabab", "pad_right with multi-char");

    // Test pad_left with multi-character padding
    assert_eq(pad_left("hi", "ab", 6), "ababhi", "pad_left with multi-char");

    // Test increment_array with very large numbers
    const result = increment_array([Number.MAX_SAFE_INTEGER], 1);
    assert_eq(result[0], Number.MAX_SAFE_INTEGER + 1, "Increment very large number");

    // Test replace_invalid_position with all valid positions
    const validResult = replace_invalid_position([0, 1, 2, 3, 4], 10);
    assert_eq(validResult, [0, 1, 2, 3, 4], "All valid positions");

    // Test prettify_string with null character in middle
    const withNull = prettify_string("a\0b\0c");
    assert_eq(withNull.includes("$"), true, "Null characters replaced");

    // Test prettify_array with mixed types
    const mixedResult = prettify_array([1, "two", 3]);
    assert_eq(mixedResult.includes("two"), true, "Mixed types handled");

    // Test encodeWhitespaces with all whitespace types
    const allWhitespace = encodeWhitespaces(" \t\n\r\v\f");
    assert_eq(allWhitespace.includes(" "), false, "No spaces in encoded");
    assert_eq(allWhitespace.includes("\t"), false, "No tabs in encoded");
    assert_eq(allWhitespace.includes("\n"), false, "No newlines in encoded");

    // Test decodeWhitespaces round trip
    const original = "hello\tworld\n";
    const encoded = encodeWhitespaces(original);
    const decoded = decodeWhitespaces(encoded);
    assert_eq(decoded, original, "Round trip whitespace encoding");

    // Test prettify_factorization with empty arrays
    assert_eq(prettify_factorization([], []), "", "Empty factorization");

    // Test prettify_factorization with single element
    assert_eq(prettify_factorization(["a"], [true]), "a|", "Single element factorization");
}


// NEW

interface IntRow {
	name: string;
	data: number[];
}

interface StringRow {
	name: string;
	data: string[];
}

interface BoolRow {
	name: string;
	data: boolean[];
}

type Row = IntRow | StringRow | BoolRow;

function repeat(str: string, n: number): string {
	let r = "";
	while (n-- > 0) r += str;
	return r;
}

function escapeLatex(s: unknown): string {
	return String(s)
		.replace(/\\/g, "\\textbackslash{}")
		.replace(/([#$%&_{}])/g, "\\$1");
}


function isBoolRow(row: Row): row is BoolRow {
        return typeof row.data[0] === "boolean";
}

function isStringRow(row: Row): row is StringRow {
        return typeof row.data[0] === "string";
}

function partitionsFromBool(boolArr: boolean[]): number[] {
	const parts: number[] = [];
	let len = 0;

	for (let i = 0; i < boolArr.length; i++) {
		len++;
		if (boolArr[i]) {
			parts.push(len);
			len = 0;
		}
	}
	return parts;
}

function export_latex(rows: Row[]): string {
	const n = rows[0].data.length;

	const tRow = rows.find(isStringRow);
	if (!tRow) {
		throw new Error("Row T (string[]) required");
	}
	const T = tRow.data;

	const out: string[] = [];
	out.push(`\\begin{tabular}{l|${"c".repeat(n)}}`);
	out.push("\\hline");

	for (const row of rows) {
		let line = `${escapeLatex(row.name)} & `;

		if (isBoolRow(row)) {
			const parts = partitionsFromBool(row.data);
			let pos = 0;

			for (let p = 0; p < parts.length; p++) {
				const k = parts[p];
				let text = "";

				for (let i = 0; i < k; i++) {
					text += escapeLatex(T[pos++]);
				}

				line += `\\multicolumn{${k}}{c}{${text}}`;
				if (p !== parts.length - 1) line += " & ";
			}
		} else {
			for (let i = 0; i < n; i++) {
				line += escapeLatex(row.data[i]);
				if (i !== n - 1) line += " & ";
			}
		}

		line += " \\\\";
		out.push(line);
	}

	out.push("\\hline");
	out.push("\\end{tabular}");
	return out.join("\n");
}

function export_markdown(rows: Row[]): string {
	const n = rows[0].data.length;

	const tRow = rows.find(isStringRow);
	if (!tRow) {
		throw new Error("Row T (string[]) required for boolean partitions");
	}
	const T = tRow.data;

	const out: string[] = [];

	/* header */
	const header: string[] = [" "];
	for (let i = 0; i < n; i++) {
		header.push(String(i + 1));
	}
	out.push("|" + header.join("|") + "|");
	out.push("|" + repeat("---|", n + 1));

	for (const row of rows) {
		const cells: string[] = [row.name];

		if (isBoolRow(row)) {
			let s = "";
			for (let i = 0; i < n; i++) {
				s += T[i];
				if (row.data[i]) s += "|";
			}
			cells.push(s);
		} else {
			for (let i = 0; i < n; i++) {
				cells.push(String(row.data[i]));
			}
		}

		out.push("|" + cells.join("|") + "|");
	}

	return out.join("\n");
}

function escape_csv(value: unknown): string {
	const s = String(value);
	if (/[",\n]/.test(s)) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
}



function export_csv(rows: Row[]): string {
	const n = rows[0].data.length;

	const out: string[] = [];
	for (const row of rows) {
		const cells: string[] = [];
		cells.push(row.name);

                for (let i = 0; i < n; i++) {
                    cells.push(String(row.data[i]));
                }

		out.push(cells.map(escape_csv).join(","));
	}

	return out.join("\n");
}
export function test_export_formats(): void {
    const rows: Row[] = [
        { name: "T", data: ["a", "b", "c", "d", "e"] },
        { name: "F", data: [true, false, true, true, false] },
        { name: "N", data: [1, 2, 3, 4, 5] },
        { name: "S", data: ["one", "two", "three", "four", "five"] },
    ];

    const expectedLatex = `\\begin{tabular}{l|ccccc}
\\hline
T & a & b & c & d & e \\\\
F & \\multicolumn{1}{c}{a} & \\multicolumn{2}{c}{bc} & \\multicolumn{1}{c}{d} \\\\
N & 1 & 2 & 3 & 4 & 5 \\\\
S & one & two & three & four & five \\\\
\\hline
\\end{tabular}`;

    const expectedMarkdown = `| |1|2|3|4|5|
|---|---|---|---|---|---|
|T|a|b|c|d|e|
|F|a|bc|d|e|
|N|1|2|3|4|5|
|S|one|two|three|four|five|`;

    const expectedCSV = `T,a,b,c,d,e
F,true,false,true,true,false
N,1,2,3,4,5
S,one,two,three,four,five`;

    assert_eq(export_latex(rows), expectedLatex, "LaTeX export failed");
    assert_eq(export_markdown(rows), expectedMarkdown, "Markdown export failed");
    assert_eq(export_csv(rows), expectedCSV, "CSV export failed");
}


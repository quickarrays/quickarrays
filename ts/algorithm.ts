function assert_eq(a: any, b: any, message: string): void {
    if(a !== b) {
        throw new Error(`Assertion Failed: ${message}. Expected "${a}", but got "${b}"`);
    }
}

/**
 * @name p
 * @description Period
 * @tutorial The period of a string is the length of the smallest substring that can be repeated without overlaps to form the entire string.
 * @see https://en.wikipedia.org/wiki/Periodicity_(string_matching)#Period
 */
function count_period(border_array: number[]) : number {
    const last_border = border_array[border_array.length - 1];
    return border_array.length - last_border;
}

/**
 * @name e
 * @description Exponent
 * @tutorial The exponent of a string is the number of times its smallest period repeats to form the string.
 * @see https://en.wikipedia.org/wiki/Periodicity_(string_matching)#Exponent
 */
function count_exponent(border_array: number[]) : number {
    const period = count_period(border_array);
    return border_array.length / period;
}

/**
 * @name R
 * @description Regularity
 */
function count_regularity(border_array: number[]) : string {
    const n = border_array.length;
    const last_border = border_array[n - 1];
    const period = count_period(border_array);
    const exponent = count_exponent(border_array);
    if(exponent > 1 && n % period == 0) {
        if(exponent == 2) {
            return 'square';
        }
        return 'non-primitive';
    }
    if(last_border == 0) {
        return 'unbordered';
    }
    return 'primitive';
}

/**
 * @name SA
 * @kind enable
 * @type index
 * @description Suffix Array
 */
function construct_suffix_array(text: string): number[] {
    const n: number = text.length;

    type RotationEntry = [number, string];

    const rotations: RotationEntry[] = [...Array(n).keys()].map((num: number) => {
        return [num, text.substring(num)];
    });

    // Sort the rotations array based on the lexicographical order of the conjugated strings (the second element of the tuple).
    // The sort method modifies the array in-place.
    rotations.sort((a: RotationEntry, b: RotationEntry) => a[1].localeCompare(b[1]));

    // Map the sorted rotations back to an array containing only their original indices.
    return rotations.map((rotation: RotationEntry) => rotation[0]);
}

export function test_suffix_array() {
    assert_eq(construct_suffix_array("banana").toString(), [5, 3, 1, 0, 4, 2].toString(), "Suffix array of 'banana'");
    assert_eq(construct_suffix_array("abracadabra").toString(), [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2].toString(), "Suffix array of 'abracadabra'");
    assert_eq(construct_suffix_array("").toString(), [].toString(), "Suffix array of empty string");
    assert_eq(construct_suffix_array("a").toString(), [0].toString(), "Suffix array of 'a'");
    assert_eq(construct_suffix_array("aaaaa").toString(), [4, 3, 2, 1, 0].toString(), "Suffix array of 'aaaaa'");
    assert_eq(construct_suffix_array("abcde").toString(), [0, 1, 2, 3, 4].toString(), "Suffix array of 'abcde'");
    assert_eq(construct_suffix_array("mississippi").toString(), [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2].toString(), "Suffix array of 'mississippi'");
}

/**
 * @name B
 * @kind disable
 * @type length
 * @description Border Array
 */
function construct_border_array(text: string): number[] {
  const n: number = text.length;
  if (n === 0) {
      return [];
  }
  const border: number[] = new Array<number>(n);
  border[0] = 0;
  for (let i = 1; i < n; i++) {
      let j = border[i - 1];
      while (j > 0 && text[i] !== text[j]) {
          j = border[j - 1];
      }
      if (text[i] === text[j]) {
          j++;
      }
      border[i] = j;
  }
  return border;
}

export function test_border_array() {
    assert_eq(construct_border_array("ababa").toString(), [0, 0, 1, 2, 3].toString(), "Border array of 'ababa'");
    assert_eq(construct_border_array("aaaa").toString(), [0, 1, 2, 3].toString(), "Border array of 'aaaa'");
    assert_eq(construct_border_array("abcd").toString(), [0, 0, 0, 0].toString(), "Border array of 'abcd'");
    assert_eq(construct_border_array("").toString(), [].toString(), "Border array of empty string");
    assert_eq(construct_border_array("a").toString(), [0].toString(), "Border array of 'a'");
    assert_eq(construct_border_array("abcababc").toString(), [0, 0, 0, 1, 2, 3, 4, 5].toString(), "Border array of 'abcababc'");
}

/**
 * @name BWT
 * @kind disable
 * @type string 
 * @description Burrows-Wheeler Transform
 */
function construct_bw_transform(text: string, rotation_array: number[]): string {
    if (text.length === 0) {
        return "";
    }
    if (text.length !== rotation_array.length) {
        throw new Error("The length of rotation_array must match the length of text.");
    }
    const n: number = text.length;
    let result: string = "";
    for (let i: number = 0; i < n; i++) {
        /* Calculate the index of the character preceding the start of the i-th sorted rotation.
           (rotation_array[i] + n - 1) calculates the index of the character before the start of the rotation,
           and then % n ensures it wraps around correctly if rotation_array[i] is 0. */
        result += text[(rotation_array[i] + n - 1) % n];
    }
    return result;
}
export function test_bw_transform() {
    assert_eq(construct_bw_transform("banana", [5, 3, 1, 0, 4, 2]), "annb$aa", "BWT of 'banana'");
    assert_eq(construct_bw_transform("abracadabra", [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), "ard$rcaaaabb", "BWT of 'abracadabra'");
    assert_eq(construct_bw_transform("", []), "", "BWT of empty string");
    assert_eq(construct_bw_transform("a", [0]), "a", "BWT of 'a'");
    assert_eq(construct_bw_transform("aaaaa", [4, 3, 2, 1, 0]), "aaaaa", "BWT of 'aaaaa'");
    assert_eq(construct_bw_transform("abcde", [0, 1, 2, 3, 4]), "eabcd", "BWT of 'abcde'");
}

/**
 * @name F
 * @kind disable
 * @type string 
 * @description First Column Array
 */
function construct_first_array(text: string): string {
    return [...text].sort().join('');
}
export function test_first_array() {
    assert_eq(construct_first_array("annb$aa"), "$aaabnn", "First array of 'annb$aa'");
    assert_eq(construct_first_array("ard$rcaaaabb"), "$aaaaabbcdrr", "First array of 'ard$rcaaaabb'");
    assert_eq(construct_first_array(""), "", "First array of empty string");
    assert_eq(construct_first_array("a"), "a", "First array of 'a'");
    assert_eq(construct_first_array("aaaaa"), "aaaaa", "First array of 'aaaaa'");
    assert_eq(construct_first_array("eabcd"), "abcde", "First array of 'eabcd'");
}

/**
 * @name i
 * @kind enable
 * @type index
 * @description Index Array
 */
function construct_index_array(n: number): number[] {
    return Array.from(Array(n).keys());
}
export function test_index_array() {
    assert_eq(construct_index_array(5).toString(), [0, 1, 2, 3, 4].toString(), "Index array of length 5");
    assert_eq(construct_index_array(0).toString(), [].toString(), "Index array of length 0");
    assert_eq(construct_index_array(1).toString(), [0].toString(), "Index array of length 1");
    assert_eq(construct_index_array(10).toString(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].toString(), "Index array of length 10");
}

/**
 * @name Rot
 * @kind disable
 * @type index
 * @description Rotation Array
 */
function construct_rotation_array(text: string): number[] {
    const n: number = text.length;
    type RotationEntry = [number, string];
    const rotations: RotationEntry[] = [...Array(n).keys()].map((num: number) => {
        return [num, conjugate_string(text, num)];
    });
    // Sort the rotations array based on the lexicographical order of the conjugated strings (the second element of the tuple).
    // The sort method modifies the array in-place.
    rotations.sort((a: RotationEntry, b: RotationEntry) => a[1].localeCompare(b[1]));
    // Map the sorted rotations back to an array containing only their original indices.
    return rotations.map((rotation: RotationEntry) => rotation[0]);
}
export function test_rotation_array() {
    assert_eq(construct_rotation_array("banana").toString(), [5, 3, 1, 0, 4, 2].toString(), "Rotation array of 'banana'");
    assert_eq(construct_rotation_array("abracadabra").toString(), [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2].toString(), "Rotation array of 'abracadabra'");
    assert_eq(construct_rotation_array("").toString(), [].toString(), "Rotation array of empty string");
    assert_eq(construct_rotation_array("a").toString(), [0].toString(), "Rotation array of 'a'");
    assert_eq(construct_rotation_array("aaaaa").toString(), [4, 3, 2, 1, 0].toString(), "Rotation array of 'aaaaa'");
    assert_eq(construct_rotation_array("abcde").toString(), [0, 1, 2, 3, 4].toString(), "Rotation array of 'abcde'");
}


/**
 * @name ISA
 * @kind disable
 * @type index
 * @description Inverse Suffix Array
 */
function construct_inverse_suffix_array(suffix_array: readonly number[]): number[] {
    const result: number[] = new Array<number>(suffix_array.length);
    for (let i = 0; i < suffix_array.length; i++) {
        result[suffix_array[i]] = i;
    }
    return result;
}
export function test_inverse_suffix_array() {
    assert_eq(construct_inverse_suffix_array([5, 3, 1, 0, 4, 2]).toString(), [3, 2, 5, 1, 4, 0].toString(), "Inverse suffix array of 'banana'");
    assert_eq(construct_inverse_suffix_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]).toString(), [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0].toString(), "Inverse suffix array of 'abracadabra'");
    assert_eq(construct_inverse_suffix_array([]).toString(), [].toString(), "Inverse suffix array of empty array");
    assert_eq(construct_inverse_suffix_array([0]).toString(), [0].toString(), "Inverse suffix array of [0]");
    assert_eq(construct_inverse_suffix_array([4, 3, 2, 1, 0]).toString(), [4, 3, 2, 1, 0].toString(), "Inverse suffix array of [4,3,2,1,0]");
    assert_eq(construct_inverse_suffix_array([0, 1, 2, 3, 4]).toString(), [0, 1, 2, 3, 4].toString(), "Inverse suffix array of [0,1,2,3,4]");
}

/**
 * @name &Phi;
 * @kind disable
 * @type index
 * @description Phi Array
 * @see karkkainen09plcp
 */
function construct_phi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    const n: number = suffix_array.length;
    const result: number[] = new Array<number>(n);

    for (let i = 0; i < n; i++) {
        if (inverse_suffix_array[i] !== 0) {
            result[i] = suffix_array[inverse_suffix_array[i] - 1];
        } else {
            result[i] = n;
        }
    }
    return result;
}
export function test_phi_array() {
    assert_eq(construct_phi_array([5, 3, 1, 0, 4, 2], [3, 2, 5, 1, 4, 0]).toString(), [3, 1, 4, 5, 2, 6].toString(), "Phi array of 'banana'");
    assert_eq(construct_phi_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2], [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0]).toString(), [7, 1, 11, 0, 6, 2, 4, 10, 5, 9, 3].toString(), "Phi array of 'abracadabra'");
    assert_eq(construct_phi_array([], []).toString(), [].toString(), "Phi array of empty array");
    assert_eq(construct_phi_array([0], [0]).toString(), [1].toString(), "Phi array of [0]");
    assert_eq(construct_phi_array([4, 3, 2, 1, 0], [4, 3, 2, 1, 0]).toString(), [5, 0, 1, 2, 3].toString(), "Phi array of [4,3,2,1,0]");
    assert_eq(construct_phi_array([0, 1, 2, 3, 4], [0, 1, 2, 3, 4]).toString(), [5, 0, 1, 2, 3].toString(), "Phi array of [0,1,2,3,4]");
}

/**
 * @name &Phi;&#8315;&#185;
 * @kind disable
 * @type index
 * @description Inverse Phi Array
 */
function construct_inverse_phi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    const n: number = suffix_array.length;
    const result: number[] = new Array<number>(n);
    for (let i: number = 0; i < n; ++i) {
        if (inverse_suffix_array[i] + 1 !== n) {
            result[i] = suffix_array[inverse_suffix_array[i] + 1];
        } else {
            result[i] = n;
        }
    }
    return result;
}
export function test_inverse_phi_array() {
    assert_eq(construct_inverse_phi_array([5, 3, 1, 0, 4, 2], [3, 2, 5, 1, 4, 0]).toString(), [1, 4, 2, 6, 3, 5].toString(), "Inverse Phi array of 'banana'");
    assert_eq(construct_inverse_phi_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2], [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0]).toString(), [3, 5, 9, 2, 8, 10, 4, 11, 6, 7, 1].toString(), "Inverse Phi array of 'abracadabra'");
    assert_eq(construct_inverse_phi_array([], []).toString(), [].toString(), "Inverse Phi array of empty array");
    assert_eq(construct_inverse_phi_array([0], [0]).toString(), [1].toString(), "Inverse Phi array of [0]");
    assert_eq(construct_inverse_phi_array([4, 3, 2, 1, 0], [4, 3, 2, 1, 0]).toString(), [0, 1, 2, 3, 5].toString(), "Inverse Phi array of [4,3,2,1,0]");
    assert_eq(construct_inverse_phi_array([0, 1, 2, 3, 4], [0, 1, 2, 3, 4]).toString(), [1, 2, 3, 4, 5].toString(), "Inverse Phi array of [0,1,2,3,4]");
}

/**
 * Computes the length of the Longest Common Prefix (LCP) between two suffixes of a given text.
 * The suffixes start at `pos1` and `pos2` respectively.
 *
 * @param text The input string in which to find the LCP.
 * @param pos1 The starting index of the first suffix.
 * @param pos2 The starting index of the second suffix.
 * @returns The length of the LCP. Returns 0 if no common prefix exists or if either position is out of bounds initially.
 */
function lcp_query(text: string, index1: number, index2: number): number {
  let lcp = 0;
  const maxLength = Math.min(text.length - index1, text.length - index2);
  for (let k = 0; k < maxLength; ++k) {
      if (text[index1 + k] === text[index2 + k]) {
          lcp++;
      } else {
          break;
      }
  }
  return lcp;
}
export function test_lcp_query() {
    assert_eq(lcp_query("banana", 1, 3), 3, "LCP of suffixes starting at 1 and 3 in 'banana'");
    assert_eq(lcp_query("abracadabra", 0, 3), 1, "LCP of suffixes starting at 0 and 3 in 'abracadabra'");
    assert_eq(lcp_query("aaaaa", 0, 2), 3, "LCP of suffixes starting at 0 and 2 in 'aaaaa'");
    assert_eq(lcp_query("abcde", 1, 3), 0, "LCP of suffixes starting at 1 and 3 in 'abcde'");
    assert_eq(lcp_query("mississippi", 2, 5), 1, "LCP of suffixes starting at 2 and 5 in 'mississippi'");
    assert_eq(lcp_query("hello", 0, 0), 5, "LCP of suffixes starting at 0 and 0 in 'hello'");
    assert_eq(lcp_query("", 0, 0), 0, "LCP of suffixes in empty string");
}

/**
 * @name LCP
 * @kind disable
 * @type length
 * @description Longest Common Prefix array
 */
function construct_lcp_array(text: string, suffix_array: number[]): number[] {
    if (suffix_array.length === 0) {
        return [];
    }
    const result: number[] = [0];

    for (let i = 1; i < suffix_array.length; i++) {
        result.push(lcp_query(text, suffix_array[i], suffix_array[i - 1]));
    }

    return result;
}

/**
 * @name &Sigma; LCP
 * @description Sum of LCP array values
 */
function count_lcp_array(lcp_array : number[]) : number {
    return lcp_array.reduce((a, b) => a + b, 0);
}

/**
 * @name PLCP
 * @kind disable
 * @type length
 * @description Permuted Longest Common Prefix array
 * @see karkkainen09plcp
 */
function construct_plcp_array(inverse_suffix_array: number[], lcp_array: number[]): number[] {
    if (inverse_suffix_array.length !== lcp_array.length) {
        throw new Error("Inverse suffix array and LCP array must have the same length.");
    }
    const n = inverse_suffix_array.length;
    return [...new Array(n).keys()].map(i => lcp_array[inverse_suffix_array[i]]);
}

/**
 * @name &Psi;
 * @kind disable
 * @type index
 * @description Psi Array
 */
function construct_psi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    const n = suffix_array.length;
    return [...new Array(n).keys()].map(i => 
        (suffix_array[i] + 1 < n) ? inverse_suffix_array[suffix_array[i] + 1] : n
    );
}




/**
 * @name LynF
 * @kind disable
 * @type factor
 * @description Lyndon Factorization
 */
function construct_lyndon_factorization(text: string, inverse_suffix_array: number[]): boolean[] {
    const n: number = text.length;
    if (n === 0) { return []; }
    const result: boolean[] = new Array<boolean>(n).fill(false);

    if (inverse_suffix_array.length < n) {
        throw new Error(`Inverse suffix array (inverse_suffix_array) must have a length of at least text.length (${n}), but got ${inverse_suffix_array.length}.`);
    }

    let inverse_suffix_arrayval: number = inverse_suffix_array[0];
    for (let i = 0; i + 1 < n; ++i) {
        if (inverse_suffix_arrayval > inverse_suffix_array[i + 1]) {
            result[i] = true;
            inverse_suffix_arrayval = inverse_suffix_array[i + 1];
        }
    }
    result[n-1] = true;
    return result;
}

/**
 * @name &delta;
 * @description Substring Complexity Measure
 */
function count_delta(substring_complexity: number[]): [number, number] {
    if (substring_complexity.length === 0) {
        throw new Error("Input array 'substring_complexity' cannot be empty.");
    }

    let bestlength: number = 1;
    // The initial bestval is substring_complexity[0] / (0+1) which is simply substring_complexity[0].
    // We explicitly type these variables for strictness.
    let bestval: number = substring_complexity[0];

    // Loop starts from the second element (index 1) as the first element (index 0)
    // is already considered for initialization.
    for (let i = 1; i < substring_complexity.length; ++i) {
        // Calculate the current ratio for substring_complexity[i] corresponding to 1-based length (i+1).
        // The `1.0 * substring_complexity[i]` from the original JS is redundant in TypeScript's `number` type
        // as division already handles floating point results.
        const currentRatio: number = substring_complexity[i] / (i + 1);
        
        // If the current ratio is strictly greater than the best found so far, update.
        if (currentRatio > bestval) {
            bestlength = i + 1; // Update bestlength to the current 1-based index
            bestval = currentRatio; // Update bestval to the new maximum ratio
        }
    }
    return [bestlength, bestval];
}


/**
 * @name SC
 * @kind disable
 * @type length
 * @description Substring Complexity Array
 */
function construct_substring_complexity(lcp_array: number[]): number[] {
  const n: number = lcp_array.length;
  // Initialize 'ret' as an array of `n` elements.
  // All elements will be assigned a number in the subsequent loop,
  // so no initial values are strictly necessary here beyond creating the slots.
  const ret: number[] = new Array<number>(n);

  const c = new Map<number, number>();
     lcp_array.forEach((ele: number) => {
       c.set(ele, (c.get(ele) || 0) + 1);
     });

  let count: number = 0; // Accumulator for the current complexity value.

  // Iterate backwards from `n` down to `1`.
  // `i` represents a potential substring length.
  for (let i: number = n; i >= 1; --i) {
    count += 1; // Each length `i` contributes to the base complexity.

    // Check if the current length `i` exists as a key in the frequency map 'c'.
    // This signifies that there are LCP values exactly equal to `i`.
     if (c.has(i)) {
       // Using `!` because `c.has(i)` guarantees `c.get(i)` is not undefined.
       count -= c.get(i)!;
     }

    // Store the calculated complexity for substrings of length `i` at index `i - 1`.
    ret[i - 1] = count;
  }

  return ret;
}


/**
 * Conjugates a string by splitting it at a given shift point and rejoining the parts.
 * For example, conjugate_string("abcde", 2) would return "cdeab".
 * @param text The input string.
 * @param shift The number of characters to shift the string by.
 * @returns The conjugated string.
 */
function conjugate_string(text: string, shift: number): string {
    /* Suggestion: Use .substring() instead of .substr() as .substr() is deprecated. */
    return text.substring(shift) + text.substring(0, shift);
}
export function test_conjugate_string() {
    assert_eq(conjugate_string("abcde", 2), "cdeab", "Conjugate 'abcde' by 2");
    assert_eq(conjugate_string("hello", 0), "hello", "Conjugate 'hello' by 0");
    assert_eq(conjugate_string("rotation", 4), "ationrot", "Conjugate 'rotation' by 4");
    assert_eq(conjugate_string("a", 1), "a", "Conjugate 'a' by 1");
    assert_eq(conjugate_string("", 0), "", "Conjugate empty string by 0");
}


/**
 * Finds the index of the nth occurrence of a substring within a given text.
 * The 'nth' parameter is 1-based (e.g., nth=1 finds the first occurrence, nth=2 finds the second).
 * Returns -1 if the substring is not found or if the nth occurrence does not exist.
 *
 * @param text The string to search within.
 * @param subString The substring to search for.
 * @param nth The 1-based index of the occurrence to find. Must be a positive integer.
 * @returns The starting index of the nth occurrence, or -1 if not found.
 */
function select_query(text: any, pattern: string|boolean, nth: number): number {
    if (nth <= 0) {
        throw new Error("The 'nth' parameter must be a positive integer for 1-based indexing.");
    }

    let pos: number = -1; // Initialize position to -1, so the first `text.indexOf` starts from index 0.
    for (let k = 0; k < nth; k++) { // Loop 'nth' times to find the 'nth' occurrence
        pos = text.indexOf(pattern, pos + 1);
        if (pos === -1) {
            break;
        }
    }
    return pos;
}
export function test_select_query() {
    assert_eq(select_query("banana", "a", 1), 1, "1st occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 2), 3, "2nd occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 3), 5, "3rd occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 4), -1, "4th occurrence of 'a' in 'banana' (not found)");
    assert_eq(select_query("abracadabra", "abra", 1), 0, "1st occurrence of 'abra' in 'abracadabra'");
    assert_eq(select_query("abracadabra", "abra", 2), 7, "2nd occurrence of 'abra' in 'abracadabra'");
    assert_eq(select_query("abracadabra", "xyz", 1), -1, "1st occurrence of 'xyz' in 'abracadabra' (not found)");
    assert_eq(select_query("aaaaa", "aa", 2), 1, "2nd occurrence of 'aa' in 'aaaaa'");
    assert_eq(select_query("aaaaa", "aa", 3), 2, "3rd occurrence of 'aa' in 'aaaaa'");
    assert_eq(select_query("aaaaa", "aa", 4), -1, "4th occurrence of 'aa' in 'aaaaa' (not found)");
}

/**
 * Counts the number of occurrences of a substring within a prefix of a given text.
 * The prefix is defined by `text.substring(0, index)`.
 *
 * @param text The full string.
 * @param subString The substring to count.
 * @param index The exclusive end index of the prefix.
 * @returns The number of times the substring appears in the specified prefix.
 */
function rank_query(text: string | readonly boolean[], pattern: string | boolean, index: number): number {
    const prefix = text.slice(0, index);
    return [...prefix].filter(c => c === pattern).length;
}
export function test_rank_query() {
    assert_eq(rank_query("banana", "a", 6), 3, "Count of 'a' in 'banana'");
    assert_eq(rank_query("banana", "a", 3), 1, "Count of 'a' in 'ban'");
    assert_eq(rank_query("abracadabra", "abra", 11), 2, "Count of 'abra' in 'abracadabra'");
    assert_eq(rank_query("abracadabra", "abra", 7), 1, "Count of 'abra' in 'abracad'");
    assert_eq(rank_query("aaaaa", "aa", 5), 4, "Count of 'aa' in 'aaaaa'");
    assert_eq(rank_query("aaaaa", "aa", 3), 2, "Count of 'aa' in 'aaa'");
    assert_eq(rank_query("", "a", 0), 0, "Count of 'a' in empty string");
    assert_eq(rank_query("hello", "z", 5), 0, "Count of 'z' in 'hello'");
}

/**
 * @name LF
 * @kind disable
 * @type index
 * @description Last-to-First Mapping Array
 */
function construct_lf_array(first_array : string, bw_transform : string) : number[] {
    if (first_array.length !== bw_transform.length) {
        throw new Error("First array and BWT must have the same length.");
    }

    const n: number = first_array.length;
    const result: number[] = new Array<number>(n);

    for (let i = 0; i < n; ++i) {
        const c: string = bw_transform[i]; 
        const crank: number = rank_query(bw_transform, c, i + 1);
        result[i] = select_query(first_array, c, crank);
    }
    return result;
}




/**
 * @name S/L
 * @kind disable
 * @type length
 * @description S/L SAIS type string
 */
function construct_sl_string(text : string) : string[] {
    var n = text.length;
    var result = new Array(n);
    var type = 'S';
    result[n-1] = type;
    for(var i = n-2; i >= 0; --i) {
        if(text[i+1] > text[i]) {
            type = 'S';
        }
        else if(text[i+1] < text[i]) {
            type = 'L';
            if(result[i+1] == 'S') { result[i+1] = 'S*'; }
        }
        result[i] = type;
    }
    return result;
}

/**
 * @name LPF
 * @kind disable
 * @type length
 * @description Longest Previous Factor array
 */
function construct_lpf_array(text: string): number[] {
    const n: number = text.length;
    const result: number[] = new Array<number>(n);

    for (let i: number = 0; i < n; i++) {
        let maxval: number = 0;

        for (let j: number = 0; j < i; j++) {
            const lcpval: number = lcp_query(text, i, j);
            if (maxval < lcpval) {
                maxval = lcpval;
            }
        }
        result[i] = maxval;
    }
    return result;
}

/**
 * @name LNF
 * @kind disable
 * @type length
 * @description Longest Next Factor array
 */
function construct_lnf_array(text: string): number[] {
    const revtext: string = text.split('').reverse().join('');
    const lpfarray: number[] = construct_lpf_array(revtext);

    const n: number = lpfarray.length;
    return [...new Array(n).keys()].map((i) => lpfarray[n-1-i]); 
}


function greedy_factorize(factor_array : readonly number[]) : boolean[] {
    const n: number = factor_array.length;
    if(n === 0) {
        return [];
    }
    const result: boolean[] = new Array<boolean>(n).fill(false);
    for (let i: number = 0; i < n; ) {
        const currentFactor: number = factor_array[i];
        let distance = currentFactor === 0 ? 1 : currentFactor;
        result[i+distance-1] = true;
        i += distance;
    }
    return result;
}


/**
 * @name rLZSS
 * @kind disable
 * @type factor
 * @description Reverse LZSS Factorization
 */
function construct_reverse_lzss_factorization(lnf_array: readonly number[]): boolean[] {
    const copied_lnf_array = lnf_array.slice().reverse();
    return greedy_factorize(copied_lnf_array);
}

/**
 * @name LZSS
 * @kind disable
 * @type factor
 * @description LZSS Factorization
 */
function construct_lzss_factorization(lpf_array: readonly number[]): boolean[] {
    return greedy_factorize(lpf_array);
}

/**
 * @name LexParse
 * @kind disable
 * @type factor
 * @description Lexicographic Parse Factorization
 * @see navarro21approximation
 */
function construct_lexparse_factorization(plcp_array: readonly number[]): boolean[] {
    return greedy_factorize(plcp_array);
}

/**
 * @name NSS
 * @kind disable
 * @type index
 * @description Next Smaller Suffix Array
 */
function construct_nss_array(text: string, inverse_suffix_array: readonly number[]): number[] {
    const n: number = text.length;
    /* In JavaScript, 'result' would become a global variable if not declared with var/let/const.
       In TypeScript, this would be a compile-time error without explicit declaration. */
    const result: number[] = new Array<number>(n);

    for (let i = 0; i < n; ++i) {
        let nss: number = i + 1;
        while (nss < n && inverse_suffix_array[nss] > inverse_suffix_array[i]) {
            ++nss;
        }
        result[i] = (nss >= n) ? n : nss;
    }
    return result;
}

/**
 * @name PSS
 * @kind disable
 * @type index
 * @description Previous Smaller Suffix Array
 */
function construct_pss_array(text: string, inverse_suffix_array: readonly number[]): number[] {
    const n: number = text.length;
    const result: number[] = new Array<number>(n);

    for (let i = 0; i < n; ++i) {
        let pss: number = i - 1;
        while (pss >= 0 && inverse_suffix_array[pss] > inverse_suffix_array[i]) {
            --pss;
        }
        result[i] = (pss < 0) ? n : pss;
    }
    return result;
}

/**
 * @name Lyndon
 * @kind disable
 * @type length
 * @description Lyndon Array
 * @see bannai17runs
 */
function construct_lyndon_array(text: string, nss_array: readonly number[]): number[] {
    const n: number = text.length;
    if (nss_array.length !== n) {
        throw new Error("The length of nss_array must match the length of text.");
    }
    let result: number[] = new Array<number>(n);

    for (let i = 0; i < n; ++i) {
        result[i] = (nss_array[i] === n) ? (n - i) : (nss_array[i] - i);
    }
    return result;
}


/**
 * @name necklace
 * @kind hidden
 * @type string 
 * @description Lexicographically smallest conjugate of a given string.
 */
function construct_necklace_conjugate_transform(text: string): string {
    const n: number = text.length;
    if (n === 0) {
        return "";
    }
    let best_conj: string = text;

    for (let i: number = 0; i < n; ++i) {
        const conj: string = conjugate_string(text, i);
        if (conj < best_conj) {
            best_conj = conj;
        }
    }
    return best_conj;
}

/**
 * @name Invert
 * @kind hidden
 * @type string 
 * @description Inverts a string by mapping each character to its complementary character
 */
function construct_invert_transform(text : string) {
    const sorted_chars = [...text].sort();
    const minchar = sorted_chars[0];
    const maxchar = sorted_chars.reverse()[0];
    function invert(c : string) : string {
        return String.fromCharCode(maxchar.charCodeAt(0) - (c.charCodeAt(0) - minchar.charCodeAt(0)));
    }
    return [...text].map(invert).join('');
}

/**
 * @name Revert
 * @kind hidden
 * @type string
 * @description Reverts a string by reading it backwards
 */
function construct_revert_transform(text: string) {
    return text.split('').reverse().join('');
}

function phrases_from_factorizations(text: string, factorization: readonly boolean[]): string[] {
    const n: number = text.length;
    const phrases: string[] = [];

    let old_pos: number = 0;
    for(let i = 0; i < n; ++i) {
        if(factorization[i] === true) {
            let factor: string = text.slice(old_pos, i+1); 
            old_pos = i+1;
            phrases.push(factor);
        }
    }
    return phrases;
}

function omegaOrder(strA: string, strB: string): number {
    if (strA === strB) { return 0; }
    const maxLength = Math.max(strA.length, strB.length)*3;

    for(let i = 0; i < maxLength ; ++i) { 
        if (strA[i % strA.length] < strB[i % strB.length]) { return -1; }
        if (strA[i % strA.length] > strB[i % strB.length]) { return +1; }
    }
    return strA.length < strB.length ? -1 : +1;
}

/**
 * @name CSA
 * @kind disable
 * @type index
 * @description Circular Suffix Array
 */
function construct_circular_suffix_array(text: string, lyndon_factorization: readonly boolean[]): number[] {
    interface Conjugate {
        pos: number;
        str: string;
    }
    const factors : string[] = phrases_from_factorizations(text, lyndon_factorization);
    const conjugates: Conjugate[] = [];
    let factor_starting_position : number = 0;
    for(const factor of factors) {
        const factor_length = factor.length;
        for (let conj_it = 0; conj_it < factor_length; ++conj_it) {
            conjugates.push({ pos: factor_starting_position + conj_it, str: conjugate_string(factor, conj_it) });
        }
        factor_starting_position += factor_length;
    }
    conjugates.sort((a,b) => omegaOrder(a.str, b.str));
    return [...conjugates].map(conjugate => conjugate.pos);
}

/**
 * @name CISA
 * @kind disable
 * @type index
 * @description Inverse Circular Suffix Array
 */
function construct_inverse_circular_suffix_array(circular_suffix_array: readonly number[]): number[] {
    return construct_inverse_suffix_array(circular_suffix_array);
}
export function test_inverse_circular_suffix_array() {
    assert_eq(construct_inverse_circular_suffix_array([5, 3, 1, 0, 4, 2]).toString(), [3, 2, 5, 1, 4, 0].toString(), "Inverse circular suffix array of 'banana'");
    assert_eq(construct_inverse_circular_suffix_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]).toString(), [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0].toString(), "Inverse circular suffix array of 'abracadabra'");
    assert_eq(construct_inverse_circular_suffix_array([]).toString(), [].toString(), "Inverse circular suffix array of empty array");
    assert_eq(construct_inverse_circular_suffix_array([0]).toString(), [0].toString(), "Inverse circular suffix array of [0]");
    assert_eq(construct_inverse_circular_suffix_array([4, 3, 2, 1, 0]).toString(), [4, 3, 2, 1, 0].toString(), "Inverse circular suffix array of [4,3,2,1,0]");
    assert_eq(construct_inverse_circular_suffix_array([0, 1, 2, 3, 4]).toString(), [0, 1, 2, 3, 4].toString(), "Inverse circular suffix array of [0,1,2,3,4]");
}

/**
 * @name BBWTi
 * @kind disable
 * @type index
 * @description Text-Indices of the Bijective Burrows-Wheeler Transform
 */
function construct_bbw_indices(lyndon_factorization: readonly boolean[], circular_suffix_array: readonly number[]): number[] {
  const n: number = circular_suffix_array.length;
  return [...circular_suffix_array].map(pos => {
    var position : number;
    if (pos == 0 || lyndon_factorization[pos-1] == true) {
        const rank = rank_query(lyndon_factorization, true, pos);
        const selected_position = select_query(lyndon_factorization, true, 1+rank);
        position = (selected_position == -1) ? n-1 : selected_position;
    } else { position = pos-1; }
    return position;
  });
}
export function test_bbw_indices() {
    assert_eq(construct_bbw_indices([false, false, true, false, true, true], [5, 3, 1, 0, 4, 2]).toString(), [4, 0, 3, 5, 2, 1].toString(), "BBWT indices of 'banana'");
    assert_eq(construct_bbw_indices([false, false, true, false, true, false, true, true, false, true, true], [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]).toString(), [9, 4, 2, 6, 8, 0, 5, 10, 1, 7, 3].toString(), "BBWT indices of 'abracadabra'");
    assert_eq(construct_bbw_indices([], []).toString(), [].toString(), "BBWT indices of empty array");
    assert_eq(construct_bbw_indices([true], [0]).toString(), [0].toString(), "BBWT indices of [0]");
    assert_eq(construct_bbw_indices([true, true, true, true, true], [4, 3, 2, 1, 0]).toString(), [4, 3, 2, 1, 0].toString(), "BBWT indices of [4,3,2,1,0]");
    assert_eq(construct_bbw_indices([true, true, true, true, true], [0, 1, 2, 3, 4]).toString(), [0, 1, 2, 3, 4].toString(), "BBWT indices of [0,1,2,3,4]");
}

/**
 * @name BBWT
 * @kind disable
 * @type string
 * @description Bijective Burrows-Wheeler Transform
 */
function construct_bbw_transform(text: string, bbw_indices: readonly number[]): string {
    return [...bbw_indices].map(pos => text[pos]).join('');
}

export function test_bbw_transform() {
    assert_eq(construct_bbw_transform("banana", [4, 0, 3, 5, 2, 1]), "annb$aa", "BBWT of 'banana'");
    assert_eq(construct_bbw_transform("abracadabra", [9, 4, 2, 6, 8, 0, 5, 10, 1, 7, 3]), "ard$rcaaaabb", "BBWT of 'abracadabra'");
    assert_eq(construct_bbw_transform("", []), "", "BBWT of empty string");
    assert_eq(construct_bbw_transform("a", [0]), "a", "BBWT of 'a'");
    assert_eq(construct_bbw_transform("abcde", [4, 3, 2, 1, 0]), "edcba", "BBWT of 'abcde'");
    assert_eq(construct_bbw_transform("abcde", [0, 1, 2, 3, 4]), "abcde", "BBWT of 'abcde' with identity indices");
}

/**
 * @name BBWT&#8315;&#185;
 * @kind disable
 * @type string
 * @description Inverse Bijective Burrows-Wheeler Transform
 */
function construct_inverse_bbw_transform(bbw_transform : string): string {
    let n = bbw_transform.length;
    var farray = construct_first_array(bbw_transform); 
    var marking : boolean[] = new Array(n).fill(0);
    var conjugates = [];
    for(let bbwt_init_position = 0; bbwt_init_position < n; ++bbwt_init_position) {
        let conjugate = []
        if(marking[bbwt_init_position] == true) {
            continue;
        }
        var pos = bbwt_init_position;
        while(marking[pos] == false) {
            marking[pos] = true;
            conjugate.push(bbw_transform[pos]);
            let cur_char = farray[pos];
            let character_number = rank_query(farray, cur_char, pos+1); 
            console.assert(character_number > 0, 'character_number is zero');
            console.assert(bbw_transform.split(cur_char).length + 1 > character_number, 'bbw_transform mismatch');
            pos = select_query(bbw_transform, cur_char, character_number);
        }
        const finalConjugate = construct_necklace_conjugate_transform(conjugate.join(''))
        conjugates.push(finalConjugate);
    }
    conjugates.sort();
    conjugates.reverse();
    return conjugates.join('');
}


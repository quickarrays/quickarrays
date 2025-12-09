/**
 * @name Lyndon Factorization
 * @kind disabled
 * @type factor
 */
function compute_lyndon_factorization(text: string, inverse_suffix_array: number[]): boolean[] {
    const n: number = text.length;
    const result: boolean[] = new Array<boolean>(n).fill(false);

    // If the input string is empty, the result array will also be empty.
    if (n === 0) {
        return result;
    }

    // Strictness check: `inverse_suffix_array` must have at least `n` elements to safely access
    // `inverse_suffix_array[0]` and `inverse_suffix_array[i+1]` up to `i = n-2` (which means `i+1` up to `n-1`).
    if (inverse_suffix_array.length < n) {
        throw new Error(`Inverse suffix array (inverse_suffix_array) must have a length of at least text.length (${n}), but got ${inverse_suffix_array.length}.`);
    }

    // `inverse_suffix_arrayval` starts with the first element of `inverse_suffix_array`.
    let inverse_suffix_arrayval: number = inverse_suffix_array[0];

    // The loop iterates up to `n-2`.
    // When `i = n-2`, `i+1` is `n-1`. This is the last index of `inverse_suffix_array` that needs to be accessed.
    for (let i = 0; i + 1 < n; ++i) {
        if (inverse_suffix_arrayval > inverse_suffix_array[i + 1]) {
            result[i] = true;
            // `inverse_suffix_arrayval` is updated to `inverse_suffix_array[i+1]` only if the condition is met.
            inverse_suffix_arrayval = inverse_suffix_array[i + 1];
        }
    }
    return result;
}

/**
 * Computes the 1-based index `k` and corresponding value `sc[k-1]/k` such that `sc[k-1]/k` is maximized.
 *
 * This function iterates through the input array `sc`, calculating a ratio `sc[i]/(i+1)` for each element `sc[i]`.
 * It keeps track of the maximum ratio found and the 1-based index `i+1` associated with it.
 *
 * For example, if `sc = [10, 20, 5, 40]`:
 * - For index 0 (k=1): ratio = 10 / 1 = 10
 * - For index 1 (k=2): ratio = 20 / 2 = 10
 * - For index 2 (k=3): ratio = 5 / 3 = 1.66...
 * - For index 3 (k=4): ratio = 40 / 4 = 10
 * The first occurrence of the maximum ratio (10) is at index 0 (1-based length 1).
 *
 * @param sc An array of numbers. Each `sc[i]` is treated as a value corresponding to a 1-based index `i+1`.
 * @returns A tuple `[bestLength, bestValue]`, where `bestLength` is the 1-based index `k` that yielded the maximum ratio `sc[k-1]/k`, and `bestValue` is that maximum ratio.
 * @throws {Error} If the input array `sc` is empty, as a meaningful computation cannot be performed.
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
 * Calculates the substring complexity for each possible length based on the given Longest Common Prefix (LCP) array.
 * This function computes a 'complexity' metric for substrings of varying lengths,
 * which is derived from the distribution and frequency of LCP values.
 *
 * @param {number[]} lcp - The Longest Common Prefix (LCP) array. `lcp[i]` typically represents the length of the longest common prefix
 *                         between the suffix at index `i` and the suffix at index `i-1` in a sorted suffix array.
 *                         All elements are expected to be non-negative integers.
 * @returns {number[]} An array `ret` where `ret[k-1]` represents the calculated complexity for substrings of length `k`.
 *                     The length of the returned array will be equal to `lcp.length`.
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
function select_query(text: string, subString: string, nth: number): number {
    /*
     * Suggestion: The original logic for `select_query` was potentially buggy.
     * For `nth=1`, it would find the second occurrence. For `nth=0` (which implies 0-based),
     * it would find the first. The loop started `k=1` and `pos = text.indexOf(subString, pos + 1)`
     * was executed `nth` times *after* an initial `pos = text.indexOf(subString, 0)`.
     * This revised logic correctly finds the nth occurrence for a 1-based 'nth' parameter.
     *
     * Example: text="banana", subString="a", nth=1 -> returns 1 (index of first 'a')
     * Example: text="banana", subString="a", nth=2 -> returns 3 (index of second 'a')
     */
    if (nth <= 0) {
        throw new Error("The 'nth' parameter must be a positive integer for 1-based indexing.");
    }

    let pos: number = -1; // Initialize position to -1, so the first `text.indexOf` starts from index 0.
    for (let k = 0; k < nth; k++) { // Loop 'nth' times to find the 'nth' occurrence
        pos = text.indexOf(subString, pos + 1);
        if (pos === -1) {
            // If the substring is not found at any point, no further occurrences exist.
            break;
        }
    }
    return pos;
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
function rank_query(text: string, subString: string, index: number): number {
    const prefix: string = text.substring(0, index);
    // Counting occurrences by splitting: "abcabc".split("bc") -> ["a", "a", ""].length is 3.
    // The number of occurrences is always (length of array resulting from split) - 1.
    return prefix.split(subString).length - 1;
}

/**
 * Computes the LF-mapping (Last-to-First mapping) array for a given text,
 * based on its Burrows-Wheeler Transform (BWT). The LF-mapping is a core component
 * for reconstructing the original text from its BWT and for pattern searching.
 * This function relies on external implementations of `firstRow`, `bwt`, and `rotationArray`.

 * @param text The input text string.
 * @returns An array of numbers representing the LF-mapping for each character in the BWT.
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
 * Constructs the Burrows-Wheeler Transform (BWT) of a given text.
 *
 * @param {string} text - The input text for which to construct the BWT.
 * @param {number[]} rotation_array - An array of numbers where each number is the starting index
 *                                    of a rotation of `text` in lexicographically sorted order.
 *                                    For example, if `text = "banana$"`, `rotation_array` might be
 *                                    `[6, 5, 3, 1, 0, 4, 2]` for the suffixes sorted.
 * @returns {string} The Burrows-Wheeler Transform (BWT) of the input text.
 */
function construct_bw_transform(text: string, rotation_array: number[]): string {
    /* Ensure text is not empty for meaningful transformation. */
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

/**
 * Constructs a new string by splitting the input text into characters, sorting them alphabetically, and then joining them back.
 *
 * @param {string} text - The input string to process.
 * @returns {string} A new string with its characters sorted alphabetically.
 */
function construct_first_array(text: string): string {
    return [...text].sort().join('');
}

/**
 * @name Index Array
 * @kind enabled
 * @type index
 */
function construct_index_array(n: number): number[] {
    return Array.from(Array(n).keys());
}

/**
 * @name Suffix Array
 * @kind enabled
 * @type index
 */
function construct_suffix_array(text: string): number[] {
    const n: number = text.length;

    // Define a type for the elements in the 'rotations' array for better readability and type safety.
    type RotationEntry = [number, string];

    // Create an array of rotation entries: [original_index, conjugated_string, original_index_again]
    const rotations: RotationEntry[] = [...Array(n).keys()].map((num: number) => {
        return [num, text.substring(num)];
    });

    // Sort the rotations array based on the lexicographical order of the conjugated strings (the second element of the tuple).
    // The sort method modifies the array in-place.
    rotations.sort((a: RotationEntry, b: RotationEntry) => a[1].localeCompare(b[1]));

    // Map the sorted rotations back to an array containing only their original indices.
    return rotations.map((rotation: RotationEntry) => rotation[0]);
}

/**
 * Constructs an array of indices representing the sorted order of all cyclic rotations of a given string.
 * This is often a step in algorithms like the Burrows-Wheeler Transform.
 * @param inputString The string for which to construct the rotation array.
 * @param base An optional parameter with a default value of 0. It is currently unused in the function logic.
 * @returns An array of numbers, where each number is the starting index of a rotation in the original string, sorted lexicographically.
 */
function construct_rotation_array(text: string): number[] {
    const n: number = text.length;

    // Define a type for the elements in the 'rotations' array for better readability and type safety.
    type RotationEntry = [number, string];

    // Create an array of rotation entries: [original_index, conjugated_string, original_index_again]
    const rotations: RotationEntry[] = [...Array(n).keys()].map((num: number) => {
        return [num, conjugate_string(text, num)];
    });

    // Sort the rotations array based on the lexicographical order of the conjugated strings (the second element of the tuple).
    // The sort method modifies the array in-place.
    rotations.sort((a: RotationEntry, b: RotationEntry) => a[1].localeCompare(b[1]));

    // Map the sorted rotations back to an array containing only their original indices.
    return rotations.map((rotation: RotationEntry) => rotation[0]);
}


/**
 * Constructs the inverse suffix array from a given suffix array.
 * The inverse suffix array `inverse_suffix_array[i]` stores the rank of the suffix starting at index `i` in the sorted list of all suffixes.
 * If `sa[k] = i`, then `inverse_suffix_array[i] = k`.
 *
 * @param sa The suffix array, an array of numbers where `sa[k]` is the starting index of the k-th lexicographically smallest suffix.
 * @returns The inverse suffix array, where `inverse_suffix_array[i]` is the rank of the suffix starting at index `i`.
 */
function construct_inverse_suffix_array(suffix_array: number[]): number[] {
    const result: number[] = new Array<number>(suffix_array.length);
    for (let i = 0; i < suffix_array.length; i++) {
        result[suffix_array[i]] = i;
    }
    return result;
}

/**
 * Constructs the phi array (φ-array) given a suffix array and its inverse.
 * The phi array helps in calculating the LCP array (Longest Common Prefix).
 * Specifically, phi[i] stores the starting position of the suffix that comes just before
 * the suffix starting at position i in the lexicographically sorted list of suffixes.
 *
 * @param suffix_array The suffix array (SA), an array of numbers where SA[k] is the starting index
 *                     of the k-th lexicographically smallest suffix.
 * @param inverse_suffix_array The inverse suffix array (inverse_suffix_array), an array of numbers where inverse_suffix_array[i] is
 *                             the rank of the suffix starting at index i (i.e., inverse_suffix_array[i] = k if SA[k] = i).
 * @returns A new array representing the phi array.
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


/**
 * Constructs the Phi array (often denoted as `phi` or `iPhi` in LCP array construction algorithms),
 * which maps each suffix's starting index `i` to the starting index of the suffix
 * that immediately follows it in the lexicographically sorted list of all suffixes.
 * If suffix `i` is the last suffix in sorted order (i.e., has rank `n-1`), it maps to `n` (a sentinel value).
 *
 * This array is crucial for efficiently constructing the Longest Common Prefix (LCP) array
 * using Kasai's algorithm or similar methods.
 *
 * @param {number[]} suffix_array The suffix array (SA), where `SA[k]` is the starting index of the k-th lexicographically smallest suffix.
 * @param {number[]} inverse_suffix_array The inverse suffix array (inverse_suffix_array), where `inverse_suffix_array[i]` is the rank (0-indexed position in SA) of the suffix starting at index `i`.
 * @returns {number[]} The Phi array, where `phi[i]` is the starting index of the suffix that follows `suffix[i]` in sorted order.
 */
function construct_inverse_phi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    const n: number = suffix_array.length;
    const result: number[] = new Array<number>(n);

    for (let i: number = 0; i < n; ++i) {
        /*
         * Logic Explanation:
         * 1. `inverse_suffix_array[i]` gives the rank (0-indexed position) of the suffix starting at index `i` within the sorted suffix array.
         *    Let `k = inverse_suffix_array[i]`. This means `SA[k] = i`.
         * 2. We want to find the suffix that comes *after* `suffix[i]` in sorted order. This suffix is at rank `k + 1`.
         * 3. The starting index of this next suffix is `suffix_array[k + 1]`, which translates to `suffix_array[inverse_suffix_array[i] + 1]`.
         * 4. This is valid only if `k + 1` is within the bounds of `suffix_array`, i.e., `k + 1 < n`.
         * 5. If `k + 1 == n`, it means `k = n - 1`, which means `suffix[i]` is the *last* suffix in lexicographical order.
         *    In this case, there is no "next" suffix, so we assign a sentinel value `n`.
         * The condition `inverse_suffix_array[i] + 1 != n` is equivalent to `inverse_suffix_array[i] < n - 1`.
         */
        if (inverse_suffix_array[i] + 1 !== n) {
            result[i] = suffix_array[inverse_suffix_array[i] + 1];
        } else {
            result[i] = n;
        }
    }
    return result;
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

/**
 * @name LCP Array
 * @kind disabled
 * @type length
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
 * Constructs the permuted LCP array (PLCP array) from the inverse suffix array and LCP array.
 * The PLCP array stores LCP values in the order of the original string's suffixes.
 *
 * @param {number[]} inverse_suffix_array - The inverse suffix array, where `inverse_suffix_array[i]`
 *   is the rank of the suffix starting at index `i` in the original string.
 * @param {number[]} lcp_array - The LCP array, where `lcp_array[i]` is the longest common prefix
 *   between the suffix `i` and suffix `i-1` in the sorted suffix array.
 * @returns {number[]} The PLCP array.
 */
function construct_plcp_array(inverse_suffix_array: number[], lcp_array: number[]): number[] {
    if (inverse_suffix_array.length !== lcp_array.length) {
        throw new Error("Inverse suffix array and LCP array must have the same length.");
    }
    const n = inverse_suffix_array.length;
    return [...new Array(n).keys()].map(i => lcp_array[inverse_suffix_array[i]]);
}

/**
 * Constructs the Psi array from a Suffix Array and its Inverse Suffix Array.
 * The Psi array (or next-char array) maps SA[i] to inverse_suffix_array[SA[i] + 1].
 * This means Psi[i] gives the rank of the suffix starting at `SA[i] + 1`.
 * This is a common step in constructing the Burrows-Wheeler Transform.
 *
 * @param suffix_array The suffix array (SA) of the text, an array of numbers.
 * @param inverse_suffix_array The inverse suffix array (inverse_suffix_array) of the text, an array of numbers.
 * @returns The Psi array, an array of numbers.
 */
function construct_psi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    const n = suffix_array.length;
    return [...new Array(n).keys()].map(i => 
        (suffix_array[i] + 1 < n) ? inverse_suffix_array[suffix_array[i] + 1] : n
    );
}


function construct_sl_string(text) {
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
 * Constructs an array where each element at index `i` is the length of the longest common prefix (LCP)
 * between the suffix starting at `i` and any suffix starting at an index `j < i`.
 * This array is often referred to as the LPF (Longest Previous Factor) array or a variant of a border array.
 *
 * For each `i` from `0` to `text.length - 1`, `result[i]` stores the maximum LCP value
 * found by comparing `text[i...]` with `text[j...]` for all `j < i`.
 *
 * @param text The input string for which to compute the LPF array.
 * @returns An array of numbers, where `result[i]` is the LCP between `text[i...]` and `text[j...]` for some `j < i`.
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
 * Computes an array often referred to as the "Longest Proper Suffix" (LPS) array for a string's reverse,
 * or a related variant used in string algorithms.
 *
 * This function performs the following steps:
 * 1. Reverses the input `text`.
 * 2. Calls an external `construct_lpf_array` function with the reversed text to compute
 *    what is typically a "Longest Proper Prefix/Suffix" (LPF) array for that reversed string.
 * 3. Reverses the order of elements in the resulting LPF array.
 *
 * This pattern is commonly used in string matching algorithms, like KMP, to derive specific
 * prefix/suffix information.
 *
 * @param text The input string for which to compute the LNF array.
 * @returns An array of numbers. Each element usually represents a length or an index
 *          related to the prefix/suffix properties of the string or its reversed form.
 */
function construct_lnf_array(text: string): number[] {
    const revtext: string = text.split('').reverse().join('');
    const lpfarray: number[] = construct_lpf_array(revtext);

    const n: number = lpfarray.length;
    return [...new Array(n).keys()].map((i) => lpfarray[n-1-i]); 
}


function greedy_factorize(factor_array : number[]) : boolean[] {
    const n: number = factor_array.length;
    const result: boolean[] = new Array<boolean>(n).fill(false);
    let boundary: number = 1;
    for (let i: number = 0; i < n; i++) {
        if (boundary === i) {
            result[n - i - 1] = true;
            const currentFactor: number = factor_array[i];
            boundary += currentFactor === 0 ? 1 : currentFactor;
        }
    }
    return result;
}


/**
 * Reverses an LZSS-like factorization to determine boundary points.
 * This function identifies positions in the input sequence that are start points of factors
 * when considered in reverse order, based on a provided array of lengths/factors.
 *
 * @param {string} text - The input text or sequence. Its length is used for factorization.
 *                        /* Suggestion: If 'text' could be an array of bytes/numbers, consider using 'ReadonlyArray<unknown>' or a more specific array type like 'Uint8Array'. *\/
 * @param {number[]} lnf_array - An array of numbers where each number represents a length or factor.
 *                                A value of 0 typically means a single literal, and a positive number
 *                                means a match of that length.
 * @returns {boolean[]} - An array of booleans. `true` at an index `k` in the returned array
 *                        means that the character at original index `n-k-1` (where `n` is `text.length`)
 *                        is a boundary point in the context of the reverse factorization process.
 */
function compute_reverse_lzss_factorization(lnf_array: number[]): boolean[] {
    return greedy_factorize(lnf_array);
}

function compute_lzss_factorization(lpf_array: number[]): boolean[] {
    return greedy_factorize(lpf_array);
}

function compute_lexparse_factorization(plcp_array: number[]): boolean[] {
    return greedy_factorize(plcp_array);
}


/**
 * Computes the Next Smaller Suffix (NSS) array for a given text using its inverse suffix array.
 * The NSS array stores for each index `i` the smallest index `j > i` such that the suffix starting at `j`
 * is lexicographically smaller than the suffix starting at `i`. If no such suffix exists, it stores `n` (text length).
 *
 * @param text The original text (or sequence) for which the inverse suffix array was computed.
 *             Its length determines the bounds for calculations.
 * @param inverse_suffix_array An array where `inverse_suffix_array[i]` is the rank of the suffix starting at `i`.
 *                             The ranks are used to compare suffixes.
 * @returns An array of numbers representing the NSS array.
 */
function construct_nss_array(text: string, inverse_suffix_array: number[]): number[] {
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
 * Computes the Previous Smaller Suffix (PSS) array for a given text and its inverse suffix array.
 *
 * The PSS array for an index `i` stores the largest index `j < i` such that `inverse_suffix_array[j] < inverse_suffix_array[i]`.
 * If no such `j` exists, `n` (the length of the text) is stored.
 *
 * @param text The input string.
 * @param inverse_suffix_array An array where `inverse_suffix_array[i]` is the rank of the suffix starting at index `i` in the sorted list of all suffixes.
 * @returns An array where `result[i]` is the PSS value for index `i`.
 */
function construct_pss_array(text: string, inverse_suffix_array: number[]): number[] {
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
 * Computes the KMP border array (also known as the prefix function or longest proper prefix suffix array) for a given text.
 * The border array `P[i]` stores the length of the longest proper prefix of `text[0...i]` that is also a suffix of `text[0...i]`.
 * This implementation uses a common technique where an initial -1 is pushed to simplify the loop, and then shifted out at the end.
 *
 * @param {string} text The input string for which to compute the border array.
 * @returns {number[]} The computed border array. Each element `P[i]` represents the length of the longest proper prefix of `text[0...i]` that is also a suffix of `text[0...i]`.
 */
function construct_border_array(text: string): number[] {
  const n: number = text.length;
  if (n === 0) {
      return [];
  }
  let result: number[] = new Array<number>(n);
  result[0] = -1; // Initializing with -1 to simplify the KMP-like logic
  for (let i = 0; i < n; ++i) {
    let len: number = result[i];
    while (len >= 0 && text[len] !== text[i]) {
      len = result[len];
    }
    result.push(len + 1);
  }
  result.shift(); /* The initial -1 element is removed to return the standard border array. */
  return result;
}

/**
 * Computes the Lyndon array for a given text based on its Next Smaller Suffix (NSS) array.
 * The Lyndon array element at index `i` represents the length of the Lyndon word
 * that starts at position `i` in the original text, when performing a Lyndon factorization.
 *
 * @param text The input string for which the Lyndon array is to be computed.
 * @param nss_array An array of numbers representing the Next Smaller Suffix array for the `text`.
 *                  It is expected that `nss_array` has the same length as `text`.
 * @returns An array of numbers, where each element `result[i]` is the length of the Lyndon word
 *          starting at `text[i]`.
 */
function construct_lyndon_array(text: string, nss_array: number[]): number[] {
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
 * Computes the lexicographically smallest cyclic shift (conjugate) of a given string.
 * This is often a step in finding the canonical representation for Lyndon words or other string algorithms.
 *
 * @param {string} text The input string.
 * @returns {string} The lexicographically smallest cyclic shift of the input string.
 */
function compute_necklace_conjugate_transform(text: string): string {
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

// /**
//  * Computes a specific array based on Lyndon factorization and cyclic shifts of factors.
//  * This function processes the input text by identifying Lyndon factors based on the `lyndon_factorization` array.
//  * For each Lyndon factor, it generates all its cyclic shifts (conjugates) and stores their original starting positions in the text.
//  * These conjugates are then sorted using a specific 'omega' lexicographical comparison (treating strings as infinitely repeated).
//  * The final `result` array contains the starting positions of these sorted conjugates.
//  *
//  * @param {string} text - The input text string.
//  * @param {(boolean | undefined)[]} lyndon_factorization - An array where `lyndon_factorization[i]` is `true` if a Lyndon factor ends at index `i-1` (inclusive) in the `text`.
//  *                                                         It can be sparse, with `undefined` values treated as `false`.
//  * @returns {number[]} An array containing the starting positions in the original text of the sorted cyclic shifts of Lyndon factors.
//  */
// function circular_suffix_array(text: string, lyndon_factorization: boolean[]): number[] {
//     const n: number = text.length;
//     const result: number[] = new Array(n);
//
//     interface Conjugate {
//         pos: number;
//         str: string;
//     }
//
//     const conjugates: Conjugate[] = [];
//     let next_starting_pos: number = 0;
//
//     // Mark the end of the entire text as a potential Lyndon factor boundary for processing the last segment.
//     // This allows the loop to pick up any remaining segment if 'n' itself is a Lyndon factor boundary.
//     lyndon_factorization[n] = true;
//
//     for (let i = 0; i <= n; ++i) {
//         if (lyndon_factorization[i] === true) {
//             // Extract the Lyndon factor
//             let conjugate_segment: string = text.substring(next_starting_pos, i); 
//             /* Original code used i+1, but substring's end is exclusive.
//                If i is the end index of the factor, then text.substring(start, i) is correct.
// Example: text="abc", next_start=0, i=1 (factor "a"). substring(0,1) gives "a".
// If i is the *length* of the factor *from next_starting_pos*, then i+1 is correct.
// Given how i increments and `next_starting_pos = i+1` is set, `i` appears to be the
// exclusive end index for the substring.
// Let's trace: if `next_starting_pos = 0`, `i = 1`, factor is `text[0]`.
// `text.substring(0, 1+1)` = `text.substring(0,2)` which is `text[0]text[1]`.
// This indicates `lyndon_factorization[i]` signals that `text[i-1]` is the *end* of the factor.
// So `text.substring(next_starting_pos, i)` is probably correct.
// If `i` is the length of the factor, then `text.substring(next_starting_pos, next_starting_pos + i)` would be clearer.
// Assuming `lyndon_factorization[i] = true` means `text[next_starting_pos...i-1]` is a Lyndon factor.
// Then `text.substring(next_starting_pos, i)` is correct.
// I will preserve `i+1` for now as it's directly from original, but this is a potential source of off-by-one difference. */
//             let current_conjugate_str: string = text.substring(next_starting_pos, i); 
//             /* Original `i+1` implies `lyndon_factorization[i]` marks end index *inclusive*.
//                So for a factor `text[k...j]`, `lyndon_factorization[j+1]` would be true.
//                If `lyndon_factorization[i] === true` means `text[next_starting_pos ... i-1]` is the factor,
//                then `text.substring(next_starting_pos, i)` is correct.
//                If `lyndon_factorization[i] === true` means `text[next_starting_pos ... i]` is the factor,
//                then `text.substring(next_starting_pos, i + 1)` is correct.
//                The way `next_starting_pos = i + 1` is used suggests that `i` is the last *inclusive* index processed.
//                Let's re-verify: if text="ab", `n=2`. `lyndon_factorization[0]` to `lyndon_factorization[2]` are relevant.
//                If "a" is a factor, `lyndon_factorization[1]=true`. `next_starting_pos=0`, `i=1`.
//                `conjugate = text.substring(0, 1+1) = text.substring(0,2) = "ab"`. This is wrong if "a" is the factor.
//                It should be `text.substring(next_starting_pos, i)`.
//                Therefore, I am changing `i+1` to `i` based on standard `substring` behavior where end is exclusive.
//                This makes `lyndon_factorization[i]` mark the *exclusive end index* of a factor. */
//             current_conjugate_str = text.substring(next_starting_pos, i); /* Correction applied here. */
//
//             const conjugate_length = current_conjugate_str.length;
//             for (let conj_it = 0; conj_it < conjugate_length; ++conj_it) {
//                 conjugates.push({ pos: next_starting_pos + conj_it, str: current_conjugate_str });
//                 // Perform a circular shift
//                 current_conjugate_str = current_conjugate_str.substring(1) + current_conjugate_str[0];
//             }
//             next_starting_pos = i; /* Corrected to `i` because `i` is the exclusive end of the previous factor.
//                                       The next factor should start at `i`. Original code had `i+1`.
//                                       If `i` is the exclusive end of `text[next_starting_pos ... i-1]`, then `i` is the start of the next one.
//                                       Example: text = "abc", Lyndon factors "a", "b", "c".
//                                       `lyndon_factorization[1]=true`, `lyndon_factorization[2]=true`, `lyndon_factorization[3]=true`.
//                                       1. `next_starting_pos = 0`, `i=1`. `factor = text.substring(0,1) = "a"`. `next_starting_pos` becomes `1`.
//                                       2. `next_starting_pos = 1`, `i=2`. `factor = text.substring(1,2) = "b"`. `next_starting_pos` becomes `2`.
//                                       3. `next_starting_pos = 2`, `i=3`. `factor = text.substring(2,3) = "c"`. `next_starting_pos` becomes `3`.
//                                       This seems to align with typical Lyndon factorization where `i` marks the *end* of a factor, not `i+1`. */
//         }
//         if (i === n) { break; } // Loop condition `i <= n` makes `i = n` the last iteration. No need for `i = n + 1`. This break handles that.
//     }
//
//     conjugates.sort(function omegaOrder(conj_strA: Conjugate, conj_strB: Conjugate): number {
//         const strA = conj_strA.str;
//         const strB = conj_strB.str;
//
//         if (strA === strB) {
//             return 0;
//         }
//
//         /* BUG / SUGGESTION: The 'omegaOrder' comparison as written can lead to an infinite loop
//          * if strA and strB are different lengths and one is a cyclic repetition of the other
//          * or if they are repetitions of shorter strings that compare equal indefinitely.
//          * E.g., strA = "ab", strB = "aba".
//          * A safer comparison for smallest cyclic shift usually involves comparing
//          * `(strA + strA)` with `(strB + strB)` up to a certain length,
//          * or having an explicit length check / finite loop bound.
//          * For example, compare `strA[i % strA.length]` with `strB[i % strB.length]` for `i` up to `strA.length * strB.length` (least common multiple of lengths),
//          * or more commonly, `min(strA.length, strB.length) * 2`.
//          * However, preserving original logic as requested, with this warning. */
//         for (let i = 0; ; ++i) { // Infinite loop potential here
//             if (strA[i % strA.length] < strB[i % strB.length]) { return -1; }
//             if (strA[i % strA.length] > strB[i % strB.length]) { return +1; }
//             // If they are equal at this position, continue to next.
//             // If they are perpetually equal (e.g., strA = "ab", strB = "ab"), the `strA === strB` check at the start handles it.
//             // If strA = "ab", strB = "abab", this loop will go on infinitely.
//         }
//     });
//
//     for (let i = 0; i < conjugates.length; ++i) {
//         const conjugate: Conjugate = conjugates[i];
//         result[i] = conjugate.pos;
//     }
//
//     return result;
// }

/**
 * @name &Phi; Array
 * @kind enabled|disabled|hidden
 * @type string|length|index|factor
 *
 * construct_XXX_YYY
 * YYY: array, factorization, transform
 *
 * counter 
 * - number_of_ones for factorization
 * - number_of_runs for transform
 *
 *
 *  base : only substract when @@type = index
 *
 *  if string -> qa-structure-text
 *  if length -> qa-structure-length
 *  if factor -> qa-structure-factorization
 *  if index -> qa-structure-index
 *
 */

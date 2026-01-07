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

class AlgorithmError extends Error {
    constructor(
        message: string,
        public readonly algorithm: string,
        public readonly input: any
    ) {
        super(message);
        this.name = 'AlgorithmError';
    }
}

/**
 * @name &sigma;
 * @description Alphabet size
 * @tutorial The shortest period of a string is the smallest positive integer such that the string is a prefix of an infinite repetition of the prefix of that length. Concretely, the shortest period \(p\) of the text \(T\) is the length of the shortest prefix \(P\) of \(T\) such that \(T\) is a prefix of \(P^{k}\) for some integer \(k \geq 1\).
 * @wikipedia Alphabet_(formal_languages)
 */
function count_sigma(text: string) : number {
    if(!text) { return 0; }
    return new Set(text).size;
}
export function test_sigma() {
    assert_eq(count_sigma("abab"), 2, "Alphabet size of 'abab'");
    assert_eq(count_sigma("abcde"), 5, "Alphabet size of 'abcde'");
    assert_eq(count_sigma("aaaaa"), 1, "Alphabet size of 'aaaaa'");
    assert_eq(count_sigma("ababa"), 2, "Alphabet size of 'ababa'");
    assert_eq(count_sigma("a"), 1, "Alphabet size of 'a'");
    assert_eq(count_sigma(""), 0, "Alphabet size of empty string");
}


/**
 * @name p
 * @description Shortest Period
 * @tutorial The shortest period of a string is the smallest positive integer such that the string is a prefix of an infinite repetition of the prefix of that length. Concretely, the shortest period \(p\) of the text \(T\) is the length of the shortest prefix \(P\) of \(T\) such that \(T\) is a prefix of \(P^{k}\) for some integer \(k \geq 1\).
 * @wikipedia Periodic_sequence
 */
function count_period(border_array: number[]) : number {
    if(!border_array || border_array.length === 0) { return 0; }
    const last_border = border_array[border_array.length - 1];
    return border_array.length - last_border;
}

export function test_period() {
    assert_eq(count_period([0, 0, 1, 2]), 2, "Period of 'abab'");
    assert_eq(count_period([0, 0, 0, 0, 0]), 5, "Period of 'abcde'");
    assert_eq(count_period([0, 1, 2, 3, 4]), 1, "Period of 'aaaaa'");
    assert_eq(count_period([0, 0, 1, 2, 3]), 2, "Period of 'ababa'");
    assert_eq(count_period([0]), 1, "Period of 'a'");
    assert_eq(count_period([]), 0, "Period of empty string");
}

/**
 * @name e
 * @description Exponent
 * @tutorial The exponent of a string is the division of the string's length by its shortest period, representing how many times the shortest period needs to be repeated to form the string. Formally, the exponent of the text \(T\) is defined as the length of \(T\) divided by the length of its shortest period \(p\), i.e., \(\frac{|T|}{p}\).
 * @wikipedia Periodic_sequence
 */
function count_exponent(border_array: number[]) : number {
    if (!border_array || border_array.length === 0) { return 0; }
    const period = count_period(border_array);
    return border_array.length / period;
}

export function test_exponent() {
    assert_eq(count_exponent([0, 0, 1, 2]), 2, "Exponent of 'abab'");
    assert_eq(count_exponent([0, 0, 0, 0, 0]), 1, "Exponent of 'abcde'");
    assert_eq(count_exponent([0, 1, 2, 3, 4]), 5, "Exponent of 'aaaaa'");
    assert_eq(count_exponent([0, 0, 1, 2, 3]), 2.5, "Exponent of 'ababa'");
    assert_eq(count_exponent([0]), 1, "Exponent of 'a'");
    assert_eq(count_exponent([]), 0, "Exponent of empty string");
}


/**
 * @name R
 * @description Regularity Type
 * @tutorial The regularity type of a string classifies it based on its periodic structure. A string can be categorized as unbordered, primitive, square, or non-primitive based on its borders and periods. Specifically, a string is unbordered if it has no proper border, primitive if it cannot be expressed as a repetition of a smaller substring, square if it is formed by repeating a substring exactly twice, and non-primitive if it can be expressed as a repetition of a smaller substring more than twice.
 */
function count_regularity(border_array: number[]) : string {
    if(!border_array || border_array.length === 0) { return 'empty'; }
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

export function test_regularity() {
    assert_eq(count_regularity([0, 0, 0, 0, 0]), 'unbordered', "Regularity of 'abcde'");
    assert_eq(count_regularity([0, 1, 2, 3, 4]), 'non-primitive', "Regularity of 'aaaaa'");
    assert_eq(count_regularity([0, 0, 1, 2, 3]), 'primitive', "Regularity of 'ababa'");
    assert_eq(count_regularity([0, 0, 1, 2]), 'square', "Regularity of 'abab'");
    assert_eq(count_regularity([0]), 'unbordered', "Regularity of 'a'");
    assert_eq(count_regularity([]), 'empty', "Regularity of empty string");
}

/**
 * @name SA
 * @kind enable
 * @type index
 * @description Suffix Array
 * @tutorial The suffix array sorts the entry indices of a string based on the lexicographical order of their corresponding suffixes. Formally, the suffix array \(\mathsf{SA}\) of the text \(T[1..n]\) is an array of integers representing the starting indices of all the suffixes of \(T\), sorted in lexicographical order. It obeys that \(T[\mathsf{SA}[i]..n] \prec T[\mathsf{SA}[i+1]..n]\) for all text positions \(i \in [1..n-1]\).
 * @cite manber93sa
 * @wikipedia Suffix_array
 */
function construct_suffix_array(text: string): number[] {
    if (!text) { return []; }

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
    assert_eq(construct_suffix_array("banana"), [5, 3, 1, 0, 4, 2], "Suffix array of 'banana'");
    assert_eq(construct_suffix_array("abracadabra"), [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2], "Suffix array of 'abracadabra'");
    assert_eq(construct_suffix_array(""), [], "Suffix array of empty string");
    assert_eq(construct_suffix_array("a"), [0], "Suffix array of 'a'");
    assert_eq(construct_suffix_array("aaaaa"), [4, 3, 2, 1, 0], "Suffix array of 'aaaaa'");
    assert_eq(construct_suffix_array("abcde"), [0, 1, 2, 3, 4], "Suffix array of 'abcde'");
    assert_eq(construct_suffix_array("mississippi"), [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2], "Suffix array of 'mississippi'");
}

/**
 * @name B
 * @kind disable
 * @type length
 * @description Border Array
 * @tutorial The border array of a string stores the lengths of the longest borders for each prefix of the string. A border of a string is defined as a substring that is both a proper prefix and a proper suffix. Formally, the border array \(\mathsf{B}\) for a text \(T[1..n]\) is an array where each entry \(\mathsf{B}[i]\) represents the length of the longest border of the prefix \(T[1..i]\), i.e., \(\mathsf{B}[i]\) is the largest integer \(k \le i-1\) such that \(T[1..k] = T[i-k+1..i]\). By definition, \(\mathsf{B}[0] = 0\).
 * @wikipedia Knuth–Morris–Pratt_algorithm
 */
function construct_border_array(text: string): number[] {
  if (!text) { return []; }
  const n: number = text.length;
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
    assert_eq(construct_border_array("ababa"), [0, 0, 1, 2, 3], "Border array of 'ababa'");
    assert_eq(construct_border_array("aaaa"), [0, 1, 2, 3], "Border array of 'aaaa'");
    assert_eq(construct_border_array("abcd"), [0, 0, 0, 0], "Border array of 'abcd'");
    assert_eq(construct_border_array(""), [], "Border array of empty string");
    assert_eq(construct_border_array("a"), [0], "Border array of 'a'");
    assert_eq(construct_border_array("abcababc"), [0,0,0,1,2,1,2,3], "Border array of 'abcababc'");
}

/**
 * @name BWT
 * @kind disable
 * @type string 
 * @description Burrows-Wheeler Transform
 * @tutorial The Burrows-Wheeler Transform (BWT) is a reversible transformation that rearranges the characters of a string based on the lexicographical order of its cyclic rotations. Formally, given a text \(T[1..n]\) and its rotation array \(\mathsf{Rot}\), the BWT \(\mathsf{BWT}[1..n]\) is defined such that \(\mathsf{BWT}[i] = T[(\mathsf{Rot}[i] + n - 1) \mod n]\) for each \(i \in [1..n]\).
 * @wikipedia Burrows%E2%80%93Wheeler_transform
 * @cite burrows94bwt
 */
function construct_bw_transform(text: string, rotation_array: number[]): string {
    if (!text) { return ""; }
    if (text.length !== rotation_array.length) {
        throw new AlgorithmError('Invalid input: text must be a string and rotation_array must be an array', 'BWT', { text, rotation_array });
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
    assert_eq(construct_bw_transform("banana", [5, 3, 1, 0, 4, 2]), "nnbaaa", "BWT of 'banana'");
    assert_eq(construct_bw_transform("abracadabra", [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), "rdarcaaaabb", "BWT of 'abracadabra'");
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
 * @tutorial The First Column Array represents the first column of the sorted rotations of a string, which is obtained by sorting the characters of the string in lexicographical order. Formally, for a given text \(T[1..n]\), the First Column Array \(\mathsf{F}\) is defined as the sorted sequence of characters in \(T\).
 * @wikipedia Burrows%E2%80%93Wheeler_transform
 * @cite burrows94bwt
 */
function construct_first_array(text: string): string {
    if (!text) { return ""; }
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
 * @tutorial The index array contains a sequence of integers from \(1\) to \(n\), where \(n\) is the length of the input text \(T[1..n]\). Formally, the index array \(\mathsf{i}\) is defined such that \(\mathsf{i}[j] = j\) for each \(j \in [1..n]\).
 */
function construct_index_array(n: number): number[] {
    if (!n || n <= 0) { return []; }
    return Array.from(Array(n).keys());
}

export function test_index_array() {
    assert_eq(construct_index_array(5), [0, 1, 2, 3, 4], "Index array of length 5");
    assert_eq(construct_index_array(0), [], "Index array of length 0");
    assert_eq(construct_index_array(1), [0], "Index array of length 1");
    assert_eq(construct_index_array(10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "Index array of length 10");
}

/**
 * @name Rot
 * @kind disable
 * @type index
 * @description Rotation Array
 * @tutorial The rotation array sorts the entry indices of a string based on the lexicographical order of their corresponding cyclic rotations. Formally, the rotation array \(\mathsf{Rot}\) of the text \(T[1..n]\) is an array of integers representing the starting indices of all the cyclic rotations of \(T\), sorted in lexicographical order. It obeys that \(T[\mathsf{Rot}[i]..n]T[1..\mathsf{Rot}[i]-1] \prec T[\mathsf{Rot}[i+1]..n]T[1..\mathsf{Rot}[i+1]-1]\) for all text positions \(i \in [1..n-1]\), where $\prec$ is a total order by assigning lower ranks to lexicographically smaller strings and uses the text position \(i\) for tie-breaking.
 */
function construct_rotation_array(text: string): number[] {
    if (!text) { return []; }
    const n: number = text.length;
    type RotationEntry = [number, string];
    const rotations: RotationEntry[] = [...Array(n).keys()].map((num: number) => {
        return [num, conjugate_string(text, num)];
    });
    // Sort the rotations array based on the lexicographical order of the conjugated strings (the second element of the tuple).
    // The sort method modifies the array in-place.
    rotations.sort((a: RotationEntry, b: RotationEntry) => {
        const cmp = a[1].localeCompare(b[1]);
        if (cmp !== 0) return cmp;
        return a[0] - b[0]; // Stable sort: preserve original order for ties
    });

    // Map the sorted rotations back to an array containing only their original indices.
    return rotations.map((rotation: RotationEntry) => rotation[0]);
}

export function test_rotation_array() {
    assert_eq(construct_rotation_array("banana"), [5, 3, 1, 0, 4, 2], "Rotation array of 'banana'");
    assert_eq(construct_rotation_array("abracadabra"), [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2], "Rotation array of 'abracadabra'");
    assert_eq(construct_rotation_array(""), [], "Rotation array of empty string");
    assert_eq(construct_rotation_array("a"), [0], "Rotation array of 'a'");
    assert_eq(construct_rotation_array("aaaaa"), [0, 1, 2, 3, 4], "Rotation array of 'aaaaa'");
    assert_eq(construct_rotation_array("edcba"), [4, 3, 2, 1, 0], "Rotation array of 'edcba'");
    assert_eq(construct_rotation_array("abcde"), [0, 1, 2, 3, 4], "Rotation array of 'abcde'");
}


/**
 * @name ISA
 * @kind disable
 * @type index
 * @description Inverse Suffix Array
 * @tutorial The inverse suffix array provides a mapping from each starting index of the suffixes of a string back to their respective positions in the suffix array. Formally, given the suffix array \(\mathsf{SA}\) of the text \(T[1..n]\), the inverse suffix array \(\mathsf{ISA}\) is defined such that \(\mathsf{ISA}[\mathsf{SA}[i]] = i\) for each \(i \in [1..n]\).
 * @wikipedia Suffix_array
 * @cite manber93sa
 */
function construct_inverse_suffix_array(suffix_array: readonly number[]): number[] {
    if (!suffix_array) { return []; }
    const result: number[] = new Array<number>(suffix_array.length);
    for (let i = 0; i < suffix_array.length; i++) {
        result[suffix_array[i]] = i;
    }
    return result;
}

export function test_inverse_suffix_array() {
    assert_eq(construct_inverse_suffix_array([5, 3, 1, 0, 4, 2]), [3, 2, 5, 1, 4, 0], "Inverse suffix array of 'banana'");
    assert_eq(construct_inverse_suffix_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0], "Inverse suffix array of 'abracadabra'");
    assert_eq(construct_inverse_suffix_array([]), [], "Inverse suffix array of empty array");
    assert_eq(construct_inverse_suffix_array([0]), [0], "Inverse suffix array of [0]");
    assert_eq(construct_inverse_suffix_array([4, 3, 2, 1, 0]), [4, 3, 2, 1, 0], "Inverse suffix array of [4,3,2,1,0]");
    assert_eq(construct_inverse_suffix_array([0, 1, 2, 3, 4]), [0, 1, 2, 3, 4], "Inverse suffix array of [0,1,2,3,4]");
}

/**
 * @name &Phi;
 * @kind disable
 * @type index
 * @description Phi Array
 * @tutorial The Phi array provides a mapping from each starting index of the suffixes of a string to the starting index of the lexicographically preceding suffix. Formally, given the suffix array \(\mathsf{SA}\) and the inverse suffix array \(\mathsf{ISA}\) of the text \(T[1..n]\), the Phi array \(\mathsf{\Phi}\) is defined such that \(\mathsf{\Phi}[i] = \mathsf{SA}[\mathsf{ISA}[i] - 1]\) if \(\mathsf{ISA}[i] > 0\), and \(\mathsf{\Phi}[i] = \bot\) if \(\mathsf{ISA}[i] = 0\), for each \(i \in [1..n]\).
 * @cite karkkainen09plcp
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
    function test_helper(text: string) : number[] {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        const phi_array = construct_phi_array(suffix_array, inverse_suffix_array);
        return phi_array;
    }
    assert_eq(test_helper("banana"), [1,3,4,5,0,6], "Phi array of 'banana'");
    assert_eq(test_helper("abracadabra"), [7, 8, 9, 0, 1, 3, 4,10, 5, 6, 11], "Phi array of 'abracadabra'");
    assert_eq(test_helper(""), [], "Phi array of empty string");
    assert_eq(test_helper("a"), [1], "Phi array of 'a'");
    assert_eq(test_helper("aaaaa"), [1,2,3,4,5], "Phi array of 'aaaaa'");
    assert_eq(test_helper("abcde"), [5,0,1,2,3], "Phi array of 'abcde'");
    assert_eq(test_helper("edcba"), [1,2,3,4,5], "Phi array of 'edcba'");
}

/**
 * @name &Phi;&#8315;&#185;
 * @kind disable
 * @type index
 * @description Inverse Phi Array
 * @tutorial The inverse Phi array provides a mapping from each starting index of the suffixes of a string to the starting index of the lexicographically succeeding suffix. Formally, given the suffix array \(\mathsf{SA}\) and the inverse suffix array \(\mathsf{ISA}\) of the text \(T[1..n]\), the inverse Phi array \(\mathsf{\Phi}^{-1}\) is defined such that \(\mathsf{\Phi}^{-1}[i] = \mathsf{SA}[\mathsf{ISA}[i] + 1]\) if \(\mathsf{ISA}[i] \le n-1 \), and \(\mathsf{\Phi}^{-1}[i] = \bot\) if \(\mathsf{ISA}[i] = n \), for each \(i \in [1..n]\).
 */
function construct_inverse_phi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    if (!suffix_array || !inverse_suffix_array) { return []; }
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
    function test_helper(text: string) : number[] {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        const inverse_phi_array = construct_inverse_phi_array(suffix_array, inverse_suffix_array);
        return inverse_phi_array;
    }
    assert_eq(test_helper("banana"), [4,0,6,1,2,3], "Inverse Phi array of 'banana'");
    assert_eq(test_helper("abracadabra"), [3, 4, 11, 5, 6, 8, 9, 0, 1, 2, 7], "Inverse Phi array of 'abracadabra'");
    assert_eq(test_helper("a"), [1], "Inverse Phi array of 'a'");
    assert_eq(test_helper("aaaaa"), [5,0,1,2,3], "Inverse Phi array of 'aaaaa'");
    assert_eq(test_helper("abcde"), [1,2,3,4,5], "Inverse Phi array of 'abcde'");
    assert_eq(test_helper("edcba"), [5,0,1,2,3], "Inverse Phi array of 'edcba'");
    assert_eq(test_helper(""), [], "Inverse Phi array of empty string");
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
    if (!text || index1 < 0 || index2 < 0 || index1 >= text.length || index2 >= text.length) { return 0; }
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
    assert_eq(lcp_query("mississippi", 2, 5), 3, "LCP of suffixes starting at 2 and 5 in 'mississippi'");
    assert_eq(lcp_query("hello", 0, 0), 5, "LCP of suffixes starting at 0 and 0 in 'hello'");
    assert_eq(lcp_query("", 0, 0), 0, "LCP of suffixes in empty string");
}

/**
 * @name LCP
 * @kind disable
 * @type length
 * @description Longest Common Prefix array
 * @tutorial The Longest Common Prefix (LCP) array stores the lengths of the longest common prefixes between consecutive suffixes in the suffix array of a string. Formally, for a given text \(T[1..n]\) and its suffix array \(\mathsf{SA}\), the LCP array \(\mathsf{LCP}[1..n]\) is defined such that \(\mathsf{LCP}[1] = 0\) and \(\mathsf{LCP}[i] = \text{lcp}(T[\mathsf{SA}[i]..n], T[\mathsf{SA}[i-1]..n])\) for each \(i \in [2..n]\), where \(\text{lcp}(S_1, S_2)\) denotes the length of the longest common prefix between the suffixes \(S_1\) and \(S_2\).
 * @wikipedia Longest_common_prefix_array
 */
function construct_lcp_array(text: string, suffix_array: number[]): number[] {
    if(!text || !suffix_array) { return []; }
    const result: number[] = [0];

    for (let i = 1; i < suffix_array.length; i++) {
        result.push(lcp_query(text, suffix_array[i], suffix_array[i - 1]));
    }

    return result;
}

export function test_lcp_array() {
    assert_eq(construct_lcp_array("banana", [5, 3, 1, 0, 4, 2]), [0, 1, 3, 0, 0, 2], "LCP array of 'banana'");
    assert_eq(construct_lcp_array("abracadabra", [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), [0,1,4,1,1,0,3,0,0,0,2], "LCP array of 'abracadabra'");
    assert_eq(construct_lcp_array("", []), [], "LCP array of empty string");
    assert_eq(construct_lcp_array("a", [0]), [0], "LCP array of 'a'");
    assert_eq(construct_lcp_array("aaaaa", [4, 3, 2, 1, 0]), [0, 1, 2, 3, 4], "LCP array of 'aaaaa'");
    assert_eq(construct_lcp_array("abcde", [0, 1, 2, 3, 4]), [0, 0, 0, 0, 0], "LCP array of 'abcde'");
}

/**
 * @name &Sigma; LCP
 * @description Sum of LCP array values
 * @tutorial The sum of the Longest Common Prefix (LCP) array values provides a measure of the total length of common prefixes between consecutive suffixes in the suffix array of a string. Formally, for a given LCP array \(\mathsf{LCP}[1..n]\), the sum \(\Sigma \mathsf{LCP}\) is defined as \(\sum_{i=1}^{n} \mathsf{LCP}[i]\).
 * @wikipedia Longest_common_prefix_array
 */
function count_lcp_array(lcp_array : number[]) : number {
    if(!lcp_array) { return 0; }
    return lcp_array.reduce((a, b) => a + b, 0);
}

export function test_sum_lcp_array() {
    assert_eq(count_lcp_array([0, 1, 3, 0, 0, 2]), 6, "Sum of LCP array of 'banana'");
    assert_eq(count_lcp_array([0,1,4,1,1,0,3,0,0,0,2]), 12, "Sum of LCP array of 'abracadabra'");
    assert_eq(count_lcp_array([]), 0, "Sum of LCP array of empty string");
    assert_eq(count_lcp_array([0]), 0, "Sum of LCP array of 'a'");
    assert_eq(count_lcp_array([0, 1, 2, 3, 4]), 10, "Sum of LCP array of 'aaaaa'");
    assert_eq(count_lcp_array([0, 0, 0, 0, 0]), 0, "Sum of LCP array of 'abcde'");
}


/**
 * @name PLCP
 * @kind disable
 * @type length
 * @description Permuted Longest Common Prefix array
 * @tutorial The Permuted Longest Common Prefix (PLCP) array reorders the values of the Longest Common Prefix (LCP) array based on the respective positions in the string. Formally, for the inverse suffix array \(\mathsf{ISA}\) and LCP array \(\mathsf{LCP}\) of the text \(T[1..n]\), the PLCP array \(\mathsf{PLCP}[1..n]\) is defined such that \(\mathsf{PLCP}[i] = \mathsf{LCP}[\mathsf{ISA}[i]]\) for each \(i \in [1..n]\).
 * @wikipedia Longest_common_prefix_array
 * @cite karkkainen09plcp
 */
function construct_plcp_array(inverse_suffix_array: number[], lcp_array: number[]): number[] {
    if(!inverse_suffix_array || !lcp_array) { return []; }
    if (inverse_suffix_array.length !== lcp_array.length) {
        throw new AlgorithmError("Inverse suffix array and LCP array must have the same length.", "PLCP", { inverse_suffix_array, lcp_array });
    }
    const n = inverse_suffix_array.length;
    return [...new Array(n).keys()].map(i => lcp_array[inverse_suffix_array[i]]);
}

export function test_plcp_array() {
    function test_helper(text: string) : number[] {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        const lcp_array = construct_lcp_array(text, suffix_array);
        return construct_plcp_array(inverse_suffix_array, lcp_array);
    }
    assert_eq(test_helper("banana"), [0,3,2,1,0,0], "PLCP array of 'banana'");
    assert_eq(test_helper("abracadabra"), [4,3,2,1,0,1,0,1,0,0,0], "PLCP array of 'abracadabra'");
    assert_eq(test_helper(""), [], "PLCP array of empty string");
    assert_eq(test_helper("a"), [0], "PLCP array of 'a'");
    assert_eq(test_helper("aaaaa"), [4, 3, 2, 1, 0], "PLCP array of 'aaaaa'");
    assert_eq(test_helper("abcde"), [0, 0, 0, 0, 0], "PLCP array of 'abcde'");
}


/**
 * @name &Psi;
 * @kind disable
 * @type index
 * @description Psi Array
 * @tutorial The Psi array provides a mapping inside the suffix array that advances by one text position. Formally, given the suffix array \(\mathsf{SA}\) and the inverse suffix array \(\mathsf{ISA}\) of the text \(T[1..n]\), the Psi array \(\mathsf{\Psi}\) is defined such that \(\mathsf{\Psi}[i] = \mathsf{ISA}[\mathsf{SA}[i] + 1]\) if \(\mathsf{SA}[i] + 1 < n\), and \(\mathsf{\Psi}[i] = \bot\) if \(\mathsf{SA}[i] + 1 = n\), for each \(i \in [1..n]\).
 * @cite grossi05csa
 */
function construct_psi_array(suffix_array: number[], inverse_suffix_array: number[]): number[] {
    if(!suffix_array || !inverse_suffix_array) { return []; }
    const n = suffix_array.length;
    return [...new Array(n).keys()].map(i => 
        (suffix_array[i] + 1 < n) ? inverse_suffix_array[suffix_array[i] + 1] : n
    );
}

export function test_psi_array() {
    function test_helper(text: string) : number[] {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        return construct_psi_array(suffix_array, inverse_suffix_array);
    }
    assert_eq(test_helper("banana"), [6,4,5,2,0,1], "Psi array of 'banana'");
    assert_eq(test_helper("abracadabra"), [11, 5, 6, 7, 8, 9,10, 4, 1, 0, 3], "Psi array of 'abracadabra'");
    assert_eq(test_helper(""), [], "Psi array of empty string");
    assert_eq(test_helper("a"), [1], "Psi array of 'a'");
    assert_eq(test_helper("aaaaa"), [5,0,1,2,3], "Psi array of 'aaaaa'");
    assert_eq(test_helper("abcde"), [1,2,3,4,5], "Psi array of 'abcde'");
    assert_eq(test_helper("edcba"), [5,0,1,2,3], "Psi array of 'edcba'");
}

/**
 * @name LynF
 * @kind disable
 * @type factor
 * @description Lyndon Factorization
 * @tutorial The Lyndon factorization of a string decomposes it into a sequence of Lyndon words in lexicographically non-increasing order, where a Lyndon word is a non-empty string that is strictly smaller in lexicographical order than all of its non-trivial rotations.
 * @cite chen58lyndon
 */
function construct_lyndon_factorization(text: string, inverse_suffix_array: number[]): boolean[] {
    if(!text || !inverse_suffix_array) { return []; }
    const n: number = text.length;
    if (n === 0) { return []; }
    const result: boolean[] = new Array<boolean>(n).fill(false);

    if (inverse_suffix_array.length < n) {
        throw new AlgorithmError(`Inverse suffix array (inverse_suffix_array) must have a length of at least text.length (${n}), but got ${inverse_suffix_array.length}.`, "LynF", { text, inverse_suffix_array });
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

export function test_lyndon_factorization() {
    function test_helper(text: string) : boolean[] {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        return construct_lyndon_factorization(text, inverse_suffix_array);
    }
    assert_eq(test_helper("banana"), [true, false, true, false, true, true], "Lyndon factorization of 'banana'");
    assert_eq(test_helper("abracadabra"), [false,false,false,false,false,false,true,false,false,true,true], "Lyndon factorization of 'abracadabra'");
    assert_eq(test_helper("aaaaa"), [true, true, true, true, true], "Lyndon factorization of 'aaaaa'");
    assert_eq(test_helper("abcde"), [false, false, false, false, true], "Lyndon factorization of 'abcde'");
}

function delta(substring_complexity: number[]): [number, number] {
    if (substring_complexity.length === 0) {
        throw new AlgorithmError("Input array 'substring_complexity' cannot be empty.", "delta", { substring_complexity });
    }
    let bestlength: number = 1;
    let bestval: number = substring_complexity[0];
    for (let i = 1; i < substring_complexity.length; ++i) {
        const currentRatio: number = substring_complexity[i] / (i + 1);
        if (currentRatio > bestval) {
            bestlength = i + 1; // Update bestlength to the current 1-based index
            bestval = currentRatio; // Update bestval to the new maximum ratio
        }
    }
    return [bestlength, bestval];
}


/**
 * @name &delta;
 * @description Substring Complexity Measure
 * @tutorial The substring complexity measure quantifies the maximum ratio of substring complexity to length. Given an array of substring complexities for lengths \(1\) to \(n\), it computes the maximum value of \(\frac{\mathsf{SC}[k]}{k}\) for \(k \in [1..n]\), where \(\mathsf{SC}[k]\) is the substring complexity for length \(k\).
 * @cite raskhodnikova13sublinear
 */
function count_delta(substring_complexity: number[]): number {
    if (!substring_complexity) { return 0; }
    return delta(substring_complexity)[1];
}

export function test_delta() {
    assert_eq(count_delta([3, 3, 3, 3, 2, 1]), 3, "Delta of substring complexity [3, 3, 3, 3, 2, 1]");
    assert_eq(count_delta([5, 8, 9, 10, 12]), 5, "Delta of substring complexity [5, 8, 9, 10, 12]");
    assert_eq(count_delta([1, 1, 1, 1]), 1, "Delta of substring complexity [1, 1, 1, 1]");
    assert_eq(count_delta([2, 4, 6, 8]), 2, "Delta of substring complexity [2, 4, 6, 8]");
    assert_eq(count_delta([1]), 1, "Delta of substring complexity [1]");
}

/**
 * @name max &delta;
 * @description Substring Complexity Measure Length
 * @tutorial The substring complexity measure length identifies the substring length that maximizes the ratio of substring complexity to length. Given an array of substring complexities for lengths \(1\) to \(n\), it computes the length \(k\) that maximizes \(\frac{\mathsf{SC}[k]}{k}\), where \(\mathsf{SC}[k]\) is the substring complexity for length \(k\).
 * @cite raskhodnikova13sublinear
 */
function count_delta_argmax(substring_complexity: number[]): number {
    if (!substring_complexity) { return 0; }
    return delta(substring_complexity)[0];
}

export function test_delta_argmax() {
    assert_eq(count_delta_argmax([3, 3, 3, 3, 2, 1]), 1, "Delta argmax of substring complexity [3, 3, 3, 3, 2, 1]");
    assert_eq(count_delta_argmax([1, 1, 1, 1]), 1, "Delta argmax of substring complexity [1, 1, 1, 1]");
    assert_eq(count_delta_argmax([2, 10, 6, 8]), 2, "Delta argmax of substring complexity [2, 10, 6, 8]");
    assert_eq(count_delta_argmax([2, 3, 20, 8]), 3, "Delta argmax of substring complexity [2, 3, 20, 8]");
    assert_eq(count_delta_argmax([1]), 1, "Delta argmax of substring complexity [1]");
}

/**
 * @name SC
 * @kind disable
 * @type length
 * @description Substring Complexity Array
 * @tutorial The substring complexity array quantifies the number of distinct substrings of various lengths within a string. Given the Longest Common Prefix (LCP) array of a string, the substring complexity array \(\mathsf{SC}[1..n]\) is defined such that for each length \(k \in [1..n]\), \(\mathsf{SC}[k]\) represents the count of distinct substrings of length \(k\). The computation leverages the LCP values to efficiently determine the number of new substrings introduced at each length.
 * @cite raskhodnikova13sublinear
 */
function construct_substring_complexity(lcp_array: number[]): number[] {
    if(!lcp_array) { return []; }
  const n: number = lcp_array.length;
  const ret: number[] = new Array<number>(n);

  const c = new Map<number, number>();
     lcp_array.forEach((ele: number) => {
       c.set(ele, (c.get(ele) || 0) + 1);
     });

  let count: number = 0; // Accumulator for the current complexity value.

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

export function test_substring_complexity() {
    function test_helper(text: string) : number[] {
        const suffix_array = construct_rotation_array(text);
        const lcp_array = construct_lcp_array(text, suffix_array);
        const substring_complexity = construct_substring_complexity(lcp_array);
        return substring_complexity;
    }
    assert_eq(test_helper("banana"), [3, 3, 3, 3, 2, 1], "Substring complexity of 'banana'");
}


/**
 * Conjugates a string by splitting it at a given shift point and rejoining the parts.
 * For example, conjugate_string("abcde", 2) would return "cdeab".
 * @param text The input string.
 * @param shift The number of characters to shift the string by.
 * @returns The conjugated string.
 */
function conjugate_string(text: string, shift: number): string {
    if (!text) { return ""; }

    if(shift < 0 || shift > text.length) {
        throw new AlgorithmError("Shift value must be between 0 and the length of the string.", "conjugate_string", { text, shift });
    }
    if(text.length === 0 || shift === 0) {
        return text;
    }
    return text.substring(shift) + text.substring(0, shift);
}

export function test_conjugate_string() {
    assert_eq(conjugate_string("abcde", 2), "cdeab", "Conjugate 'abcde' by 2");
    assert_eq(conjugate_string("hello", 0), "hello", "Conjugate 'hello' by 0");
    assert_eq(conjugate_string("rotation", 3), "ationrot", "Conjugate 'rotation' by 3");
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
function select_query(text: string, pattern: string, nth: number): number;
function select_query(text: readonly boolean[], pattern: boolean, nth: number): number;
function select_query(text: string | readonly boolean[], pattern: string | boolean, nth: number): number {
    if (!text) { return -1; }
    if (nth <= 0) {
        throw new AlgorithmError("The 'nth' parameter must be a positive integer for 1-based indexing.", "select_query", { text, pattern, nth });
    }

    let pos: number = -1; // Initialize position to -1, so the first `text.indexOf` starts from index 0.
    for (let k = 0; k < nth; ++k) { // Loop 'nth' times to find the 'nth' occurrence
        if (typeof text === 'string') {
            pos = text.indexOf(pattern as string, pos + 1);
        } else {
            pos = text.indexOf(pattern as boolean, pos + 1);
        }
        if (pos === -1) {
            return -1;
        }
    }
    return pos;
}

export function test_select_query() {
    assert_eq(select_query("", "a", 1), -1, "1st occurrence of 'a' in empty string (not found)");
    assert_eq(select_query("banana", "a", 1), 1, "1st occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 2), 3, "2nd occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 3), 5, "3rd occurrence of 'a' in 'banana'");
    assert_eq(select_query("banana", "a", 4), -1, "4th occurrence of 'a' in 'banana' (not found)");
    assert_eq(select_query("abracadabra", "abra", 1), 0, "1st occurrence of 'abra' in 'abracadabra'");
    assert_eq(select_query("abracadabra", "abra", 2), 7, "2nd occurrence of 'abra' in 'abracadabra'");
    assert_eq(select_query("abracadabra", "xyz", 1), -1, "1st occurrence of 'xyz' in 'abracadabra' (not found)");
    assert_eq(select_query("aaaaa", "aa", 2), 1, "2nd occurrence of 'aa' in 'aaaaa'");
    assert_eq(select_query("aaaaa", "aa", 3), 2, "3rd occurrence of 'aa' in 'aaaaa'");
    assert_eq(select_query("aaaaa", "aa", 4), 3, "4th occurrence of 'aa' in 'aaaaa'");
    assert_eq(select_query("aaaaa", "aa", 5), -1, "5th occurrence of 'aa' in 'aaaaa' (not found)");
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
    if (!text) { return 0; }
    const prefix = text.slice(0, index);
    return [...prefix].filter(c => c === pattern).length;
}

export function test_rank_query() {
    assert_eq(rank_query("banana", "a", 6), 3, "Count of 'a' in 'banana'");
    assert_eq(rank_query("banana", "a", 3), 1, "Count of 'a' in 'ban'");
    assert_eq(rank_query("100101", "1", 6), 3, "Count of '1' in '100101'");
    assert_eq(rank_query("100101", "0", 4), 2, "Count of '0' in '1001'");
    assert_eq(rank_query("aaaaa", "a", 5), 5, "Count of 'a' in 'aaaaa'");
    assert_eq(rank_query("aaaaa", "a", 3), 3, "Count of 'a' in 'aaa'");
    assert_eq(rank_query("aaaaa", "a", 0), 0, "Count of 'a' in ''");
    assert_eq(rank_query("", "a", 0), 0, "Count of 'a' in empty string");
    assert_eq(rank_query("hello", "z", 5), 0, "Count of 'z' in 'hello'");
}

/**
 * @name LF
 * @kind disable
 * @type index
 * @description Last-to-First Mapping Array
 * @tutorial The Last-to-First (LF) mapping array identifies characters from the last column with those from the first column of the Burrows-Wheeler Transform (BWT) that orginated from the same text position. Given the first column \(\mathsf{F}\) and \(\textsf{BWT}\), the LF mapping array \(\mathsf{LF}[1..n]\) is defined such that \(\mathsf{LF}[i] = \text{select}(\textsf{F}, \textsf{BWT}[i], \text{rank}(\textsf{BWT}, \textsf{BWT}[i], i))\) for each \(i \in [1..n]\), where \(\text{rank}(\textsf{BWT}, c, i)\) counts the occurrences of character \(c\) in the prefix \(\textsf{BWT}[1..i]\), and \(\text{select}(\textsf{F}, c, r)\) finds the position of the \(r\)-th occurrence of character \(c\) in \(\textsf{F}\).
 * @wikipedia Burrows%E2%80%93Wheeler_transform
 * @cite burrows94bwt
 */
function construct_lf_array(first_array : string, bw_transform : string) : number[] {
    if (!first_array || !bw_transform) { return []; }
    if (first_array.length !== bw_transform.length) {
        throw new AlgorithmError("First array and BWT must have the same length.", "LF", { first_array, bw_transform });
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

export function test_lf_array() {
    function test_helper(text: string) : number[] {
        const rotation_array = construct_rotation_array(text);
        const bw_transform = construct_bw_transform(text, rotation_array);
        const first_array = construct_first_array(bw_transform);
        return construct_lf_array(first_array, bw_transform);
    }
    assert_eq(test_helper("banana"),[4,5,3,0,1,2], "LF array of 'banana'");
    assert_eq(test_helper("abracadabra"), [9, 8, 0,10, 7, 1, 2, 3, 4, 5, 6], "LF array of 'abracadabra'");
    assert_eq(test_helper("a"), [0], "LF array of 'a'");
    assert_eq(test_helper("aaaaa"), [0, 1, 2, 3, 4], "LF array of 'aaaaa'");
    assert_eq(test_helper("abcde"), [4,0,1,2,3], "LF array of 'abcde'");
    assert_eq(test_helper("edcba"), [1,2,3,4,0], "LF array of 'edcba'");
    assert_eq(test_helper(""), [], "LF array of empty string");
}

/**
 * @name S/L
 * @kind disable
 * @type length
 * @description S/L SAIS type string
 * @tutorial The S/L type string classifies each character in a string as either S-type or L-type based on the lexicographic order of the suffixes starting at those characters. A character at position \(i\) is classified as S-type if the suffix starting at \(i\) is lexicographically smaller than the suffix starting at \(i+1\), and L-type if it is larger. If the suffixes are equal, the type is determined by the type of the suffix starting at \(i+1\). Additionally, an S-type character that is the first character or immediately preceded by an L-type character is marked as S*-type.
 * @cite nong11sais
 */
function construct_sl_string(text : string) : string[] {
    if(!text) { return []; }
    const n = text.length;
    const result = new Array(n);
    let type = 'S';
    result[n-1] = type;
    for(let i = n-2; i >= 0; --i) {
        if(text[i+1] > text[i]) {
            type = 'S';
        }
        else if(text[i+1] < text[i]) {
            type = 'L';
            if(result[i+1] == 'S') { result[i+1] = 'S*'; }
        }
        result[i] = type;
    }
    if (result[0] == 'S') { result[0] = 'S*'; }
    return result;
}

export function test_sl_string() {
    assert_eq(construct_sl_string("banana"), ['L','S*','L','S*','L','S*'], "SL string of 'banana'");
    assert_eq(construct_sl_string("abracadabra"), ['S*','S','L','S*','L','S*','L','S*','S','L','S*'], "SL string of 'abracadabra'");
    assert_eq(construct_sl_string("aaaaa"), ['S*','S','S','S','S'], "SL string of 'aaaaa'");
    assert_eq(construct_sl_string("abcde"), ['S*','S','S','S','S'], "SL string of 'abcde'");
    assert_eq(construct_sl_string("edcba"), ['L','L','L','L','S*'], "SL string of 'edcba'");
    assert_eq(construct_sl_string("a"), ['S*'], "SL string of 'a'");
    assert_eq(construct_sl_string(""), [], "SL string of empty string");
}

/**
 * @name LPF
 * @kind disable
 * @type length
 * @description Longest Previous Factor array
 * @tutorial The Longest Previous Factor (LPF) array stores the length of the longest prefix of each suffix of a string that matches a substring starting at a prior position within the same string. Formally, for a given text \(T[1..n]\), the LPF array \(\mathsf{LPF}[1..n]\) is defined such that \(\mathsf{LPF}[i] = \max_{j \in [1..i-1]} \text{lcp}(T[i..n], T[j..n])\) for each \(i \in [1..n]\), where \(\text{lcp}(S_1, S_2)\) denotes the length of the longest common prefix between the suffixes \(S_1\) and \(S_2\).
 * @reference franek03lpf
 */
function construct_lpf_array(text: string): number[] {
    if(!text) { return []; }
    const n: number = text.length;
    const result: number[] = new Array<number>(n);
    result[0] = 0;
    for (let i = 1; i < n; i++) {
        let maxLCP = 0;
        for (let j = 0; j < i; j++) { // Check all positions before i
            let lcp = 0; // Use incremental LCP computation
            while (i + lcp < n && j + lcp < n && text[i + lcp] === text[j + lcp]) {
                lcp++;
            }
            maxLCP = Math.max(maxLCP, lcp);
        }
        result[i] = maxLCP;
    }
    return result;
}

export function test_lpf_array() {
    assert_eq(construct_lpf_array("banana"), [0, 0, 0, 3, 2, 1], "LPF array of 'banana'");
    assert_eq(construct_lpf_array("abracadabra"), [0,0,0,1,0,1,0,4,3,2,1], "LPF array of 'abracadabra'");
    assert_eq(construct_lpf_array("aaaaa"), [0, 4, 3, 2, 1], "LPF array of 'aaaaa'");
    assert_eq(construct_lpf_array(""), [], "LPF array of empty string");
    assert_eq(construct_lpf_array("a"), [0], "LPF array of 'a'");
    assert_eq(construct_lpf_array("abcde"), [0, 0, 0, 0, 0], "LPF array of 'abcde'");
}

/**
 * @name LPnF
 * @kind disable
 * @type length
 * @description Longest Previous Non-Overlapping Factor array
 * @tutorial The Longest Previous Non-Overlapping Factor (LPnF) array stores the length of the longest prefix of each suffix of a string that matches a substring ending at a prior position within the same string. Formally, for a given text \(T[1..n]\), the LPnF array \(\mathsf{LPnF}[1..n]\) is defined such that \(\mathsf{LPnF}[i] = \max_{j \in [1..i-1]} \min(i-j,\text{lcp}(T[i..n], T[j..n]))\) for each \(i \in [1..n]\), where \(\text{lcp}(S_1, S_2)\) denotes the length of the longest common prefix between the suffixes \(S_1\) and \(S_2\).
 * @reference crochemore11computing
 */
function construct_lpnf_array(text: string): number[] {
    if(!text) { return []; }
    const n: number = text.length;
    const result: number[] = new Array<number>(n);
    result[0] = 0;
    for (let i = 1; i < n; i++) {
        let maxLCP = 0;
        for (let j = 0; j < i; j++) { // Check all positions before i
            let lcp = 0; // Use incremental LCP computation
            while (i + lcp < n && j + lcp < i && text[i + lcp] === text[j + lcp]) {
                lcp++;
            }
            maxLCP = Math.max(maxLCP, lcp);
        }
        result[i] = maxLCP;
    }
    return result;
}
export function test_lpnf_array() {
    assert_eq(construct_lpnf_array("banana"), [0, 0, 0, 2, 2, 1], "LPnF array of 'banana'");
    assert_eq(construct_lpnf_array("abracadabra"), [0,0,0,1,0,1,0,4,3,2,1], "LPnF array of 'abracadabra'");
    assert_eq(construct_lpnf_array("aaaaa"), [0, 1, 2, 2, 1], "LPnF array of 'aaaaa'");
    assert_eq(construct_lpnf_array(""), [], "LPnF array of empty string");
    assert_eq(construct_lpnf_array("a"), [0], "LPnF array of 'a'");
    assert_eq(construct_lpnf_array("abcde"), [0, 0, 0, 0, 0], "LPnF array of 'abcde'");
}


/**
 * @name LNF
 * @kind disable
 * @type length
 * @description Longest Next Factor array
 * @tutorial The Longest Next Factor (LNF) array is the LPF array of the reversed text.
 * @reference franek03lpf
 */
function construct_lnf_array(text: string): number[] {
    if(!text) { return []; }
    const revtext: string = text.split('').reverse().join('');
    const lpfarray: number[] = construct_lpf_array(revtext);

    const n: number = lpfarray.length;
    return [...new Array(n).keys()].map((i) => lpfarray[n-1-i]); 
}

export function test_lnf_array() {
    assert_eq(construct_lnf_array("banana"), [0,1,2,3,0,0], "LNF array of 'banana'");
    assert_eq(construct_lnf_array("abracadabra"), [1,2,3,4,0,1,0,1,0,0,0], "LNF array of 'abracadabra'");
    assert_eq(construct_lnf_array("aaaaa"), [1,2,3,4,0], "LNF array of 'aaaaa'");
    assert_eq(construct_lnf_array(""), [], "LNF array of empty string");
    assert_eq(construct_lnf_array("a"), [0], "LNF array of 'a'");
    assert_eq(construct_lnf_array("abcde"), [0,0,0,0,0], "LNF array of 'abcde'");
}


function greedy_factorize(factor_array : readonly number[]) : boolean[] {
    if(!factor_array) { return []; }
    const n: number = factor_array.length;
    if(n === 0) { return []; }
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
 * @name LZSS
 * @kind disable
 * @type factor
 * @description LZSS Factorization
 * @tutorial The Lempel-Ziv-Storer-Szymanski (LZSS) factorization decomposes a string into a sequence of factors, where each factor is either a new character or a reference to a substring with an earlier starting position. The factorization is constructed greedily by selecting the longest previous factor at each position in the string. Formally, given a text \(T[1..n]\) the length of the factor starting at position \(i\) is \(\max \{1\} \cup \{\text{lcp}(T[i..n], T[j..n]) \mid j \in [1..i-1] \}\).
 * @cite storer82lzss
 */
function construct_lzss_factorization(lpf_array: readonly number[]): boolean[] {
    return greedy_factorize(lpf_array);
}

export function test_lzss_factorization() {
    function test_helper(text: string, expected : boolean[]) {
        const lpf_array = construct_lpf_array(text);
        const lzss_factorization = construct_lzss_factorization(lpf_array);
        assert_eq(lzss_factorization, expected, `LZSS factorization test for '${text}'`);
    }
    test_helper("banana", [true, true, true, false, false, true]);
    test_helper("abracadabra", [true, true, true, true, true, true, true, false, false, false, true]);
    test_helper("aaaaa", [true, false, false, false, true]);
    test_helper("abcde", [true, true, true, true, true]);
    test_helper("", []);
    test_helper("a", [true]);
}

/**
 * @name LZSSno
 * @kind disable
 * @type factor
 * @description LZSS non-overlapping Factorization
 * @tutorial The Lempel-Ziv-Storer-Szymanski non-overlapping (LZSSno) factorization decomposes a string into a sequence of factors, where each factor is either a new character or a reference to a substring ending at an earlier positition. The factorization is constructed greedily by selecting the longest previous non-overlapping factor at each position in the string. Formally, given a text \(T[1..n]\) the length of the factor starting at position \(i\) is \(\max \{1\} \cup \{\min(i-j, \text{lcp}(T[i..n], T[j..n])) \mid j \in [1..i-1] \}\).
 * @cite storer82lzss
 */
function construct_lzssno_factorization(lpnf_array: readonly number[]): boolean[] {
    return greedy_factorize(lpnf_array);
}

export function test_lzssno_factorization() {
    function test_helper(text: string, expected : boolean[]) {
        const lpnf_array = construct_lpnf_array(text);
        const lzssno_factorization = construct_lzssno_factorization(lpnf_array);
        assert_eq(lzssno_factorization, expected, `LZSSno factorization test for '${text}'`);
    }
    test_helper("banana", [true, true, true, false, true, true]);
    test_helper("abracadabra", [true, true, true, true, true, true, true, false, false, false, true]);
    test_helper("aaaaa", [true, true, false, true, true]);
    test_helper("abcde", [true, true, true, true, true]);
    test_helper("", []);
    test_helper("a", [true]);
}


function greedy_factorize_with_new_letter(factor_array : readonly number[]) : boolean[] {
    if(!factor_array) { return []; }
    const n: number = factor_array.length;
    if(n === 0) { return []; }
    const result: boolean[] = new Array<boolean>(n).fill(false);
    for (let i: number = 0; i < n; ) {
        const currentFactor: number = factor_array[i];
        let distance = currentFactor === 0 ? 1 : Math.min(currentFactor+1, n - i);
        result[i+distance-1] = true;
        i += distance;
    }
    return result;
}

/**
 * @name LZ77
 * @kind disable
 * @type factor
 * @description LZ77 Factorization
 * @tutorial The Lempel-Ziv-77  (LZ77) factorization decomposes a string into a sequence of factors, where each factor is either a new character or a reference to a substring starting at a prior position within the same string. The factorization is constructed greedily by selecting the longest previous factor at each position in the string, with an additional character appended to the factor. Formally, given a text \(T[1..n]\) the length of the factor starting at position \(i\) is \(\max \{1\} \cup \{\text{lcp}(T[i..n], T[j..n]) + 1 \mid j \in [1..i-1] \}\).
 * @cite ziv77lz
 */
function construct_lz77_factorization(lpf_array: readonly number[]): boolean[] {
    return greedy_factorize_with_new_letter(lpf_array);
}
export function test_lz77_factorization() {
    function test_helper(text: string, expected : boolean[]) {
        const lpf_array = construct_lpf_array(text);
        const lz77_factorization = construct_lz77_factorization(lpf_array);
        assert_eq(lz77_factorization, expected, `LZ77 factorization test for '${text}'`);
    }
    test_helper("banana", [true, true, true, false, false, true]);
    test_helper("abracadabra", [true, true, true, false, true, false, true, false, false, false, true]);
    test_helper("aaaaa", [true, false, false, false, true]);
    test_helper("abcde", [true, true, true, true, true]);
    test_helper("", []);
    test_helper("a", [true]);
}



/**
 * @name rLZSS
 * @kind disable
 * @type factor
 * @description Reverse LZSS Factorization
 * @tutorial The Reverse Lempel-Ziv-Storer-Szymanski (rLZSS) factorization of a string is the LZSS factorization of the reversed string obtained by reading the string in reversed order.
 * @cite storer82lzss
 */
function construct_reverse_lzss_factorization(lnf_array: readonly number[]): boolean[] {
    if(!lnf_array) { return []; }
    const copied_lnf_array = lnf_array.slice().reverse();
    return greedy_factorize(copied_lnf_array);
}

export function test_reverse_lzss_factorization() {
    function test_helper(text: string, expected : boolean[]) {
        const lpf_array = construct_lnf_array(text);
        const lzss_factorization = construct_reverse_lzss_factorization(lpf_array);
        assert_eq(lzss_factorization, expected, `LZSS factorization test for '${text}'`);
    }
    test_helper("ananab", [true, true, true, false, false, true]);
    test_helper("arbadacarba", [true, true, true, true, true, true, true, false, false, false, true]);
    test_helper("aaaaa", [true, false, false, false, true]);
    test_helper("abcde", [true, true, true, true, true]);
    test_helper("", []);
    test_helper("a", [true]);
}

/**
 * @name LexParse
 * @kind disable
 * @type factor
 * @tutorial Text factorization using lexicographic parse
 * @description Lexicographic Parse Factorization
 * @tutorial The lexicographic parse (lexparse) decomposes a string into a sequence of factors based on the permuted longest common prefix (PLCP) array. Each factor is determined by the longest prefix of the suffix starting at the current position that matches a substring starting at a lexicographically smaller suffix position. Formally, for a given text \(T[1..n]\) and its PLCP array \(\mathsf{PLCP}[1..n]\), the length of the factor starting at position \(i\) is \(\mathsf{PLCP}[i]\) or 1 if \(\mathsf{PLCP}[i] = 0\).
 * @cite navarro21approximation
 */
function construct_lexparse_factorization(plcp_array: readonly number[]): boolean[] {
    return greedy_factorize(plcp_array);
}

export function test_lexparse_factorization() {
    function test_helper(text: string, expected : boolean[]) {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        const lcp_array = construct_lcp_array(text, suffix_array);
        const plcp_array = construct_plcp_array(inverse_suffix_array, lcp_array);
        const lexparse_factorization = construct_lexparse_factorization(plcp_array);
        assert_eq(lexparse_factorization, expected, `LexParse factorization test for '${text}'`);
    }
    test_helper("banana", [true, false, false, true, true, true]);
    test_helper("abracadabra", [false,false,false,true,true,true,true,true,true,true,true]);
    test_helper("aaaaa", [false, false, false, true, true]);
    test_helper("abcde", [true, true, true, true, true]);
    test_helper("", []);
    test_helper("a", [true]);
}

/**
 * @name NSS
 * @kind disable
 * @type index
 * @description Next Smaller Suffix Array
 * @tutorial The Next Smaller Suffix (NSS) array identifies the subsequent suffix in text order that is lexicographically smaller than the current suffix. Given the inverse suffix array \(\mathsf{ISA}\) of a text \(T[1..n]\), the NSS array \(\mathsf{NSS}[1..n]\) is defined such that \(\mathsf{NSS}[i] = \min \{ j > i \mid \mathsf{ISA}[j] < \mathsf{ISA}[i] \}\) if such a \(j\) exists, and \(\mathsf{NSS}[i] = \bot \) otherwise, for each \(i \in [1..n]\).
 */
function construct_nss_array(inverse_suffix_array: readonly number[]): number[] {
    if (!inverse_suffix_array) { return []; }
    const n: number = inverse_suffix_array.length;
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

export function test_nss_array() {
    assert_eq(construct_nss_array([5, 3, 1, 0, 4, 2]), [1,2,3,6,5,6], "NSS array of inverse suffix array [5, 3, 1, 0, 4, 2]");
    assert_eq(construct_nss_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), [1,2,11,6,6,6,11,10,10,10,11], "NSS array of inverse suffix array [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]");
    assert_eq(construct_nss_array([]), [], "NSS array of empty inverse suffix array");
    assert_eq(construct_nss_array([0]), [1], "NSS array of inverse suffix array [0]");
    assert_eq(construct_nss_array([1, 0]), [1, 2], "NSS array of inverse suffix array [1, 0]");
    assert_eq(construct_nss_array([0, 1]), [2, 2], "NSS array of inverse suffix array [0, 1]");
    assert_eq(construct_nss_array([0, 1, 2, 3, 4]), [5, 5, 5, 5, 5], "NSS array of inverse suffix array [0, 1, 2, 3, 4]");
    assert_eq(construct_nss_array([4, 3, 2, 1, 0]), [1,2,3,4,5], "NSS array of inverse suffix array [4, 3, 2, 1, 0]");
}


/**
 * @name PSS
 * @kind disable
 * @type index
 * @description Previous Smaller Suffix Array
 * @tutorial The Previous Smaller Suffix (PSS) array identifies the preceding suffix in text order that is lexicographically smaller than the current suffix. Given the inverse suffix array \(\mathsf{ISA}\) of a text \(T[1..n]\), the PSS array \(\mathsf{PSS}[1..n]\) is defined such that \(\mathsf{PSS}[i] = \max \{ j < i \mid \mathsf{ISA}[j] < \mathsf{ISA}[i] \}\) if such a \(j\) exists, and \(\mathsf{PSS}[i] = \bot \) otherwise, for each \(i \in [1..n]\).
 */
function construct_pss_array(inverse_suffix_array: readonly number[]): number[] {
    if (!inverse_suffix_array) { return []; }
    const n: number = inverse_suffix_array.length;
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

export function test_pss_array() {
    assert_eq(construct_pss_array([5, 3, 1, 0, 4, 2]), [6,6,6,6,3,3], "PSS array of inverse suffix array [5, 3, 1, 0, 4, 2]");
    assert_eq(construct_pss_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), [11,11,11,2,3,4,2,6,7,8,6], "PSS array of inverse suffix array [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]");
    assert_eq(construct_pss_array([]), [], "PSS array of empty inverse suffix array");
    assert_eq(construct_pss_array([0]), [1], "PSS array of inverse suffix array [0]");
    assert_eq(construct_pss_array([1, 0]), [2,2], "PSS array of inverse suffix array [1, 0]");
    assert_eq(construct_pss_array([0, 1]), [2,0], "PSS array of inverse suffix array [0, 1]");
    assert_eq(construct_pss_array([0, 1, 2, 3, 4]), [5,0,1,2,3], "PSS array of inverse suffix array [0, 1, 2, 3, 4]");
    assert_eq(construct_pss_array([4, 3, 2, 1, 0]), [5,5,5,5,5], "PSS array of inverse suffix array [4, 3, 2, 1, 0]");
}

/**
 * @name Lyndon
 * @kind disable
 * @type length
 * @description Lyndon Array
 * @tutorial The Lyndon array stores the lengths of the longest Lyndon words starting at each position in a string. A Lyndon word is a non-empty string that is strictly smaller in lexicographical order than all of its non-trivial rotations. Given the Next Smaller Suffix (NSS) array \(\mathsf{NSS}[1..n]\) of a text \(T[1..n]\), the Lyndon array \(\mathsf{Lyndon}[1..n]\) is defined such that \(\mathsf{Lyndon}[i] = \mathsf{NSS}[i] - i\) if \(\mathsf{NSS}[i] \neq \bot\), and \(\mathsf{Lyndon}[i] = n - i + 1\) otherwise, for each \(i \in [1..n]\).
 * @cite franek16algorithms
 */
function construct_lyndon_array(nss_array: readonly number[]): number[] {
    if (!nss_array) { return []; }
    const n: number = nss_array.length;
    let result: number[] = new Array<number>(n);
    for (let i = 0; i < n; ++i) {
        result[i] = (nss_array[i] === n) ? (n - i) : (nss_array[i] - i);
    }
    return result;
}

export function test_lyndon_array() {
    assert_eq(construct_lyndon_array([1,2,3,6,5,6]), [1,1,1,3,1,1], "Lyndon array from NSS [1,2,3,6,5,6]");
    assert_eq(construct_lyndon_array([1,2,11,6,6,6,11,10,10,10,11]), [1,1,9,3,2,1,5,3,2,1,1], "Lyndon array from NSS [1,2,11,6,6,6,11,10,10,10,11]");
    assert_eq(construct_lyndon_array([]), [], "Lyndon array from empty NSS");
    assert_eq(construct_lyndon_array([1]), [1], "Lyndon array from NSS [1]");
    assert_eq(construct_lyndon_array([1,2]), [1,1], "Lyndon array from NSS [1,2]");
    assert_eq(construct_lyndon_array([2,2]), [2,1], "Lyndon array from NSS [2,2]");
    assert_eq(construct_lyndon_array([5,5,5,5,5]), [5,4,3,2,1], "Lyndon array from NSS [5,5,5,5,5]");
    assert_eq(construct_lyndon_array([1,2,3,4,5]), [1,1,1,1,1], "Lyndon array from NSS [1,2,3,4,5]");
}


/**
 * @name necklace
 * @kind hidden
 * @type string 
 * @description Lexicographically smallest conjugate of a given string.
 * @tutorial The necklace conjugate of a string is the lexicographically smallest string that can be obtained by rotating the original string. This involves generating all possible rotations (conjugates) of the string and selecting the smallest one in lexicographic order.
 */
function construct_necklace_conjugate_transform(text: string): string {
    if (!text) { return ""; }
    const n: number = text.length;
    let best_conj: string = text;

    for (let i: number = 0; i < n; ++i) {
        const conj: string = conjugate_string(text, i);
        if (conj < best_conj) {
            best_conj = conj;
        }
    }
    return best_conj;
}

export function test_necklace_conjugate_transform() {
    assert_eq(construct_necklace_conjugate_transform("bca"), "abc", "Necklace conjugate of 'bca'");
    assert_eq(construct_necklace_conjugate_transform("cab"), "abc", "Necklace conjugate of 'cab'");
    assert_eq(construct_necklace_conjugate_transform("abc"), "abc", "Necklace conjugate of 'abc'");
    assert_eq(construct_necklace_conjugate_transform("aaaa"), "aaaa", "Necklace conjugate of 'aaaa'");
    assert_eq(construct_necklace_conjugate_transform("abab"), "abab", "Necklace conjugate of 'abab'");
    assert_eq(construct_necklace_conjugate_transform("baba"), "abab", "Necklace conjugate of 'baba'");
    assert_eq(construct_necklace_conjugate_transform(""), "", "Necklace conjugate of empty string");
    assert_eq(construct_necklace_conjugate_transform("a"), "a", "Necklace conjugate of 'a'");
}

/**
 * @name Invert
 * @kind hidden
 * @type string 
 * @description Inverts a string by mapping each character to its complementary character
 * @tutorial The invert transform of a string maps each character to its complementary character based on the minimum and maximum characters in the string. Specifically, given a text \(T[1..n]\), the invert transform \(\mathsf{Invert}(T)\) maps each character \(T[i]\) to \(\text{max_j} T[j] - (c - \text{min_j T[j]})\).
 */
function construct_invert_transform(text : string) {
    if (!text) { return ""; }
    const sorted_chars = [...text].sort();
    const minchar = sorted_chars[0];
    const maxchar = sorted_chars.reverse()[0];
    function invert(c : string) : string {
        return String.fromCharCode(maxchar.charCodeAt(0) - (c.charCodeAt(0) - minchar.charCodeAt(0)));
    }
    return [...text].map(invert).join('');
}

export function test_invert_transform() {
    assert_eq(construct_invert_transform("abc"), "cba", "Invert transform of 'abc'");
    assert_eq(construct_invert_transform("hello"), "lohhe", "Invert transform of 'hello'");
    assert_eq(construct_invert_transform("abcdxyz"), "zyxwcba", "Invert transform of 'abcdxyz'");
    assert_eq(construct_invert_transform("aaaa"), "aaaa", "Invert transform of 'aaaa'");
    assert_eq(construct_invert_transform(""), "", "Invert transform of empty string");
    assert_eq(construct_invert_transform("a"), "a", "Invert transform of 'a'");
}

/**
 * @name Revert
 * @kind hidden
 * @type string
 * @description Reverts a string by reading it backwards
 * @tutorial The revert transform of a string is obtained by reversing the order of its characters. Given a text \(T[1..n]\), the revert transform \(\mathsf{Revert}(T)\) produces the string \(T[n] T[n-1] \ldots T[1]\), where the characters are arranged in the opposite order, effectively reading the string backwards.
 */
function construct_revert_transform(text: string) {
    if (!text) { return ""; }
    return text.split('').reverse().join('');
}

export function test_revert_transform() {
    assert_eq(construct_revert_transform("abc"), "cba", "Revert transform of 'abc'");
    assert_eq(construct_revert_transform("hello"), "olleh", "Revert transform of 'hello'");
    assert_eq(construct_revert_transform("abcdxyz"), "zyxdcba", "Revert transform of 'abcdxyz'");
    assert_eq(construct_revert_transform("aaaa"), "aaaa", "Revert transform of 'aaaa'");
    assert_eq(construct_revert_transform(""), "", "Revert transform of empty string");
    assert_eq(construct_revert_transform("a"), "a", "Revert transform of 'a'");
}

function phrases_from_factorizations(text: string, factorization: readonly boolean[]): string[] {
    if(!text || !factorization) { return []; }
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

function omega_order(strA: string, strB: string): number {
    if (strA === undefined || strB === undefined) { throw new AlgorithmError("Undefined string input(s) for omega order comparison.", "OmegaOrder", { strA, strB }); }
    if (strA === strB) { return 0; }
    const maxLength = Math.max(strA.length, strB.length)*3;

    for(let i = 0; i < maxLength ; ++i) { 
        if (strA[i % strA.length] < strB[i % strB.length]) { return -1; }
        if (strA[i % strA.length] > strB[i % strB.length]) { return +1; }
    }
    return strA.length < strB.length ? -1 : +1;
}

export function test_omega_order() {
    assert_eq(omega_order("abc", "bca"), -1, "'abc' < 'bca'");
    assert_eq(omega_order("bca", "abc"), 1, "'bca' > 'abc'");
    assert_eq(omega_order("abab", "abab"), 0, "'abab' == 'abab'");
    assert_eq(omega_order("a", "aa"), -1, "'a' < 'aa'");
    assert_eq(omega_order("", "a"), -1, "'' < 'a'");
    assert_eq(omega_order("a", ""), 1, "'a' > ''");
    assert_eq(omega_order("aa", "a"), 1, "'aa' > 'a'");
    assert_eq(omega_order("abcd", "abce"), -1, "'abcd' < 'abce'");
    assert_eq(omega_order("abce", "abcd"), 1, "'abce' > 'abcd'");
}

/**
 * @name CSA
 * @kind disable
 * @type index
 * @description Circular Suffix Array
 * @tutorial The Circular Suffix Array (CSA) of a string is a permutation of text positions that assigns a rank to each cyclic rotation (conjugate) of the Lyndon factors of the string based on the omega order. Given a text \(T[1..n]\) and its Lyndon factorization, the CSA \(\mathsf{CSA}[1..n]\) is defined such that \(\mathsf{CSA}[i]\) gives the starting position in \(T\) of the \(i\)-th smallest conjugate in \(\omega\)-order among all conjugates of the Lyndon factors of \(T\).
 * @cite hon13spaceefficient
 */
function construct_circular_suffix_array(text: string, lyndon_factorization: readonly boolean[]): number[] {
    if (!text || !lyndon_factorization) { return []; }
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
    conjugates.sort((a,b) => omega_order(a.str, b.str));
    return [...conjugates].map(conjugate => conjugate.pos);
}

export function test_circular_suffix_array() {
    function test_helper(input: string, expected: number[], description: string) {
        const isa = construct_inverse_suffix_array(construct_suffix_array(input));
        const lyndonFactorization = construct_lyndon_factorization(input, isa);
        const csa = construct_circular_suffix_array(input, lyndonFactorization);
        assert_eq(csa, expected, description);
    }
    test_helper("banana", [5, 1, 3, 0, 2, 4], "Circular suffix array of 'banana'");
    test_helper("abracadabra", [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2], "Circular suffix array of 'abracadabra'");
    test_helper("", [], "Circular suffix array of empty string");
    test_helper("a", [0], "Circular suffix array of 'a'");
    test_helper("aaaaa", [0, 1, 2, 3, 4], "Circular suffix array of 'aaaaa'");
    test_helper("edcba", [4, 3, 2, 1, 0], "Circular suffix array of 'edcba'");
    test_helper("abcde", [0, 1, 2, 3, 4], "Circular suffix array of 'abcde'");
}

/**
 * @name CISA
 * @kind disable
 * @type index
 * @description Inverse Circular Suffix Array
 * @tutorial The inverse circular suffix array (ICSA) is the reverse permutation of the circular suffix array (CSA). 
 * @cite hon13spaceefficient
 */
function construct_inverse_circular_suffix_array(circular_suffix_array: readonly number[]): number[] {
    if (!circular_suffix_array) { return []; }
    return construct_inverse_suffix_array(circular_suffix_array);
}

export function test_inverse_circular_suffix_array() {
    assert_eq(construct_inverse_circular_suffix_array([5, 3, 1, 0, 4, 2]), [3, 2, 5, 1, 4, 0], "Inverse circular suffix array of 'banana'");
    assert_eq(construct_inverse_circular_suffix_array([10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2]), [2, 6, 10, 3, 7, 4, 8, 1, 5, 9, 0], "Inverse circular suffix array of 'abracadabra'");
    assert_eq(construct_inverse_circular_suffix_array([]), [], "Inverse circular suffix array of empty array");
    assert_eq(construct_inverse_circular_suffix_array([0]), [0], "Inverse circular suffix array of [0]");
    assert_eq(construct_inverse_circular_suffix_array([4, 3, 2, 1, 0]), [4, 3, 2, 1, 0], "Inverse circular suffix array of [4,3,2,1,0]");
    assert_eq(construct_inverse_circular_suffix_array([0, 1, 2, 3, 4]), [0, 1, 2, 3, 4], "Inverse circular suffix array of [0,1,2,3,4]");
}

/**
 * @name BBWTi
 * @kind disable
 * @type index
 * @description Text-Indices of the Bijective Burrows-Wheeler Transform
 * @tutorial The Bijective Burrows-Wheeler Transform Indices (BBWTi) array stores the text positions of the circular sufix array (CSA) decremented by one, but mapping positions at the beginning of Lyndon factors to the end of the respective Lyndon factor.
 * @cite bannai25survey
 */
function construct_bbw_indices(lyndon_factorization: readonly boolean[], circular_suffix_array: readonly number[]): number[] {
    if (!lyndon_factorization || !circular_suffix_array) { return []; }
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
    function test_helper(input: string, expected: number[], description: string) {
        const isa = construct_inverse_suffix_array(construct_suffix_array(input));
        const lyndonFactorization = construct_lyndon_factorization(input, isa);
        const csa = construct_circular_suffix_array(input, lyndonFactorization);
        const bbwt_indices = construct_bbw_indices(lyndonFactorization, csa);
        assert_eq(bbwt_indices, expected, description);
    }
    test_helper("banana", [5,2,4,0,1,3], "BBWTi of 'banana'");
    test_helper("abracadabra", [10,9,6,2,4,7,0,3,5,8,1], "BBWTi of 'abracadabra'");
    test_helper("", [], "BBWTi of empty string");
    test_helper("a", [0], "BBWTi of 'a'");
    test_helper("edcba", [4,3,2,1,0], "BBWTi of 'edcba'");
    test_helper("abcde", [4,0,1,2,3], "BBWTi of 'abcde'");
    test_helper("aaaaa", [0,1,2,3,4], "BBWTi of 'aaaaa'");
}

/**
 * @name BBWT
 * @kind disable
 * @type string
 * @description Bijective Burrows-Wheeler Transform
 * @tutorial The Bijective Burrows-Wheeler Transform (BBWT) of a string rearranges the characters of the original string based on the Bijective Burrows-Wheeler Transform Indices (BBWTi). Given a text \(T[1..n]\) and its BBWTi array \(\mathsf{BBWTi}[1..n]\), the BBWT \(\mathsf{BBWT}[1..n]\) is defined such that \(\mathsf{BBWT}[i] = T[\mathsf{BBWTi}[i]]\) for each \(i \in [1..n]\).
 * @cite bannai25survey
 */
function construct_bbw_transform(text: string, bbw_indices: readonly number[]): string {
    if (!text || !bbw_indices) { return ""; }
    return [...bbw_indices].map(pos => text[pos]).join('');
}

export function test_bbw_transform() {
    function test_helper(input: string, expected: string, description: string) {
        const isa = construct_inverse_suffix_array(construct_suffix_array(input));
        const lyndonFactorization = construct_lyndon_factorization(input, isa);
        const csa = construct_circular_suffix_array(input, lyndonFactorization);
        const bbwt_indices = construct_bbw_indices(lyndonFactorization, csa);
        const bbwTransform = construct_bbw_transform(input, bbwt_indices);
        assert_eq(bbwTransform, expected, description);
    }
    test_helper("banana", "annbaa", "BBWT of 'banana'");
    test_helper("abracadabra", "ardrcaaaabb", "BBWT of 'abracadabra'");
    test_helper("", "", "BBWT of empty string");
    test_helper("a", "a", "BBWT of 'a'");
    test_helper("edcba", "abcde", "BBWT of 'edcba'");
    test_helper("abcde", "eabcd", "BBWT of 'abcde'");
}

/**
 * @name BBWT&#8315;&#185;
 * @kind disable
 * @type string
 * @description Inverse Bijective Burrows-Wheeler Transform
 * @tutorial The inverse Bijective Burrows-Wheeler Transform (inverse BBWT), also called the Gessel-Reutenauer transformation, applies the LF-mapping on the cycles in the BBWT to extract all Lyndon words, which sorted in lexicographically descreing order recovers the original text.
 * @cite bannai25survey
 */
function construct_inverse_bbw_transform(bbw_transform : string): string {
    if(!bbw_transform) { return ""; }
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
            if(character_number == 0) {
                throw new AlgorithmError('character_number is zero in inverse BBWT', 'construct_inverse_bbw_transform', bbw_transform);
            }
            if(bbw_transform.split(cur_char).length + 1 <= character_number) {
                throw new AlgorithmError('character_number exceeds occurrences in inverse BBWT', 'construct_inverse_bbw_transform', bbw_transform);
            }
            pos = select_query(bbw_transform, cur_char, character_number);
        }
        const finalConjugate = construct_necklace_conjugate_transform(conjugate.join(''))
        conjugates.push(finalConjugate);
    }
    conjugates.sort();
    conjugates.reverse();
    return conjugates.join('');
}

export function test_inverse_bbw_transform() {
    assert_eq(construct_inverse_bbw_transform("annbaa"), "banana", "Inverse BBWT of 'annbaa'");
    assert_eq(construct_inverse_bbw_transform("ardrcaaaabb"), "abracadabra", "Inverse BBWT of 'ardrcaaaabb'");
    assert_eq(construct_inverse_bbw_transform(""), "", "Inverse BBWT of empty string");
    assert_eq(construct_inverse_bbw_transform("a"), "a", "Inverse BBWT of 'a'");
    assert_eq(construct_inverse_bbw_transform("abcde"), "edcba", "Inverse BBWT of 'abcde'");
    assert_eq(construct_inverse_bbw_transform("eabcd"), "abcde", "Inverse BBWT of 'eabcd'");
}


function random_ternary_string(length : number) : string {
  const ternaryChars = 'abc'; // The possible characters for the string
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ternaryChars.length);
    result += ternaryChars.charAt(randomIndex);
  }
  return result;
}

export function test_bbwt_random() {
    for(let i = 0; i < 20; ++i) {
        const randomString = random_ternary_string(2+i);
        const isa = construct_inverse_suffix_array(construct_suffix_array(randomString));
        const lyndonFactorization = construct_lyndon_factorization(randomString, isa);
        const csa = construct_circular_suffix_array(randomString, lyndonFactorization);
        const bbwt_indices = construct_bbw_indices(lyndonFactorization, csa);
        const bbwTransform = construct_bbw_transform(randomString, bbwt_indices);
        const invertedString = construct_inverse_bbw_transform(bbwTransform);
        assert_eq(invertedString, randomString, `Inverse BBWT of random string '${randomString}'`);
    }
}

export function test_phi_array_identity() {
    function test_helper(text: string) {
        const suffix_array = construct_suffix_array(text);
        const inverse_suffix_array = construct_inverse_suffix_array(suffix_array);
        const phi_array = construct_phi_array(suffix_array, inverse_suffix_array);
        const inverse_phi_array = construct_inverse_phi_array(suffix_array, inverse_suffix_array);

        for (let i = 0; i < text.length; i++) {
            if(phi_array[i] === text.length || inverse_phi_array[i] === text.length) {
                continue
            }
            const phi_of_inverse_phi = inverse_phi_array[phi_array[i]];
            assert_eq(phi_of_inverse_phi, i, `Phi and Inverse Phi identity failed for index ${i} in text '${text}'`);
            const inverse_phi_of_phi = phi_array[inverse_phi_array[i]];
            assert_eq(inverse_phi_of_phi, i, `Phi and Inverse Phi identity failed for index ${i} in text '${text}'`);
        }
    }
    test_helper("banana");
    test_helper("abracadabra");
    test_helper("a");
    test_helper("aaaaa");
    test_helper("abcde");
    test_helper("edcba");
    test_helper("");
    for(let i = 0; i < 20; ++i) {
        const randomString = random_ternary_string(2+i);
        test_helper(randomString);
    }
}

/**
 * Edge case tests for error handling
 */
export function test_error_handling() {
    // Test construct_bw_transform with mismatched array lengths
    try {
        construct_bw_transform("abc", [1, 2]);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test conjugate_string with negative shift
    try {
        conjugate_string("hello", -1);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test conjugate_string with shift greater than length
    try {
        conjugate_string("hello", 10);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test select_query with zero nth parameter
    try {
        select_query("banana", "a", 0);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test select_query with negative nth parameter
    try {
        select_query("banana", "a", -1);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test construct_plcp_array with mismatched lengths
    try {
        construct_plcp_array([1, 2, 3], [1, 2]);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test construct_lf_array with mismatched lengths
    try {
        construct_lf_array("abc", "ab");
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test construct_lyndon_factorization with short inverse suffix array
    try {
        construct_lyndon_factorization("hello", [1, 2]);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test delta with empty array
    try {
        delta([]);
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }

    // Test omega_order with undefined strings
    try {
        omega_order(undefined as any, "abc");
        throw new Error("Should have thrown AlgorithmError");
    } catch (e) {
        if (!(e instanceof AlgorithmError)) {
            throw new Error("Expected AlgorithmError");
        }
    }
}

/**
 * Boundary condition tests
 */
export function test_boundary_conditions() {
    // Test count_period with very large border arrays
    const largeArray = new Array(1000).fill(0).map((_, i) => i < 500 ? i : 500);
    const result1 = count_period(largeArray);
    assert_eq(result1 > 0, true, "count_period should handle large arrays");

    // Test construct_suffix_array with repeated characters
    assert_eq(construct_suffix_array("aaaaaaaaaa"), [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], "Suffix array of repeated chars");

    // Test construct_border_array with very long string
    const longString = "ab".repeat(500);
    const result2 = construct_border_array(longString);
    assert_eq(result2.length, 1000, "Border array of long string");

    // Test construct_suffix_array with special characters
    const result3 = construct_suffix_array("!@#$%");
    assert_eq(result3.length, 5, "Suffix array with special chars");

    // Test construct_rotation_array with single repeating character
    assert_eq(construct_rotation_array("bbbb"), [0, 1, 2, 3], "Rotation array of repeated char");

    // Test lcp_query with out of bounds indices
    assert_eq(lcp_query("hello", -1, 0), 0, "LCP with negative index1");
    assert_eq(lcp_query("hello", 0, -1), 0, "LCP with negative index2");
    assert_eq(lcp_query("hello", 10, 0), 0, "LCP with index1 > length");
    assert_eq(lcp_query("hello", 0, 10), 0, "LCP with index2 > length");

    // Test rank_query with index at boundaries
    assert_eq(rank_query("hello", "l", 0), 0, "Rank query at index 0");
    assert_eq(rank_query("hello", "l", 5), 2, "Rank query at end");

    // Test construct_index_array with zero length
    assert_eq(construct_index_array(0), [], "Index array with 0 length");

    // Test construct_index_array with negative length
    assert_eq(construct_index_array(-5), [], "Index array with negative length");
}

/**
 * Tests for null and undefined inputs
 */
export function test_null_undefined_inputs() {
    // Test various functions with null inputs
    assert_eq(count_period(null as any), 0, "count_period with null");
    assert_eq(count_exponent(null as any), 0, "count_exponent with null");
    assert_eq(count_regularity(null as any), 'empty', "count_regularity with null");
    assert_eq(construct_suffix_array(null as any), [], "construct_suffix_array with null");
    assert_eq(construct_border_array(null as any), [], "construct_border_array with null");
    assert_eq(construct_bw_transform(null as any, null as any), "", "construct_bw_transform with null");
    assert_eq(construct_first_array(null as any), "", "construct_first_array with null");
    assert_eq(construct_rotation_array(null as any), [], "construct_rotation_array with null");
    assert_eq(construct_inverse_suffix_array(null as any), [], "construct_inverse_suffix_array with null");
    assert_eq(construct_lcp_array(null as any, null as any), [], "construct_lcp_array with null");
    assert_eq(count_lcp_array(null as any), 0, "count_lcp_array with null");
    assert_eq(construct_plcp_array(null as any, null as any), [], "construct_plcp_array with null");
    assert_eq(construct_psi_array(null as any, null as any), [], "construct_psi_array with null");
    assert_eq(construct_lyndon_factorization(null as any, null as any), [], "construct_lyndon_factorization with null");
    assert_eq(count_delta(null as any), 0, "count_delta with null");
    assert_eq(count_delta_argmax(null as any), 0, "count_delta_argmax with null");
    assert_eq(construct_substring_complexity(null as any), [], "construct_substring_complexity with null");
    assert_eq(conjugate_string(null as any, 0), "", "conjugate_string with null");
    assert_eq(select_query(null as any, "a", 1), -1, "select_query with null");
    assert_eq(rank_query(null as any, "a", 0), 0, "rank_query with null");
    assert_eq(construct_lf_array(null as any, null as any), [], "construct_lf_array with null");
    assert_eq(construct_sl_string(null as any), [], "construct_sl_string with null");
    assert_eq(construct_lpf_array(null as any), [], "construct_lpf_array with null");
    assert_eq(construct_lnf_array(null as any), [], "construct_lnf_array with null");
    assert_eq(construct_nss_array(null as any), [], "construct_nss_array with null");
    assert_eq(construct_pss_array(null as any), [], "construct_pss_array with null");
    assert_eq(construct_lyndon_array(null as any), [], "construct_lyndon_array with null");
    assert_eq(construct_necklace_conjugate_transform(null as any), "", "construct_necklace_conjugate_transform with null");
    assert_eq(construct_invert_transform(null as any), "", "construct_invert_transform with null");
    assert_eq(construct_revert_transform(null as any), "", "construct_revert_transform with null");
    assert_eq(construct_circular_suffix_array(null as any, null as any), [], "construct_circular_suffix_array with null");
    assert_eq(construct_inverse_circular_suffix_array(null as any), [], "construct_inverse_circular_suffix_array with null");
    assert_eq(construct_bbw_indices(null as any, null as any), [], "construct_bbw_indices with null");
    assert_eq(construct_bbw_transform(null as any, null as any), "", "construct_bbw_transform with null");
    assert_eq(construct_inverse_bbw_transform(null as any), "", "construct_inverse_bbw_transform with null");
    assert_eq(lcp_query(null as any, 0, 0), 0, "lcp_query with null");
    assert_eq(construct_inverse_phi_array(null as any, null as any), [], "construct_inverse_phi_array with null");
}

/**
 * Complex integration tests
 */
export function test_complex_integration() {
    // Test full suffix array pipeline with unicode
    const unicode = "café";
    const sa = construct_suffix_array(unicode);
    const isa = construct_inverse_suffix_array(sa);
    const lcp = construct_lcp_array(unicode, sa);
    
    assert_eq(sa.length, unicode.length, "SA length matches");
    assert_eq(isa.length, unicode.length, "ISA length matches");
    assert_eq(lcp.length, unicode.length, "LCP length matches");

    // Test BWT transform and inverse with complex string
    const text = "mississippi";
    const ra = construct_rotation_array(text);
    const bwt = construct_bw_transform(text, ra);
    
    assert_eq(bwt.length, text.length, "BWT length matches");

    // Test Lyndon factorization consistency
    const texts = ["banana", "abracadabra", "aaaaa", "abcde"];
    
    texts.forEach(t => {
        const sa2 = construct_suffix_array(t);
        const isa2 = construct_inverse_suffix_array(sa2);
        const lf = construct_lyndon_factorization(t, isa2);
        
        assert_eq(lf.length, t.length, `LF length matches for ${t}`);
        assert_eq(lf.filter(x => x).length > 0, true, `At least one factor end for ${t}`);
    });

    // Test BBWT round trip with various strings
    const testStrings = ["a", "ab", "abc", "aaa", "abab"];
    
    testStrings.forEach(t => {
        const sa3 = construct_suffix_array(t);
        const isa3 = construct_inverse_suffix_array(sa3);
        const lf3 = construct_lyndon_factorization(t, isa3);
        const csa = construct_circular_suffix_array(t, lf3);
        const bbwti = construct_bbw_indices(lf3, csa);
        const bbwt3 = construct_bbw_transform(t, bbwti);
        const recovered = construct_inverse_bbw_transform(bbwt3);
        
        assert_eq(recovered, t, `BBWT round trip for ${t}`);
    });
}

/**
 * @name LZ78
 * @kind disable
 * @type factor
 * @description LZ78 Factorization
 * @tutorial The Lempel-Ziv-78 (LZ78) factorization decomposes a string into a sequence of factors based on previously seen substrings. Each factor consists of a reference to the longest previously seen factor (or zero if none exists) followed by a new character. 
 * @cite ziv78lz
 */
function construct_lz78_factorization(text: string): boolean[] {
    if (!text) { return []; }
    const n: number = text.length;
    const factorization: boolean[] = new Array(n).fill(false);
    const dictionary: Map<string, number> = new Map();
    let currentIndex: number = 0;
    while (currentIndex < n) {
        let currentSubstring: string = "";

        // Find the longest prefix in the dictionary
        for (let j = currentIndex; j < n; j++) {
            currentSubstring += text[j];
            if(!dictionary.has(currentSubstring)) { break; }
        }

        // Add the new factor to the dictionary
        const newFactor: string = currentSubstring;
        dictionary.set(newFactor, currentIndex);

        // Mark the end of the factor
        factorization[currentIndex + newFactor.length - 1] = true;

        // Move to the next position
        currentIndex += newFactor.length;
    }
    return factorization;
}
export function test_lz78_factorization() {
    assert_eq(construct_lz78_factorization("ababc"), [true, true, false, true, true], "LZ78 factorization of 'ababc'");
    assert_eq(construct_lz78_factorization("aaaaa"), [true, false, true, false, true], "LZ78 factorization of 'aaaaa'");
    assert_eq(construct_lz78_factorization("banana"), [true, true, true, false, true, true], "LZ78 factorization of 'banana'");
    assert_eq(construct_lz78_factorization("abracadabra"), [true, true, true, false, true, false, true, false, true, false, true], "LZ78 factorization of 'abracadabra'");
    assert_eq(construct_lz78_factorization(""), [], "LZ78 factorization of empty string");
    assert_eq(construct_lz78_factorization("a"), [true], "LZ78 factorization of 'a'");
    assert_eq(construct_lz78_factorization("abcde"), [true, true, true, true, true], "LZ78 factorization of 'abcde'");
    assert_eq(construct_lz78_factorization("edcba"), [true, true, true, true, true], "LZ78 factorization of 'edcba'");
    assert_eq(construct_lz78_factorization(null), [], "LZ78 factorization of null input");
}


/**
 * @name LZW
 * @kind disable
 * @type factor
 * @description LZW Factorization
 * @tutorial The Lempel-Ziv-Welch (LZW) factorization decomposes a string into a sequence of factors by building a dictionary of previously seen substrings. Each factor is the longest prefix of the remaining text that exists in the dictionary, followed by the next character.
 * @cite welch84lzw
 */
function construct_lzw_factorization(text : string): boolean[] {
  if (!text) {
    return [];
  }
  const n = text.length;
  const factorization = new Array(n).fill(false);
  const dictionary = new Map();
  // Initialize the dictionary with single characters
  for (let i = 0; i < n; i++) {
    const char = text[i];
    if (!dictionary.has(char)) {
      dictionary.set(char, dictionary.size);
    }
  }
  for(let i = 0; i < n; ) {
    let s = "";
    for (let j = i; j < n; j++) {
      s += text[j];
      if (!dictionary.has(s)) { 
           s = s.slice(0, -1);
           break; 
           }
    }
    let endpos = i + s.length - 1;
    if (endpos >= n) {
      // Reached the end of the text
      factorization[n - 1] = true;
      break;
    }
    if (s.length == 0) {
      throw new AlgorithmError("LZW factorization failed to find a valid substring.", "construct_lzw_factorization", { text
      });
    }
    factorization[endpos] = true;
    // Add new substring to the dictionary
    if (i+s.length < n) { s += text[i+s.length]; }
    if (!dictionary.has(s)) {
      dictionary.set(s, dictionary.size);
    }
    // Move to the next position
    i = endpos+1;
  }
  return factorization;
}


export function test_lzw_factorization() {
    assert_eq(construct_lzw_factorization("ababc"), [true, true, false, true, true], "LZW factorization of 'ababc'");
    assert_eq(construct_lzw_factorization("aaaaa"), [true, false, true, false, true], "LZW factorization of 'aaaaa'");
    assert_eq(construct_lzw_factorization("banana"), [true, true, true, false, true, true], "LZW factorization of 'banana'");
    assert_eq(construct_lzw_factorization("abracadabra"), [true,true,true,true,true,true,true,false,true,false,true], "LZW factorization of 'abracadabra'");
    assert_eq(construct_lzw_factorization(""), [], "LZW factorization of empty string");
    assert_eq(construct_lzw_factorization("a"), [true], "LZW factorization of 'a'");
    assert_eq(construct_lzw_factorization("abcde"), [true, true, true, true, true], "LZW factorization of 'abcde'");
    assert_eq(construct_lzw_factorization("edcba"), [true, true, true, true, true], "LZW factorization of 'edcba'");
    assert_eq(construct_lzw_factorization(null), [], "LZW factorization of null input");
}
    

    
    
    
    
/**
 * @name NeckF
 * @kind disable
 * @type factor
 * @description Necklace Factorization
 * @tutorial The Necklace factorization is the Lyndon factorization colliding all equal Lyndon factors to a single factor that is a necklace. The number of factors is the number of distinct Lyndon factors.
 * @cite chen58lyndon
 */
function construct_necklace_factorization(text: string, lyndon_factorization: boolean[]): boolean[] {
    if (!text || !lyndon_factorization) { return []; }
    const n: number = text.length;
    const necklace_factorization: boolean[] = new Array(n).fill(false);
    let factor_start: number = 0;
    let last_factor = "";
    while (factor_start < n) {
        let factor_end: number = factor_start;
        while (factor_end < n && lyndon_factorization[factor_end] == false) {
            factor_end++;
        }
        // Now factor_end is at the end of the current Lyndon factor
        const current_factor = text.slice(factor_start, factor_end + 1);
        if(current_factor === last_factor) {
            // assert_eq(necklace_factorization[factor_start-1], true, "Previous factor end should be marked true for equal Lyndon factors");
            necklace_factorization[factor_start-1] = false;
            necklace_factorization[factor_end] = true;
            factor_start = factor_end + 1;
            continue;
        }
        last_factor = current_factor;
        // Mark the end of the necklace factor
        necklace_factorization[factor_end] = true;
        // Move to the next factor
        factor_start = factor_end + 1;
    }
    return necklace_factorization;
}
export function test_necklace_factorization() {
    function test_helper(input: string, expected: boolean[], description: string) {
        const isa = construct_inverse_suffix_array(construct_suffix_array(input));
        const lyndonFactorization = construct_lyndon_factorization(input, isa);
        const necklaceFactorization = construct_necklace_factorization(input, lyndonFactorization);
        assert_eq(necklaceFactorization, expected, description);
    }
    test_helper("banana", [true, false, false, false, true, true], "Necklace factorization of 'banana'");
    test_helper("abracadabra", [false,false,false,false,false,false,true,false,false,true,true], "Necklace factorization of 'abracadabra'");
    test_helper("", [], "Necklace factorization of empty string");
    test_helper("a", [true], "Necklace factorization of 'a'");
    test_helper("aaaaa", [false, false, false, false, true], "Necklace factorization of 'aaaaa'");
    test_helper("edcba", [true, true, true, true, true], "Necklace factorization of 'edcba'");
    test_helper("abcde", [false, false, false, false, true], "Necklace factorization of 'abcde'");
}


/**
 * @name o-pali
 * @kind disable
 * @type length
 * @description Odd Maximal Palindromic Length Array
 * @tutorial The odd maximal palindromic length array (o-pali) stores at each position the length of the left arm of the longest odd-length palindromic substring centered at that position, excluding the position itself in the length measurement. Hence, a palindrome of length \(2k+1\) contributes \(k\) to the o-pali array at its center position.
 * @cite manacher75new
 */
function construct_odd_maximal_palindromic_length_array(text: string): number[] {
    if (!text) { return []; }
    const n: number = text.length;
    const o_pali: number[] = new Array(n).fill(0);
    let center: number = 0;
    let right: number = 0;
    for (let i = 0; i < n; i++) {
        let mirror: number = 2 * center - i;
        if (i < right) {
            o_pali[i] = Math.min(right - i, o_pali[mirror]);
        }
        // Expand around center i
        while (i - o_pali[i] - 1 >= 0 && i + o_pali[i] + 1 < n && text[i - o_pali[i] - 1] === text[i + o_pali[i] + 1]) {
            o_pali[i]++;
        }
        // Update center and right boundary
        if (i + o_pali[i] > right) {
            center = i;
            right = i + o_pali[i];
        }
    }
    return o_pali;
}
export function test_odd_maximal_palindromic_length_array() {
    assert_eq(construct_odd_maximal_palindromic_length_array("ababa"), [0,1,2,1,0], "o-pali of 'ababa'");
    assert_eq(construct_odd_maximal_palindromic_length_array("racecar"), [0,0,0,3,0,0,0], "o-pali of 'racecar'");
    assert_eq(construct_odd_maximal_palindromic_length_array(""), [], "o-pali of empty string");
    assert_eq(construct_odd_maximal_palindromic_length_array("a"), [0], "o-pali of 'a'");
    assert_eq(construct_odd_maximal_palindromic_length_array("abcde"), [0,0,0,0,0], "o-pali of 'abcde'");
}

/**
 * @name e-pali
 * @kind disable
 * @type length
 * @description Even Maximal Palindromic Length Array
 * @tutorial The even maximal palindromic length array (e-pali) stores at each position the length of the longest even-length palindromic substring centered between that and its preding position.
 * @cite manacher75new
 */
function construct_even_maximal_palindromic_length_array(text: string): number[] {
    if (!text) { return []; }
    const n: number = text.length;
    const e_pali: number[] = new Array(n).fill(0);
    let center: number = 0;
    let right: number = 0;
    for (let i = 0; i < n; i++) {
        let mirror: number = 2 * center - i + 1;
        if (i < right) {
            e_pali[i] = Math.min(right - i, e_pali[mirror]);
        }
        // Expand around center between i-1 and i
        while (i - e_pali[i] - 1 >= 0 && i + e_pali[i] < n && text[i - e_pali[i] - 1] === text[i + e_pali[i]]) {
            e_pali[i]++;
        }
        // Update center and right boundary
        if (i + e_pali[i] > right) {
            center = i - 1;
            right = i + e_pali[i];
        }
    }
    return e_pali;
}
export function test_even_maximal_palindromic_length_array() {
    assert_eq(construct_even_maximal_palindromic_length_array("abba"), [0,0,2,0], "e-pali of 'abba'");
    assert_eq(construct_even_maximal_palindromic_length_array("noon"), [0,0,2,0], "e-pali of 'noon'");
    assert_eq(construct_even_maximal_palindromic_length_array(""), [], "e-pali of empty string");
    assert_eq(construct_even_maximal_palindromic_length_array("a"), [0], "e-pali of 'a'");
    assert_eq(construct_even_maximal_palindromic_length_array("abcde"), [0,0,0,0,0], "e-pali of 'abcde'");
}


function get_lzend_reference(text : string, substring : string, factorization : boolean[]) : number {
  let startIndex = 0; 
  // Loop as long as an occurrence is found (indexOf returns -1 when no match)
  while((startIndex = text.indexOf(substring, startIndex)) !== -1) {
    if (factorization[startIndex + substring.length - 1]) {
      return startIndex; // Found an occurrence with a valid ending reference
    }
    startIndex += substring.length; 
  }
  return -1;
}

/**
 * @name LZend
 * @kind disable
 * @type factor
 * @description LZ-end Factorization
 * @tutorial The LZ-end factorization is a restriction of the Lempel-Ziv 77 factorization where each new factor, omitting its last new character, must be the longest possible prefix of the remaining text that also appears ending exactly at the end of a previous factor, or just a single character if no such match exists. 
 *
 * @cite kreft13lzend
 */
function construct_lzend_factorization(text : string): boolean[] {
  if (!text) {
    return [];
  }
  const n = text.length;
  const factorization = new Array(n).fill(false);
  for (let i = 0; i < n;) {
    let factor = "";
    let s = "";
    const prefix = text.slice(0, i);
    for (let j = i; j < n; j++) {
      s += text[j];
      if(prefix.indexOf(s) === -1) {
        break;
      }
      if(get_lzend_reference(prefix, s, factorization) !== -1) {
        factor = s;
      }
    }
    if(!factor) { factor = text[i]; }
    else { factor += text[i + factor.length - 1]; }

    let endpos = i + factor.length - 1;
    if (endpos >= n) {
      factorization[n - 1] = true;
      break;
    }
    factorization[endpos] = true;
    i = endpos + 1;
  }
  return factorization;
}
export function test_lzend_factorization() {
    assert_eq(construct_lzend_factorization("alabar_a_la_alabarda$"), [true,true,false,true,false,true,true,false,true,false,true,false,true,false,false,false,false,false,true,false,true], "LZ-end factorization of 'alabar_a_la_alabarda$'");
    assert_eq(construct_lzend_factorization("ababc"), [true, true, false, false, true], "LZ-end factorization of 'ababc'");
    assert_eq(construct_lzend_factorization("aaaaa"), [true, false, true, false, true], "LZ-end factorization of 'aaaaa'");
    assert_eq(construct_lzend_factorization("banana"), [true, true, true, false, false, true], "LZ-end factorization of 'banana'");
}



function is_stringattractor(text : string, attractor : readonly number[]) : boolean {
	const n = text.length;
	const posSet = new Set(attractor);

	for (let i = 0; i < n; i++) {
		let s = '';
		for (let j = i; j < n; j++) {
			s += text[j];

			// Check if at least one occurrence is hit
			let hit = false;
			for (let k = 0; k + s.length <= n; k++) {
				if (text.slice(k, k + s.length) === s) {
					for (let p = k; p < k + s.length; p++) {
						if (posSet.has(p)) {
							hit = true;
							break;
						}
					}
				}
				if (hit) break;
			}

			if (!hit) return false;
		}
	}
	return true;
}

/**
 * @name &Gamma;
 * @kind disable
 * @type factor
 * @description Leftmost Smallest String Attractor
 * @tutorial A string attractor is a set of positions in a string such that every distinct substring has at least one occurrence that crosses one of these positions. The smallest string attractor size is the minimum number of positions needed to form such a set. Here, \(\Gamma\) is the leftmost such smallest string attractor, i.e., the one that has the lexicographically smallest sequence of positions.
 * @cite kempa18stringattractors
 */
function construct_gamma_factorization(text : string) : boolean[] {
	if(!text) { return []; }
	const n = text.length;

	// Count all substrings
	const freq = new Map();
	for (let i = 0; i < n; i++) {
		let s = '';
		for (let j = i; j < n; j++) {
			s += text[j];
			freq.set(s, (freq.get(s) || 0) + 1);
		}
	}

	// Compute minimal substrings
	const minimal = [];
	for (const [s, f] of freq.entries()) {
		let minimalFlag = true;
		for (let i = 0; i < s.length && minimalFlag; i++) {
			const t = s.slice(0, i) + s.slice(i + 1);
			if (t.length > 0 && freq.get(t) <= f) {
				minimalFlag = false;
			}
		}
		if (minimalFlag) minimal.push(s);
	}

	// For each minimal substring, compute all positions that hit it
	const hits = minimal.map(s => {
		const set = new Set();
		for (let i = 0; i + s.length <= n; i++) {
			if (text.slice(i, i + s.length) === s) {
				for (let p = i; p < i + s.length; p++) {
					set.add(p);
				}
			}
		}
		return set;
	});

	const positions = [...Array(n).keys()];

	function backtrack(idx : number, chosen : Set<number>, best : Set<number>) : Set<number> {
		if (best.size > 0  && chosen.size >= best.size) return new Set<number>();

		// Check coverage
		let ok = true;
		for (const h of hits) {
			let covered = false;
			for (const p of chosen) {
				if (h.has(p)) {
					covered = true;
					break;
				}
			}
			if (!covered) {
				ok = false;
				break;
			}
		}

		if (ok) {
			return new Set<number>(chosen);
		}

		if (idx === positions.length) { return new Set<number>(); }

		// Include position
		chosen.add(positions[idx]);
		var res = backtrack(idx + 1, chosen, best);
    best = res.size > 0 ? res : best;
		chosen.delete(positions[idx]);

		// Exclude position
		var res = backtrack(idx + 1, chosen, best);
    best = res.size > 0 ? res : best;
    return best;
	}

  const ret = backtrack(0, new Set<number>(), new Set<number>());
  const result: boolean[] = new Array<boolean>(n).fill(false);
  ret.forEach((val) => result[val] = true);
  return result;
}

function factorization_to_positions(factorization : readonly boolean[]) : number[] {
    const positions: number[] = [];
    for (let i = 0; i < factorization.length; i++) {
        if (factorization[i]) {
            positions.push(i);
        }
    }
    return positions;
}

export function test_gamma_factorization() {
    function test_helper(text: string, exp_attr: readonly number[]) {
        const attractor_fact = construct_gamma_factorization(text);
        const attractor = factorization_to_positions(attractor_fact);
        assert_eq(is_stringattractor(text, attractor), true, `Valid attractor '${attractor}' for text '${text}'`);
        assert_eq(attractor, exp_attr, `Expected gamma size for text '${text}'`);
    }
    test_helper('a', [0]);
    test_helper('banana', [0,1,2]);
    test_helper('ananas', [0,1,5]);
    test_helper('abracadabra', [0, 1, 2, 4, 6]); 
    test_helper('mississippi', [0, 5, 7, 9]);
    test_helper('', []);
    test_helper('aaaa', [0]);
    test_helper('abcde', [0,1,2,3,4]);
    test_helper('edcba', [0,1,2,3,4]);
    test_helper('abab', [0,1]);
}

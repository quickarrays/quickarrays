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
 * @name p
 * @description Shortest Period
 * @tutorial The shortest period of a string is the smallest positive integer such that the string is a prefix of an infinite repetition of the prefix of that length. Concretely, the shortest period \(p\) of the text \(T\) is the length of the shortest prefix \(P\) of \(T\) such that \(T\) is a prefix of \(P^{k}\) for some integer \(k \geq 1\).
 * @wikipedia Periodicity_(string_matching)#Period
 */
function count_period(border_array: number[]) : number {
    const last_border = border_array[border_array.length - 1];
    return border_array.length - last_border;
}

/**
 * @name e
 * @description Exponent
 * @tutorial The exponent of a string is the division of the string's length by its shortest period, representing how many times the shortest period needs to be repeated to form the string. Formally, the exponent of the text \(T\) is defined as the length of \(T\) divided by the length of its shortest period \(p\), i.e., \(\frac{|T|}{p}\).
 * @wikipedia Periodicity_(string_matching)#Exponent
 */
function count_exponent(border_array: number[]) : number {
    const period = count_period(border_array);
    return border_array.length / period;
}

/**
 * @name R
 * @description Regularity Type
 * @tutorial The regularity type of a string classifies it based on its periodic structure. A string can be categorized as unbordered, primitive, square, or non-primitive based on its borders and periods. Specifically, a string is unbordered if it has no proper border, primitive if it cannot be expressed as a repetition of a smaller substring, square if it is formed by repeating a substring exactly twice, and non-primitive if it can be expressed as a repetition of a smaller substring more than twice.
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
 * @tutorial The suffix array sorts the entry indices of a string based on the lexicographical order of their corresponding suffixes. Formally, the suffix array \(\mathsf{SA}\) of the text \(T[1..n]\) is an array of integers representing the starting indices of all the suffixes of \(T\), sorted in lexicographical order. It obeys that \(T[\mathsf{SA}[i]..n] \prec T[\mathsf{SA}[i+1]..n]\) for all text positions \(i \in [1..n-1]\).
 * @cite manber93sa
 * @wikipedia Suffix_array
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
 * @tutorial The border array of a string stores the lengths of the longest borders for each prefix of the string. A border of a string is defined as a substring that is both a proper prefix and a proper suffix. Formally, the border array \(\mathsf{B}\) for a text \(T[1..n]\) is an array where each entry \(\mathsf{B}[i]\) represents the length of the longest border of the prefix \(T[1..i]\), i.e., \(\mathsf{B}[i]\) is the largest integer \(k \le i-1\) such that \(T[1..k] = T[i-k+1..i]\). By definition, \(\mathsf{B}[0] = 0\).
 * @wikipedia Border_(string_matching)
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
    assert_eq(construct_border_array("abcababc").toString(), [0,0,0,1,2,1,2,3].toString(), "Border array of 'abcababc'");
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
    if (text.length === 0) {
        return "";
    }
    if (!text || !Array.isArray(rotation_array)) {
        throw new AlgorithmError('Invalid input: text must be a string and rotation_array must be an array', 'BWT', { text, rotation_array });
    }
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
 * @tutorial The rotation array sorts the entry indices of a string based on the lexicographical order of their corresponding cyclic rotations. Formally, the rotation array \(\mathsf{Rot}\) of the text \(T[1..n]\) is an array of integers representing the starting indices of all the cyclic rotations of \(T\), sorted in lexicographical order. It obeys that \(T[\mathsf{Rot}[i]..n]T[1..\mathsf{Rot}[i]-1] \prec T[\mathsf{Rot}[i+1]..n]T[1..\mathsf{Rot}[i+1]-1]\) for all text positions \(i \in [1..n-1]\), where $\prec$ is a total order by assigning lower ranks to lexicographically smaller strings and uses the text position \(i\) for tie-breaking.
 */
function construct_rotation_array(text: string): number[] {
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
    assert_eq(construct_rotation_array("banana").toString(), [5, 3, 1, 0, 4, 2].toString(), "Rotation array of 'banana'");
    assert_eq(construct_rotation_array("abracadabra").toString(), [10, 7, 0, 3, 5, 8, 1, 4, 6, 9, 2].toString(), "Rotation array of 'abracadabra'");
    assert_eq(construct_rotation_array("").toString(), [].toString(), "Rotation array of empty string");
    assert_eq(construct_rotation_array("a").toString(), [0].toString(), "Rotation array of 'a'");
    assert_eq(construct_rotation_array("aaaaa").toString(), [0, 1, 2, 3, 4].toString(), "Rotation array of 'aaaaa'");
    assert_eq(construct_rotation_array("edcba").toString(), [4, 3, 2, 1, 0].toString(), "Rotation array of 'edcba'");
    assert_eq(construct_rotation_array("abcde").toString(), [0, 1, 2, 3, 4].toString(), "Rotation array of 'abcde'");
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
 * @tutorial The inverse Phi array provides a mapping from each starting index of the suffixes of a string to the starting index of the lexicographically succeeding suffix. Formally, given the suffix array \(\mathsf{SA}\) and the inverse suffix array \(\mathsf{ISA}\) of the text \(T[1..n]\), the inverse Phi array \(\mathsf{\Phi}^{-1}\) is defined such that \(\mathsf{\Phi}^{-1}[i] = \mathsf{SA}[\mathsf{ISA}[i] + 1]\) if \(\mathsf{ISA}[i] \le n-1 \), and \(\mathsf{\Phi}^{-1}[i] = \bot\) if \(\mathsf{ISA}[i] = n \), for each \(i \in [1..n]\).
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
 * @tutorial The sum of the Longest Common Prefix (LCP) array values provides a measure of the total length of common prefixes between consecutive suffixes in the suffix array of a string. Formally, for a given LCP array \(\mathsf{LCP}[1..n]\), the sum \(\Sigma \mathsf{LCP}\) is defined as \(\sum_{i=1}^{n} \mathsf{LCP}[i]\).
 * @wikipedia Longest_common_prefix_array
 */
function count_lcp_array(lcp_array : number[]) : number {
    return lcp_array.reduce((a, b) => a + b, 0);
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
 * @tutorial The Psi array provides a mapping inside the suffix array that advances by one text position. Formally, given the suffix array \(\mathsf{SA}\) and the inverse suffix array \(\mathsf{ISA}\) of the text \(T[1..n]\), the Psi array \(\mathsf{\Psi}\) is defined such that \(\mathsf{\Psi}[i] = \mathsf{ISA}[\mathsf{SA}[i] + 1]\) if \(\mathsf{SA}[i] + 1 < n\), and \(\mathsf{\Psi}[i] = \bot\) if \(\mathsf{SA}[i] + 1 = n\), for each \(i \in [1..n]\).
 * @cite grossi05csa
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
 * @tutorial The Lyndon factorization of a string decomposes it into a sequence of Lyndon words in lexicographically non-increasing order, where a Lyndon word is a non-empty string that is strictly smaller in lexicographical order than all of its non-trivial rotations.
 * @cite chen58lyndon
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

function delta(substring_complexity: number[]): [number, number] {
    if (substring_complexity.length === 0) {
        throw new Error("Input array 'substring_complexity' cannot be empty.");
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
 * @wikipedia Substring_complexity
 * @cite raskhodnikova13sublinear
 */
function count_delta(substring_complexity: number[]): number {
    return delta(substring_complexity)[1];
}

/**
 * @name max &delta;
 * @description Substring Complexity Measure Length
 * @tutorial The substring complexity measure length identifies the substring length that maximizes the ratio of substring complexity to length. Given an array of substring complexities for lengths \(1\) to \(n\), it computes the length \(k\) that maximizes \(\frac{\mathsf{SC}[k]}{k}\), where \(\mathsf{SC}[k]\) is the substring complexity for length \(k\).
 * @wikipedia Substring_complexity
 * @cite raskhodnikova13sublinear
 */
function count_delta_argmax(substring_complexity: number[]): number {
    return delta(substring_complexity)[0];
}


/**
 * @name SC
 * @kind disable
 * @type length
 * @description Substring Complexity Array
 * @tutorial The substring complexity array quantifies the number of distinct substrings of various lengths within a string. Given the Longest Common Prefix (LCP) array of a string, the substring complexity array \(\mathsf{SC}[1..n]\) is defined such that for each length \(k \in [1..n]\), \(\mathsf{SC}[k]\) represents the count of distinct substrings of length \(k\). The computation leverages the LCP values to efficiently determine the number of new substrings introduced at each length.
 * @wikipedia Substring_complexity
 * @cite raskhodnikova13sublinear
 */
function construct_substring_complexity(lcp_array: number[]): number[] {
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
    const prefix = text.slice(0, index);
    return [...prefix].filter(c => c === pattern).length;
}
export function test_rank_query() {
    assert_eq(rank_query("banana", "a", 6), 3, "Count of 'a' in 'banana'");
    assert_eq(rank_query("banana", "a", 3), 1, "Count of 'a' in 'ban'");
    assert_eq(rank_query("100101", "1", 6), 3, "Count of '1' in '100101'");
    assert_eq(rank_query("100101", "0", 4), 2, "Count of '0' in '1001'");
    assert_eq(rank_query("aaaaa", "a", 5), 4, "Count of 'aa' in 'aaaaa'");
    assert_eq(rank_query("aaaaa", "a", 3), 2, "Count of 'aa' in 'aaa'");
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
 * @tutorial The S/L type string classifies each character in a string as either S-type or L-type based on the lexicographic order of the suffixes starting at those characters. A character at position \(i\) is classified as S-type if the suffix starting at \(i\) is lexicographically smaller than the suffix starting at \(i+1\), and L-type if it is larger. If the suffixes are equal, the type is determined by the type of the suffix starting at \(i+1\). Additionally, an S-type character that is the first character or immediately preceded by an L-type character is marked as S*-type.
 * @wikipedia Suffix_array_induced_sorting
 * @cite nong11sais
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
 * @tutorial The Longest Previous Factor (LPF) array stores the length of the longest prefix of each suffix of a string that matches a substring starting at a prior position within the same string. Formally, for a given text \(T[1..n]\), the LPF array \(\mathsf{LPF}[1..n]\) is defined such that \(\mathsf{LPF}[i] = \max_{j \in [1..i-1]} \text{lcp}(T[i..n], T[j..n])\) for each \(i \in [1..n]\), where \(\text{lcp}(S_1, S_2)\) denotes the length of the longest common prefix between the suffixes \(S_1\) and \(S_2\).
 * @reference franek03lpf
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
 * @tutorial The Longest Next Factor (LNF) array stores the length of the longest prefix of each suffix of a string that matches a substring starting at a subsequent position within the same string. Formally, for a given text \(T[1..n]\), the LNF array \(\mathsf{LNF}[1..n]\) is defined such that \(\mathsf{LNF}[i] = \max_{j \in [i+1..n]} \text{lcp}(T[i..n], T[j..n])\) for each \(i \in [1..n]\), where \(\text{lcp}(S_1, S_2)\) denotes the length of the longest common prefix between the suffixes \(S_1\) and \(S_2\).
 * @reference franek03lpf
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

/**
 * @name rLZSS
 * @kind disable
 * @type factor
 * @description Reverse LZSS Factorization
 * @tutorial The Reverse Lempel-Ziv-Storer-Szymanski (rLZSS) factorization of a string is the LZSS factorization of the reversed string obtained by reading the string in reversed order.
 * @cite storer82lzss
 */
function construct_reverse_lzss_factorization(lnf_array: readonly number[]): boolean[] {
    const copied_lnf_array = lnf_array.slice().reverse();
    return greedy_factorize(copied_lnf_array);
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

/**
 * @name NSS
 * @kind disable
 * @type index
 * @description Next Smaller Suffix Array
 * @tutorial The Next Smaller Suffix (NSS) array identifies the subsequent suffix in text order that is lexicographically smaller than the current suffix. Given the inverse suffix array \(\mathsf{ISA}\) of a text \(T[1..n]\), the NSS array \(\mathsf{NSS}[1..n]\) is defined such that \(\mathsf{NSS}[i] = \min \{ j > i \mid \mathsf{ISA}[j] < \mathsf{ISA}[i] \}\) if such a \(j\) exists, and \(\mathsf{NSS}[i] = \bot \) otherwise, for each \(i \in [1..n]\).
 */
function construct_nss_array(text: string, inverse_suffix_array: readonly number[]): number[] {
    const n: number = text.length;
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
 * @tutorial The Previous Smaller Suffix (PSS) array identifies the preceding suffix in text order that is lexicographically smaller than the current suffix. Given the inverse suffix array \(\mathsf{ISA}\) of a text \(T[1..n]\), the PSS array \(\mathsf{PSS}[1..n]\) is defined such that \(\mathsf{PSS}[i] = \max \{ j < i \mid \mathsf{ISA}[j] < \mathsf{ISA}[i] \}\) if such a \(j\) exists, and \(\mathsf{PSS}[i] = \bot \) otherwise, for each \(i \in [1..n]\).
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
 * @tutorial The Lyndon array stores the lengths of the longest Lyndon words starting at each position in a string. A Lyndon word is a non-empty string that is strictly smaller in lexicographical order than all of its non-trivial rotations. Given the Next Smaller Suffix (NSS) array \(\mathsf{NSS}[1..n]\) of a text \(T[1..n]\), the Lyndon array \(\mathsf{Lyndon}[1..n]\) is defined such that \(\mathsf{Lyndon}[i] = \mathsf{NSS}[i] - i\) if \(\mathsf{NSS}[i] \neq \bot\), and \(\mathsf{Lyndon}[i] = n - i + 1\) otherwise, for each \(i \in [1..n]\).
 * @cite franek16algorithms
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
 * @tutorial The necklace conjugate of a string is the lexicographically smallest string that can be obtained by rotating the original string. This involves generating all possible rotations (conjugates) of the string and selecting the smallest one in lexicographic order.
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
 * @tutorial The invert transform of a string maps each character to its complementary character based on the minimum and maximum characters in the string. Specifically, given a text \(T[1..n]\), the invert transform \(\mathsf{Invert}(T)\) maps each character \(T[i]\) to \(\text{max_j} T[j] - (c - \text{min_j T[j]})\).
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
 * @tutorial The revert transform of a string is obtained by reversing the order of its characters. Given a text \(T[1..n]\), the revert transform \(\mathsf{Revert}(T)\) produces the string \(T[n] T[n-1] \ldots T[1]\), where the characters are arranged in the opposite order, effectively reading the string backwards.
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

function omega_order(strA: string, strB: string): number {
    if (strA === strB) { return 0; }
    const maxLength = Math.max(strA.length, strB.length)*3;

    for(let i = 0; i < maxLength ; ++i) { 
        if (strA[i % strA.length] < strB[i % strB.length]) { return -1; }
        if (strA[i % strA.length] > strB[i % strB.length]) { return +1; }
    }
    return strA.length < strB.length ? -1 : +1;
}
function test_omega_order() {
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

/**
 * @name CISA
 * @kind disable
 * @type index
 * @description Inverse Circular Suffix Array
 * @tutorial The inverse circular suffix array (ICSA) is the reverse permutation of the circular suffix array (CSA). 
 * @cite hon13spaceefficient
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
 * @tutorial The Bijective Burrows-Wheeler Transform Indices (BBWTi) array stores the text positions of the circular sufix array (CSA) decremented by one, but mapping positions at the beginning of Lyndon factors to the end of the respective Lyndon factor.
 * @cite bannai25survey
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
 * @tutorial The Bijective Burrows-Wheeler Transform (BBWT) of a string rearranges the characters of the original string based on the Bijective Burrows-Wheeler Transform Indices (BBWTi). Given a text \(T[1..n]\) and its BBWTi array \(\mathsf{BBWTi}[1..n]\), the BBWT \(\mathsf{BBWT}[1..n]\) is defined such that \(\mathsf{BBWT}[i] = T[\mathsf{BBWTi}[i]]\) for each \(i \in [1..n]\).
 * @cite bannai25survey
 */
function construct_bbw_transform(text: string, bbw_indices: readonly number[]): string {
    return [...bbw_indices].map(pos => text[pos]).join('');
}

export function test_bbw_transform() {
    assert_eq(construct_bbw_transform("banana", [4, 0, 3, 5, 2, 1]), "annbaa", "BBWT of 'banana'");
    assert_eq(construct_bbw_transform("abracadabra", [9, 4, 2, 6, 8, 0, 5, 10, 1, 7, 3]), "ardrcaaaabb", "BBWT of 'abracadabra'");
    assert_eq(construct_bbw_transform("", []), "", "BBWT of empty string");
    assert_eq(construct_bbw_transform("a", [0]), "a", "BBWT of 'a'");
    assert_eq(construct_bbw_transform("edcba", [4, 3, 2, 1, 0]), "abcde", "BBWT of 'edcba'");
    assert_eq(construct_bbw_transform("abcde", [0, 1, 2, 3, 4]), "eabcd", "BBWT of 'abcde'");
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

function test_inverse_bbw_transform() {
    assert_eq(construct_inverse_bbw_transform("annbaa"), "banana", "Inverse BBWT of 'annbaa'");
    assert_eq(construct_inverse_bbw_transform("ardrcaaaabb"), "abracadabra", "Inverse BBWT of 'ardrcaaaabb'");
    assert_eq(construct_inverse_bbw_transform(""), "", "Inverse BBWT of empty string");
    assert_eq(construct_inverse_bbw_transform("a"), "a", "Inverse BBWT of 'a'");
    assert_eq(construct_inverse_bbw_transform("abcde"), "edcba", "Inverse BBWT of 'abcde'");
    assert_eq(construct_inverse_bbw_transform("eabcd"), "abcde", "Inverse BBWT of 'eabcd'");
}

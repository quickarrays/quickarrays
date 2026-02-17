/**
 * Shared text preparation logic used by both the worker and the main-thread fallback.
 *
 * @param {Object} p
 * @param {string|null} p.generatorName - Name of the string generator, or null for custom text
 * @param {number|null} p.limit - Maximum string length for generated strings
 * @param {string|null} p.customText - Custom text (when generatorName is null)
 * @param {string} p.placeholder - Placeholder text when no text is available
 * @param {string} p.transformSelection - Transform to apply ('none', 'custom', or a DS name)
 * @param {boolean} p.customTransformActive - Whether custom transform is active
 * @param {string|null} p.customFnSource - Source code for custom transform function
 * @param {string} p.prepend - Text to prepend
 * @param {string} p.append - Text to append
 * @param {boolean} p.dollar - Whether to append null terminator
 * @returns {{ text: string, generator_order: number|null }}
 */
function prepare_text(p) {
	let text, generator_order = null;

	// Step 1: Generate or use provided text
	if (p.generatorName) {
		const gen = string_generators[p.generatorName];
		if (!gen) {
			return { text: '', generator_order: null };
		}
		let best = '';
		let k = 0;

		let cand0 = gen(0);
		if (cand0.length <= p.limit) {
			best = cand0;

			// Exponential search to find an upper bound where it exceeds the limit
			let hi = 1;
			while (hi < 64) {
				const cand = gen(hi);
				if (cand.length > p.limit) break;
				best = cand;
				hi <<= 1;
			}

			// Binary search for the exact boundary
			const firstBad = Math.min(hi, 64);
			const lastGood = Math.min(hi >> 1, 63);

			let lo = lastGood + 1;
			let r = firstBad - 1;
			while (lo <= r) {
				const mid = (lo + r) >> 1;
				const cand = gen(mid);
				if (cand.length <= p.limit) {
					best = cand;
					k = mid;
					lo = mid + 1;
				} else {
					r = mid - 1;
				}
			}
			k = Math.min(lo, 64);
		}
		text = best;
		generator_order = k - 1;
	} else {
		text = p.customText || '';
	}

	if (!text) text = p.placeholder || '';

	// Step 2: Apply transform
	const sel = p.transformSelection;
	if (sel && sel !== 'none' && sel !== 'custom') {
		const tDS = build_ds(text, structure_flags[sel]);
		if (tDS && tDS[sel] !== undefined) text = tDS[sel];
	} else if (sel === 'custom' && p.customTransformActive && p.customFnSource) {
		var ret = '';
		for (var i = 0; i < text.length; i++) {
			try {
				var ctx = { i: i, text: text };
				var newchar = eval('with(ctx) { ' + p.customFnSource + ' }');
				ret += newchar !== undefined ? newchar : text[i];
			} catch (err) {
				return { text: text, generator_order: generator_order, transformError: err.message };
			}
		}
		text = ret;
	}

	if (text.length === 0) {
		return { text: '', generator_order: generator_order };
	}

	// Step 3: Prepend, append, dollar
	if (p.prepend) text = p.prepend + text;
	if (p.append) text = text + p.append;
	if (p.dollar) text += '\0';

	return { text: text, generator_order: generator_order };
}

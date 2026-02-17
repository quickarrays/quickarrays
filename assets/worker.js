self.onmessage = function (e) {
    const p = e.data;

    // Step 1: Generate or use provided text
    let text, generator_order = null;
    if (p.generatorName) {
        const gen = string_generators[p.generatorName];
        if (!gen) {
            self.postMessage({ text: '', __generator_order: null });
            return;
        }
        let best = '';
        let k = 0;

        // If even k=0 is too long, nothing fits.
        let cand0 = gen(0);
        if (cand0.length <= p.limit) {
            best = cand0;

            // 1) Exponential search to find an upper bound where it breaks.
            let hi = 1;
            while (hi < 64) {
                const cand = gen(hi);
                if (cand.length > p.limit) break;
                best = cand;
                hi <<= 1; // *= 2
            }

            // We now binary search
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
        } else {
            best = '';
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
                ret = text;
                break;
            }
        }
        text = ret;
    }

    if (text.length === 0) {
        self.postMessage({ text: '', __generator_order: generator_order });
        return;
    }

    // Step 3: Prepend, append, dollar
    if (p.prepend) text = p.prepend + text;
    if (p.append) text = text + p.append;
    if (p.dollar) text += '\0';

    // Step 4: Build data structures
    const result = build_ds(text, p.enabled_flag);
    result['text'] = text;
    result['__generator_order'] = generator_order;
    self.postMessage(result);
};

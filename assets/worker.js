self.onmessage = function (e) {
    const p = e.data;
    const prepared = prepare_text(p);

    if (prepared.text.length === 0) {
        self.postMessage({ text: '', __generator_order: prepared.generator_order });
        return;
    }

    const result = build_ds(prepared.text, p.enabled_flag);
    result['text'] = prepared.text;
    result['__generator_order'] = prepared.generator_order;
    if (prepared.transformError) result['__transformError'] = prepared.transformError;
    self.postMessage(result);
};

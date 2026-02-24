function setupShowHide(containerId) {
	const container = document.getElementById(containerId);
	if (!container) return;
	const btn = container.querySelector('.qa-toggle-btn');
	const colon = container.querySelector('.qa-itemlist-colon');
	if (!btn) return;
	let shown = true;
	function getItems() {
		return Array.from(container.querySelectorAll(':scope > .qa-item'));
	}
	function render() {
		btn.textContent = shown ? '(hide)' : '(show)';
		btn.setAttribute('aria-expanded', String(shown));
		getItems().forEach(el => el.classList.toggle('qa-hidden', !shown));
		if (colon) colon.classList.toggle('qa-hidden', !shown);
	}
	const obs = new MutationObserver(() => {
		if (!shown) {
			getItems().forEach(el => el.classList.add('qa-hidden'));
			if (colon) colon.classList.add('qa-hidden');
		}
	});
	obs.observe(container, { childList: true });
	btn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		shown = !shown;
		render();
		if (typeof update_history === 'function') update_history();
	});
	render();
}

function changeVisibility(element, is_visible) {
	const addClass = is_visible ? 'qa-visible' : 'qa-hidden';
	const remClass = is_visible ? 'qa-hidden' : 'qa-visible';
	element.classList.remove(remClass);
	element.classList.add(addClass);
}

function getItemSortLabel(el) {
	const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
	return (node ? node.textContent : el.textContent).trim().toLowerCase();
}

function insertInLexOrder(parent, el, selector) {
	const label = getItemSortLabel(el);
	const siblings = Array.from(parent.querySelectorAll(':scope > ' + selector));
	const before = siblings.find(s => s !== el && getItemSortLabel(s) > label);
	if (before) parent.insertBefore(el, before);
	else parent.appendChild(el);
}

function sortChildrenLex(parent, selector) {
	const items = Array.from(parent.querySelectorAll(':scope > ' + selector));
	items.sort((a, b) => getItemSortLabel(a).localeCompare(getItemSortLabel(b)));
	items.forEach(el => parent.appendChild(el));
}

function getOwnText(element) {
	let text = '';
	for (const node of element.childNodes) {
		// Check if the node is a text node (nodeType === 3)
		if (node.nodeType === Node.TEXT_NODE) {
			text += node.textContent;
		}
	}
	return text;
}

var qa_counter_automatic;
var qa_counter_itemlists;
var qa_text;
var qa_ds_output;
var qa_counter_output;

var qa_generate_string_list;
var qa_generate_string_range;
var qa_generate_string_rank;
var qa_generate_string_order;
var qa_generate_string_span;
var qa_loading_spinner;

var qa_transform_active; // button element
var qa_transform_active_span;
var qa_transform_list;
var qa_transform_input;

function setTransformActive(active) {
	qa_transform_active.dataset.active = active ? '1' : '0';
	qa_transform_active.textContent = active ? 'Disable' : 'Enable';
}
function isTransformActive() {
	return qa_transform_active.dataset.active === '1';
}

var ds_name2html = {};
var counter_name2html = {};
// Maps counter dsName → array of structure dsNames that auto-enable it
var counter_structures = {};

var qa_prepend_input;
var qa_append_input;
var qa_separator_input;

var structures_list;
var counters_list;
var options_list;

var structures_default;
var counters_default
var options_default;
const separator_default = ' ';

var is_update_requested = true;
var is_update_ready = true;
function update_history() {
	if (!is_update_ready) { is_update_requested = true; }
	else {
		is_update_ready = false;
		update_history_internal();
		setTimeout(() => {
			is_update_ready = true;
			if (is_update_requested) {
				is_update_requested = false;
				update_history();
			}
		}, 1000);
	}
}

var generate_string_default;
var generate_string_range_default;
var transform_default;
var prepend_default;
var append_default;
var timeout_default;
var counter_digits_default;
const counter_automatic_default = true;

function update_history_internal() {
	var newQuery = $.query.empty();

	const text_query = options_list.enabled("whitespace") ? decodeWhitespaces(qa_text.value) : qa_text.value;
	if (text_query) { newQuery = newQuery.set("text", text_query); }

	const structures_query = structures_list.getEnabled();
	if (structures_query != structures_default) { newQuery = newQuery.set("structures", structures_query); }

	const options_query = options_list.getEnabled();
	if (options_query != options_default) { newQuery = newQuery.set("options_list", options_query); }

	const separator_query = decodeWhitespaces(qa_separator_input.value);
	if (separator_query != separator_default) { newQuery = newQuery.set("sep", separator_query); }

	const counters_query = counters_list.getEnabled();
	if (counters_query != counters_default) { newQuery = newQuery.set("counters", counters_query); }

	const generate_string_query = qa_generate_string_list.value;
	if (generate_string_query != generate_string_default) { newQuery = newQuery.set("generate_string", generate_string_query); }

	const generate_string_range_query = currentLimit();
	if (generate_string_range_query != null && generate_string_range_query != generate_string_range_default) { newQuery = newQuery.set("generate_string_range", generate_string_range_query); }

	const transform_query = qa_transform_list.value;
	if (transform_query != transform_default) { newQuery = newQuery.set("transform", transform_query); }

	const transform_input_query = qa_transform_input.value;
	if (transform_input_query != '') {
		newQuery = newQuery.set("transform_input", transform_input_query);
	}

	const timeout_query = qa_timeout_range.value;
	if (timeout_query != timeout_default) {
		newQuery = newQuery.set("timeout", timeout_query);
	}

	const counter_digits_query = qa_counter_digits_range.value;
	if (counter_digits_query != counter_digits_default) {
		newQuery = newQuery.set("counter_digits", counter_digits_query);
	}

	const prepend_query = qa_prepend_input.value;
	if (prepend_query != prepend_default) { newQuery = newQuery.set("prepend", prepend_query); }

	const append_query = qa_append_input.value;
	if (append_query != append_default) { newQuery = newQuery.set("append", append_query); }

	const counter_automatic_query = qa_counter_automatic.checked;
	if (counter_automatic_query != counter_automatic_default) { newQuery = newQuery.set("counter_automatic", counter_automatic_query ? '1' : '0'); }

	const cvCbx = document.getElementById('qa-compact-view');
	if (cvCbx) {
		const cvDefault = !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
		if (cvCbx.checked !== cvDefault) newQuery = newQuery.set("compact", cvCbx.checked ? '1' : '0');
	}
	const advCbx = document.getElementById('qa-show-advanced-options');
	if (advCbx) {
		const advDefault = !(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
		if (advCbx.checked !== advDefault) newQuery = newQuery.set("adv", advCbx.checked ? '1' : '0');
	}

	window.history.replaceState("", "", window.location.pathname + newQuery.toString());
}
function load_history_internal() {
	// parse configuration from GET url parameters
	const getQueryString = (key) => {
		const value = $.query.get(key);
		// value === "" implies that the parameter is not present
		if (value === "") return false;
		// value === "<some string>" implies the parameter is present and non-empty
		if (typeof value === "string") return value;
		// value === true implies the parameter is present and empty
		if (value === true) return "";
		return false;
	};

	const text_query = getQueryString("text");
	if (text_query) { qa_text.value = text_query; }

	const counters_query = getQueryString("counters");
	if (typeof counters_query === "string") { counters_list.setEnabled(counters_query); }

	const structures_query = getQueryString("structures");
	if (typeof structures_query === "string") { structures_list.setEnabled(structures_query); }

	const options_query = getQueryString("options_list");
	if (options_query) { options_list.setEnabled(options_query); }

	const sepfrom_query = getQueryString("sep");
	if (typeof sepfrom_query === "string") { qa_separator_input.value = encodeWhitespaces(sepfrom_query); }

	const generate_string_query = getQueryString("generate_string");
	if (generate_string_query) { qa_generate_string_list.value = generate_string_query; }
	if (generate_string_query && generate_string_query !== 'custom') {
		changeVisibility(qa_generate_string_span, true);
		changeVisibility(qa_text, false);
	} else {
		changeVisibility(qa_generate_string_span, false);
		changeVisibility(qa_text, true);
	}

	const generate_string_range_query = getQueryString("generate_string_range");
	if (generate_string_range_query) {
		updateSliderForGenerator(parseInt(generate_string_range_query));
	}

	const transform_query = getQueryString("transform");
	if (transform_query) { qa_transform_list.value = transform_query; }
	if (transform_query === 'custom') {
		changeVisibility(qa_transform_input, true);
		changeVisibility(qa_transform_active_span, true);
	} else {
		changeVisibility(qa_transform_input, false);
		changeVisibility(qa_transform_active_span, false);
	}

	const transform_input_query = getQueryString("transform_input");
	if (transform_input_query) { qa_transform_input.value = transform_input_query; }

	const timeout_query = getQueryString("timeout");
	if (timeout_query) {
		qa_timeout_range.value = timeout_query;
		qa_timeout_value.textContent = timeout_query;
	}

	const counter_digits_query = getQueryString("counter_digits");
	if (counter_digits_query) {
		qa_counter_digits_range.value = counter_digits_query;
		qa_counter_digits_value.textContent = counter_digits_query == '10' ? '\u221e' : counter_digits_query;
	}

	const prepend_query = getQueryString("prepend");
	if (prepend_query) { qa_prepend_input.value = prepend_query; }

	const append_query = getQueryString("append");
	if (append_query) { qa_append_input.value = append_query; }

	const counter_automatic_query = getQueryString("counter_automatic");
	if (counter_automatic_query) { qa_counter_automatic.checked = counter_automatic_query === '1'; }
	if (qa_counter_automatic.checked) {
		changeVisibility(qa_counter_itemlists, false);
	} else {
		changeVisibility(qa_counter_itemlists, true);
	}

	const cvCbx = document.getElementById('qa-compact-view');
	if (cvCbx) {
		const urlCompact = getQueryString("compact");
		const cvDefault = !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
		cvCbx.checked = urlCompact === '1' ? true : urlCompact === '0' ? false : cvDefault;
	}

	const advCbx = document.getElementById('qa-show-advanced-options');
	if (advCbx) {
		const urlAdv = getQueryString("adv");
		const advDefault = !(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
		advCbx.checked = urlAdv === '1' ? true : urlAdv === '0' ? false : advDefault;
	}
}

function updateTextAreas() {
	updateTextArea(qa_text);
	updateOutputArea(qa_ds_output);
}

function updateTextArea(area) {
	area.style.height = "";
	area.style.height = (10 + area.scrollHeight) + 'px';
}

function updateOutputArea(area) {
	if (area.value === "") {
		area.style.display = 'none';
	} else {
		area.style.display = '';
		area.style.height = "0";
		area.style.height = area.scrollHeight + 'px';
	}
}

var wasWhitespace = false;
function updateWhitespaces() {
	if (options_list.enabled("whitespace")) {
		const selStart = qa_text.selectionStart;
		const selEnd = qa_text.selectionEnd;
		qa_text.value = encodeWhitespaces(qa_text.value);
		qa_text.selectionStart = selStart;
		qa_text.selectionEnd = selEnd;
		wasWhitespace = true;
	}
	else if (wasWhitespace) {
		const selStart = qa_text.selectionStart;
		const selEnd = qa_text.selectionEnd;
		qa_text.value = decodeWhitespaces(qa_text.value);
		qa_text.selectionStart = selStart;
		qa_text.selectionEnd = selEnd;
		wasWhitespace = false;
	}
}



const SLIDER_MAX = 1000;

function currentGeneratorLengths() {
	return generator_lengths[qa_generate_string_list.value] || null;
}

function orderForLength(lengths, target) {
	let order = 0;
	for (let i = 0; i < lengths.length; i++) {
		if (lengths[i] <= target) order = i;
		else break;
	}
	return order;
}

function sliderToOrder(sliderVal, lengths) {
	return Math.round(sliderVal / SLIDER_MAX * (lengths.length - 1));
}

function orderToSlider(order, lengths) {
	if (lengths.length <= 1) return 0;
	return Math.round(order / (lengths.length - 1) * SLIDER_MAX);
}

function currentLimit() {
	const lengths = currentGeneratorLengths();
	if (!lengths) return null;
	return lengths[sliderToOrder(parseInt(qa_generate_string_range.value), lengths)];
}

function updateOrderLabel() {
	if (!qa_generate_string_order) return;
	const lengths = currentGeneratorLengths();
	if (!lengths) {
		qa_generate_string_order.textContent = '';
		return;
	}
	const order = sliderToOrder(parseInt(qa_generate_string_range.value), lengths);
	qa_generate_string_order.textContent = '(order ' + order + ')';
}

function updateSliderForGenerator(targetLength) {
	const lengths = currentGeneratorLengths();
	if (!lengths) return;
	qa_generate_string_range.min = 0;
	qa_generate_string_range.max = SLIDER_MAX;
	const order = orderForLength(lengths, targetLength);
	qa_generate_string_range.value = orderToSlider(order, lengths);
	qa_generate_string_rank.innerHTML = lengths[order];
	updateOrderLabel();
}


function prettify_row(ds_text, dsName, varDs, varSep, varBase, do_padding, width) {
	if (structures_list.isIndex(dsName)) {
		if (varBase != 0) {
			varDs = increment_array(varDs);
		}
		varDs = replace_invalid_position(varDs, varBase + ds_text.length);
	}
	const ds_htmlname = ds_name2html[dsName] ? ds_name2html[dsName] : dsName;
	if (structures_list.isString(dsName)) {
		varDs = varDs.split('\0').join("$");
	}
	if (!do_padding) { return { 'name': ds_htmlname, 'data': varDs }; }

	if (structures_list.isString(dsName)) {
		if (options_list.enabled("whitespace")) {
			varDs = encodeWhitespaces(varDs);
		}
		varDs = prettify_string(varDs, varSep, varBase, options_list.enabled("tabularize"), width);
	} else if (structures_list.isFactorization(dsName)) {
		if (options_list.enabled("facttext")) {
			varDs = prettify_factorization(options_list.enabled("whitespace") ? encodeWhitespaces(ds_text) : ds_text, varDs, varSep, varBase, width);
		} else {
			varDs = prettify_array(varDs.map((b) => b ? 1 : 0), varSep, varBase, width);
		}
	} else {
		varDs = prettify_array(varDs, varSep, varBase, width);
	}
	return { 'name': ds_htmlname, 'data': varDs };
}

function fill_updates(DS) {
	const varSep = decodeWhitespaces(qa_separator_input.value);

	let pad = 0;
	structures_list.forEachEnabled(function (dsName) {
		const ds_htmlname = ds_name2html[dsName] ? ds_name2html[dsName] : dsName;
		if (ds_htmlname.length > pad) pad = ds_htmlname.length;
	});

	const varBase = options_list.enabled("baseone") ? 1 : 0;

	let globalWidth = 0;
	structures_list.forEachEnabled(function (dsName) {
		const varDs = DS[dsName];
		if (!varDs) return;
		let w;
		if (structures_list.isString(dsName)) {
			w = 1;
		} else if (structures_list.isFactorization(dsName)) {
			w = 1;
			if (options_list.enabled("facttext") && varSep.length == 0) {
				w = 2;
			}
		} else {
			let arr = varDs;
			if (structures_list.isIndex(dsName)) {
				if (varBase != 0) arr = increment_array(arr);
				arr = replace_invalid_position(arr, varBase + DS['text'].length);
			}
			w = arr.length === 0 ? 0 : Math.max(...arr.map((x) => ("" + x).length));
		}
		if (w > globalWidth) globalWidth = w;
	});

	const rows = [];
	structures_list.forEachEnabled(function (dsName) {
		let varDs = DS[dsName];
		if (!varDs) {
			rows.push("Function " + dsName + ": not defined");
			return;
		}
		rows.push(prettify_row(DS['text'], dsName, varDs, varSep, varBase, qa_output_select.value == 'plain', globalWidth));
	});

	if (qa_output_select.value == 'plain') {
		const result = rows.map((row) => { return pad_right(row.name + ":", ' ', pad + 2) + row.data; });
		qa_ds_output.value = result.join('\n');
	} else if (qa_output_select.value == 'latex') {
		qa_ds_output.value = export_latex(rows);
	} else if (qa_output_select.value == 'markdown') {
		qa_ds_output.value = export_markdown(rows);
	} else {
		qa_ds_output.value = export_csv(rows);
	}

	const result = [];

	const formatCounterVal = (v) => {
		if (typeof v === 'number') {
			const digits = Number(qa_counter_digits_range.value);
			if (digits < 10) {
				const rounded = v.toFixed(digits);
				return parseFloat(rounded).toString();
			}
		}
		return v;
	};
	const wrapVal = (v) => '<span class="qa-counter-value">' + formatCounterVal(v) + '</span>';
	if (qa_counter_automatic.checked) {
		if (DS["counter_n"] !== undefined) result.push("n: " + wrapVal(DS["counter_n"]));
		if (DS["counter_sigma"] !== undefined) {
			const sigma_html = counter_name2html["sigma"] || "&sigma;";
			result.push(sigma_html + ": " + wrapVal(DS["counter_sigma"]));
		}
		// Single pass in structure order: emit associated counters and runs/size counters
		const shownCounters = new Set();
		structures_list.forEachEnabled(function (dsName) {
			for (const cName in counter_structures) {
				if (shownCounters.has(cName)) continue;
				if (!counter_structures[cName].includes(dsName)) continue;
				const varDs = DS["counter_" + cName];
				if (varDs === undefined) continue;
				result.push((counter_name2html[cName] || cName) + ": " + wrapVal(varDs));
				shownCounters.add(cName);
			}
			if (!shownCounters.has(dsName)) {
				const varDs = DS["counter_" + dsName];
				if (varDs !== undefined) {
					const ds_htmlname = counter_name2html[dsName] ? counter_name2html[dsName] : dsName;
					result.push(ds_htmlname + ": " + wrapVal(varDs));
					shownCounters.add(dsName);
				}
			}
		});
	} else {
		counters_list.forEachEnabled(function (dsName) {
			let varDs = DS["counter_" + dsName];
			const ds_htmlname = counter_name2html[dsName] ? counter_name2html[dsName] : dsName;
			if (varDs === undefined) {
				result.push(dsName + ": not defined");
			} else {
				result.push(ds_htmlname + ": " + wrapVal(varDs));
			}
		});
	}
	qa_counter_output.innerHTML = [...result].map((el) => '<span class="qa-item">' + el + '</span>').join('&nbsp;');

	updateTextAreas();
	document.body.classList.remove('qa-page-loading');
}

var qa_worker = null;
var qa_is_loaded = false;
var qa_timeout_id = null;

function updateArrays() {
	if (!qa_is_loaded) {
		return;
	}

	update_history();
	if (qa_worker !== null) {
		clearTimeout(qa_timeout_id);
		qa_timeout_id = null;
		qa_worker.terminate()
		qa_worker = null;
		if (qa_loading_spinner) qa_loading_spinner.classList.remove('qa-spinning');
		qa_computation_status.textContent = `Killed due to more recent request.`
	}
	qa_separator_input.value = encodeWhitespaces(qa_separator_input.value);
	updateWhitespaces();


	let enabled_flag = 0;
	structures_list.forEachEnabled(function (dsName) {
		enabled_flag |= structure_flags[dsName];
	});
	counters_list.forEachEnabled(function (dsName) {
		if (structure_flags[dsName]) {
			enabled_flag |= structure_flags[dsName];
		}
		const countername = "counter_" + dsName;
		if (structure_flags[countername]) {
			enabled_flag |= structure_flags[countername];
		}
	});

	// Always compute n and sigma
	if (structure_flags.counter_n) enabled_flag |= structure_flags.counter_n;
	if (structure_flags.counter_sigma) enabled_flag |= structure_flags.counter_sigma;

	// In auto mode, enable counters whose associated structures are currently enabled
	if (qa_counter_automatic.checked) {
		for (const dsName in counter_structures) {
			const associated = counter_structures[dsName];
			if (!associated.some(s => structures_list.enabled(s))) continue;
			const flag = structure_flags["counter_" + dsName];
			if (flag) enabled_flag |= flag;
		}
	}

	// Build params — shared between worker and fallback path
	const transformSelection = qa_transform_list.value;
	let workerParams;
	if (qa_generate_string_list.value !== 'custom') {
		workerParams = {
			generatorName: qa_generate_string_list.value,
			limit: currentLimit(),
			customText: null,
			placeholder: qa_text.placeholder,
		};
	} else {
		const rawText = options_list.enabled("whitespace")
			? decodeWhitespaces(qa_text.value)
			: qa_text.value;
		workerParams = {
			generatorName: null,
			limit: null,
			customText: rawText || null,
			placeholder: qa_text.placeholder,
		};
	}
	workerParams.transformSelection = transformSelection;
	workerParams.customTransformActive = (transformSelection === 'custom') && isTransformActive();
	workerParams.customFnSource = (transformSelection === 'custom') ? (qa_transform_input.value || qa_transform_input.placeholder) : null;
	workerParams.prepend = qa_prepend_input.value;
	workerParams.append = qa_append_input.value;
	workerParams.dollar = options_list.enabled("dollar");
	workerParams.enabled_flag = enabled_flag;

	const script_elements = document.querySelectorAll('script[type="text/js-worker"]');
	if (!script_elements || !script_elements[0].innerHTML) {
		qa_computation_status.textContent = `⚠️ Warning: No worker scripts found!`;
		qa_timeout_range.disabled = true;
		const prepared = prepare_text(workerParams);
		if (prepared.transformError) {
			alert("Error in transformation: " + prepared.transformError);
			setTransformActive(false);
		}
		if (qa_generate_string_order) {
			qa_generate_string_order.textContent = prepared.generator_order !== null ? '(order ' + prepared.generator_order + ')' : '';
		}
		const DS = build_ds(prepared.text, enabled_flag);
		DS['text'] = prepared.text;
		fill_updates(DS);
		return;
	}

	const blob = new Blob(
		Array.prototype.map.call(
			document.querySelectorAll("script[type='text/js-worker']"),
			(script) => script.textContent,
		),
		{ type: "text/javascript" },
	);

	// Creating a new global "worker" variable from all our "text/js-worker" scripts.
	const blobURL = window.URL.createObjectURL(blob);
	const timeout_seconds = Number(qa_timeout_range.value);
	qa_computation_status.textContent = `Computing... (timeout: ${timeout_seconds}s)`;

	const time_now = Date.now();
	qa_timeout_id = timeout_seconds > 0
		? setTimeout(() => {
			qa_worker.terminate()
			qa_worker = null;
			if (qa_loading_spinner) qa_loading_spinner.classList.remove('qa-spinning');
			qa_computation_status.textContent = `Killed after ${timeout_seconds}s`
			qa_ds_output.value = `Timeout: killed after ${timeout_seconds}s.\n(limit can be adjusted in the advanced options)`;
			updateOutputArea(qa_ds_output);
			qa_counter_output.innerHTML = '';
		}, timeout_seconds * 1000)
		: null

	qa_worker = new Worker(blobURL); //
	if (qa_loading_spinner) qa_loading_spinner.classList.add('qa-spinning');

	qa_worker.onerror = (error) => {
		clearTimeout(qa_timeout_id);
		qa_worker.terminate();
		qa_worker = null;
		if (qa_loading_spinner) qa_loading_spinner.classList.remove('qa-spinning');
		qa_computation_status.textContent = `Error during computation: ${error.message}`;
	};
	qa_worker.postMessage(workerParams);
	qa_worker.onmessage = (event) => {
		clearTimeout(qa_timeout_id);
		const DS = event.data;
		qa_worker.terminate();
		qa_worker = null;
		if (qa_loading_spinner) qa_loading_spinner.classList.remove('qa-spinning');
		qa_computation_status.textContent = `✅ Computation finished in ${((Date.now() - time_now) / 1000).toFixed(2)}s`;

		if (DS['__transformError']) {
			alert("Error in transformation: " + DS['__transformError']);
			setTransformActive(false);
		}
		if (qa_generate_string_order) {
			const order = DS['__generator_order'];
			qa_generate_string_order.textContent = order !== null ? '(order ' + order + ')' : '';
		}
		fill_updates(DS);
	};

}

// groupName: shared Sortable group name (string)
// enabledEl: the enabled list DOM element
// disabledMap: object mapping category keys to DOM elements, e.g. { string: el, index: el, ... }
// categoryClassFn: function(cat) → CSS class that items in that category carry
function initDragAndDropGrouped(groupName, enabledEl, disabledMap, categoryClassFn, itemClass) {
	const enabledSortable = Sortable.create(enabledEl, {
		group: { name: groupName, pull: true, put: true },
		sort: true,
		draggable: '.qa-item',
		ghostClass: 'qa-item-ghost',
		dragClass: 'qa-item-drag',
		onStart: () => document.body.classList.add('qa-dragging'),
		onEnd: () => document.body.classList.remove('qa-dragging'),
		onSort: updateArrays
	});
	for (const cat in disabledMap) {
		const el = disabledMap[cat];
		if (!el) continue;
		const cls = categoryClassFn(cat);
		const matchesCls = typeof cls === 'function' ? cls : (dragEl) => dragEl.classList.contains(cls);
		Sortable.create(el, {
			group: {
				name: groupName,
				put: function (_to, from, dragEl) {
					return from.el === enabledEl && matchesCls(dragEl);
				}
			},
			sort: false,
			draggable: '.qa-item',
			ghostClass: 'qa-item-ghost',
			dragClass: 'qa-item-drag',
			onStart: () => document.body.classList.add('qa-dragging'),
			onEnd: () => document.body.classList.remove('qa-dragging'),
			onAdd: function (evt) {
				sortChildrenLex(evt.to, '.' + itemClass);
				updateArrays();
			}
		});
	}
	return enabledSortable;
}

var qa_tutorial_open_button;
var qa_tutorial_select;
var qa_tutorial_open_selected_button;
var qa_tutorial_close_button;
var qa_tutorial_overlay;
var qa_tutorial_title;
var qa_tutorial_content;
var qa_tutorial_oeis
var qa_tutorial_cite;
var qa_tutorial_wikipedia;
var qa_output_select;

var qa_timeout_range;
var qa_timeout_value;
var qa_counter_digits_range;
var qa_counter_digits_value;
var qa_computation_status;

function qa_html_to_text(html) {
	const el = document.createElement('div');
	el.innerHTML = html;
	return (el.textContent || el.innerText || '').trim();
}

function qa_populate_tutorial_select() {
	if (!qa_tutorial_select) return;
	const ids = Object.keys(tutorials || {});
	if (ids.length === 0) return;
	ids.sort((a, b) => {
		const ta = tutorials[a] && tutorials[a].title ? qa_html_to_text(tutorials[a].title) : a;
		const tb = tutorials[b] && tutorials[b].title ? qa_html_to_text(tutorials[b].title) : b;
		return ta.localeCompare(tb);
	});
	const prev = qa_tutorial_select.value;
	qa_tutorial_select.innerHTML = '';
	for (const id of ids) {
		const opt = document.createElement('option');
		opt.value = id;
		opt.textContent = tutorials[id] && tutorials[id].title ? qa_html_to_text(tutorials[id].title) : id;
		qa_tutorial_select.appendChild(opt);
	}
	if (prev) qa_tutorial_select.value = prev;
}

function update_tutorial(id, name) {
	if (tutorials[id] === undefined) { return; }
	const tutorial = tutorials[id];
	qa_tutorial_title.innerHTML = tutorial.title;
	qa_tutorial_content.innerHTML = tutorial.content;
	if (typeof MathJax !== 'undefined') {
		MathJax.typeset([qa_tutorial_content]);
	}
	if (tutorial.oeis !== undefined) {
		qa_tutorial_oeis.style.display = "block";
		qa_tutorial_oeis.innerHTML = "Converges to OEIS sequence " + tutorial.oeis;
		qa_tutorial_oeis.href = "https://oeis.org/" + tutorial.oeis;
	}
	else {
		qa_tutorial_oeis.style.display = "none";
	}
	if (tutorial.cite !== undefined) {
		qa_tutorial_cite.style.display = "block";
		qa_tutorial_cite.href = tutorial.cite;
		if (typeof citations !== 'undefined' && citations[tutorial.cite] !== 'undefined') {
			qa_tutorial_cite.innerHTML = citations[tutorial.cite];
			qa_tutorial_cite.querySelectorAll('a').forEach(a => a.target = '_blank');
		}
	}
	else {
		qa_tutorial_cite.style.display = "none";
	}
	if (tutorial.wikipedia !== undefined) {
		qa_tutorial_wikipedia.style.display = "block";
		qa_tutorial_wikipedia.innerHTML = "Wikipedia Article about " + name;
		qa_tutorial_wikipedia.href = "https://en.wikipedia.org/wiki/" + tutorial.wikipedia;
	} else {
		qa_tutorial_wikipedia.style.display = "none";
	}
	qa_populate_tutorial_select();
	if (qa_tutorial_select) qa_tutorial_select.value = id;
}

window.onload = function () {
	qa_tutorial_open_button = document.getElementById('qa-tutorial-open-button');
	qa_tutorial_select = document.getElementById('qa-tutorial-select');
	qa_tutorial_open_selected_button = document.getElementById('qa-tutorial-open-selected');
	qa_tutorial_close_button = document.getElementById('qa-tutorial-close-button');
	qa_tutorial_overlay = document.getElementById('qa-tutorial-overlay');
	qa_tutorial_title = document.getElementById('qa-tutorial-title');
	qa_tutorial_content = document.getElementById('qa-tutorial-content');
	qa_tutorial_oeis = document.getElementById('qa-tutorial-oeis');
	qa_tutorial_cite = document.getElementById('qa-tutorial-cite');
	qa_tutorial_wikipedia = document.getElementById('qa-tutorial-wikipedia');

	qa_timeout_range = document.getElementById('qa-timeout-range');
	qa_timeout_value = document.getElementById('qa-timeout-value');
	qa_timeout_range.oninput = () => {
		qa_timeout_value.textContent = qa_timeout_range.value;
		update_history();
	};

	qa_counter_digits_range = document.getElementById('qa-counter-digits-range');
	qa_counter_digits_value = document.getElementById('qa-counter-digits-value');
	qa_counter_digits_range.oninput = () => {
		qa_counter_digits_value.textContent = qa_counter_digits_range.value == '10' ? '\u221e' : qa_counter_digits_range.value;
		updateArrays();
		update_history();
	};
	qa_computation_status = document.getElementById('qa-computation-status');

	qa_output_select = document.getElementById('qa-output-select');

	qa_counter_itemlists = document.getElementById('qa-counter-itemlists');
	qa_counter_automatic = document.getElementById('qa-counter-automatic');
	qa_transform_active = document.getElementById('qa-transform-active');
	qa_transform_list = document.getElementById('qa-transform-list');
	qa_transform_input = document.getElementById('qa-transform-input');
	qa_transform_active_span = document.getElementById('qa-transform-active-span');

	qa_text = document.getElementById('qa-text');
	qa_ds_output = document.getElementById('qa-ds-output');
	qa_counter_output = document.getElementById('qa-counter-output');
	qa_separator_input = document.getElementById('qa-separator-input');
	qa_prepend_input = document.getElementById('qa-prepend-input');
	qa_append_input = document.getElementById('qa-append-input');

	qa_generate_string_list = document.getElementById('qa-generate-string-list');
	qa_generate_string_range = document.getElementById('qa-generate-string-range');
	qa_generate_string_rank = document.getElementById('qa-generate-string-rank');
	qa_generate_string_order = document.getElementById('qa-generate-string-order');
	qa_generate_string_span = document.getElementById('qa-generate-string-span');
	qa_loading_spinner = document.getElementById('qa-loading-spinner');

	timeout_default = qa_timeout_range.value;
	counter_digits_default = qa_counter_digits_range.value;
	qa_separator_input.value = encodeWhitespaces(separator_default);
	generate_string_default = qa_generate_string_list.value;
	updateSliderForGenerator(16);
	generate_string_range_default = currentLimit();
	transform_default = qa_transform_list.value;
	prepend_default = qa_prepend_input.value;
	append_default = qa_append_input.value;

	const ds_list_enabled = document.getElementById('qa-structures-enabled');
	const ds_list_disabled = {
		string: document.getElementById('qa-structures-disabled-string'),
		index: document.getElementById('qa-structures-disabled-index'),
		length: document.getElementById('qa-structures-disabled-length'),
		factor: document.getElementById('qa-structures-disabled-factor'),
		other: document.getElementById('qa-structures-disabled-other'),
	};

	// Distribute source items into category sections
	(function () {
		const src = document.getElementById('qa-structures-disabled-source');
		if (!src) return;
		Array.from(src.querySelectorAll('.qa-structure')).forEach(el => {
			if (el.classList.contains('qa-structure-string')) ds_list_disabled.string.appendChild(el);
			else if (el.classList.contains('qa-structure-index')) ds_list_disabled.index.appendChild(el);
			else if (el.classList.contains('qa-structure-length')) ds_list_disabled.length.appendChild(el);
			else if (el.classList.contains('qa-structure-factor')) ds_list_disabled.factor.appendChild(el);
			else ds_list_disabled.other.appendChild(el);
		});
		src.remove();
		for (const cat in ds_list_disabled) {
			if (ds_list_disabled[cat]) sortChildrenLex(ds_list_disabled[cat], '.qa-structure');
		}
	})();

	const counter_list_enabled = document.getElementById('qa-counter-enabled');
	const counter_list_disabled = {
		rle: document.getElementById('qa-counter-disabled-rle'),
		factor: document.getElementById('qa-counter-disabled-factor'),
		other: document.getElementById('qa-counter-disabled-other'),
	};

	// Distribute counter source items into category sections
	(function () {
		const src = document.getElementById('qa-counter-disabled-source');
		if (!src) return;
		Array.from(src.querySelectorAll('.qa-counter')).forEach(el => {
			if (el.classList.contains('qa-counter-rle')) counter_list_disabled.rle.appendChild(el);
			else if (el.classList.contains('qa-counter-factor')) counter_list_disabled.factor.appendChild(el);
			else counter_list_disabled.other.appendChild(el);
		});
		src.remove();
		for (const cat in counter_list_disabled) {
			if (counter_list_disabled[cat]) sortChildrenLex(counter_list_disabled[cat], '.qa-counter');
		}
	})();

	// initalize data structure settings container
	structures_list = new DataStructureList(ds_list_enabled, ds_list_disabled, updateArrays, true);
	document.querySelectorAll(".qa-structure").forEach((elem) => { structures_list.add(elem); });
	structures_default = structures_list.getEnabled();

	// initialize counter settings container
	counters_list = new CounterList(counter_list_enabled, counter_list_disabled, updateArrays, true);
	document.querySelectorAll(".qa-counter").forEach((elem) => { counters_list.add(elem); });
	counters_default = counters_list.getEnabled();

	// initialize option settings container
	options_list = new OptionList(updateArrays);
	document.querySelectorAll(".qa-option-cbx").forEach((elem) => { options_list.add(elem); });
	options_default = options_list.getEnabled();

	const structsSortable = initDragAndDropGrouped('qa-structs', ds_list_enabled, ds_list_disabled, cat => {
		if (cat === 'other') return el => el.classList.contains('qa-structure-other') || el.classList.contains('qa-structure-other-index');
		return 'qa-structure-' + cat;
	}, 'qa-structure');
	const countersSortable = initDragAndDropGrouped('qa-counters', counter_list_enabled, counter_list_disabled, cat => 'qa-counter-' + cat, 'qa-counter');

	applyLegacyRedirects();
	load_history_internal();

	//tutorial
	qa_populate_tutorial_select();
	if (qa_tutorial_open_selected_button) {
		qa_tutorial_open_selected_button.onclick = function () {
			if (qa_tutorial_select && qa_tutorial_select.selectedIndex >= 0) {
				update_tutorial(
					qa_tutorial_select.value,
					qa_tutorial_select.options[qa_tutorial_select.selectedIndex].textContent
				);
			}
			qa_tutorial_overlay.style.display = "block";
		};
	}
	qa_tutorial_close_button.onclick = function () { qa_tutorial_overlay.style.display = "none"; }
	// Close the pop-up when clicking anywhere outside the box
	window.onclick = function (event) {
		if (event.target == qa_tutorial_overlay) {
			qa_tutorial_overlay.style.display = "none";
		}
	}

	document.querySelectorAll(".qa-item").forEach((elem) => {
		if (tutorials[elem.dataset.ds] === undefined) { return; }
		elem.onmouseover = function () {
			update_tutorial(elem.dataset.ds, elem.innerHTML);
		};
	});


	const triggering = [qa_prepend_input, qa_append_input, qa_transform_list, qa_generate_string_list, qa_output_select];
	for (const idx in triggering) {
		triggering[idx].addEventListener('change', function () {
			updateArrays();
		});
		triggering[idx].addEventListener('input', function () {
			updateArrays();
		});
	}
	qa_transform_active.addEventListener('click', function () {
		setTransformActive(!isTransformActive());
		updateArrays();
	});
	qa_counter_automatic.addEventListener('change', function () {
		changeVisibility(qa_counter_itemlists, !qa_counter_automatic.checked);
		updateArrays();
	});
	window.addEventListener('resize', updateTextAreas);


	let _lastLimit = null;
	qa_generate_string_range.addEventListener('input', function () {
		const limit = currentLimit();
		qa_generate_string_rank.innerHTML = limit !== null ? limit : '';
		updateOrderLabel();
		if (limit !== _lastLimit) {
			_lastLimit = limit;
			updateArrays();
		}
	});

	qa_transform_list.addEventListener('change', function () {
		setTransformActive(false);
		updateArrays();
	});

	qa_generate_string_list.addEventListener('change', function () {
		const is_visible = this.value != 'custom';
		changeVisibility(qa_generate_string_span, is_visible);
		changeVisibility(qa_text, !is_visible);
		const selectedIndex = this.selectedIndex;
		const selectedInnerHTML = this.options[selectedIndex].innerHTML;
		update_tutorial(this.value, selectedInnerHTML);
		const currentLength = parseInt(qa_generate_string_rank.innerHTML) || 16;
		updateSliderForGenerator(currentLength);
		updateArrays();
	});

	qa_transform_list.addEventListener('change', function () {
		const is_visible = this.value == 'custom';
		changeVisibility(qa_transform_input, is_visible);
		changeVisibility(qa_transform_active_span, is_visible);
		const selectedIndex = this.selectedIndex;
		const selectedInnerHTML = this.options[selectedIndex].innerHTML;
		update_tutorial(this.value, selectedInnerHTML);
		updateArrays();
	});
	qa_transform_input.addEventListener('input', function () {
		setTransformActive(false);
		updateArrays();
	});
	qa_transform_input.addEventListener('change', function () {
		setTransformActive(false);
		updateArrays();
	});

	setupShowHide('qa-structures-enabled');
	setupShowHide('qa-structures-disabled-string');
	setupShowHide('qa-structures-disabled-index');
	setupShowHide('qa-structures-disabled-length');
	setupShowHide('qa-structures-disabled-factor');
	setupShowHide('qa-structures-disabled-other');
	setupShowHide('qa-counter-enabled');
	setupShowHide('qa-counter-disabled-rle');
	setupShowHide('qa-counter-disabled-factor');
	setupShowHide('qa-counter-disabled-other');

	// Compact view
	(function () {
		const isNarrow = () => !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
		function getDesc(compact) {
			const action = isNarrow() ? 'double-tap' : 'double-click';
			return compact
				? '<strong>Step 4:</strong> Choose structures:<br /><span>(' + action + ' to disable, drag-and-drop to reorder)</span>'
				: '<strong>Step 4:</strong> Choose structures:<br /><span>(' + action + ' to enable/disable, drag-and-drop to enable/disable/reorder)</span>';
		}
		const DISABLED_IDS = ['qa-structures-disabled-string', 'qa-structures-disabled-index', 'qa-structures-disabled-length', 'qa-structures-disabled-factor', 'qa-structures-disabled-other'];
		const COUNTER_DISABLED_IDS = ['qa-counter-disabled-rle', 'qa-counter-disabled-factor', 'qa-counter-disabled-other'];

		function structureGroup(el) {
			if (!el) return 'other';
			if (el.classList.contains('qa-structure-string')) return 'string';
			if (el.classList.contains('qa-structure-index')) return 'index';
			if (el.classList.contains('qa-structure-length')) return 'length';
			if (el.classList.contains('qa-structure-factor')) return 'factor';
			return 'other';
		}

		const GROUP_TITLES = { string: 'String transforms', index: 'Index permutations', length: 'Length arrays', factor: 'Factorizations', other: 'Other' };

		function getLabel(el) {
			const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
			return (node ? node.textContent : el.textContent).trim();
		}

		const COUNTER_GROUP_TITLES = { rle: 'Size of run length encoding', factor: 'Number of factors', other: 'Other counters' };

		function counterGroup(el) {
			if (!el) return 'other';
			if (el.classList.contains('qa-counter-rle')) return 'rle';
			if (el.classList.contains('qa-counter-factor')) return 'factor';
			return 'other';
		}

		function rebuildDropdown() {
			const select = document.getElementById('qa-structures-add-select');
			if (!select || !window.structures_list) return;
			const placeholder = select.querySelector('option[value=""]');
			select.innerHTML = '';
			if (placeholder) select.appendChild(placeholder);
			if (placeholder) placeholder.selected = true;
			const groups = { string: [], index: [], length: [], factor: [], other: [] };
			for (const ds in structures_list.dictionary) {
				if (!structures_list.dictionary.hasOwnProperty(ds)) continue;
				if (structures_list.enabled(ds)) continue;
				const el = structures_list.dictionary[ds];
				groups[structureGroup(el)].push(el);
			}
			for (const k in groups) groups[k].sort((a, b) => getLabel(a).localeCompare(getLabel(b)));
			['string', 'index', 'length', 'factor', 'other'].forEach(key => {
				if (!groups[key].length) return;
				const og = document.createElement('optgroup');
				og.label = GROUP_TITLES[key] || key;
				groups[key].forEach(el => {
					const opt = document.createElement('option');
					opt.value = el.dataset.ds;
					opt.textContent = getLabel(el);
					og.appendChild(opt);
				});
				select.appendChild(og);
			});
		}

		function rebuildCounterDropdown() {
			const select = document.getElementById('qa-counter-add-select');
			if (!select || !window.counters_list) return;
			const placeholder = select.querySelector('option[value=""]');
			select.innerHTML = '';
			if (placeholder) select.appendChild(placeholder);
			if (placeholder) placeholder.selected = true;
			const groups = { rle: [], factor: [], other: [] };
			for (const ds in counters_list.dictionary) {
				if (!counters_list.dictionary.hasOwnProperty(ds)) continue;
				if (counters_list.enabled(ds)) continue;
				const el = counters_list.dictionary[ds];
				groups[counterGroup(el)].push(el);
			}
			for (const k in groups) groups[k].sort((a, b) => getLabel(a).localeCompare(getLabel(b)));
			['rle', 'factor', 'other'].forEach(key => {
				if (!groups[key].length) return;
				const og = document.createElement('optgroup');
				og.label = COUNTER_GROUP_TITLES[key] || key;
				groups[key].forEach(el => {
					const opt = document.createElement('option');
					opt.value = el.dataset.ds;
					opt.textContent = getLabel(el);
					og.appendChild(opt);
				});
				select.appendChild(og);
			});
		}

		function setCompactView(on) {
			const desc = document.getElementById('qa-structures-description');
			const controls = document.getElementById('qa-structures-compact-controls');
			const box = document.getElementById('qa-structures-box');
			if (box) box.classList.toggle('qa-compact-on', on);
			if (desc) desc.innerHTML = getDesc(on);
			if (controls) controls.classList.toggle('qa-hidden', !on);
			DISABLED_IDS.forEach(id => {
				const el = document.getElementById(id);
				if (el) el.classList.toggle('qa-hidden', on);
			});
			if (on) rebuildDropdown();

			const counterControls = document.getElementById('qa-counter-compact-controls');
			const counterBox = document.getElementById('qa-counter-itemlists');
			if (counterBox) counterBox.classList.toggle('qa-compact-on', on);
			if (counterControls) counterControls.classList.toggle('qa-hidden', !on);
			COUNTER_DISABLED_IDS.forEach(id => {
				const el = document.getElementById(id);
				if (el) el.classList.toggle('qa-hidden', on);
			});
			if (on) rebuildCounterDropdown();
		}

		const cbx = document.getElementById('qa-compact-view');
		const select = document.getElementById('qa-structures-add-select');
		if (!cbx || !select) return;

		// Keep dropdowns in sync when structures/counters change
		const origUpdateArrays = window.updateArrays;
		window.updateArrays = function () {
			const r = origUpdateArrays.apply(this, arguments);
			if (cbx.checked) { rebuildDropdown(); rebuildCounterDropdown(); }
			return r;
		};

		let rebuildPending = false;
		const scheduleRebuild = () => {
			if (!cbx.checked) return;
			if (rebuildPending) return;
			rebuildPending = true;
			requestAnimationFrame(() => { rebuildPending = false; rebuildDropdown(); });
		};
		const watchEls = [ds_list_enabled, ...DISABLED_IDS.map(id => document.getElementById(id))].filter(Boolean);
		const obs = new MutationObserver(scheduleRebuild);
		watchEls.forEach(el => obs.observe(el, { childList: true }));
		const structuresBox = document.getElementById('qa-structures-box');
		if (structuresBox) structuresBox.addEventListener('dblclick', scheduleRebuild, true);

		let counterRebuildPending = false;
		const scheduleCounterRebuild = () => {
			if (!cbx.checked) return;
			if (counterRebuildPending) return;
			counterRebuildPending = true;
			requestAnimationFrame(() => { counterRebuildPending = false; rebuildCounterDropdown(); });
		};
		const counterEnabledEl = document.getElementById('qa-counter-enabled');
		const counterWatchEls = [counterEnabledEl, ...COUNTER_DISABLED_IDS.map(id => document.getElementById(id))].filter(Boolean);
		const counterObs = new MutationObserver(scheduleCounterRebuild);
		counterWatchEls.forEach(el => counterObs.observe(el, { childList: true }));
		const counterBox = document.getElementById('qa-counter-itemlists');
		if (counterBox) counterBox.addEventListener('dblclick', scheduleCounterRebuild, true);

		cbx.addEventListener('change', () => {
			setCompactView(cbx.checked);
			if (typeof update_history === 'function') update_history();
		});

		if (window.matchMedia) {
			window.matchMedia('(max-width: 640px)').addEventListener('change', () => {
				const desc = document.getElementById('qa-structures-description');
				if (desc) desc.innerHTML = getDesc(cbx.checked);
			});
		}

		select.addEventListener('change', () => {
			const ds = select.value;
			if (!ds || !window.structures_list) return;
			structures_list.enable(ds);
			const placeholder = select.querySelector('option[value=""]');
			if (placeholder) placeholder.selected = true;
			rebuildDropdown();
		});

		const counterSelect = document.getElementById('qa-counter-add-select');
		if (counterSelect) counterSelect.addEventListener('change', () => {
			const ds = counterSelect.value;
			if (!ds || !window.counters_list) return;
			counters_list.enable(ds);
			const placeholder = counterSelect.querySelector('option[value=""]');
			if (placeholder) placeholder.selected = true;
			rebuildCounterDropdown();
		});

		// Allow dragging enabled items onto the dropdown to disable them.
		function setupDropToDisable(btnEl, list, sortable, groupName) {
			// The invisible select sits on top; disable pointer-events during drag so
			// Sortable's hit-testing can reach btnEl beneath it.
			const selectEl = btnEl.nextElementSibling;

			Sortable.create(btnEl, {
				group: { name: groupName, put: true, pull: false },
				sort: false,
				draggable: '.qa-item-draggable-invisible',
				onAdd: function (evt) {
					list.disable(evt.item.dataset.ds);
				}
			});

			const prevStart = sortable.option('onStart');
			sortable.option('onStart', function (evt) {
				if (prevStart) prevStart.call(this, evt);
				btnEl.textContent = '🗑';
				btnEl.classList.add('qa-drag-active');
				if (selectEl) selectEl.style.pointerEvents = 'none';
			});

			const prevEnd = sortable.option('onEnd');
			sortable.option('onEnd', function (evt) {
				if (prevEnd) prevEnd.call(this, evt);
				if (selectEl) selectEl.style.pointerEvents = '';
				btnEl.textContent = '+';
				btnEl.classList.remove('qa-drag-active');
			});
		}
		const structsAddBtn = document.getElementById('qa-structures-add-btn');
		if (structsAddBtn) setupDropToDisable(structsAddBtn, structures_list, structsSortable, 'qa-structs');
		const counterAddBtn = document.getElementById('qa-counter-add-btn');
		if (counterAddBtn) setupDropToDisable(counterAddBtn, counters_list, countersSortable, 'qa-counters');

		// Initial state set by load_history_internal()
		setCompactView(cbx.checked);
	})();

	// Show/hide advanced options
	(function () {
		function applyAdvanced(on) {
			const panel = document.getElementById('qa-advanced-options');
			if (panel) panel.classList.toggle('qa-hidden', !on);
		}
		const cbx = document.getElementById('qa-show-advanced-options');
		if (!cbx) return;
		// Initial state set by load_history_internal()
		applyAdvanced(cbx.checked);
		cbx.addEventListener('change', () => {
			applyAdvanced(cbx.checked);
			if (typeof update_history === 'function') update_history();
		});
	})();

	document.querySelectorAll(".qa-structure").forEach((elem) => { ds_name2html[elem.dataset.ds] = getOwnText(elem); });
	document.querySelectorAll(".qa-counter").forEach((elem) => {
		const ds = elem.dataset.ds;
		counter_name2html[ds] = getOwnText(elem);
		const structs = elem.dataset.structures;
		if (structs) counter_structures[ds] = structs.split(',').map(s => s.trim()).filter(Boolean);
	});

	// update output while typing
	qa_text.oninput = updateArrays;
	qa_text.onpropertychange = updateArrays;
	qa_separator_input.oninput = updateArrays;
	qa_separator_input.onpropertychange = updateArrays;

	update_history_internal();
	qa_is_loaded = true;
	updateArrays();


	setTimeout(() => {
		document.body.classList.remove('qa-page-loading');
	}, 250);
};

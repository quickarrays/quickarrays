function toggleVisibility(parent_id, state) {
	var structs = document.getElementById(parent_id);
	for(var i = 0; i < structs.children.length; i++) {
		if (structs.children[i].classList.contains('qa-item')) {
			structs.children[i].style.display = state ? 'block' : 'none';
		}
	}
}

function changeVisibility(element, is_visible) {
	const addClass = is_visible ? 'qa-visible': 'qa-hidden';
	const remClass = is_visible ? 'qa-hidden' : 'qa-visible';
	element.classList.remove(remClass);
	element.classList.add(addClass);
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
var qa_generate_string_span;

var qa_transform_active;
var qa_transform_active_span;
var qa_transform_list;
var qa_transform_input;

var ds_name2html = {};
var counter_name2html = {};

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
	if(!is_update_ready) { is_update_requested = true; }
	else {
		is_update_ready = false;
		update_history_internal();
		setTimeout(() => {
			is_update_ready = true;
			if(is_update_requested) {
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
const counter_automatic_default = true;

function update_history_internal() {
	var newQuery = $.query.empty();

	const text_query = options_list.enabled("whitespace") ? decodeWhitespaces(qa_text.value) : text_query = qa_text.value;
	if(text_query) { newQuery = newQuery.set("text", text_query); }

	const structures_query = structures_list.getEnabled();
	if(structures_query != structures_default) { newQuery = newQuery.set("structures", structures_query); }

	const options_query = options_list.getEnabled();
	if(options_query != options_default) { newQuery = newQuery.set("options_list", options_query); }

	const separator_query = decodeWhitespaces(qa_separator_input.value);
	if(separator_query != separator_default) { newQuery = newQuery.set("sep", separator_query); }

	const counters_query = counters_list.getEnabled();
	if(counters_query != counters_default) { newQuery = newQuery.set("counters", counters_query); }

	const generate_string_query = qa_generate_string_list.value;
	if(generate_string_query != generate_string_default) { newQuery = newQuery.set("generate_string", generate_string_query); }

	const generate_string_range_query = qa_generate_string_range.value;
	if(generate_string_range_query != generate_string_range_default) { newQuery = newQuery.set("generate_string_range", generate_string_range_query); }

	const transform_query = qa_transform_list.value;
	if(transform_query != transform_default) { newQuery = newQuery.set("transform", transform_query); }

	const prepend_query = qa_prepend_input.value;
	if(prepend_query != prepend_default) { newQuery = newQuery.set("prepend", prepend_query); }

	const append_query = qa_append_input.value;
	if(append_query != append_default) { newQuery = newQuery.set("append", append_query); }

	const counter_automatic_query = qa_counter_automatic.checked;
	if(counter_automatic_query != counter_automatic_default) { newQuery = newQuery.set("counter_automatic", counter_automatic_query ? '1' : '0'); }

	window.history.replaceState("", "", window.location.pathname + newQuery.toString());
}

function load_history_internal() {
	// parse configuration from GET url parameters
	const text_query = $.query.get("text").toString();
	if(text_query) { qa_text.value = text_query; }

	const counters_query = $.query.get("counters").toString();
	if(counters_query) { counters_list.setEnabled(counters_query); }

	const structures_query = $.query.get("structures").toString();
	if(structures_query) { structures_list.setEnabled(structures_query); }

	const options_query = $.query.get("options_list").toString();
	if(options_query) { options_list.setEnabled(options_query); }

	const sepfrom_query = $.query.get("sep").toString();
	if(sepfrom_query) { qa_separator_input.value = encodeWhitespaces(sepfrom_query); }

	const generate_string_query = $.query.get("generate_string").toString();
	if(generate_string_query) { qa_generate_string_list.value = generate_string_query; }
	if(generate_string_query && generate_string_query != 'custom') {
		changeVisibility(qa_generate_string_span, true);
		changeVisibility(qa_text, false);
	} else {
		changeVisibility(qa_generate_string_span, false);
		changeVisibility(qa_text, true);
	}

	const generate_string_range_query = $.query.get("generate_string_range").toString();
	if(generate_string_range_query) { 
		qa_generate_string_range.value = generate_string_range_query;
		qa_generate_string_rank.innerHTML = qa_generate_string_range.value;
	}


	const transform_query = $.query.get("transform").toString();
	if(transform_query) { qa_transform_list.value = transform_query; }

	const prepend_query = $.query.get("prepend").toString();
	if(prepend_query) { qa_prepend_input.value = prepend_query; }

	const append_query = $.query.get("append").toString();
	if(append_query) { qa_append_input.value = append_query; }

	const counter_automatic_query = $.query.get("counter_automatic").toString();
	if(counter_automatic_query) { qa_counter_automatic.checked = counter_automatic_query == '1'; }
	if(qa_counter_automatic.checked) {
		changeVisibility(qa_counter_itemlists, false);
	} else {
		changeVisibility(qa_counter_itemlists, true);
	}
}



function updateTextAreas() {
	updateTextArea(qa_text);
	updateTextArea(qa_ds_output);
}

function updateTextArea(area) {
	area.style.height = ""; 
	area.style.height = (10 + area.scrollHeight) + 'px';
}

var wasWhitespace = false;
function updateWhitespaces() {
	if(options_list.enabled("whitespace")) {
		const selStart = qa_text.selectionStart;
		const selEnd = qa_text.selectionEnd;
		qa_text.value = encodeWhitespaces(qa_text.value);
		qa_text.selectionStart = selStart;
		qa_text.selectionEnd = selEnd;
		wasWhitespace = true;
	}
	else if(wasWhitespace) {
		const selStart = qa_text.selectionStart;
		const selEnd = qa_text.selectionEnd;
		qa_text.value = decodeWhitespaces(qa_text.value);
		qa_text.selectionStart = selStart;
		qa_text.selectionEnd = selEnd;
		wasWhitespace = false;
	}
}

function custom_transform_text(text, eval_string) {
	var ret = '';
	for(var i = 0; i < text.length; i++) {
		try {
			const newchar = eval(eval_string);
			ret += newchar !== undefined ? newchar : text[i];
		}
		catch (error) {
			alert("Error in transformation: " + error.message);
			qa_transform_active.checked = false;
			return text;
		}
	}
	return ret;
}

function transform_text(text) {
	const selection = qa_transform_list.value;
	if(selection == 'none') { return text; }
	if(selection == 'custom') {
		if(qa_transform_active.checked == false) { return text; }
		return custom_transform_text(text, qa_transform_input.value);
	}
	const DS = construct_ds(text);
	return DS[selection];
}


function generate_text() {
	if(qa_generate_string_list.value == 'custom') {
		return qa_text.value;
	}
	if(!(qa_generate_string_list.value in string_generators)) {
		return 'Unknown string generator: ' + qa_generate_string_list.value;
	}
	return string_generators[qa_generate_string_list.value](parseInt(qa_generate_string_range.value));
}


function construct_text() {
	if(qa_generate_string_range.value == 'custom') {
	}

	let ds_text = generate_text();
	if(options_list.enabled("whitespace")) {
		ds_text = decodeWhitespaces(ds_text);
	} 

	if(!ds_text) { ds_text = qa_text.placeholder; }
	ds_text = transform_text(ds_text);

	if(ds_text.length == 0) {
		qa_ds_output.value = '';
		qa_counter_output.value = '';
		return;
	}
	if(qa_prepend_input.value) {
		ds_text = qa_prepend_input.value + ds_text;
	}
	if(qa_append_input.value) {
		ds_text = ds_text + qa_append_input.value;
	}
	if(options_list.enabled("dollar")) ds_text += '\0';
	return ds_text;
}

function updateArrays() {
	qa_separator_input.value = encodeWhitespaces(qa_separator_input.value);
	updateWhitespaces();

	const ds_text = construct_text();
	const DS = construct_ds(ds_text);
	DS['text'] = ds_text;

	const Counters = construct_counters(DS);
	Counters['text'] = number_of_runs(ds_text);
	// const Counters = {
	// 	'delta' : count_delta(DS.substring_complexity),
	// 	'text' : ds_text.length,
	// };

	const sep = decodeWhitespaces(qa_separator_input.value);

	let pad = 0;
	structures_list.forEachEnabled(function(dsName) {
		const ds_htmlname = ds_name2html[dsName] ? ds_name2html[dsName] : dsName;
		if(ds_htmlname.length > pad) pad = ds_htmlname.length;
	});

	const varBase = options_list.enabled("baseone") ? 1 : 0;

	{ const result = [];
		structures_list.forEachEnabled(function(dsName) {
			let varDs = DS[dsName];
			if(!varDs) {
				result.push("Function " + dsName + ": not defined");
				return;
			}
			if(structures_list.isIndex(dsName)) {
				varDs = replace_invalid_position(varDs, ds_text.length);
				if(varBase != 0) {
					varDs = increment_array(varDs);
				}
			}
			if(structures_list.isString(dsName)) {
				if(options_list.enabled("whitespace")) {
					varDs = encodeWhitespaces(varDs);
				}
				varDs = prettify_string(varDs, sep, varBase, options_list.enabled("tabularize"));
			} else if(structures_list.isFactorization(dsName)) {
				if(options_list.enabled("facttext")) {
					varDs = prettify_factorization(options_list.enabled("whitespace") ? encodeWhitespaces(ds_text) : ds_text, varDs, sep, varBase);
				} else { 
					varDs = prettify_array(varDs.map((b) => b ? 1 : 0), sep, varBase); 
				}
			} else { 
				varDs = prettify_array(varDs, sep, varBase); 
			}
			const ds_htmlname = ds_name2html[dsName] ? ds_name2html[dsName] : dsName;
			result.push(padRight(ds_htmlname + ":", ' ', pad + 2) + varDs);
		});
		qa_ds_output.value = result.join('\n');
	}

	enabled_counters = qa_counter_automatic.checked ? structures_list : counters_list;

	const result = [];
	enabled_counters.forEachEnabled(function(dsName) {
		let varDs = Counters[dsName];
		const ds_htmlname = counter_name2html[dsName] ? counter_name2html[dsName] : dsName;
		if(varDs === undefined) {
			if(qa_counter_automatic.checked) {
				return;
			}
			result.push(dsName + ": not defined");
		} else {
		result.push(ds_htmlname + ": " + varDs);
		}
	});
	qa_counter_output.innerHTML = [...result].map((el) => '<span class="qa-item">' + el + '</span>').join('&nbsp;');

	updateTextAreas();
	update_history();
}

function initDragAndDrop(listEnabled, listDisabled) {
	Sortable.create(listEnabled, {
		group: 'qa-structs',
		draggable: '.qa-item',
		ghostClass: 'qa-item-ghost',
		dragClass: 'qa-item-drag',
		onSort: updateArrays
	});
	Sortable.create(listDisabled, {
		group: 'qa-structs',
		draggable: '.qa-item',
		ghostClass: 'qa-item-ghost',
		dragClass: 'qa-item-drag'
	});
}

const tutorials = {};
tutorials['bw_transform'] = {
	'title' : 'Transformations',
	'content' : 'You can apply transformations to the generated string. For example, you can convert all characters to uppercase by using the custom transformation with the code "text[i].toUpperCase()".',
	'reference': 'Mozilla Developer Network (MDN), "String.prototype.toUpperCase()", https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase',
	'wikipedia': 'String_(computer_science)#Changing_case'
};
tutorials['thue-morse'] = {
	'title' : 'Thue-Morse Sequence',
	'content' : 'The Thue-Morse sequence is a binary sequence that is constructed by starting with 0 and successively appending the binary complement of the sequence obtained so far. It is known for its applications in combinatorics and theoretical computer science. It uses the morphism \\(0 \\to 01, 1 \\to 10 \\).',
	'oeis': 'A010060',
	'reference': 'Allouche, J.-P.; Shallit, J. (1999), "The ubiquitous Prouhet-Thue-Morse sequence", in Graham, R. L.; Grötschel, M.; Lovász, L. (eds.), Handbook of Combinatorics, Elsevier and MIT Press, pp. 873–901.',
	'wikipedia': 'Thue%E2%80%93Morse_sequence'
};

var qa_tutorial_open_button;
var qa_tutorial_close_button;
var qa_tutorial_overlay;
var qa_tutorial_title;
var qa_tutorial_content;
var qa_tutorial_oeis
var qa_tutorial_reference;
var qa_tutorial_wikipedia;

function update_tutorial(id, name) {
		if(tutorials[id] === undefined) { return; }
			const tutorial = tutorials[id];
			qa_tutorial_title.innerHTML = tutorial.title;
			qa_tutorial_content.innerHTML = tutorial.content;
			if (typeof MathJax !== 'undefined') {
				MathJax.typeset([qa_tutorial_content]);
			}
			if(tutorial.oeis !== undefined) {
				qa_tutorial_oeis.style.display = "block";
				qa_tutorial_oeis.innerHTML = "OEIS: " + tutorial.oeis;
				qa_tutorial_oeis.href = "https://oeis.org/" + tutorial.oeis;
			}
			else {
				qa_tutorial_oeis.style.display = "none";
			}
			if(tutorial.reference !== undefined) {
				qa_tutorial_reference.style.display = "block";
				qa_tutorial_reference.href = tutorial.reference;
			}
			else {
				qa_tutorial_reference.style.display = "none";
			}
			if(tutorial.wikipedia !== undefined) {
				qa_tutorial_wikipedia.style.display = "block";
				qa_tutorial_wikipedia.innerHTML = "Wikipedia Article about " + name;
				qa_tutorial_wikipedia.href = "https://en.wikipedia.org/wiki/" + tutorial.wikipedia;
			}
			qa_tutorial_open_button.innerHTML = "Explain me more about <b>" + name + "</b>!";
			qa_tutorial_open_button.style.display = "inline-block";
}

window.onload = function () {

	qa_tutorial_open_button = document.getElementById('qa-tutorial-open-button');
	qa_tutorial_close_button = document.getElementById('qa-tutorial-close-button');
	qa_tutorial_overlay = document.getElementById('qa-tutorial-overlay');
	qa_tutorial_title = document.getElementById('qa-tutorial-title');
	qa_tutorial_content = document.getElementById('qa-tutorial-content');
	qa_tutorial_oeis = document.getElementById('qa-tutorial-oeis');
	qa_tutorial_reference = document.getElementById('qa-tutorial-reference');
	qa_tutorial_wikipedia = document.getElementById('qa-tutorial-wikipedia');

	//tutorial
	qa_tutorial_open_button.onclick = function() { qa_tutorial_overlay.style.display = "block"; }
	qa_tutorial_close_button.onclick = function() { qa_tutorial_overlay.style.display = "none"; }
	// Close the pop-up when clicking anywhere outside the box
	window.onclick = function(event) {
		if (event.target == qa_tutorial_overlay) {
			qa_tutorial_overlay.style.display = "none";
		}
	}


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
	qa_generate_string_span = document.getElementById('qa-generate-string-span');

	document.querySelectorAll(".qa-item").forEach((elem) => {
		if(tutorials[elem.dataset.ds] === undefined) { return; }
		elem.onmouseover = function() { 
			update_tutorial(elem.dataset.ds, elem.innerHTML);
		};
	});

	const ds_list_enabled = document.getElementById('qa-structures-enabled');
	const ds_list_disabled = document.getElementById('qa-structures-disabled');

	const counter_list_enabled = document.getElementById('qa-counter-enabled');
	const counter_list_disabled = document.getElementById('qa-counter-disabled');

	const triggering = [qa_transform_active, qa_prepend_input, qa_append_input, qa_transform_list, qa_transform_input, qa_generate_string_list];
	for(const idx in triggering) {
		triggering[idx].addEventListener('change', function() {
			updateArrays();
		});
		triggering[idx].addEventListener('input', function() {
			updateArrays();
		});
	}
	qa_counter_automatic.addEventListener('change', function()  {
		changeVisibility(qa_counter_itemlists, !qa_counter_automatic.checked);
		updateArrays();
	});


	qa_generate_string_range.addEventListener('input', function() {
		qa_generate_string_rank.innerHTML = qa_generate_string_range.value;
		updateArrays();
	});

	qa_transform_list.addEventListener('change', function() {
		qa_transform_active.checked = false;
		updateArrays();
	});

	qa_generate_string_list.addEventListener('change', function() {
		const is_visible = this.value != 'custom';
		changeVisibility(qa_generate_string_span, is_visible);
		changeVisibility(qa_text, !is_visible);
		const selectedIndex = this.selectedIndex;
		const selectedInnerHTML = this.options[selectedIndex].innerHTML;
		update_tutorial(this.value, selectedInnerHTML);
		updateArrays();
	});

	qa_transform_list.addEventListener('change', function() {
		const is_visible = this.value == 'custom';
		changeVisibility(qa_transform_input, is_visible);
		changeVisibility(qa_transform_active_span, is_visible);
		const selectedIndex = this.selectedIndex;
		const selectedInnerHTML = this.options[selectedIndex].innerHTML;
		update_tutorial(this.value, selectedInnerHTML);
		updateArrays();
	});
	qa_transform_input.addEventListener('input', function() {
		qa_transform_active.checked = false;
	});

	document.getElementById('qa-structures-disabled-visible').addEventListener('change', function() {
		toggleVisibility('qa-structures-disabled', this.checked);
	});
	document.getElementById('qa-structures-enabled-visible').addEventListener('change', function() {
		toggleVisibility('qa-structures-enabled', this.checked);
	});
	document.getElementById('qa-counter-disabled-visible').addEventListener('change', function() {
		toggleVisibility('qa-counter-disabled', this.checked);
	});
	document.getElementById('qa-counter-enabled-visible').addEventListener('change', function() {
		toggleVisibility('qa-counter-enabled', this.checked);
	});

	document.querySelectorAll(".qa-structure").forEach((elem) => { ds_name2html[elem.dataset.ds] = getOwnText(elem); });
	document.querySelectorAll(".qa-counter").forEach((elem) => { counter_name2html[elem.dataset.ds] = getOwnText(elem); });

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

	qa_separator_input.value = encodeWhitespaces(separator_default);

	generate_string_default = qa_generate_string_list.value;
	generate_string_range_default = qa_generate_string_range.value;
	transform_default = qa_transform_list.value;
	prepend_default = qa_prepend_input.value;
	append_default = qa_append_input.value;

	load_history_internal();


	// update output while typing
	qa_text.oninput = updateArrays;
	qa_text.onpropertychange = updateArrays;
	qa_separator_input.oninput = updateArrays;
	qa_separator_input.onpropertychange = updateArrays;

	updateArrays();
	update_history_internal();
	initDragAndDrop(ds_list_enabled, ds_list_disabled);
	initDragAndDrop(counter_list_enabled, counter_list_disabled);
};

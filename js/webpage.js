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

var dataStructures;
var counterStructures;
var options;

var defaultStructures;
var defaultCounters;
var defaultOptions;
const defaultSeparator = ' ';

var updateRequested = true;
var updateReady = true;
function updateHistory() {
	if(!updateReady) updateRequested = true;
	else {
		updateReady = false;
		updateHistoryInternal();
		setTimeout(function() {
			updateReady = true;
			if(updateRequested) {
				updateRequested = false;
				updateHistory();
			}
		}, 1000);
	}
}

function updateHistoryInternal() {
	var structsStr = dataStructures.getEnabled();
	var optsStr = options.getEnabled();

	var newQuery = $.query.empty();
	var inText;
	if(options.enabled("whitespace"))
		inText = decodeWhitespaces(qa_text.value);
	else inText = qa_text.value;

	if(inText) newQuery = newQuery.set("text", inText);
	if(structsStr != defaultStructures) newQuery = newQuery.set("structures", structsStr);

	const sep = decodeWhitespaces(qa_separator_input.value);
	if(sep != defaultSeparator) { newQuery = newQuery.set("sep", sep); }

	if(optsStr != defaultOptions) newQuery = newQuery.set("options", optsStr);

	window.history.replaceState("", "", window.location.pathname + newQuery.toString());
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
	if(options.enabled("whitespace")) {
		var selStart = qa_text.selectionStart;
		var selEnd = qa_text.selectionEnd;
		qa_text.value = encodeWhitespaces(qa_text.value);
		qa_text.selectionStart = selStart;
		qa_text.selectionEnd = selEnd;
		wasWhitespace = true;
	}
	else if(wasWhitespace) {
		var selStart = qa_text.selectionStart;
		var selEnd = qa_text.selectionEnd;
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
	if(options.enabled("whitespace")) {
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
	if(options.enabled("dollar")) ds_text += '\0';
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
	dataStructures.forEachEnabled(function(dsName) {
		const ds_htmlname = ds_name2html[dsName] ? ds_name2html[dsName] : dsName;
		if(ds_htmlname.length > pad) pad = ds_htmlname.length;
	});

	const varBase = options.enabled("baseone") ? 1 : 0;

	{ const result = [];
		dataStructures.forEachEnabled(function(dsName) {
			let varDs = DS[dsName];
			if(!varDs) {
				result.push("Function " + dsName + ": not defined");
				return;
			}
			if(dataStructures.isIndex(dsName)) {
				varDs = replace_invalid_position(varDs, ds_text.length);
				if(varBase != 0) {
					varDs = increment_array(varDs);
				}
			}
			if(dataStructures.isString(dsName)) {
				if(options.enabled("whitespace")) {
					varDs = encodeWhitespaces(varDs);
				}
				varDs = prettify_string(varDs, sep, varBase, options.enabled("tabularize"));
			} else if(dataStructures.isFactorization(dsName)) {
				if(options.enabled("facttext")) {
					varDs = prettify_factorization(options.enabled("whitespace") ? encodeWhitespaces(ds_text) : ds_text, varDs, sep, varBase);
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

	enabled_counters = qa_counter_automatic.checked ? dataStructures : counterStructures;

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
	updateHistory();
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

window.onload = function () {
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
		updateArrays();
	});


	qa_transform_list.addEventListener('change', function() {
		const is_visible = this.value == 'custom';
		changeVisibility(qa_transform_input, is_visible);
		changeVisibility(qa_transform_active_span, is_visible);
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
	dataStructures = new DataStructureList(ds_list_enabled, ds_list_disabled, updateArrays, true);
	document.querySelectorAll(".qa-structure").forEach((elem) => { dataStructures.add(elem); });
	defaultStructures = dataStructures.getEnabled();

	// initialize counter settings container
	counterStructures = new CounterList(counter_list_enabled, counter_list_disabled, updateArrays, true);
	document.querySelectorAll(".qa-counter").forEach((elem) => { counterStructures.add(elem); });
	defaultCounters = counterStructures.getEnabled();

	// initialize option settings container
	options = new OptionList(updateArrays);
	document.querySelectorAll(".qa-option-cbx").forEach((elem) => { options.add(elem); });
	defaultOptions = options.getEnabled();

	qa_separator_input.value = encodeWhitespaces(defaultSeparator);

	// parse configuration from GET url parameters
	var textquery = $.query.get("text").toString();
	if(textquery) { qa_text.value = textquery; }
	var queryStructures = $.query.get("structures").toString();
	if(queryStructures) dataStructures.setEnabled(queryStructures);
	var queryOptions = $.query.get("options").toString();
	if(queryOptions) options.setEnabled(queryOptions);		
	var sepfromquery = $.query.get("sep").toString();
	if(sepfromquery) 
		if(sepfromquery == "true") 
			qa_separator_input.value = ""; 
	else 
		qa_separator_input.value = encodeWhitespaces(sepfromquery)

	// update output while typing
	qa_text.oninput = updateArrays;
	qa_text.onpropertychange = updateArrays;
	qa_separator_input.oninput = updateArrays;
	qa_separator_input.onpropertychange = updateArrays;

	updateArrays();
	updateHistoryInternal();
	initDragAndDrop(ds_list_enabled, ds_list_disabled);
	initDragAndDrop(counter_list_enabled, counter_list_disabled);
};


// ///// UTILITY
//
// function number_of_runs(text) {
// 	var runs = 1;
// 	var runchar = text[0];
// 	for(var i = 1; i < text.length; ++i) {
// 		if(text[i] != runchar) {
// 			++runs;
// 			runchar = text[i];
// 		}
// 	}
// 	return runs;
// }
//
// function number_of_ones(text) {
// 	var count = 0;
// 	for(var i = 0; i < text.length; ++i) {
// 		if(text[i] == 1) {
// 			++count;
// 		}
// 	}
// 	return count;
// }
//
// function padRight(str, char, len) {
// 	while(str.length < len) str += char;
// 	return str;
// }
//
// function padLeft(str, char, len) {
// 	while(str.length < len) str = char + str;
// 	return str;
// }
//
//
// function increment_array(array, inc = 1) {
// 	return array.map((x) => x + inc);
// }
//
// function replace_invalid_position(array, max_length) {
// 	return array.map((x) => (x >= max_length) ? '-' : x);
// }
//
// function prettify_string(string, sep = " ", base = 0, doTabularize = true) {
// 	string = string.replace("\0", "$");
// 	var width = doTabularize ? ("" + (string.length + base - 1).toString()).length : 0
// 	if(!doTabularize) {
// 		sep = '';
// 	}
// 	return string.split('').map((x) => padLeft("" + x, ' ', width)).join(sep);
// }
//
// function prettify_array(array, sep = " ", base = 0) {
// 	var width = ("" + (array.length + base - 1).toString()).length
// 	return array.map((x) => padLeft("" + x, ' ', width)).join(sep);
// }
//
// function encodeWhitespaces(string) {
// 	return string.replace(/\n/g, '\u21b5').replace(/\s/g, '\u23b5');
// }
//
// function decodeWhitespaces(string) {
// 	return string.replace(/\u21b5/g, '\n').replace(/\u23b5/g, ' ');
// }
//
//
// /* fact[i] = 1 means that a factor ends at position i */
// function prettify_factorization(string, fact, sep = " ", base = 0) {
//     var n = string.length;
//
//     var width = ("" + (n + base - 1).toString()).length
//     var result = "";
//     for(var i = 0; i < n; ++i) {
//         result += padLeft("" + ((i == n-1 && string[i] == '\0') ? '$' : string[i]), ' ', width);
//         result += (fact[i] == 1) ? ('|'+sep.substring(1))  : sep;
//     }
//     return result;
// }

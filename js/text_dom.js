function toggleVisibility(parent_id, state) {
	var structs = document.getElementById(parent_id);
	for(var i = 0; i < structs.children.length; i++) {
		if (structs.children[i].classList.contains('qa-structure')) {
			structs.children[i].style.display = state ? 'block' : 'none';
		}
	}
}
document.getElementById('predefined-transform').addEventListener('change', function() {
	document.getElementById('textTransform').disabled = this.value != 'custom';
});

document.getElementById('qa-structures-enabled-transform').addEventListener('change', function() {
	['textTransform', 'qa-structures-active-span'].forEach((elementId) => {
		document.getElementById(elementId).style.display = this.checked ? 'block' : 'none';
	});
});

document.getElementById('qa-structures-disabled-visible').addEventListener('change', function() {
	toggleVisibility('qa-structures-disabled', this.checked);
});
document.getElementById('qa-structures-enabled-visible').addEventListener('change', function() {
	toggleVisibility('qa-structures-enabled', this.checked);
});

document.getElementById('textTransform').addEventListener('input', function() {
	document.getElementById('qa-structures-active-transform').checked = false;
});

document.getElementById('qa-structures-active-transform').addEventListener('change', function() {
	updateArrays();
});

var inField;
var outField;
var separatorField;
var dataStructures;
var options;

var defaultStructures;
var defaultOptions;
var defaultSeparator;

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
		inText = decodeWhitespaces(inField.value);
	else inText = inField.value;

	if(inText) newQuery = newQuery.set("text", inText);
	if(structsStr != defaultStructures) newQuery = newQuery.set("structures", structsStr);

	var sep = decodeWhitespaces(separatorField.value);
	if(sep != defaultSeparator) newQuery = newQuery.set("sep", sep);

	if(optsStr != defaultOptions) newQuery = newQuery.set("options", optsStr);

	window.history.replaceState("", "", window.location.pathname + newQuery.toString());
}

function updateTextAreas() {
	updateTextArea(inField);
	updateTextArea(outField);
}

function updateTextArea(area) {
	area.style.height = ""; 
	area.style.height = (10 + area.scrollHeight) + 'px';
}


var wasWhitespace = false;
function updateWhitespaces() {
	if(options.enabled("whitespace")) {
		var selStart = inField.selectionStart;
		var selEnd = inField.selectionEnd;
		inField.value = encodeWhitespaces(inField.value);
		inField.selectionStart = selStart;
		inField.selectionEnd = selEnd;
		wasWhitespace = true;
	}
	else if(wasWhitespace) {
		var selStart = inField.selectionStart;
		var selEnd = inField.selectionEnd;
		inField.value = decodeWhitespaces(inField.value);
		inField.selectionStart = selStart;
		inField.selectionEnd = selEnd;
		wasWhitespace = false;
	}
}

function transformText(text) {
	const transform = document.getElementById('textTransform').value;
	var ret = '';

	var minchar = text.split('').sort()[0];
	var maxchar = text.split('').sort().reverse()[0];

	function invert(c) {
		return String.fromCharCode(maxchar.charCodeAt(0) - (c.charCodeAt(0) - minchar.charCodeAt(0)));
	}
	const selection = document.getElementById('predefined-transform').value;
	if(selection == 'invert') {
		for(var i = 0; i < text.length; i++) {
			ret += invert(text[i]);
		}
		return ret;
	}
	if(selection == 'revert') {
		for(var i = 0; i < text.length; i++) {
			ret += text[text.length - 1 - i];
		}
		return ret;
	}
	for(var i = 0; i < text.length; i++) {
		try {
			const newchar = eval(transform);
			ret += newchar !== undefined ? newchar : text[i];
		}
		catch (error) {
			alert("Error in transformation: " + error.message);
			document.getElementById('qa-structures-active-transform').checked = false;
			return text;
		}
	}
	return ret;
}


function construct_text() {
	let ds_text = '';
	if(options.enabled("whitespace"))
		ds_text = decodeWhitespaces(inField.value);
	else 
		ds_text = inField.value;

	if(!ds_text) ds_text = inField.placeholder;
	if(document.getElementById('qa-structures-enabled-transform').checked && document.getElementById('qa-structures-active-transform').checked) {
		ds_text = transformText(ds_text);
	}
	if(ds_text.length == 0) {
		outField.value = '';
		return;
	}
	if(options.enabled("dollar")) ds_text += '\0';
	return ds_text;
}

function updateArrays() {
	separatorField.value = encodeWhitespaces(separatorField.value);
	updateWhitespaces();

	const ds_text = construct_text();
	const DS = construct_ds(ds_text);
	DS['text'] = ds_text;

	const sep = decodeWhitespaces(separatorField.value);

	let pad = 0;
	dataStructures.forEachEnabled(function(dsName) {
		if (dsName.length > pad) pad = dsName.length;
	});

	const varBase = options.enabled("baseone") ? 1 : 0;

	let result = "";
	dataStructures.forEachEnabled(function(dsName) {
		let varDs = DS[dsName];
		if(!varDs) {
			result += ("ds_" + dsName) + ": not defined\n";
			return;
		}
		if(dataStructures.isIndex(dsName) && varBase != 0) {
			varDs = increment_array(varDs);
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
				varDs = prettify_array(varDs.map((b) => b ? 0 : 1), sep, varBase); 
			}
		} else { 
			varDs = prettify_array(varDs, sep, varBase); 
		}
		result += padRight(dsName + ":", ' ', pad + 2) + varDs + "\n";
	});
	outField.value = result.slice(0, result.length - 1);
	updateTextAreas();
	updateHistory();
}

function initDragAndDrop(listEnabled, listDisabled) {
	Sortable.create(listEnabled, {
		group: 'qa-structs',
		draggable: '.qa-structure',
		ghostClass: 'qa-structure-ghost',
		dragClass: 'qa-structure-drag',
		onSort: updateArrays
	});
	Sortable.create(listDisabled, {
		group: 'qa-structs',
		draggable: '.qa-structure',
		ghostClass: 'qa-structure-ghost',
		dragClass: 'qa-structure-drag'
	});
}

window.onload = function () {
	inField = document.getElementById('textSource');
	outField = document.getElementById('arraysDestination');
	separatorField = document.getElementById('separatorSource');
	structuresListEn = document.getElementById('qa-structures-enabled');
	structuresListDis = document.getElementById('qa-structures-disabled');

	// initalize data structure settings container
	var structureElements = document.getElementsByClassName("qa-structure");
	dataStructures = new DataStructureList(structuresListEn, structuresListDis, updateArrays, true);
	for(var i = 0; i < structureElements.length; i++) dataStructures.add(structureElements[i]);
	defaultStructures = dataStructures.getEnabled();

	// initialize option settings container
	var optionElements = document.getElementsByClassName("qa-option-cbx");
	options = new OptionList(updateArrays);
	for(var i = 0; i < optionElements.length; i++) options.add(optionElements[i]);
	defaultOptions = options.getEnabled();

	defaultSeparator = " ";
	separatorField.value = encodeWhitespaces(defaultSeparator);

	// parse configuration from GET url parameters
	var textquery = $.query.get("text").toString();
	if(textquery) inField.value = textquery;
	var queryStructures = $.query.get("structures").toString();
	if(queryStructures) dataStructures.setEnabled(queryStructures);
	var queryOptions = $.query.get("options").toString();
	if(queryOptions) options.setEnabled(queryOptions);		
	var sepfromquery = $.query.get("sep").toString();
	if(sepfromquery) 
		if(sepfromquery == "true") 
			separatorField.value = ""; 
	else 
		separatorField.value = encodeWhitespaces(sepfromquery)

	// update output while typing
	inField.oninput = updateArrays;
	inField.onpropertychange = updateArrays;
	separatorField.oninput = updateArrays;
	separatorField.onpropertychange = updateArrays;

	updateArrays();
	updateHistoryInternal();
	initDragAndDrop(structuresListEn, structuresListDis);
};


///// UTILITY

function number_of_runs(text) {
	var runs = 1;
	var runchar = text[0];
	for(var i = 1; i < text.length; ++i) {
		if(text[i] != runchar) {
			++runs;
			runchar = text[i];
		}
	}
	return runs;
}

function number_of_ones(text) {
	var count = 0;
	for(var i = 0; i < text.length; ++i) {
		if(text[i] == 1) {
			++count;
		}
	}
	return count;
}

function padRight(str, char, len) {
	while(str.length < len) str += char;
	return str;
}

function padLeft(str, char, len) {
	while(str.length < len) str = char + str;
	return str;
}


function increment_array(array, inc = 1) {
	return array.map((x) => x + inc);
}

function prettify_string(string, sep = " ", base = 0, doTabularize = true) {
	string = string.replace("\0", "$");
	var width = doTabularize ? ("" + (string.length + base - 1).toString()).length : 0
	if(!doTabularize) {
		sep = '';
	}
	return string.split('').map((x) => padLeft("" + x, ' ', width)).join(sep);
}

function prettify_array(array, sep = " ", base = 0) {
	var width = ("" + (array.length + base - 1).toString()).length
	return array.map((x) => padLeft("" + x, ' ', width)).join(sep);
}

function encodeWhitespaces(string) {
	return string.replace(/\n/g, '\u21b5').replace(/\s/g, '\u23b5');
}

function decodeWhitespaces(string) {
	return string.replace(/\u21b5/g, '\n').replace(/\u23b5/g, ' ');
}

/* fact[i] = 1 means that a factor ends at position i */
function prettify_factorization(string, fact, sep = " ", base = 0) {
    var n = string.length;

    var width = ("" + (n + base - 1).toString()).length
    var result = "";
    for(var i = 0; i < n - 1; i++) {
        result += padLeft("" + string[i], ' ', width);
        result += (fact[i] == 1) ? ('|'+sep.substring(1))  : sep;
    }
    result += padLeft("" + (string[n-1] == '\0' ? '$' : string[n-1]), (fact[n-1] == 1) ? '|' : ' ', width);
    return result;
}

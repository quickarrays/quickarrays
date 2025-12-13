class CounterList {
    constructor(enabledParent, disabledParent, onChange, enableDblClick) {
        this.dictionary = {};
        this.enParent = enabledParent;
        this.disParent = disabledParent;
        this.onChange = onChange;
        this.enableDblClick = enableDblClick;
    }
    add(domElement) {
        this.dictionary[domElement.dataset.ds] = domElement;
        var self = this;
        domElement.ondblclick = function() { self.toggle(domElement.dataset.ds); };
    }
}


CounterList.prototype.getEnabled = function() {
    var result = "";
    var enabledNodes = this.enParent.getElementsByClassName("qa-counter");
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName))
            result += dsName + '-';
    }
    return result.slice(0, Math.max(0, result.length - 1));
};

CounterList.prototype.setEnabled = function(dsList) {
    for(var key in this.dictionary)
        this.disable(key);
    var structs = dsList.split('-');
    for(var i = 0; i < structs.length; i++)
        this.enable(structs[i]);
};

CounterList.prototype.enabled = function(dsName) {
    return this.dictionary[dsName] 
        && this.dictionary[dsName].parentElement == this.enParent;
};

CounterList.prototype.forEachEnabled = function(func) {
    var enabledNodes = this.enParent.getElementsByClassName("qa-counter");
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName)) func(dsName);
    }
};

CounterList.prototype.enable = function(dsName) {
    var el = this.dictionary[dsName];
    if(el) {
        this.enParent.appendChild(el);
        this.onChange();
    }
};

CounterList.prototype.disable = function(dsName) {
    var el = this.dictionary[dsName];
    if(el) {
        this.disParent.appendChild(el);
        this.onChange();
    }
};

CounterList.prototype.toggle = function(dsName) {
    if(this.enabled(dsName)) this.disable(dsName);
    else this.enable(dsName);
};

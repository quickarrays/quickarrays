class DataStructureList {
    constructor(enabledParent, disabledParent, onChange, enableDblClick) {
        this.dictionary = {};
        this.enParent = enabledParent;
        // disabledParent can be a single element or a map { string, index, length, factor, other }
        this.disParent = disabledParent;
        this.onChange = onChange;
        this.enableDblClick = enableDblClick;
    }
    _getDisabledParent(dsName) {
        if (this.disParent && this.disParent.nodeType) return this.disParent;
        const el = this.dictionary[dsName];
        if (!el) return this.disParent && this.disParent.other || null;
        if (el.classList.contains('qa-structure-string')) return this.disParent.string;
        if (el.classList.contains('qa-structure-index')) return this.disParent.index;
        if (el.classList.contains('qa-structure-length')) return this.disParent.length;
        if (el.classList.contains('qa-structure-factor')) return this.disParent.factor;
        return this.disParent.other;
    }
    add(domElement) {
        this.dictionary[domElement.dataset.ds] = domElement;
        var self = this;
        domElement.ondblclick = function() { self.toggle(domElement.dataset.ds); };
    }
}


DataStructureList.prototype.getEnabled = function() {
    var result = "";
    var enabledNodes = this.enParent.getElementsByClassName("qa-structure");
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName))
            result += dsName + '-';
    }
    return result.slice(0, Math.max(0, result.length - 1));
};

DataStructureList.prototype.setEnabled = function(dsList) {
    for(var key in this.dictionary)
        this.disable(key);
    var structs = dsList.split('-');
    for(var i = 0; i < structs.length; i++)
        this.enable(structs[i]);
};

DataStructureList.prototype.enabled = function(dsName) {
    return this.dictionary[dsName]
        && this.dictionary[dsName].parentElement == this.enParent;
};

DataStructureList.prototype.isIndex = function(dsName) {
    return this.dictionary[dsName] 
        && this.dictionary[dsName].classList.contains('qa-structure-index');
};

DataStructureList.prototype.isLength = function(dsName) {
    return this.dictionary[dsName] 
        && this.dictionary[dsName].classList.contains('qa-structure-length');
};

DataStructureList.prototype.isString = function(dsName) {
    return this.dictionary[dsName] 
        && this.dictionary[dsName].classList.contains('qa-structure-string');
};
DataStructureList.prototype.isFactorization = function(dsName) {
    return this.dictionary[dsName] 
        && this.dictionary[dsName].classList.contains('qa-structure-factor');
};

DataStructureList.prototype.forEachEnabled = function(func) {
    var enabledNodes = this.enParent.getElementsByClassName("qa-structure");
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName)) func(dsName);
    }
};

DataStructureList.prototype.enable = function(dsName) {
    var el = this.dictionary[dsName];
    if(el) {
        this.enParent.appendChild(el);
        this.onChange();
    }
};

DataStructureList.prototype.disable = function(dsName) {
    var el = this.dictionary[dsName];
    var parent = this._getDisabledParent(dsName);
    if(el && parent) {
        insertInLexOrder(parent, el, '.qa-structure');
        this.onChange();
    }
};

DataStructureList.prototype.toggle = function(dsName) {
    if(this.enabled(dsName)) this.disable(dsName);
    else this.enable(dsName);
};

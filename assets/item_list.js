class ItemList {
    constructor(enabledParent, disabledParent, onChange, enableDblClick, cssClass, categoryResolver) {
        this.dictionary = {};
        this.enParent = enabledParent;
        this.disParent = disabledParent;
        this.onChange = onChange;
        this.enableDblClick = enableDblClick;
        this.cssClass = cssClass;
        this.categoryResolver = categoryResolver;
    }
    _getDisabledParent(dsName) {
        if (this.disParent && this.disParent.nodeType) return this.disParent;
        const el = this.dictionary[dsName];
        if (!el) return this.disParent && this.disParent.other || null;
        if (this.categoryResolver) {
            const category = this.categoryResolver(el);
            if (category && this.disParent[category]) return this.disParent[category];
        }
        return this.disParent.other;
    }
    add(domElement) {
        this.dictionary[domElement.dataset.ds] = domElement;
        var self = this;
        domElement.ondblclick = function() { self.toggle(domElement.dataset.ds); };
    }
}

ItemList.prototype.getEnabled = function() {
    var result = "";
    var enabledNodes = this.enParent.getElementsByClassName(this.cssClass);
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName))
            result += dsName + '-';
    }
    return result.slice(0, Math.max(0, result.length - 1));
};

ItemList.prototype.setEnabled = function(dsList) {
    for(var key in this.dictionary)
        this.disable(key);
    var structs = dsList.split('-');
    for(var i = 0; i < structs.length; i++)
        this.enable(structs[i]);
};

ItemList.prototype.enabled = function(dsName) {
    return this.dictionary[dsName]
        && this.dictionary[dsName].parentElement == this.enParent;
};

ItemList.prototype.hasClass = function(dsName, className) {
    return this.dictionary[dsName]
        && this.dictionary[dsName].classList.contains(className);
};

ItemList.prototype.forEachEnabled = function(func) {
    var enabledNodes = this.enParent.getElementsByClassName(this.cssClass);
    for(var i = 0; i < enabledNodes.length; i++) {
        var dsName = enabledNodes[i].dataset.ds;
        if(this.enabled(dsName)) func(dsName);
    }
};

ItemList.prototype.enable = function(dsName) {
    var el = this.dictionary[dsName];
    if(el) {
        this.enParent.appendChild(el);
        this.onChange();
    }
};

ItemList.prototype.disable = function(dsName) {
    var el = this.dictionary[dsName];
    var parent = this._getDisabledParent(dsName);
    if(el && parent) {
        insertInLexOrder(parent, el, '.' + this.cssClass);
        this.onChange();
    }
};

ItemList.prototype.toggle = function(dsName) {
    if(this.enabled(dsName)) this.disable(dsName);
    else this.enable(dsName);
};

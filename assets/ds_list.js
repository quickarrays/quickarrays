class DataStructureList extends ItemList {
    constructor(enabledParent, disabledParent, onChange, enableDblClick) {
        // disabledParent can be a single element or a map { string, index, length, factor, other }
        super(enabledParent, disabledParent, onChange, enableDblClick, 'qa-structure', el => {
            if (el.classList.contains('qa-structure-string')) return 'string';
            if (el.classList.contains('qa-structure-index')) return 'index';
            if (el.classList.contains('qa-structure-length')) return 'length';
            if (el.classList.contains('qa-structure-factor')) return 'factor';
            if (el.classList.contains('qa-structure-other-index')) return 'other';
            return null;
        });
    }
}

DataStructureList.prototype.isIndex = function(dsName) { return this.hasClass(dsName, 'qa-structure-index') || this.hasClass(dsName, 'qa-structure-other-index'); };
DataStructureList.prototype.isLength = function(dsName) { return this.hasClass(dsName, 'qa-structure-length'); };
DataStructureList.prototype.isString = function(dsName) { return this.hasClass(dsName, 'qa-structure-string'); };
DataStructureList.prototype.isFactorization = function(dsName) { return this.hasClass(dsName, 'qa-structure-factor'); };

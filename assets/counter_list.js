class CounterList extends ItemList {
    constructor(enabledParent, disabledParent, onChange, enableDblClick) {
        // disabledParent can be a single element or a map { rle, factor, other }
        super(enabledParent, disabledParent, onChange, enableDblClick, 'qa-counter', el => {
            if (el.classList.contains('qa-counter-rle')) return 'rle';
            if (el.classList.contains('qa-counter-factor')) return 'factor';
            return null;
        });
    }
}

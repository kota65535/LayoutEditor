import riot from "riot";

const LOCALSTORAGE_KEY = "layout-editor";

export class PaletteStore {
    constructor() {
        riot.observable(this);

        const json = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (!json) {
            this._initData();
        } else {
            this.data = JSON.parse(json);
        }

        this._registerHandlers();
    }

    _initData() {
        this.data = {
            selectedItem: "S280"
        };
        this.saveToStorage();
    }

    _registerHandlers() {
        this.on(riot.VE.PALETTE_ITEM_SELECTED, itemName => {
            this.setSelectedItem(itemName);
            this.saveToStorage();
            this.trigger(riot.SE.PALETTE_ITEM_SELECTED, this.getSelectedItem())
        });
        this.on(riot.VE.SAVE_LAYOUT, (layoutData) => {
            this.setLayout(layoutData);
            this.saveToStorage();
        });
        this.on(riot.VE.MENU_LOAD_LAYOUT, () => {
            this.trigger(riot.SE.LAYOUT_LOADED, this.data["layout"]);
        });
    }

    setSelectedItem(itemName) {
        this.data["selectedItem"] = itemName;
    }

    getSelectedItem() {
        return this.data["selectedItem"];
    }

    setLayout(layoutData) {
        this.data["layout"] = layoutData;
    }

    saveToStorage() {
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.data))
    }
}


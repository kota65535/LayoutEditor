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
        this.on(riot.VE.SAVE_LAYOUT, (json1, json2) => {
            this.setLayout(json1, json2);
            this.saveToStorage();
        });
        this.on(riot.VE.LOAD_LAYOUT, () => {
            this.trigger(riot.SE.LAYOUT_UPDATED, this.data);
        });
    }

    setSelectedItem(itemName) {
        this.data["selectedItem"] = itemName;
    }

    getSelectedItem() {
        return this.data["selectedItem"];
    }

    setLayout(json1, json2) {
        this.data["json1"] = json1;
        this.data["json2"] = json2;
    }

    saveToStorage() {
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.data))
    }
}


import riot from "riot";
import {StoreBase} from "./StoreBase";

const LOCAL_STORAGE_KEY = "layout-editor";

export class EditorStore extends StoreBase {
    constructor() {
        super(LOCAL_STORAGE_KEY);
    }

    initData() {
        return {
            selectedItem: "S280"
        };
    }

    registerHandlers() {
        this.on(riot.VE.EDITOR.PALETTE_ITEM_SELECTED, itemName => {
            this.data["selectedItem"] = itemName;
            this.saveToStorage();
            this.trigger(riot.SE.EDITOR.PALETTE_ITEM_SELECTED, itemName);
        });
        this.on(riot.VE.EDITOR.LAYOUT_CHANGED, layoutData => {
            this.data["layout"] = layoutData;
            this.saveToStorage();
            this.trigger(riot.SE.EDITOR.LAYOUT_CHANGED, JSON.parse(layoutData));
        });
        this.on(riot.VE.EDITOR.FILE_CHANGED, editingFile => {
            this.data["editing_file"] = editingFile;
            this.saveToStorage();
        });
        this.on(riot.VE.EDITOR.FILE_INIT, () => {
            this.trigger(riot.SE.EDITOR.FILE_CHANGED, this.data["editing_file"]);
        });
        this.on(riot.VE.EDITOR.LAYOUT_INIT, () => {
            let layoutData = null;
            if (this.data["layout"]) {
                layoutData = JSON.parse(this.data["layout"]);
            }
            this.trigger(riot.SE.EDITOR.LAYOUT_CHANGED, layoutData);
        });
    }

}


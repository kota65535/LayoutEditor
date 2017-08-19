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
        // ビューからのパレットアイテム変更イベント
        this.on(riot.VE.EDITOR.PALETTE_ITEM_SELECTED, itemName => {
            this.data["selectedItem"] = itemName;
            this.saveToStorage();
            this.trigger(riot.SE.EDITOR.PALETTE_ITEM_SELECTED, itemName);
        });
        // ビューからのレイアウトデータ変更イベント
        this.on(riot.VE.EDITOR.LAYOUT_CHANGED, layoutData => {
            this.data["layout"] = layoutData;
            this.saveToStorage();
            this.trigger(riot.SE.EDITOR.LAYOUT_CHANGED, layoutData);
        });
        // ビューからの編集ファイル変更イベント
        this.on(riot.VE.EDITOR.FILE_CHANGED, editingFile => {
            this.data["editing_file"] = editingFile;
            this.saveToStorage();
        });
        // ビューからの編集ファイル初期化要求
        this.on(riot.VE.EDITOR.FILE_INIT, () => {
            this.trigger(riot.SE.EDITOR.FILE_CHANGED, this.data["editing_file"]);
        });
        // ビューからのレイアウトデータ初期化要求
        this.on(riot.VE.EDITOR.LAYOUT_INIT, () => {
            let layoutData = null;
            if (this.data["layout"]) {
                layoutData = this.data["layout"];
            }
            this.trigger(riot.VE.EDITOR.LAYOUT_CHANGED, layoutData);
        });
    }

}


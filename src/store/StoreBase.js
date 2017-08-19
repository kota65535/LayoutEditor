import riot from "riot";
import logger from "../logging";
let log = logger("LayoutEditor", "DEBUG");

export class StoreBase {
    constructor(localStorageKey) {
        riot.observable(this);

        this.localStorageKey = localStorageKey;

        const json = window.localStorage.getItem(this.localStorageKey);
        if (!json) {
            this.data = this.initData();
            this.saveToStorage();
        } else {
            // データがあればJSONとしてパースする
            try {
                this.data = JSON.parse(json);
            } catch(e) {
                log.error(`Failed to parse JSON of local storage data.`);
                $.notify(
                    { message: `Failed to parse local storage data!` },
                    { type: "danger" });
            }
        }

        this.registerHandlers();
    }

    /**
     * ローカルストレージの初期化を行うメソッド。
     * オーバーライドする。
     * @returns data object
     */
    initData() {
        return {};
    }

    /**
     * イベントハンドラへの登録を行うメソッド。
     * オーバーライドする。
     */
    registerHandlers() {
    }

    /**
     * ローカルストレージに保存する。
     */
    saveToStorage() {
        window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.data))
    }
}


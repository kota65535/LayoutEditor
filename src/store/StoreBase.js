import riot from "riot";

export class StoreBase {
    constructor(localStorageKey) {
        riot.observable(this);

        this.localStorageKey = localStorageKey;

        const json = window.localStorage.getItem(this.localStorageKey);
        if (!json) {
            this.data = this.initData();
            this.saveToStorage();
        } else {
            this.data = JSON.parse(json);
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


"use strict";
/**
 * Created by tozawa on 2017/08/06.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleAuthAPI_1 = require("./GoogleAuthAPI");
const GoogleDriveAPI_1 = require("./GoogleDriveAPI");
const SCOPE = 'https://www.googleapis.com/auth/docs';
const API_KEY = 'AIzaSyB6Jfd-o3v5RafVjTNnkBevhjX3_EHqAlE';
const CLIENT_ID = '658362738764-9kdasvdsndig5tsp38u7ra31fu0e7l5t.apps.googleusercontent.com';
const DISCOVER_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
class GoogleAPIManager {
    constructor(onLoaded, onSignInStatusChanged) {
        this.authAPI = new GoogleAuthAPI_1.GoogleAuthAPI(API_KEY, CLIENT_ID, SCOPE, DISCOVER_DOCS, this._onLoadedWrapper.bind(this), this._onSignInStatusChangedWrapper.bind(this));
        this.onLoaded = onLoaded;
        this.onSignInStatusChanged = onSignInStatusChanged;
        this.accessToken = null;
        this.driveAPI = new GoogleDriveAPI_1.GoogleDriveAPI(API_KEY, null);
        this.oneoffOnSignedIn = null;
    }
    /**
     * サインインする。
     * @param {function} onSignedIn サインイン成功時に呼ばれるコールバック
     */
    signIn(onSignedIn) {
        this.oneoffOnSignedIn = onSignedIn;
        this.authAPI.signIn();
    }
    signOut() {
        this.authAPI.signOut();
    }
    isSignedIn() {
        return this.authAPI.isSignedIn();
    }
    showFilePicker(callback) {
        if (this.isSignedIn()) {
            this.driveAPI.showFilePicker("root", callback);
        }
        else {
            this.signIn(() => {
                this.driveAPI.showFilePicker("root", callback);
            });
        }
    }
    showFolderPicker(callback) {
        if (this.isSignedIn()) {
            this.driveAPI.showFolderPicker("root", callback);
        }
        else {
            this.signIn(() => {
                this.driveAPI.showFolderPicker("root", callback);
            });
        }
    }
    getFilePath(fileId) {
        return this.driveAPI.getFilePath(fileId);
    }
    createFile(fileName, mimeType, parents) {
        return this.driveAPI.createFile(fileName, mimeType, parents);
    }
    updateFile(fileId, content) {
        return this.driveAPI.updateFile(fileId, content);
    }
    downloadFile(fileId) {
        return this.driveAPI.downloadFile(fileId);
    }
    // withSignedIn(func, args) {
    //     if (this.isSignedIn()) {
    //         func.apply(args);
    //     } else {
    //         this.signIn(() => {
    //             func.apply(args);
    //         })
    //     }
    // }
    _onLoadedWrapper(isSignedIn) {
        this._authorize();
        this.onLoaded(isSignedIn);
    }
    _onSignInStatusChangedWrapper(isSignedIn) {
        this._authorize();
        this.onSignInStatusChanged(isSignedIn);
        // サインイン時にコールバックが与えられていたら実行する
        if (this.oneoffOnSignedIn) {
            this.oneoffOnSignedIn();
            this.oneoffOnSignedIn = null;
        }
    }
    // 認証を行い、アクセストークンを取得する
    _authorize() {
        let user = this.authAPI.getCurrentUser();
        let isAuthorized = user.hasGrantedScopes(SCOPE);
        if (isAuthorized) {
            console.log(user);
            this.driveAPI.setAccessToken(user.getAuthResponse().access_token);
        }
    }
}
exports.GoogleAPIManager = GoogleAPIManager;
//# sourceMappingURL=GoogleAPIManager.js.map
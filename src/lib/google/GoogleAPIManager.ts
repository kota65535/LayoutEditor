/**
 * Created by tozawa on 2017/08/06.
 */

import {GoogleAuthAPI} from "./GoogleAuthAPI";
import {GoogleDriveAPI} from "./GoogleDriveAPI";
import HttpRequest = gapi.client.HttpRequest;
import FileResource = gapi.client.drive.FileResource;

const SCOPE = 'https://www.googleapis.com/auth/docs';
const API_KEY = 'AIzaSyB6Jfd-o3v5RafVjTNnkBevhjX3_EHqAlE';
const CLIENT_ID = '658362738764-9kdasvdsndig5tsp38u7ra31fu0e7l5t.apps.googleusercontent.com';
const DISCOVER_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];


export class GoogleAPIManager {

    authAPI: GoogleAuthAPI;
    driveAPI: GoogleDriveAPI;

    onLoaded: (isSignedIn: boolean) => void;
    onSignInStatusChanged: (isSignedIn: boolean) => void;

    accessToken: string;
    oneoffOnSignedIn: () => void;


    constructor(onLoaded: (isSignedIn: boolean) => void,
                onSignInStatusChanged: (isSignedIn: boolean) => void) {
        this.authAPI = new GoogleAuthAPI(
            API_KEY,
            CLIENT_ID,
            SCOPE,
            DISCOVER_DOCS,
            this._onLoadedWrapper.bind(this),
            this._onSignInStatusChangedWrapper.bind(this)
        );

        this.onLoaded = onLoaded;
        this.onSignInStatusChanged = onSignInStatusChanged;

        this.accessToken = null;
        this.driveAPI = new GoogleDriveAPI(
            API_KEY,
            null
        );
        this.oneoffOnSignedIn = null;
    }

    /**
     * サインインする。
     * @param {function} onSignedIn サインイン成功時に呼ばれるコールバック
     */
    signIn(onSignedIn: () => void) {
        this.oneoffOnSignedIn = onSignedIn;
        this.authAPI.signIn();
    }

    signOut() {
        this.authAPI.signOut();
    }

    isSignedIn(): boolean {
        return this.authAPI.isSignedIn();
    }

    showFilePicker(callback: (Event) => void, parentId: string = "root") {
        if (this.isSignedIn()) {
            this.driveAPI.showFilePicker(parentId, callback);
        } else {
            this.signIn(() => {
                this.driveAPI.showFilePicker(parentId, callback);
            })
        }
    }

    showFolderPicker(callback: (Event) => void, parentId: string = "root") {
        if (this.isSignedIn()) {
            this.driveAPI.showFolderPicker(parentId, callback);
        } else {
            this.signIn(() => {
                this.driveAPI.showFolderPicker(parentId, callback);
            })
        }
    }

    getFilePath(fileId: string): Promise<{}> {
        return this.driveAPI.getFilePath(fileId);
    }


    createFile(fileName: string, mimeType: string, parents: string[]): HttpRequest<FileResource> {
        return this.driveAPI.createFile(fileName, mimeType, parents);
    }

    updateFile(fileId: string, content: string): HttpRequest<any> {
        return this.driveAPI.updateFile(fileId, content);
    }

    downloadFile(fileId: string): HttpRequest<FileResource> {
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

    _onLoadedWrapper(isSignedIn: boolean) {
        this._authorize();
        this.onLoaded(isSignedIn);
    }

    _onSignInStatusChangedWrapper(isSignedIn: boolean) {
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

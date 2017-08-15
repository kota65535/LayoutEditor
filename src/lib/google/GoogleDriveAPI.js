

export class GoogleDriveAPI {

    constructor(apiKey, accessToken) {
        this.apiKey = apiKey;
        this.accessToken = accessToken;

        gapi.load('picker', () => {
            // 今のところ何もしない
        });
    }


    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    /**
     * フォルダーの表示・選択が可能なPickerを表示する。
     * @param parents
     * @param callback
     */
    showFolderPicker(parents, callback) {
        let foldersOnlyView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setParent(parents)      // これを付けないと全ての階層のフォルダが列挙される
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);

        let pickerBuilder = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.MINE_ONLY)
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .addView(foldersOnlyView)
            .setTitle('Select a folder')
            .setOAuthToken(this.accessToken)
            .setDeveloperKey(this.apiKey)
            .setCallback(callback);


        let pickerInstance = pickerBuilder.build();

        pickerInstance.setVisible(true);
    }

    /**
     * ドキュメントの表示・選択が可能なPickerを表示する。
     * @param {Array<string>} parents
     * @param callback
     */
    showFilePicker(parents, callback) {
        // ファイルとフォルダー両方を表示し、ファイルの選択が可能なビュー
        let docsView = new google.picker.DocsView()
            .setIncludeFolders(true)

        // ファイルとフォルダー両方の表示・選択が可能なビュー
        let docsAndFoldersView = new google.picker.DocsView()
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);

        if (parents) {
            docsView.setParent(parents);
        }

        let pickerBuilder = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.MINE_ONLY)
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            // .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .addView(docsView)
            // .addView(docsAndFoldersView)
            .setOAuthToken(this.accessToken)
            .setDeveloperKey(this.apiKey)
            .setCallback(callback);


        let pickerInstance = pickerBuilder.build();

        pickerInstance.setVisible(true);
    }

    /**
     * ファイルのリストを取得する。
     * @returns {Promise}
     * @see https://developers.google.com/drive/v3/reference/files/list
     */
    listFiles() {
        return gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        })
    }

    /**
     * ファイル情報を取得する。
     * @param {String} fileId
     * @param {String} fields
     * @returns {Promise}
     * @see https://developers.google.com/drive/v3/reference/files/get
     */
    getFile(fileId, fields) {
        return gapi.client.drive.files.get({
            fileId: fileId,
            fields: fields
        })
    }

    /**
     * ファイルをダウンロードする。
     * @param {string} fileId
     * @returns {Promise}
     */
    downloadFile(fileId) {
        return gapi.client.drive.files.get({
            fileId: fileId,
            alt: "media"
        })
    }


    /**
     * 指定されたファイル・フォルダのRootに対する階層を取得する。
     * Google Driveでは同一フォルダに同名のファイル・フォルダが存在でき、一意なパスというものは無いため
     * あくまでParentをRootまで辿っていった階層であることに留意。
     * @param {string} fileId
     * @returns {Promise}
     */
    getFilePath(fileId) {
        let loop = (fid, result) => {
            return this.getFile(fid, "id,name,parents")
                .then(resp => {
                    result.unshift(resp.result.name);
                    if (resp.result.parents) {
                        return loop(resp.result.parents[0], result);
                    } else {
                        return resp.result.name;
                    }
                })
        };
        let titles = [];
        return new Promise((resolve, reject) => {
            loop(fileId, titles)
                .then(() => {
                    resolve(titles.join("/"));
                });
                // .catch(() => {
                //     reject();
                // })
        });
    }


    /**
     * 既存のファイルの内容を更新する。
     * @param {string} fileId
     * @param {string} content
     * @returns {Promise}
     */
    updateFile(fileId, content) {
        return gapi.client.request({
            path: '/upload/drive/v3/files/' + fileId,
            method: 'PATCH',
            params: {
                uploadType: 'media'
            },
            body: content
        })
    }

    /**
     * 空のファイルを作成する。
     * ファイルの中身を更新するにはupdateFileを呼ぶ必要がある。
     * @param {string} fileName
     * @param {string} mimeType
     * @param {Array<string>} parents
     * @returns {Promise}
     */
    createFile(fileName, mimeType, parents) {
        let metadata = {
            // mimeType: 'application/vnd.google-apps.document',
            // mimeType: 'application/json',
            mimeType: mimeType,
            name: fileName,
            fields: 'id'
        };

        if (parents) {
            metadata.parents = parents;
        }

        return gapi.client.drive.files.create({
            resource: metadata
        })
    }


    createFolder(folderName, parents) {
        return this.createFile(folderName, 'application/vnd.google-apps.folder', parents);
    }

    /**
     * リクエストを作成する
     * @param method
     * @param url
     * @returns {Promise}
     * @private
     */
    _makeRequest (method, url) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + this.accessToken);
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.onload = () => {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = () => {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }
}


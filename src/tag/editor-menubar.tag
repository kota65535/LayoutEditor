<editor-menubar>

  <nav class="navbar navbar-toggleable navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">Layout Editor</a>
      </div>
      <div class="navbar-collapse collapse" id="navbar">
        <ul class="nav navbar-nav">
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">File <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a onclick="{ onFileNew }">New</a></li>
              <li><a onclick="{ onFileOpen }">Open</a></li>
              <li><a onclick="{ onFileSaveAs }">Save As...</a></li>
              <li if="{ _editingFile }">
                <a onclick="{ onFileSave }">Save</a>
              </li>
              <!--<li role="separator" class="divider"></li>-->
              <!--<li class="dropdown-header">Nav header</li>-->
              <!--<li><a href="#">Separated link</a></li>-->
              <!--<li><a href="#">One more separated link</a></li>-->
            </ul>
          </li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Edit <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a href="#">Copy</a></li>
              <li><a href="#">Paste</a></li>
            </ul>
          </li>
        </ul>
        <p class="navbar-text">File: { _editingFile.name }</p>

        <ul class="nav navbar-nav navbar-right">
          <button type="button" class="btn btn-default navbar-btn" onclick="{ onLogin }" if={ !opts.isAuthorized }>Login</button>
          <button type="button" class="btn btn-default navbar-btn" onclick="{ onLogout }" if={ opts.isAuthorized }>Logout</button>
        </ul>
      </div>
    </div>
  </nav>

  <file-save-dialog ref="file-new-dialog" title="New File" on-ok="{ onFileNewOK }"/>
  <file-save-dialog ref="file-save-as-dialog" title="Save File As" on-ok="{ onFileSaveAsOK }"/>


  <script type="es6">
      import riot from "riot";
      import route from "riot-route";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this._editingFile = null;

      this.on('mount', () => {
          log.info(`is mounted.`);
          log.printOpts(opts);

          // 編集中のファイルの初期化を始める
          riot.control.trigger(riot.VE.EDITOR.FILE_INIT);
      });


      //====================
      // File -> New
      //====================

      this.onFileNew = () => {
          this.refs["file-new-dialog"].show();
      };

      this.onFileNewOK = (fileName, parentId, parentName) => {
          // ファイルを所定のフォルダに作成する
          window.googleAPIManager.createFile(fileName, 'application/json', [parentId])
              .then(resp => {
                  $.notify(
                      { message: `File "${resp.result.name}" created.` },
                      { type: 'info' });
                  this.setEditingFile(resp.result.id, resp.result.name, parentId, parentName);
                  this.setLayout(null);
              });

          // ダイアログを閉じる
          this.refs["file-new-dialog"].hide();
      };

      //====================
      // File -> Open
      //====================

      this.onFileOpen = () => {
          window.googleAPIManager.showFilePicker((pickerEvent) => {
              if (pickerEvent.action === "picked") {
                  let file = pickerEvent.docs[0];
                  window.googleAPIManager.downloadFile(file.id)
                      .then(resp => {
                          this.setLayout(resp.body, file.name, file.id);
                      }, resp => {
                          $.notify(
                              { message: `Failed to open file "${resp.result.name}". fileId: ${resp.result.id}` },
                              { type: 'danger' });
                      });
                  window.googleAPIManager.getFilePath(file.parentId)
                      .then(path => {
                          this.setEditingFile(file.id, file.name, file.parentId, path);
                      });
              }
          })
      };

      //====================
      // File -> Save As
      //====================

      this.onFileSaveAs = () => {
          this.refs["file-save-as-dialog"].show();
      };

      this.onFileSaveAsOK = (fileName, parentId, parentName) => {
          let content = this.getLayout();

          // ファイルを所定のフォルダに作成し、さらに中身を書き込む
          window.googleAPIManager.createFile(fileName, 'application/json', [parentId])
              .then(resp => {
                  window.googleAPIManager.updateFile(resp.result.id, content)
                      .then(resp => {
                          $.notify(
                              { message: `File "${resp.result.name}" saved, content: ${content}` },
                              { type: 'info' });
                          this.setEditingFile(resp.result.id, resp.result.name, parentId, parentName);
                      }, resp => {
                          $.notify(
                              { message: `Failed to save file. fileId: ${resp.result.id}` },
                              { type: 'danger' });
                      })
              });

          this.refs["file-save-as-dialog"].hide();
      };

      //====================
      // File -> Save
      //====================

      this.onFileSave = () => {
          let content = this.getLayout();

          window.googleAPIManager.updateFile(this._editingFile.id, content)
              .then(resp => {
                  $.notify(
                      { message: `Layout is successfully saved. Rails: ${content["rails"].length}, Feeders: ${content["feeders"].length}` },
                      { type: 'success' });
              }, resp => {
                  $.notify(
                      { message: `Failed to save file. fileId: ${resp.result.id}` },
                      { type: 'danger' });
              })
      };

      //====================
      // Login/Logout
      //====================

      this.onLogin = () => {
          log.info("login clicked");
          window.googleAPIManager.signIn();
          this.isAuthorized = window.googleAPIManager.isSignedIn();
      };


      this.onLogout = () => {
          log.info("logout clicked");
          window.googleAPIManager.signOut();
          this.isAuthorized = window.googleAPIManager.isSignedIn();
      };

      //====================
      // Utility
      //====================

      /**
       * 「編集中のファイル」を更新する
       * @param fileId
       * @param fileName
       * @param parentId
       * @param parentName
       */
      this.setEditingFile = (fileId, fileName, parentId, parentName) => {
          this._editingFile = {
              id: fileId,
              name: fileName,
              parentId: parentId,
              parentName: parentName
          };
          riot.control.trigger(riot.VE.EDITOR.FILE_CHANGED, this._editingFile);
          this.update();
      };

      /**
       * レイアウトデータを更新し、通知する
       * @param content
       * @param fileName
       * @param fileId
       */
      this.setLayout = (content, fileName, fileId) => {
          let layoutData;
          try {
              if (content) {
                  layoutData = JSON.parse(content);
              } else {
                  layoutData = null;
              }
              riot.control.trigger(riot.VE.EDITOR.LAYOUT_CHANGED, layoutData);
          } catch(e) {
              log.error(`cannot read file as JSON. (fileName: ${fileName}, fileId: ${fileId})`);
              $.notify(
                  { message: `cannot read file as JSON. (fileName: ${fileName}, fileId: ${fileId})` },
                  { type: "danger" });
          }
      };

      // 親タグからeditor-mainタグを取得してcontentを取得する
      // TODO: ちょっとDirtyなので修正する
      this.getLayout = () => {
          return this.parent.tags['editor-main'].getLayout();
      };

      //====================
      // Handler
      //====================

      // 編集中のファイルをローカルストレージから読み込む
      this.onControl(riot.SE.EDITOR.FILE_CHANGED, (editingFile) => {
          if (editingFile) {
              log.info(`Loaded editing file: ${editingFile.id}`);
              this._editingFile = editingFile
          }
      });

  </script>


  <style type="scss">
    @import "../css/app.scss";
    @import "../css/editor-view.scss";

    :scope {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      /*height: $editor-nav-height;*/
    }

    /*.navbar {*/
      /*position: absolute;*/
      /*top: 0px;*/
    /*}*/

    a {
      cursor: pointer;
    }

    .navbar-btn {
      margin-right: 10px;
    }


  </style>
</editor-menubar>

<file-save-dialog>

  <style>
    input[id$='-select-folder'] {
      cursor: pointer;
    }
  </style>

  <div id="{ opts.ref }" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
          <h4 class="modal-title">{ opts.title }</h4>
        </div>
        <div class="modal-body">
          <div class="container-fluid">
            <div class="form-group row">
              <label class="col-sm-2 control-label" for="{ opts.ref + '-file-name' }">Save As:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="{ opts.ref + '-file-name' }">
              </div>
              <label class="col-sm-2 control-label" for="{ opts.ref + '-select-folder' }">Where:</label>
              <div class="col-sm-8">
                <input type="text" id="{ opts.ref + '-select-folder' }" class="form-control"
                       onclick="{ onSelectFolder }" value="{ initialFolderPath }"/>
                <input type="hidden" id="{ opts.ref + '-folder-id' }" value="{ initialFolderId }">
              </div>
              <button id="reset-folder" type="button" class="btn btn-primary" onclick="{ onResetFolder }"><i class="fa fa-home" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" id="{ opts.ref + '-ok' }" class="btn btn-primary" onclick="{ onOK }">OK</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <script type="es6">
      /**
       *
       * @param {string} ref
       * @param {string} title
       * @param {string} parentId
       * @param {function} onOK
       */

      this.initialFolderPath = "My Drive";
      this.initialFolderId = "root";


      //====================
      // Public methods
      //====================

      this.show = () => {
          // 本当はrefsを用いて参照したいが、bootstrapのmodalメソッドはjqueryでのセレクタにしか対応していない
          $$(`#${opts.ref}`).modal('show');
      }

      this.hide = () => {
          $$(`#${opts.ref}`).modal('hide');
      }

      //====================
      // Private methods
      //====================

      this.onSelectFolder = () => {
          window.googleAPIManager.showFolderPicker((pickerEvent) => {
              if (pickerEvent.action === "picked") {
                  let folderId = pickerEvent.docs[0].id;
                  $$(`#${opts.ref}-folder-id`).val(folderId);
                  // 擬似的なファイルパスを取得する
                  window.googleAPIManager.getFilePath(folderId)
                      .then(path => {
                          console.log(`File path: ${path}`);
                          $$(`#${opts.ref}-select-folder`).val(path);
                      });
              }
          }, opts.parentId);
      };

      this.onResetFolder = () => {
          $$(`#${opts.ref}-select-folder`).val('My Drive');
          $$(`#${opts.ref}-folder-id`).val('root');
      };

      this.onOK = () => {
          let fileName = $$(`#${opts.ref}-file-name`).val();
          let parentId = $$(`#${opts.ref}-folder-id`).val();
          let parentName = $$(`#${opts.ref}-select-folder`).val();

          if (!fileName) {
              // TODO: フォームのバリデーション方法を考える
              $.notify(
                  { message: "File name is empty." },
                  { type: "danger", delay: 2000, placement: { align: "center" }});
              return true;
          }

          // コールバック呼び出し
          opts.onOk(fileName, parentId, parentName);

      };
  </script>

</file-save-dialog>
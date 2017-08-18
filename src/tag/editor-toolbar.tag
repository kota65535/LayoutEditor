<editor-toolbar>

  <nav class="navbar navbar-toggleable navbar-default navbar-fixed-bottom">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <!--<a class="navbar-brand" href="#">Layout Editor</a>-->
      </div>

      <div class="nav navbar-nav">
        <button type="button" class="btn btn-default navbar-btn" onclick="{ openBuildPalette }" >Build</button>
        <button type="button" class="btn btn-default navbar-btn" onclick="{ openRunPalette }">Run</button>
      </div>
      <form class="navbar-form navbar-left">
        <div class="form-group">
          <label>Angle: </label>
          <input ref="angle" type="text" class="form-control" oninput="{ onAngleInput }">
        </div>
      </form>
      <p class="navbar-text cursor-position">X: { _position.x }</p>
      <p class="navbar-text cursor-position">Y: { _position.y }</p>
    </div>
  </nav>


  <script type="es6">
      import riot from "riot";
      import route from "riot-route";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this._editingFile = null;
      this._position = { x: "0", y: "0" };

      this.on('mount', () => {
          log.info(`is mounted.`);
          log.printOpts(opts);
      });


      this.openBuildPalette = () => {
          riot.control.trigger(riot.VE.EDITOR.OPEN_BUILD_PALETTE);
      };

      this.openRunPalette = () => {
          riot.control.trigger(riot.VE.EDITOR.OPEN_RUN_PALETTE);
      };

      this.onAngleInput = () => {
          let angle = parseInt(this.refs["angle"].value);
          log.info(`Angle: ${angle}`);
          riot.control.trigger(riot.VE.EDITOR.ANGLE_CHANGED, angle);
      };

      this.onControl(riot.VE.EDITOR.CURSOR_POSITION_CHANGED, (point) => {
          this._position = {
              x: sprintf("%.2f", point.x),
              y: sprintf("%.2f", point.y)
          };
          this.update();
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

    .navbar-form .form-control {
      width: 50px !important;
    }

    .navbar-text.cursor-position {
      margin-right: 5px;
      margin-left: 5px;
      width: 70px;
    }

  </style>
</editor-toolbar>

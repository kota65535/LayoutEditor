<editor-pallete>
  <style>
    #editor-sidebar-wrapper {
      /* position */
      position: fixed;
      margin-top: 50px;
      width: 250px;
      /* for scroll */
      overflow-y: scroll;
      top: 0;
      bottom: 0;
      /* above content */
      z-index: 9901;
      background: #999;
    }

    [class*="col-"] {
      border: 1px solid #ddd;
    }

    /*.sidebar-nav {*/
      /*position: absolute;*/
      /*top: 0;*/
      /*width: 250px;*/
      /*margin: 0;*/
      /*padding: 0;*/
      /*list-style: none;*/
    /*}*/

    /*.sidebar-nav > .sidebar-brand {*/
      /*height: 65px;*/
      /*font-size: 18px;*/
      /*line-height: 60px;*/
    /*}*/

    .sidebar-nav > .sidebar-brand a {
      color: #999999;
    }

    .sidebar-nav > .sidebar-brand a:hover {
      color: #fff;
      background: none;
    }

    .palette-item {
      height: 125px;
      /*line-height: 125px;*/
      background: #eee;
      padding: 10px;
      /*text-align: center;*/
    }

    .palette-item button {
      height: 100%;
    }

    .button-canvas {
      height: 100%;
      width: 100%;
      /*height: 100px;*/
      /*width: 100px;*/
    }


    /*.palette-item-text {*/
      /*display: inline-block;*/
      /*vertical-align: middle;*/
      /*line-height: normal;*/
    /*}*/
  </style>

  <div class="container-fluid" id="editor-sidebar-wrapper">
    <span class="sidebar-nav">Straight Rails</span>
    <div class="row">
      <div class="col-sm-6 palette-item" each={ item in opts.items["StraightRails"] }>
        <button type="button" class="btn btn-primary btn-block" onClick={ handleItemClick.bind(this, item) }>
          <div class="item-icon">
            <canvas class="button-canvas" id="{ item.name }-canvas"></canvas>
          </div>
          <div class="item-title">{ item.name }</div>
        </button>
      </div>
    </div>
    <span class="sidebar-nav">Curve Rails</span>
    <div class="row">
      <div class="col-sm-6 palette-item" each={ item in opts.items["CurveRails"] }>
        <button type="button" class="btn btn-primary btn-block" onClick={ handleItemClick.bind(this, item) }>
          <div class="item-icon">
            <canvas class="button-canvas" id="{ item.name }-canvas"></canvas>
          </div>
          <div class="item-title">{ item.name }</div>
        </button>
      </div>
    </div>
    <span class="sidebar-nav">Turnouts</span>
    <div class="row">
      <div class="col-sm-6 palette-item" each={ item in opts.items["Turnouts"] }>
        <button type="button" class="btn btn-primary btn-block" onClick={ handleItemClick.bind(this, item) }>
          <div class="item-icon">
            <canvas class="button-canvas" id="{ item.name }-canvas"></canvas>
          </div>
          <div class="item-title">{ item.name }</div>
        </button>
      </div>
    </div>
  </div>

  <script>
      import riot from "riot";
      import 'jquery'
      import 'jquery-selector-cache';
      import 'bootstrap'
      import 'bootstrap/dist/css/bootstrap.css';
      import 'bootstrap-notify';
      import paper from "paper";
      import { RailFactory } from "../lib/RailFactory";
      import logger from "../logging";

      let log = logger("EditorPalette");

      this.mixin("controlMixin");

      this.factory = new RailFactory();

      this.on("mount", () => {
          log.info("Editor palette mounted");
          paper.install(window);

          // 各パレットアイテムのアイコン描画
          for (let [key, value] of Object.entries(opts.items)) {
              value.forEach(item => {
                  paper.setup(item.name + "-canvas");
                  let canvas = $("#" + item.name + "-canvas");
                  let rail = this.factory[item.name]();
                  let bounds = rail.getBounds();
                  let center = new Point(canvas.width() / 2, canvas.height() / 2);
                  rail.move(center, bounds.center);
                  rail.scale(0.4, 0.4);
              });
          }
      });

      // パレットアイテムをクリックすると、そのアイテムを選択する
      this.handleItemClick = (item) => {
          this.selectedItem = item;
          log.info("Selected: " + this.selectedItem.name);
          riot.control.trigger(riot.VE.PALETTE_ITEM_SELECTED, item.name);
      };


  </script>

</editor-pallete>
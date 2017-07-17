<editor-pallete>
  <style>
    #sidebar-wrapper {
      position: fixed;
      width: 300px;
      height: 100%;
      overflow-y: auto;
      background: #000;

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
      height: 150px;
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

  <div class="container-fluid" id="sidebar-wrapper">
    <!--<span class="sidebar-nav">Rails</span>-->

    <div class="row">
      <div class="col-sm-6 palette-item" each={ item in opts.items }>
        <button type="button" class="btn btn-primary btn-block" onClick={ handleItemClick.bind(this, item) }>
          <div class="item-icon">
            <canvas class="button-canvas" id="{ item.name }-canvas"></canvas>
          </div>
          <div class="item-title">{ item.name }</div>
        </button>
      </div>
      <!--<div class="col-sm-6" each={ item in opts.items }>-->
        <!--<editor-palette-item id={ item.name } item={ item } onClick={selectItem(this)} ></editor-palette-item>-->
      <!--</div>-->

    </div>
  </div>

  <script>
      import riot from "riot";
      import paper from "paper";
      import { RailFactory } from "../lib/RailFactory";
      import logger from "../logging";

      let log = logger("EditorPalette");

      this.factory = new RailFactory();

      this.mixin("controlMixin");

      this.factory = new RailFactory();

      this.on("mount", () => {
          log.info("Editor palette mounted");
          paper.install(window);

          opts.items.forEach( item => {
              paper.setup(item.name + "-canvas");
              let canvas = $("#" + item.name + "-canvas");
              let rail = this.factory[item.name]();
              let bounds = rail.getBounds();
              let center = new Point(canvas.width()/2, canvas.height()/2);
              rail.moveTest(center, bounds.center);
              log.info(rail.getBounds());
//              let scaleX = canvas.width() / bounds.width;
//              if (scaleX < 1) {
//                  rail.scale(scaleX, scaleX);
//              }

//              rail.path.position = center;
          });
      });

      this.handleItemClick = (item) => {
          this.selectedItem = item;
          log.info("Selected: " + this.selectedItem.name);
          riot.control.trigger(riot.VE.PALETTE_ITEM_SELECTED, item.name);
      };


  </script>

</editor-pallete>
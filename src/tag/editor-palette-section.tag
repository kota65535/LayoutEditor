<editor-palette-section>

  <span class="sidebar-nav">{ opts.name }</span>
  <div class="row">
    <div class="col-sm-6 palette-item" each={ item in opts.items }>
      <button type="button" class="btn btn-primary btn-block" onClick={ handleItemClick.bind(this, item) }>
        <div class="item-icon">
          <canvas class="button-canvas" id="{ parent.opts.ref }-{ item.id }-canvas"></canvas>
        </div>
        <div class="item-title">{ item.name }</div>
      </button>
    </div>
  </div>


  <script>
      import riot from "riot";
      import {RailFactory} from "../lib/RailFactory";
      import {PaletteItemType} from "../lib/PaletteItem";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this.factory = new RailFactory();

      this.on("mount", () => {
          log.info(`is mounted.`);
          log.printOpts(opts);

          // 各パレットアイテムのアイコン描画
          opts.items.forEach(item => {
              let target = `${opts.ref}-${item.id}-canvas`;
              paper.setup(target);
              let canvas = $(`#${target}`);

              switch (item.type) {
                  case PaletteItemType.RAIL:
                      let rail = this.factory[item.id]();
                      let bounds = rail.getBounds();
                      let center = new paper.Point(canvas.width() / 2, canvas.height() / 2);
                      rail.move(center, bounds.center);
                      rail.scale(0.4, 0.4);
                      break;
              }
          });
      });

      /**
       * パレットアイテムを選択したらストアに通知する
       * @param item
       */
      this.handleItemClick = (item) => {
          this.selectedItem = item;
          log.info("Selected: " + this.selectedItem);
          riot.control.trigger(riot.VE.EDITOR.PALETTE_ITEM_SELECTED, this.selectedItem);
      };


  </script>


  <style>

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
</editor-palette-section>
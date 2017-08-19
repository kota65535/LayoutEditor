<editor-palette>
  <style>
    :scope {
      /* position */
      position: fixed;
      margin-top: 50px;
      margin-bottom: 50px;
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

  </style>

  <div class="container-fluid">
    <virtual each={ section in opts.items }>
      <editor-palette-section name="{ section.title }" ref="{ section.ref }" items={ section.items }/>
    </virtual>
  </div>

  <script>
      import riot from "riot";
      import { RailFactory } from "../lib/RailFactory";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this.on("mount", () => {
          log.info(`is mounted.`);
      });

//      // パレットアイテムをクリックすると、そのアイテムを選択する
//      this.handleItemClick = (item) => {
//          this.selectedItem = item;
//          log.info("Selected: " + this.selectedItem.name);
//          riot.control.trigger(riot.VE.EDITOR.PALETTE_ITEM_SELECTED, item.name);
//      };

  </script>

</editor-palette>
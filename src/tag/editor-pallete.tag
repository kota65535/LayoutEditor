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
      height: 140px;
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
    <canvas id="unko-canvas"></canvas>

    <div class="row">
      <div class="col-sm-6 palette-item" each={ item in opts.items }>
        <button type="button" class="btn btn-primary btn-block">
          <!--<div class="item-icon">-->
            <canvas class="button-canvas" id="{ item.name }-canvas"></canvas>
          <!--</div>-->
          <!--<div class="item-title">{ item.name }</div>-->
        </button>
      </div>
      <!--<div class="col-sm-6 palette-item">-->
        <!--<button type="button" class="btn btn-primary btn-block">-->
          <!--<canvas class="button-canvas" id="button-canvas"></canvas>-->
        <!--</button>-->
      <!--</div>-->
      <!--<div class="col-sm-6 palette-item">-->
        <!--<button type="button" class="btn btn-primary btn-block">-->
          <!--&lt;!&ndash;<canvas class="button-canvas" id="button-canvas"></canvas>&ndash;&gt;-->
        <!--</button>-->
      <!--</div>-->
    </div>
  </div>

  <script>
      import paper from "paper";
      import { RailFactory } from "../lib/RailFactory";

      this.factory = new RailFactory();

      this.on("mount", () => {
          console.log("editor palette mounted");
          paper.install(window);

          opts.items.forEach( item => {
              paper.setup(item.name + "-canvas");
              let canvas = $("#" + item.name + "-canvas");
              let rail = this.factory[item.name]();
              let bounds = rail.getBounds();
              let center = new Point(canvas.width()/2, canvas.height()/2);
              rail.moveTest(center, bounds.center);
//              rail.path.position = center;
          });
      });


  </script>

</editor-pallete>
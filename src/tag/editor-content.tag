<editor-content>
  <style>
    #editor-content-wrapper{
      position: fixed;
      top: 50px;                  /* height of toolbar */
      left: 240px;                /* width of palette */
      width: calc(100% - 240px);
      height: calc(100% - 50px);
      z-index: 9900;              /* behind of palette */
      overflow: auto;
    }
    canvas[resize] {
      width: 100%;
      height: 100%;
    }
  </style>


  <div class="container" id="editor-content-wrapper">
    <canvas id="editor-canvas" resize></canvas>
  </div>


  <script>
    import riot from "riot";
    import paper from "paper";
//    import "jquery";
//    import 'jquery-selector-cache';
//    import 'bootstrap'
//    import 'bootstrap/dist/css/bootstrap.css';
//    import 'bootstrap-notify';
    import { LayoutEditor } from "../lib/LayoutEditor";
    import { RailFactory } from "../lib/RailFactory";
    import { GridPaper } from "../lib/GridPaper";
    import { StraightRail } from "../lib/rails/StraightRail";
    import {Joint} from "../lib/rails/parts/Joint";

    import logger from "../logging";
    let log = logger("EditorContent");


    this.mixin("controlMixin");

    const BOARD_WIDTH = 6000;     // ボード幅
    const BOARD_HEIGHT = 4000;    // ボード高さ
    const GRID_SIZE = 70;
    const INITIAL_ZOOM = 0.7;
    const ZOOM_UNIT = 0.002;
    const AVAILABLE_ZOOM_MIN = 0.2;
    const AVAILABLE_ZOOM_MAX = 5;

    this.on("mount", () => {
        log.info("Editor content mounted");
        paper.install(window);
        paper.setup("editor-canvas");

        // レイヤー１にグリッドを描画
        this.grid = new GridPaper("editor-canvas", BOARD_WIDTH, BOARD_HEIGHT, GRID_SIZE,
            INITIAL_ZOOM, ZOOM_UNIT, AVAILABLE_ZOOM_MIN, AVAILABLE_ZOOM_MAX);

        // レイヤー２に切り替え
        new Layer();

        this.editor = new LayoutEditor(this.grid);
        this.factory = new RailFactory();

        // 各種ハンドラの登録
        let tool = new Tool();
        tool.onMouseMove = (event) => {
            this.editor.handleMouseMove(event);
        };

        tool.onMouseDown = (event) => {
            this.grid.paperOnMouseDown(event);
            this.editor.handleMouseDown(event);
        };

        tool.onMouseUp = (event) => {
            this.grid.paperOnMouseUp(event);
        };

        tool.onKeyDown = (event) => {
            this.editor.handleKeyDown(event);
        };

        tool.onKeyUp = (event) => {
            this.editor.handleKeyUp(event);
        };

        tool.onMouseDrag = (event) => {
            this.grid.paperOnMouseDrag(event);
        };

        view.onFrame = (event) => {
            this.editor.handleOnFrame(event);
        };

        window.addEventListener('mousemove', (e) => {
            this.grid.windowOnMouseMove(e);
        });

        window.addEventListener("mousewheel", (e) => {
            this.grid.windowOnMouseWheel(e);
//            return false;
        }, false);


        this.editor.selectRail(this.factory.S280());
        let rail = new StraightRail(new Point(560, 140),0,140, true);
        this.editor.layoutManager.putRail(rail, rail.joints[0], new Point(140,140));

    });

    //====================
    // イベントハンドラ
    //====================

    this.onControl(riot.SE.PALETTE_ITEM_SELECTED, itemName => {
        this.selectedItem = itemName;
        log.info("Palette selected: " + this.selectedItem);
        this.editor.selectRail(this.factory[itemName]());
    });

    this.onControl(riot.VE.MENU_SAVE_LAYOUT, () => {
        log.info("Saving layout...");
        riot.control.trigger(riot.VE.SAVE_LAYOUT, this.editor.layoutManager.railData);
    });

    this.onControl(riot.SE.LAYOUT_LOADED, (layoutData) => {
        log.info("Loading layout...");
        this.editor.layoutManager.loadLayout(layoutData);
    });

  </script>

</editor-content>
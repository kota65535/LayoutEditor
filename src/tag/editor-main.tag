<editor-main>
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
    import { LayoutEditor } from "../lib/LayoutEditor";
    import { RailFactory } from "../lib/RailFactory";
    import { GridPaper } from "../lib/GridPaper";
    import { StraightRail } from "../lib/rails/StraightRail";
    import {Joint} from "../lib/rails/parts/Joint";
    import {MultiPartBase} from "../lib/rails/parts/primitives/MultiPartBase"
    import logger from "../logging";
    let log = logger(this.__.tagName);
    import { CirclePart } from "../lib/rails/parts/primitives/CirclePart";
    import { RectPart } from "../lib/rails/parts/primitives/RectPart";

    this.mixin("controlMixin");

    const BOARD_WIDTH = 6000;     // ボード幅
    const BOARD_HEIGHT = 4000;    // ボード高さ
    const GRID_SIZE = 70;
    const INITIAL_ZOOM = 0.7;
    const ZOOM_UNIT = 0.002;
    const AVAILABLE_ZOOM_MIN = 0.2;
    const AVAILABLE_ZOOM_MAX = 5;

    this.on("mount", () => {
        log.info(`is mounted.`);
        paper.setup("editor-canvas");

        let mul = new MultiPartBase(new paper.Point(0,0), 0,
            [ new RectPart(new paper.Point(0,0), 0, 50, 50, "red"),
        new CirclePart(new paper.Point(30,30), 0, 20, "blue")]);

        mul.moveRelatively(new paper.Point(70,70));
        mul.rotateRelatively(90);



        // レイヤー１にグリッドを描画
        this.grid = new GridPaper("editor-canvas", BOARD_WIDTH, BOARD_HEIGHT, GRID_SIZE,
            INITIAL_ZOOM, ZOOM_UNIT, AVAILABLE_ZOOM_MIN, AVAILABLE_ZOOM_MAX);

        // レイヤー２に切り替え
        new paper.Layer();

        this.editor = new LayoutEditor(this.grid);
        this.factory = new RailFactory();

        // 各種ハンドラの登録
        let tool = new paper.Tool();
        tool.onMouseMove = (event) => {
            this.editor.handleMouseMove(event);
            // マウスカーソル位置を通知
            riot.control.trigger(riot.VE.EDITOR.CURSOR_POSITION_CHANGED, event.point);
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

        paper.view.onFrame = (event) => {
            this.editor.handleOnFrame(event);
        };

        window.addEventListener('mousemove', (e) => {
            this.grid.windowOnMouseMove(e);
        });

        window.addEventListener("mousewheel", (e) => {
            this.grid.windowOnMouseWheel(e);
//            return false;
        }, false);

        // TODO: ボタンクリックイベントで選択するようにする
        this.editor.selectPaletteItem(this.factory.S280());

        // レイアウトデータの初期化を始める
        riot.control.trigger(riot.VE.EDITOR.LAYOUT_INIT);
    });

    //====================
    // イベントハンドラ
    //====================

    // パレットレールが指定されたら、これを選択する
    this.onControl(riot.SE.EDITOR.PALETTE_ITEM_SELECTED, itemName => {
        this.selectedItem = itemName;
        log.info("Palette selected: " + this.selectedItem);
        this.editor.selectPaletteItem(this.factory[itemName]());
    });

    // レイアウトデータに変更があったら、これをロードする
    this.onControl(riot.SE.EDITOR.LAYOUT_CHANGED, (layoutData) => {
        log.info(`Loading layout: ${layoutData}`);
        try {
            this.editor.loadLayout(layoutData);
        } catch(e) {
            $.notify(
                { message: `Failed to load layout!` },
                { type: 'danger' });
        }
    });

    // ツールバーにAngleが入力されたら、パレットレールの角度を変更する
    this.onControl(riot.VE.EDITOR.ANGLE_CHANGED, (angle) => {
        log.info(`Angle changed: ${angle}`);
        // 入力なしは 0 とみなす
        if (!angle) {
            angle = 0;
        }
        // 角度は左回りとする
        this.editor.gridJointsAngle = -angle;
    });

    //====================
    // public API
    //====================

    this.getLayout = () => {
        return this.editor.saveLayout();
    }


  </script>

</editor-main>
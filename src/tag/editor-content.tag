<editor-content>
  <style>
    #editor-content-wrapper{
      width: 100%;
      height: 90%;
      position: absolute;
      margin-left: 300px;
    }
    canvas[resize] {
      width: 100%;
      height: 100%;
    }
  </style>


  <div id="editor-content-wrapper">
    <canvas id="editor-canvas" resize></canvas>
  </div>


  <script>
    import riot from "riot";
    import paper from "paper";
    import { LayoutEditor } from "../lib/LayoutEditor";
    import { RailFactory } from "../lib/RailFactory";
    import { StraightRail } from "../lib/rails/StraightRail";
    import {Joint} from "../lib/rails/parts/Joint";
    import logger from "../logging";
    let log = logger("EditorContent");


    this.mixin("controlMixin");


    this.on("mount", () => {
        log.info("Editor content mounted");
        paper.install(window);
        paper.setup("editor-canvas");

        // レイヤー１にグリッドを描画
        createGrid(70);

        // レイヤー２に切り替え
        new Layer();

        this.editor = new LayoutEditor();
        this.factory = new RailFactory();

        // 各種ハンドラの登録
        var tool = new Tool();
        tool.onMouseMove = (event) => {
            this.editor.handleMouseMove(event);
        };
        tool.onMouseDown = (event) => {
            this.editor.handleMouseDown(event);
        };

        tool.onKeyDown = (event) => {
            this.editor.handleKeyEvent(event);
        }

        this.editor.selectRail(this.factory.S280());

        this.editor.putRail(new StraightRail(new Point(280, 140),0,140));

    });

    this.onControl(riot.SE.PALETTE_ITEM_SELECTED, itemName => {
        this.selectedItem = itemName;
        log.info("Palette selected: " + this.selectedItem);
        this.editor.selectRail(this.factory[itemName]());
    });

    function createGrid(size) {
        let canvas = $("#editor-canvas");
        let numX = canvas.width() / size;
        let numY = canvas.height() / size;
        for (let i=0 ; i <= numX ; i++) {
            let line = new Path.Line(new paper.Point(size * i, 0), new paper.Point(size * i, canvas.height()));
            line.strokeColor = 'grey';
        }
        for (let i=0 ; i <= numY ; i++) {
            let line = new Path.Line(new paper.Point(0, size*i), new paper.Point(canvas.width(), size*i));
            line.strokeColor = 'grey';
        }
    }
  </script>

</editor-content>
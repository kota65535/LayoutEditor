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


  <!-- Page Content -->
  <div id="editor-content-wrapper">
    <canvas id="editor-canvas" resize></canvas>
  </div>

  <script>
    import paper from "paper";
    import { LayoutEditor } from "../lib/LayoutEditor";
    import { StraightRail } from "../lib/rails/StraightRail";

    this.on("mount", () => {
        console.log("editor mounted");
        paper.install(window);
        paper.setup("editor-canvas");

        // レイヤー１にグリッドを描画
        createGrid(50);

        // レイヤー２に切り替え
        new Layer();

        this.editor = new LayoutEditor();

        // ハンドラの登録
        var tool = new Tool();
        tool.onMouseMove = (event) => {
            this.editor.handleMouseEvents(event);
        };
        tool.onMouseDown = (event) => {
            this.editor.handleMouseEvents(event);
        };

        this.editor.selectRail(new StraightRail(new Point(100,100),0,100));

        this.editor.putRail(new StraightRail(new Point(200,100),0,100));
        this.editor.putRail(new StraightRail(new Point(200,200),0,100));

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
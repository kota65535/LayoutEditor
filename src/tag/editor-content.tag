<editor-content>
  <style>
    #page-content-wrapper {
      width: 100%;
      height: 90%;
      position: absolute;
      padding-left: 250px;
    }
    canvas[resize] {
      width: 100%;
      height: 100%;
    }

  </style>


  <!-- Page Content -->
  <div id="page-content-wrapper">
    <canvas id="editor-canvas" resize></canvas>
  </div>

  <script>
    import paper from "paper";
    import { StraightRail } from "../lib/rails/StraightRail";

    this.on("mount", () => {
        console.log("editor mounted");
        paper.install(window);
        paper.setup("editor-canvas");

        createGrid(50);

        new StraightRail(new Point(100,100),0,100);



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
<editor-view>
    <editor-toolbar/>
    <editor-pallete items={ palette_items }></editor-pallete>
      <!--<editor-content/>-->

    <!--<main-content></main-content>-->
  <script>
      import paper from "paper";

      this.on("mount", () => {
          console.log("editor mounted");
      });
      this.palette_items = [
          { name: "S280" },
          { name: "S140" },
          { name: "S70" },
      ];
  </script>
</editor-view>

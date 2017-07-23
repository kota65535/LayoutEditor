<editor-view>
    <editor-toolbar/>
    <editor-pallete items={ palette_items }></editor-pallete>
    <editor-content/>

    <!--<main-content></main-content>-->
  <script>
      import paper from "paper";
      import logger from "../logging";
      let log = logger("EditorContent");

      this.on("mount", () => {
          log.info("Editor view mounted");
      });
      this.palette_items = [
          { name: "S280" },
          { name: "S140" },
          { name: "S70" },
          { name: "C280_45" },
          { name: "C541_15" },
          { name: "PL541_15" },
          { name: "PR541_15" },
          { name: "PR541_15" },
          { name: "PR541_15" },
          { name: "PR541_15" }
      ];

      // スクロール禁止
      var scroll_event = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
      $(document).on(scroll_event,function(e){e.preventDefault();});
  </script>
</editor-view>

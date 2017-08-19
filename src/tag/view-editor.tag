<view-editor>
    <editor-menubar is-authorized={ opts.isAuthorized }/>
    <editor-pallete items={ palette_items }/>
    <editor-main/>
    <editor-toolbar is-authorized={ opts.isAuthorized }/>

  <script>
      import riot from "riot";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this.palette_items = {
          "StraightRails": [
              {name: "S280"},
              {name: "S140"},
              {name: "S99"},
              {name: "S70"},
              {name: "S33"},
              {name: "S18_5"},
              {name: "S70G"},
          ],
          "CurveRails": [
              {name: "C280_45"},
              {name: "C280_15"},
              {name: "C317_45"},
              {name: "C541_15"},
          ],
          "Turnouts": [
              {name: "PL541_15"},
              {name: "PR541_15"},
              {name: "PL280_30"},
              {name: "PR280_30"},
              {name: "PY280_15"}
          ],
//          "Electric Parts": [
//              {name: "Feeder"},
//              {name: "GapJoiner"}
//          ]
      };


      this.on("mount", () => {
          log.info(`is mounted.`);

      });


  </script>


</view-editor>

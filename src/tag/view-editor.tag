<view-editor>
    <editor-menubar is-authorized={ opts.isAuthorized }/>
    <editor-palette items={ palette_items }/>
    <editor-main/>
    <editor-toolbar is-authorized={ opts.isAuthorized }/>

  <script>
      import riot from "riot";
      import {PaletteItemType} from "../lib/PaletteItem";
      import logger from "../logging";
      let log = logger(this.__.tagName);

      this.mixin("controlMixin");

      this.palette_items = [
          {
              title: "Straight Rails",
              ref: "straightRail",
              items: [
                  {type: PaletteItemType.RAIL, id: "S280",  name: "S280"},
                  {type: PaletteItemType.RAIL, id: "S140",  name: "S140"},
                  {type: PaletteItemType.RAIL, id: "S99",   name: "S99"},
                  {type: PaletteItemType.RAIL, id: "S70",   name: "S70"},
                  {type: PaletteItemType.RAIL, id: "S33",   name: "S33"},
                  {type: PaletteItemType.RAIL, id: "S18_5", name: "S18-5"},
                  {type: PaletteItemType.RAIL, id: "S70G",  name: "S70G"}
              ]
          },
          {
              title: "Curve Rails",
              ref: "curveRail",
              items: [
                  {type: PaletteItemType.RAIL, id: "C280_45", name: "C280-45"},
                  {type: PaletteItemType.RAIL, id: "C280_15", name: "C280-15"},
                  {type: PaletteItemType.RAIL, id: "C317_45", name: "C317-45"},
                  {type: PaletteItemType.RAIL, id: "C541_15", name: "C541-15"},
              ]
          },
          {
              title: "Turnouts",
              ref: "turnout",
              items: [
                  {type: PaletteItemType.RAIL, id: "PL541_15", name: "PL541-15"},
                  {type: PaletteItemType.RAIL, id: "PR541_15", name: "PR541-15"},
                  {type: PaletteItemType.RAIL, id: "PL280_30", name: "PL280-30"},
                  {type: PaletteItemType.RAIL, id: "PR280_30", name: "PR280-30"},
                  {type: PaletteItemType.RAIL, id: "PY280_15", name: "PY280-15"},
                  {type: PaletteItemType.RAIL, id: "CPR317_280_45", name: "CPR317/280-45"},
                  {type: PaletteItemType.RAIL, id: "CPL317_280_45", name: "CPL317/280-45"}
              ]
          },
          {
              title: "Electric Parts",
              ref: "electric",
              items: [
                  {type: PaletteItemType.FEEDER, id: "Feeder", name: "Feeder"},
                  {type: PaletteItemType.GAP_JOINER, id: "Gap", name: "Gap Joiner"}
              ]
          }
      ];


      this.on("mount", () => {
          log.info(`is mounted.`);

      });


  </script>


</view-editor>

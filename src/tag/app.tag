<app>
  <div id="mainview"></div>
  <!--<editor-view></editor-view>-->

  <script>
      import riot from "riot";
      import route from "riot-route";

      this._currentView = null;

      this.loadView = (viewName, id) => {
          if (this._currentView) {
              this._currentView.unmount(true)
          }
          this._currentView = riot.mount('div#mainview', viewName);
      }

      this.studyRoute = (view, id) => {
          switch (view) {
              case "editor":
                  this.loadView("editor-view");
                  break;
              case "simulator":
                  this.loadView("simulator-view");
                  break;
          }
      }

      route(this.studyRoute);

      this.on('mount', () => {
          route.start(true);
      })

  </script>
</app>

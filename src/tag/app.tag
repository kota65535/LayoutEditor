<app>
  <div data-is={ view } is-authorized="{ isAuthorized }"></div>

  <script type="es6">
      import riot from "riot";
      import route from "riot-route";
      import "../vendor";
      import {GoogleAPIManager} from "../lib/google/GoogleAPIManager";
      import logger from "../logging";
      let log = logger(this.__.tagName);


      this.isAuthorized = false;

      //==========================
      // Routing & Switching views
      //==========================

      route((view) => {
          switch (view) {
              case "editor":
                  this.view = "view-editor";
                  break;
              default:
                  this.view = "view-editor";
          }
          this.update();
      });

      this.on('mount', () => {
          route.start(true);
      });

      //==========================
      // Loading Google API client
      //==========================

      window.onGoogleAPIClientLoad = () => {
          window.googleAPIManager = new GoogleAPIManager( (isAuthorized) => {
              log.info(`Google auth API loaded: isAuthorized=${isAuthorized}`)
              this.isAuthorized = isAuthorized;
              this.update();
          }, (isAuthorized) => {
              log.info(`Auth status changed: isAuthorized=${isAuthorized}`)
              this.isAuthorized = isAuthorized;
              this.update();
          });
      };

      //====================
      // Notification setting
      //====================

      $.notifyDefaults({
          z_index: 10000
      });

      // リロードされたら未保存データが失われる旨を表示する
//      window.onbeforeunload = function() {
//          return "Dude, are you sure you want to leave? Think of the kittens!";
//      }

  </script>
</app>

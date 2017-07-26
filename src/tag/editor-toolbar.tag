<editor-toolbar>
  <style>
    #editor-toolbar-wrapper {
      position: fixed;
      top: 0;
      z-index: 9999;
    }
  </style>

  <!-- Static navbar -->
  <nav class="navbar navbar-default navbar-fixed-top" id="editor-toolbar-wrapper">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">Layout Editor</a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">File <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a href="#">New</a></li>
              <li><a href="#">Open</a></li>
              <li><a href="#save">Save</a></li>
              <li><a href="#load">Load</a></li>
              <li role="separator" class="divider"></li>
              <li class="dropdown-header">Nav header</li>
              <li><a href="#">Separated link</a></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Edit <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a href="#">Copy</a></li>
              <li><a href="#">Paste</a></li>
            </ul>
          </li>
          <li><a href="#simulator">Run</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li><a href="./login">Login</a></li>
        </ul>
      </div><!--/.nav-collapse -->
    </div><!--/.container-fluid -->
  </nav>

  <script>
      import riot from "riot";
      import route from "riot-route";
      import logger from "../logging";
      let log = logger("EditorContent");

      this.studyRoute = (view, id) => {
          switch (view) {
              case "save":
                  riot.control.trigger(riot.VE.MENU_SAVE_LAYOUT);
                  break;
              case "load":
                  riot.control.trigger(riot.VE.MENU_LOAD_LAYOUT);
                  break;

          }
      };

      route(this.studyRoute);

      this.on('mount', () => {
          log.info("Editor toolbar mounted");
          route.start(true);
      })


  </script>

</editor-toolbar>
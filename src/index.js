import riot from "riot";
import "riot-hot-reload";

import "./riotcontrol.js";
import store from "./stores.js";
import "./tags.js";

riot.control.addStore(store);

riot.mount("app");

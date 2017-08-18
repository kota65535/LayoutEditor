/* global riot */
import riot from "riot";

var RiotControl = {
    _stores: [],
    addStore: function(store) {
        this._stores.push(store);
    },
    reset: function() {
        this._stores = [];
    }
};

['on','one','off','trigger'].forEach(function(api){
    RiotControl[api] = function() {
        var args = [].slice.call(arguments);
        this._stores.forEach(function(el){
            el[api].apply(el, args);
        });
    };
});

// register global tag mixin for using RiotControl
riot.mixin('controlMixin', {
  onControl(signal, func) {
    riot.control.on(signal, func)
    this.on('unmount', () => riot.control.off(signal, func))
  },
});

// since riot is auto loaded by ProvidePlugin, merge the control into the riot object
riot.control = RiotControl;

riot.SE = {
    EDITOR: {
        PALETTE_ITEM_SELECTED: "se.editor.palette_item_selected",
        LAYOUT_CHANGED: "se.editor.layout_changed",
        FILE_CHANGED: "se.editor.file_changed",
    }
};

riot.VE = {
    APP: {
        GOOGLE_API_LOADED: "ve.app.google-api-loaded"
    },
    EDITOR: {
        PALETTE_ITEM_SELECTED: "ve.editor.palette_item_selected",
        FILE_CHANGED: "ve.editor.file_changed",
        LAYOUT_CHANGED: "ve.editor.layout_changed",
        FILE_INIT: "ve.editor.file_init",
        LAYOUT_INIT: "ve.editor.layout_init",
        OPEN_BUILD_PALETTE: "ve.editor.open_build_palette",
        OPEN_RUN_PALETTE: "ve.editor.open_run_palette",
        ANGLE_CHANGED: "ve.editor.angle_changed",
        CURSOR_POSITION_CHANGED: "ve.editor.cursor_position_changed"
    },
}



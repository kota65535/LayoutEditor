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
    PALETTE_ITEM_SELECTED: "se_palette_item_selected",
    LAYOUT_LOADED: "se_layout_loaded"
}

riot.VE = {
    APP: {
        GOOGLE_API_LOADED: "ve.app.google-api-loaded"
    },
    PALETTE_ITEM_SELECTED: "ve_palette_item_selected",
    MENU_SAVE_LAYOUT: "ve_menu_save_layout",
    MENU_LOAD_LAYOUT: "ve_load_layout",
    SAVE_LAYOUT: "ve_save_layout",
    LOAD_LAYOUT: "ve_load_layout"
}



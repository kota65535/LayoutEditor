/* global riot */
import riot from "riot";

const _RiotControlApi = ['on', 'one', 'off', 'trigger'];
const RiotControl = {
  _stores: [],
  addStore(store) {
    this._stores.push(store);
  }
};

_RiotControlApi.forEach(api => {
  RiotControl[api] = function apiHandler(...args) {
    this._stores.forEach(el => el[api].apply(null, args))
  }
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

riot.VE = {
    PALETTE_ITEM_SELECTED: "ve_palette_item_selected",
}

riot.SE = {
    PALETTE_ITEM_SELECTED: "se_palette_item_selected",
}


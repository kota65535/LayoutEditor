"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tozawa on 2017/07/03.
 */
const sprintf_js_1 = require("sprintf-js");
const RailPart_1 = require("./RailPart");
const paper_1 = require("paper");
/**
 * 直線レールパーツ。
 */
class StraightRailPart extends RailPart_1.RailPart {
    /**
     * 指定された始点、始点角度、長さで直線レールパーツを生成する。
     * @param {Point} point the point where the rail parts begin
     * @param {number} angle
     * @param {number} length
     * @param {RailPartAnchor} anchorType
     * @param {boolean} hasFeederSocket
     */
    constructor(point, angle, length, anchorType, hasFeederSocket) {
        super(hasFeederSocket);
        this.length = length;
        // パスの生成
        this._initPath(length);
        // 移動・回転
        let anchor = this._getAnchorFromType(anchorType);
        this.move(point, anchor);
        this.rotate(angle, anchor);
    }
    _initPath(length) {
        let pathData = sprintf_js_1.sprintf("M 0 0 L %f %f L %f %f L %f %f L %f %f L 0 %f Z", 0, -RailPart_1.RailPart.WIDTH / 2, length, -RailPart_1.RailPart.WIDTH / 2, length, 0, length, RailPart_1.RailPart.WIDTH / 2, RailPart_1.RailPart.WIDTH / 2);
        this.path = new paper_1.Path(pathData); // Path Object
        // this.path.strokeColor = "black";
        this.path.fillColor = RailPart_1.RailPart.FILL_COLOR;
    }
}
exports.StraightRailPart = StraightRailPart;
//# sourceMappingURL=StraightRailPart.js.map
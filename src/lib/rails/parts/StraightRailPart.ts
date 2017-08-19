/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import {RailPart} from "./RailPart";
import {Path} from "paper";

/**
 * 直線レールパーツ。
 */
export class StraightRailPart extends RailPart {

    length: number;

    /**
     * 指定された始点、始点角度、長さで直線レールパーツを生成する。
     * @param {Point} point the point where the rail parts begin
     * @param {number} angle
     * @param {number} length
     * @param {AnchorType} anchorType
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
        let pathData = sprintf("M 0 0 L %f %f L %f %f L %f %f L %f %f L 0 %f Z",
            0, -RailPart.WIDTH/2,
            length, -RailPart.WIDTH/2,
            length, 0,
            length, RailPart.WIDTH/2,
            RailPart.WIDTH/2);
        this.path = new Path(pathData);   // Path Object
        // this.path.strokeColor = "black";
        this.path.fillColor = RailPart.FILL_COLOR;

        // 始点・終点の更新
        this._updatePoints();
    }
}

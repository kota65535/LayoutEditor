/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import {RailPart, AnchorType} from "./RailPart";

/**
 * 直線レールパーツ。
 */
export class StraightRailPart extends RailPart {

    /**
     * 指定された始点、始点角度、長さで直線レールパーツを生成する。
     * @param {Point} point the point where the rail parts begin
     * @param {number} angle
     * @param {number} length
     * @param {AnchorType} anchorType
     */
    constructor(point, angle, length, anchorType=AnchorType.START) {
        super();

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
            0, -this.WIDTH/2,
            length, -this.WIDTH/2,
            length, 0,
            length, this.WIDTH/2,
            this.WIDTH/2);
        this.path = new paper.Path(pathData);   // Path Object
        this.path.strokeColor = "black";
        // this.path.fillColor = 'blue';

        // 始点・終点の更新
        this._updatePoints();

        // パスのpositionはBoundの中心を示している。
        // これに対しレールは始点をもとに位置を指定したいので、その差分をこれに保持しておく。
        this.positionOffset = this.path.position;
    }
}

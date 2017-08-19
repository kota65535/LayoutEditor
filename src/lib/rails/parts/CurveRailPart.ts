/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import {RailPart} from "./RailPart";
import {Path} from "paper";
import {FeederSocket} from "./FeederSocket";
/**
 * 曲線レールパーツ。
 */
export class CurveRailPart extends RailPart {

    radius: number;
    centerAngle: number;

    /**
     * 指定された始点、始点角度、半径、中心角度で曲線レールパーツを生成する。
     * @param {Point} point
     * @param {number} angle
     * @param {number} radius
     * @param {number} centerAngle
     * @param {AnchorType} anchorType
     * @param {boolean} hasFeederSocket
     */
    constructor(point, angle, radius, centerAngle, anchorType, hasFeederSocket) {
        super(hasFeederSocket);

        this.radius = radius;               // 半径
        this.centerAngle = centerAngle;     // 中心角

        // パスの生成
        this._initPath(radius, centerAngle);

        // 移動・回転
        let anchor = this._getAnchorFromType(anchorType);
        this.move(point, anchor);
        this.rotate(angle, anchor);

        // フィーダーソケットの生成
        // if (hasFeederSocket) {
        //     this.feederSocket = new FeederSocket(this);
        // }
    }

    _initPath(radius, centerAngle) {
        // 曲線の始点・終点の座標を計算
        let outerEndX = (radius + RailPart.WIDTH/2) * Math.sin(centerAngle / 180 * Math.PI);
        let outerEndY = (radius + RailPart.WIDTH/2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - RailPart.WIDTH/2;
        let innerEndX = (radius - RailPart.WIDTH/2) * Math.sin(centerAngle / 180 * Math.PI);
        let innerEndY = (radius - RailPart.WIDTH/2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + RailPart.WIDTH/2;

        let pathData = sprintf("M 0 0 L %f %f A %f %f, 0, 0, 1, %f %f L %f %f L %f %f A %f %f, 0, 0, 0, %f %f Z",
            0, -RailPart.WIDTH/2,
            radius + RailPart.WIDTH/2, radius + RailPart.WIDTH/2, outerEndX, outerEndY,
            (outerEndX + innerEndX) / 2, (outerEndY + innerEndY) / 2,
            innerEndX, innerEndY,
            radius - RailPart.WIDTH/2, radius - RailPart.WIDTH/2, 0, RailPart.WIDTH/2);

        // console.log(sprintf("curve rail path: %s", pathData));

        this.path = new Path(pathData);   // パスオブジェクト
        // this.path.strokeColor = "black";
        this.path.fillColor = RailPart.FILL_COLOR;

        // 終点角度
        this.endAngle = centerAngle;
    }

    /**
     * 任意の点を中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} anchor
     */
    rotate(angle, anchor) {
        // 中心点の座標を調べる
        let centerX = this.startPoint.x - this.radius * Math.cos((90 - this.startAngle) / 180 * Math.PI);
        let centerY = this.startPoint.y + this.radius * Math.sin((90 - this.startAngle) / 180 * Math.PI);

        // アンカーの曲線への接線の角度をアンカー絶対角度とすると、Arctanで計算できる
        let tanOfCenterToAnchor = -(anchor.x - centerX)/(anchor.y - centerY);
        // if ( !isFinite(tanOfCenterToAnchor)) {}
        let absAngle = Math.atan(tanOfCenterToAnchor) * 180 / Math.PI;

        // アンカーの絶対角度と指定角度の差分
        let relAngle = angle - absAngle;

        // console.log(sprintf("absAngle: %.3f, relAngle: %.3f ", absAngle, relAngle));

        this.rotateRelatively(relAngle, anchor);
    }
}

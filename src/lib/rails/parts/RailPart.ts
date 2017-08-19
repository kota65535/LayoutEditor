/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import {FlowDirection} from "./FeederSocket";
import logger from "../../../logging";
import {IGradientColor, Path, Point} from "paper";

let log = logger("RailPart");

/**
 * レールパーツのコンストラクタでアンカー点を指定するための識別子。
 * 始点または終点が指定可能。
 * @type {{START: Symbol, END: Symbol}}
 */
export enum RailPartAnchor {
    START,
    END
};


/**
 * レールパーツの基底クラス。全てのレールは複数のレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class RailPart {

    static FILL_COLOR = "#333333";
    static WIDTH = 12;
    static FLOW_COLOR_1 = "royalblue";
    static FLOW_COLOR_2 = "greenyellow";


    startPoint: Point;
    middlePoint: Point;
    endPoint: Point;
    position: Point;

    startAngle: number;
    endAngle: number;

    path: Path;

    _isSimulated: boolean;
    _hasFeederSocket: boolean;

    flowDirection: FlowDirection;


    /**
     * レールパーツの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでパスの生成・移動・回転を行う。
     */
    constructor(hasFeederSocket) {
        this.startPoint = this.endPoint = new Point(0, 0);
        this.startAngle = this.endAngle = 0;

        this.path = null;

        this._isSimulated = false;

        this._hasFeederSocket = hasFeederSocket;

        this.flowDirection = FlowDirection.NONE;
    }

    /**
     * 現在位置からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        this.path.position = this.path.position.add(difference);
        this.position = this.path.position;
        this._updatePoints()
    }

    /**
     * 基準点の絶対座標で移動する。
     * @param {Point} position
     * @param {Point} anchor
     */
    move(position, anchor) {
        let difference = position.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * 任意の点を中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} center
     */
    rotateRelatively(difference, center) {
        this.path.rotate(difference, center);
        this._updatePoints();
        this.startAngle += difference;
        this.endAngle += difference;
        this.showInfo();
    }

    /**
     * 任意の点を中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} center
     */
    rotate(angle, center) {
        let relAngle = angle - this.startAngle;
        this.rotateRelatively(relAngle, center);
    }

    hide() {
        this.path.opacity = 0;
    }

    show() {
        this.path.opacity = 1.0;
    }

    remove() {
        this.path.remove();
    }

    /**
     * 始点・始点角度、終点・終点角度を表示する。デバッグ用。
     */
    showInfo() {
        log.debug(sprintf("%s: (%.3f, %.3f | %.3f) -> (%.3f, %.3f | %.3f)",
            this.constructor.name, this.startPoint.x, this.startPoint.y, this.startAngle, this.endPoint.x, this.endPoint.y, this.endAngle));
    }

    /**
     * 始点・終点を更新する。パスの移動・回転を行った場合に必ず呼び出される。
     * @private
     */
    _updatePoints() {
        this.startPoint = this.path.segments[0].point;
        this.endPoint = this.path.segments[3].point;
        let centerOfOuterCurve = this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
        let centerOfInnerCurve = this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
        this.middlePoint = centerOfOuterCurve.add(centerOfInnerCurve).divide(2);
        // log.info(`middlePoint: ${this.middlePoint}`)
    }

    /**
     * アンカータイプをもとにアンカー点を返す。
     * デフォルトは始点。
     * @param {AnchorType} anchorType
     * @private
     */
    _getAnchorFromType(anchorType) {
        let anAnchorType = anchorType || RailPartAnchor.START;
        let anchor;
        switch (anAnchorType) {
            case RailPartAnchor.START:
                anchor = this.startPoint;
                break;
            case RailPartAnchor.END:
                anchor = this.startPoint;
                anchor = this.endPoint;
                break;
            default:
                anchor = this.startPoint;
                break;
        }
        return anchor;
    }

    hasFeederSocket() {
        return this._hasFeederSocket;
    }

    isSimulated() {
        return this._isSimulated;
    }

    setSimulated(isSimulated) {
        this._isSimulated = isSimulated;
    }

    /**
     *
     * @param {FlowDirection} flowDirection
     */
    setFlowDirection(flowDirection) {
        this.flowDirection = flowDirection;
    }


    /**
     * 電流のアニメーションを行う。
     * @param event
     */
    animate(event) {
        let ratio = event.count % 60 / 60;
        let currentOrigin;
        let currentDestination: Point;

        switch (this.flowDirection) {
            case FlowDirection.NONE:
                // アニメーションしない
                this.path.fillColor = "black";
                return;
            case FlowDirection.START_TO_END:
                currentOrigin = this.startPoint.multiply(2 - ratio).add(this.endPoint.multiply(ratio - 1));
                currentDestination = currentOrigin.add(this.endPoint.subtract(this.startPoint).multiply(2));
                log.debug("S to E : ", currentOrigin, "=>", currentDestination);
                break;
            case FlowDirection.END_TO_START:
                currentOrigin = this.startPoint.multiply(ratio + 1).add(this.endPoint.multiply(-ratio));
                currentDestination = currentOrigin.add(this.endPoint.subtract(this.startPoint).multiply(2));
                log.debug("E to S : ", currentOrigin, "=>", currentDestination);
                break;
        }

        this.path.fillColor = <IGradientColor>{
            gradient: {
                stops: [RailPart.FLOW_COLOR_1, RailPart.FLOW_COLOR_2, RailPart.FLOW_COLOR_1, RailPart.FLOW_COLOR_2, RailPart.FLOW_COLOR_1]
            },
            origin: currentDestination,
            destination: currentOrigin,
        };
    }
}

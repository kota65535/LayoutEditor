/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import {FeederSocket, FlowDirection} from "./FeederSocket";
import logger from "../../../logging";
import {IGradientColor, Path, Point} from "paper";
import {PartBase} from "./primitives/PartBase";

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
export class RailPart extends PartBase {

    static FILL_COLOR = "#333333";
    static WIDTH = 12;
    static FLOW_COLOR_1 = "royalblue";
    static FLOW_COLOR_2 = "greenyellow";

    _endAngle: number;

    _hasFeederSocket: boolean;
    _isSimulated: boolean;

    _flowDirection: FlowDirection;  // 電流方向


    /**
     * レールの始点。Read Only
     * @returns {"paper".Point}
     */
    get startPoint(): Point { return this.path.segments[0].point; }

    /**
     * レールの中間点。Read Only
     * @returns {"paper".Point}
     */
    get middlePoint(): Point {
        let centerOfOuterCurve = this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
        let centerOfInnerCurve = this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
        return centerOfOuterCurve.add(centerOfInnerCurve).divide(2);
    }

    /**
     * レールの終点。Read Only
     * @returns {"paper".Point}
     */
    get endPoint(): Point { return this.path.segments[3].point; }

    /**
     * レールの始点の角度
     * @returns {number}
     */
    get startAngle(): number { return this.angle };
    set startAngle(angle: number) { this.angle = angle };

    /**
     * レールの終点の角度
     * @returns {number}
     */
    get endAngle(): number { return this._endAngle };
    set endAngle(angle: number) { this._endAngle = angle };

    get flowDirection() { return this._flowDirection; }
    set flowDirection(flowDirection: FlowDirection) { this._flowDirection = flowDirection; }


    /**
     * レールパーツの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでパスの生成・移動・回転を行う。
     */
    constructor(hasFeederSocket) {
        super();
        this.startAngle = this.endAngle = 0;

        this._hasFeederSocket = hasFeederSocket;
        this._isSimulated = false;
        this._flowDirection = FlowDirection.NONE;
    }

    /**
     * 任意の点を中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} center
     */
    rotateRelatively(difference: number, center: Point) {
        super.rotateRelatively(difference, center);
        this.endAngle += difference;
    }


    /**
     * アンカータイプをもとにアンカー点を返す。
     * デフォルトは始点。
     * @param {AnchorType} anchorType
     * @private
     */
    _getAnchorFromType(anchorType: RailPartAnchor) {
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

    /**
     * 始点・始点角度、終点・終点角度を表示する。デバッグ用。
     */
    showInfo() {
        log.debug(sprintf("%s: (%.3f, %.3f | %.3f) -> (%.3f, %.3f | %.3f)",
            this.constructor.name, this.startPoint.x, this.startPoint.y, this.startAngle, this.endPoint.x, this.endPoint.y, this.endAngle));
    }

}

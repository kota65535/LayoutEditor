/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import logger from "../../../logging";

let log = logger("Part");


/**
 * レールパーツの基底クラス。全てのレールは複数のレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class RailPart {

    static FILL_COLOR = "#333333";
    static WIDTH = 12;

    /**
     * レールパーツのコンストラクタでアンカー点を指定するための識別子。
     * 始点または終点が指定可能。
     * @type {{START: Symbol, END: Symbol}}
     */
    static Anchor = {
        START: Symbol(),
        END: Symbol
    };

    /**
     * レールパーツの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでパスの生成・移動・回転を行う。
     */
    constructor() {
        this.startPoint = this.endPoint = new Point(0, 0);
        this.startAngle = this.endAngle = 0;

        this.path = null;

        this.rendered = false;
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
    }

    /**
     * アンカータイプをもとにアンカー点を返す。
     * デフォルトは始点。
     * @param {AnchorType} anchorType
     * @private
     */
    _getAnchorFromType(anchorType) {
        let anAnchorType = anchorType || RailPart.Anchor.START;
        let anchor;
        switch (anAnchorType) {
            case RailPart.Anchor.START:
                anchor = this.startPoint;
                break;
            case RailPart.Anchor.END:
                anchor = this.startPoint;
                anchor = this.endPoint;
                break;
            default:
                anchor = this.startPoint;
                break;
        }
        return anchor;
    }
}

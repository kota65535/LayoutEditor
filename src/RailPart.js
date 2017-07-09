/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";

/**
 * レールパーツのコンストラクタでアンカー点を指定するための識別子。
 * 始点または終点が指定可能。
 * @type {{START: Symbol, END: Symbol}}
 */
export const AnchorType = {
    START: Symbol(),
    END: Symbol
};

/**
 * レールパーツの基底クラス。全てのレールは複数のレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class RailPart {

    /**
     * レールパーツの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでパスの生成・移動・回転を行う。
     */
    constructor() {
        this.WIDTH = 10;

        this.startPoint = this.endPoint = new Point(0, 0);
        this.startAngle = this.endAngle = 0;

        this.path = null;

        // パスのpositionはBoundの中心を示している。
        // これに対しレールは始点をもとに位置を指定したいので、その差分をこれに保持しておく。
        this.positionOffset = new Point(0, 0);
    }

    /**
     * 任意の点を基準に、絶対座標で移動する。
     * @param {Point} point
     * @param {Point} anchor
     */
    move(point, anchor) {
        let anchorToPoint = point.subtract(anchor);
        this.startPoint = this.startPoint.add(anchorToPoint);
        this.path.position = this.positionOffset.add(this.startPoint);
        this._updatePoints()
        // this.showInfo();
    }

    /**
     * 現在からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        let absPoint = this.startPoint.add(difference);
        this.move(absPoint, this.startPoint);
    }

    /**
     * 任意の点を中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Point} anchor
     */
    rotate(angle, anchor) {
        let relAngle = angle - this.startAngle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * 任意の点を中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} difference
     * @param {Point} anchor
     */
    rotateRelatively(difference, anchor) {
        this.startAngle += difference;
        this.endAngle += difference;
        this.path.rotate(difference, anchor);
        this._updatePoints();
        this.positionOffset = this.path.position.subtract(this.startPoint);
        // this.showInfo();
    }

    /**
     * 始点・始点角度、終点・終点角度を表示する。デバッグ用。
     */
    showInfo() {
        console.log(sprintf("%s: (%.3f, %.3f | %.3f) -> (%.3f, %.3f | %.3f)",
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
        let anAnchorType = anchorType || AnchorType.START;
        let anchor;
        switch (anAnchorType) {
            case AnchorType.START:
                anchor = this.startPoint;
                break;
            case AnchorType.END:
                anchor = this.endPoint;
                break;
            default:
                anchor = this.startPoint;
                break;
        }
        return anchor;
    }
}

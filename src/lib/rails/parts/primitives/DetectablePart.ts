
import {PartBase} from "./PartBase";
import {Group, Path, Point} from "paper";
import {MultiPartBase} from "./MultiPartBase";

export enum DetectionState {
    DISABLED = -1,
    BEFORE_DETECT,
    DETECTING,
    AFTER_DETECT
}

/**
 * 可視領域以外に当たり判定を持つことができるパーツ。
 */
export class DetectablePart extends MultiPartBase {

    // COLOR_BEFORE_DETECT: string = "darkorange";
    // COLOR_DETECTING: string = "deepskyblue";
    // COLOR_AFTER_DETECT: string = "darkgray";

    pathGroup: Group;
    detectionState: DetectionState;
    fillColors: string[];

    get basePart() { return this.parts[0]; }
    get detectionPart() { return this.parts[1]; }

    /**
     *
     * @param {"paper".Point} position
     * @param {number} angle
     * @param {PartBase} basePart
     * @param {PartBase} detectionPart
     * @param {string[]} colors 3要素の、それぞれ BEFORE_DETECT, DETECTING, AFTER_DETECT 時の色を表す文字列の配列。
     */
    constructor(position: Point, angle: number, basePart: PartBase, detectionPart: PartBase, colors: string[]) {
        super(position, angle, [basePart, detectionPart]);

        this.fillColors = colors;
    }


    setVisible(isVisible: boolean) {
        this.basePart.setVisible(isVisible);
        this.detectionPart.setVisible(isVisible);
    }

    /**
     * 当たり判定は本体には無いことに留意。
     * @param {"paper".Path} path
     * @returns {boolean}
     */
    containsPath(path: Path): boolean {
        return this.detectionPart.containsPath(path);
    }

    /**
     * 当たり判定領域の状態を変更する。
     * @param {DetectionState} state
     */
    setDetectionState(state: DetectionState) {
        switch(state) {
            case DetectionState.DISABLED:
                this.detectionPart.setVisible(false);
                this.detectionPart.setOpacity(0);
                break;
            case DetectionState.BEFORE_DETECT:
                // 当たり判定領域を透明化
                this.detectionPart.setVisible(true);
                this.detectionPart.setOpacity(0.3);
                this.basePart.path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                this.detectionPart.path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                // 親グループ（Railオブジェクトを想定）内で最前に移動
                // TODO: レールが同士が近いとお互いのレールの上下関係により当たり判定が最前に表示されない。
                this.pathGroup.bringToFront();
                break;
            case DetectionState.DETECTING:
                // 当たり判定領域を半透明化
                this.detectionPart.setVisible(true);
                this.detectionPart.setOpacity(0.6);
                this.basePart.path.fillColor = this.fillColors[DetectionState.DETECTING];
                this.detectionPart.path.fillColor = this.fillColors[DetectionState.DETECTING];
                // 親グループ（Railオブジェクトを想定）内で最前に移動
                this.pathGroup.bringToFront();
                break;
            case DetectionState.AFTER_DETECT:
                // 当たり判定領域を不可視（無効化）
                this.detectionPart.setVisible(false);
                // this.detectionPart.setOpacity(1.0);
                this.basePart.path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
                this.detectionPart.path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
                break;
        }
        this.detectionState = state;
    }


    // /**
    //  * 指定されたパスがこのパーツに属するか否かを返す。
    //  * @param path
    //  * @returns {boolean}
    //  */
    // equals(group) {
    //     return this.pathGroup.id === group.id;
    // }

    // getCenterOfTop() {
    //     return this.path.curves[1].getLocationAt(this.path.curves[1].length/2).point;
    // }
    //
    // getCenterOfBottom() {
    //     return this.path.curves[4].getLocationAt(this.path.curves[4].length/2).point;
    // }
    //
    // getCenterOfLeft() {
    //     return this.path.segments[0].point
    // }
    //
    // getCenterOfRight() {
    //     return this.path.segments[3].point
    // }

}

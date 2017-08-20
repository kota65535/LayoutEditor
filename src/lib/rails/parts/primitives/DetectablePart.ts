
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
        this.parts[0].setVisible(isVisible);
        this.parts[1].setVisible(isVisible);
    }

    /**
     * 当たり判定は本体には無いことに留意。
     * @param {"paper".Path} path
     * @returns {boolean}
     */
    containsPath(path: Path): boolean {
        return this.parts[1].containsPath(path);
    }

    /**
     * 当たり判定領域の状態を変更する。
     * @param {DetectionState} state
     */
    setDetectionState(state: DetectionState) {
        switch(state) {
            case DetectionState.DISABLED:
                this.parts[1].setVisible(false);
                this.parts[1].setOpacity(0);
                break;
            case DetectionState.BEFORE_DETECT:
                // 当たり判定領域を透明化
                this.parts[1].setVisible(true);
                this.parts[1].setOpacity(0.3);
                this.parts[0].path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                this.parts[1].path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                // 親グループ（Railオブジェクトを想定）内で最前に移動
                // TODO: レールが同士が近いとお互いのレールの上下関係により当たり判定が最前に表示されない。
                this.pathGroup.bringToFront();
                break;
            case DetectionState.DETECTING:
                // 当たり判定領域を半透明化
                this.parts[1].setVisible(true);
                this.parts[1].setOpacity(0.6);
                this.parts[0].path.fillColor = this.fillColors[DetectionState.DETECTING];
                this.parts[1].path.fillColor = this.fillColors[DetectionState.DETECTING];
                // 親グループ（Railオブジェクトを想定）内で最前に移動
                this.pathGroup.bringToFront();
                break;
            case DetectionState.AFTER_DETECT:
                // 当たり判定領域を不可視（無効化）
                this.parts[1].setVisible(false);
                // this.parts[1].setOpacity(1.0);
                this.parts[0].path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
                this.parts[1].path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
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


import {PartBase} from "./PartBase";
import {Group, Path, Point} from "paper";
import {MultiPartBase} from "./MultiPartBase";

/**
 * 当たり判定による検出状態。
 */
export enum DetectionState {
    BEFORE_DETECT = 0,  // 検出前
    DETECTING,          // 検出中（カーソルが当たっている）
    AFTER_DETECT        // 検出後（クリックなどにより選択された）
}

/**
 * 可視領域以外に当たり判定を持つことができるパーツ。
 */
export class DetectablePart extends MultiPartBase {

    // COLOR_BEFORE_DETECT: string = "darkorange";
    // COLOR_DETECTING: string = "deepskyblue";
    // COLOR_AFTER_DETECT: string = "darkgray";

    _detectionState: DetectionState;
    fillColors: string[];
    _enabled: boolean;      // 検出の有効・無効を切り替えるフラグ。本体は見える。

    // 1番目のパーツが主パーツ
    get basePart() { return this.parts[0]; }
    // 2番目が当たり判定用パーツ
    get detectionPart() { return this.parts[1]; }

    get enabled() { return this._enabled; }
    set enabled(isEnabled: boolean) {
        this.detectionPart.visible = isEnabled;
        if (isEnabled) {
            this._setDetectionState(this._detectionState);
        }
        this._enabled = isEnabled;
    }

    // 検出状態
    get detectionState() { return this._detectionState; }
    set detectionState(state: DetectionState) { this._setDetectionState(state); }

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

        // 無効状態かつ未接続
        // いったんDetectionStateを設定するためのスマートでないやり方
        this._enabled = true;
        this.detectionState = DetectionState.BEFORE_DETECT;
        this.enabled = false;
    }

    /**
     * 指定されたパスがこのパーツに属するか否かを返す。
     * TODO: 当たり判定が本体に存在すると何か困るんだっけ？
     * @param {"paper".Path} path
     * @returns {boolean}
     */
    containsPath(path: Path): boolean {
        return this.basePart.containsPath(path) || this.detectionPart.containsPath(path);
    }

    /**
     * 検出状態を変更する。
     * @param {DetectionState} state
     */
    private _setDetectionState(state: DetectionState) {
        // 無効時はDetectionStateの変更は許可されない。
        if (this._enabled) {
            switch(state) {
                case DetectionState.BEFORE_DETECT:
                    // 当たり判定領域を半透明化
                    this.detectionPart.visible = true;
                    this.detectionPart.opacity = 0.3;
                    this.basePart.path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                    this.detectionPart.path.fillColor = this.fillColors[DetectionState.BEFORE_DETECT];
                    // 親グループ（Railオブジェクトを想定）内で最前に移動
                    // TODO: レールが同士が近いとお互いのレールの上下関係により当たり判定が最前に表示されない。
                    this.pathGroup.bringToFront();
                    break;
                case DetectionState.DETECTING:
                    // 当たり判定領域を半透明化
                    this.detectionPart.visible = true;
                    this.detectionPart.opacity = 0.6;
                    this.basePart.path.fillColor = this.fillColors[DetectionState.DETECTING];
                    this.detectionPart.path.fillColor = this.fillColors[DetectionState.DETECTING];
                    // 親グループ（Railオブジェクトを想定）内で最前に移動
                    this.pathGroup.bringToFront();
                    break;
                case DetectionState.AFTER_DETECT:
                    // 当たり判定領域を不可視（無効化）
                    this.detectionPart.visible = false;
                    // this.detectionPart.opacity = 0;
                    this.basePart.path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
                    this.detectionPart.path.fillColor = this.fillColors[DetectionState.AFTER_DETECT];
                    break;
            }
            this._detectionState = state;
        }
    }
}

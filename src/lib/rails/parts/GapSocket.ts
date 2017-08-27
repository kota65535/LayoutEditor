/**
 * Created by tozawa on 2017/07/12.
 */
import {RectPart} from "./primitives/RectPart";
import logger from "../../../logging";
import {DetectablePart, DetectionState} from "./primitives/DetectablePart";
import {CirclePart} from "./primitives/CirclePart";
import {Gap} from "./Gap";
import {Joint} from "./Joint";
import {Path} from "paper";

let log = logger("GapSocket");

/**
 * ギャップの接続状態
 */
export enum GapState {
    OPEN = 0,       // ギャップ未接続
    CONNECTING,     // ギャップ接続中
    CONNECTED       // ギャップ接続後
}


/**
 * ギャップジョイナーは、プログラム上下記のように表現される。
 *   - ジョイントに仮想的なギャップ差込口(GapSocket)を仮定する
 *   - ギャップ差込口にギャップ(Gap)が差し込まれたジョイントをギャップジョイナーとする
 * 本クラスはこのギャップ差込口を表す。
 * ジョイントが接続された状態では、ギャップジョイナーとギャップは重なり合う状態になる。
 * この時、
 */
export class GapSocket extends DetectablePart {

    // 定数
    static WIDTH = 6;
    static HEIGHT = 12;
    static HIT_RADIUS = 20;
    static FILL_COLORS = ["red", "deepskyblue", "red"];
    static OPACITIES = [0.1, 0.2];


    joint: Joint;             // 所属するジョイント
    connectedGap: Gap;        // 接続されたギャップオブジェクト
    _gapState: GapState;      // ギャップ接続状態

    get gapState() { return this._gapState; }
    set gapState(gapState: GapState) { this._setGapState(gapState); }

    get enabled() { return this._enabled; }
    set enabled(isEnabled: boolean) {
        super.enabled = isEnabled;
        // 現在のギャップ接続状態を再設定しておく
        if (isEnabled) {
            this._setGapState(this._gapState);
        }
        // 接続されたギャップがあれば同じ状態に変更する
        // if (this.connectedGap) {
        //     this.connectedGap.visible = isEnabled;
        // }
    }

    // 主パーツはRectPartであることが分かっているのでキャストする
    get basePart(): RectPart { return <RectPart>this.parts[0]; }


    /**
     * ジョイントに仮想的なギャップの差込口をセットする。
     * @param {Joint} joint
     */
    constructor(joint: Joint) {
        let base = new CirclePart(joint.position, 0, 5, 'black');
        let detection = new CirclePart(joint.position, 0, GapSocket.HIT_RADIUS, GapSocket.FILL_COLORS[0]);
        super(joint.position, joint.angle, base, detection, GapSocket.FILL_COLORS, GapSocket.OPACITIES, false);

        this.joint = joint;
        this.connectedGap = null;

        // 最初は無効で未接続状態
        this.enabled = true;
        this.gapState = GapState.OPEN;
        this.enabled = false;
        // this._setGapState(GapState.OPEN);

        // console.log("GapSocket", this.railPart.path.position);
    }

    /**
     * このソケットにギャップを接続する。
     * @param isDryRun
     */
    connect(isDryRun: boolean = false) {
        if (!this.isConnected()) {
            this.connectedGap = new Gap(this);
        }

        if (isDryRun) {
            this._setGapState(GapState.CONNECTING);
        } else {
            this._setGapState(GapState.CONNECTED);
        }
    }

    /**
     * このソケットからギャップを削除する。
     */
    disconnect() {
        if (! this.isConnected()) {
            return;
        }
        this.connectedGap.remove();
        this._setGapState(GapState.OPEN);
        this.connectedGap = null;
    }

    /**
     * ギャップが接続されているか否かを返す。
     * @returns {boolean}
     */
    isConnected(): boolean {
        return !!this.connectedGap;
    }

    /**
     * 指定のパスを含むか否かを返す。
     * ソケットにギャップが接続されている場合、ギャップにも含まれているか調べる。
     * @param {"paper".Path} path
     * @returns {boolean}
     */
    containsPath(path: Path): boolean {
        if (this.isConnected()) {
            return super.containsPath(path) || this.connectedGap.containsPath(path);
        } else {
            return super.containsPath(path);
        }
    }

    private _setGapState(gapState: GapState) {
        if (this._enabled) {
            switch(gapState) {
                case GapState.OPEN:
                    this.detectionState = DetectionState.BEFORE_DETECT;
                    break;
                case GapState.CONNECTING:
                    this.detectionState = DetectionState.DETECTING;
                    break;
                case GapState.CONNECTED:
                    this.detectionState = DetectionState.AFTER_DETECT;
                    break;
            }
            // 接続されたギャップがあれば同じ状態に変更する
            if (this.connectedGap) {
                this.connectedGap.state = gapState;
            }
            this._gapState = gapState;
        }
        this.showInfo();
        // log.info(`GapSocket @${this.joint.name}: basePart.path=${this.basePart.path.position}, detectPart.path=${this.detectionPart.path.position}`);
    }

    showInfo() {
        log.info(`GapSocket @${this.joint.name}: enabled=${this.enabled}, state=${this.gapState}, detect=${this.detectionState}`);
    }
}

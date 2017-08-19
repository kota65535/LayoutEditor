/**
 * Created by tozawa on 2017/07/12.
 */
import {RectPart} from "./primitives/RectPart";
import {Feeder} from "./Feeder";
import logger from "../../../logging";
import {DetectablePart, DetectionState} from "./primitives/DetectablePart";
import {CirclePart} from "./primitives/CirclePart";
import {RailPart} from "./RailPart";

let log = logger("FeederSocket");

/**
 * フィーダーの電流方向をレールパーツの始点・終点を使って指定するための識別子。
 * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
 */
export enum FeederState {
    OPEN,
    CONNECTING,
    CONNECTED
}

export enum FlowDirection {
    NONE,
    START_TO_END,
    END_TO_START
}


/**
 * レールの両端の中点に存在するフィーダー差し込み口を表すクラス。
 */
export class FeederSocket extends DetectablePart {

    static WIDTH = 8;
    static HEIGHT = 12;
    static HIT_RADIUS = 20;
    static FILL_COLOR_CONNECTED = "darkgray";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "red";

    basePart: RectPart;
    detectionPart: CirclePart;

    railPart: RailPart;
    connectedFeeder: Feeder;        // 接続されたフィーダーオブジェクト
    _flowDirection: FlowDirection;  // 電流方向
    _feederState: FeederState;      // フィーダー接続状態
    _isEnabled: boolean;            // 操作有効・無効状態

    get flowDirection() { return this._flowDirection; }
    set flowDirection(flowDirection: FlowDirection) { this._flowDirection = flowDirection; }
    get feederState() { return this._feederState; }
    set feederState(feederState: FeederState) { this._setFeederState(feederState); }
    get enabled() { return this._isEnabled; };
    set enabled(isEnabled: boolean) { this._setEnabled(isEnabled); }

    get position() {
        switch(this._flowDirection) {
            case FlowDirection.START_TO_END:
                return this.basePart.getCenterOfBottom();
            case FlowDirection.END_TO_START:
                return this.basePart.getCenterOfTop();
        }
        return this.basePart.getCenterOfBottom();
    }

    get angle() {
        switch(this._flowDirection) {
            case FlowDirection.START_TO_END:
                return this.basePart.angle;
            case FlowDirection.END_TO_START:
                return this.basePart.angle - 180;
        }
    }

    /**
     * レールパーツにフィーダー差し込み口をセットする。
     * @param {RailPart} railPart
     * @param {FlowDirection} direction
     */
    constructor(railPart: RailPart, direction: FlowDirection = FlowDirection.NONE) {
        let angle = (railPart.startAngle + railPart.endAngle) / 2;
        let rect = new RectPart(railPart.middlePoint, angle,
            FeederSocket.WIDTH, FeederSocket.HEIGHT, FeederSocket.FILL_COLOR_OPEN);
        let circle = new CirclePart(railPart.middlePoint, angle, FeederSocket.HIT_RADIUS, FeederSocket.FILL_COLOR_OPEN);
        super(railPart.middlePoint, angle, rect, circle,
            [FeederSocket.FILL_COLOR_OPEN, FeederSocket.FILL_COLOR_OPEN, FeederSocket.FILL_COLOR_CONNECTING, FeederSocket.FILL_COLOR_CONNECTED]);

        this.railPart = railPart;
        this._flowDirection = direction;
        this.connectedFeeder = null;

        // 最初は無効で未接続状態
        this._setFeederState(FeederState.OPEN);
        this._setEnabled(false);

        // console.log("FeederSocket", this.railPart.path.position);
    }


    /**
     * 電流方向をトグルする。
     */
    toggleDirection() {
       switch(this.flowDirection) {
           case FlowDirection.START_TO_END:
               this.flowDirection = FlowDirection.END_TO_START;
               break;
           case FlowDirection.END_TO_START:
               this.flowDirection = FlowDirection.START_TO_END;
               break;
       }
    }


    /**
     * このソケットにフィーダーを接続する。
     * @param isDryRun
     */
    connect(isDryRun: boolean = false) {
        if (!this.isConnected()) {
            this.connectedFeeder = new Feeder(this);
        }

        if (isDryRun) {
            this._setFeederState(FeederState.CONNECTING);
        } else {
            this._setFeederState(FeederState.CONNECTED);
        }
    }

    /**
     * このソケットからフィーダーを削除する。
     */
    disconnect() {
        this.connectedFeeder.remove();
        this._setFeederState(FeederState.OPEN);
        this.connectedFeeder = null;
    }


    /**
     *
     * @returns {boolean}
     */
    isConnected() {
        return !!this.connectedFeeder;
    }


    private _setEnabled(isEnabled: boolean) {
        if (isEnabled) {
            this._setFeederState(this._feederState);
        } else {
            // 操作無効状態なら当たり判定を消しておく
            this.setDetectionState(DetectionState.DISABLED);
        }

        // 接続されたフィーダーがあれば同じ状態に変更する
        if (this.connectedFeeder) {
            this.connectedFeeder.setEnabled(isEnabled);
        }
        this._isEnabled = isEnabled;
    }


    private _setFeederState(feederState: FeederState) {
        switch(feederState) {
            case FeederState.OPEN:
                this.setDetectionState(DetectionState.BEFORE_DETECT);
                break;
            case FeederState.CONNECTING:
                this.setDetectionState(DetectionState.DETECTING);
                break;
            case FeederState.CONNECTED:
                this.setDetectionState(DetectionState.AFTER_DETECT);
                break;
        }
        // 接続されたフィーダーがあれば同じ状態に変更する
        if (this.connectedFeeder) {
            this.connectedFeeder.setState(feederState);
        }
        this._feederState = feederState;
    }
}

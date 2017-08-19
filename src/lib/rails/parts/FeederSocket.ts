/**
 * Created by tozawa on 2017/07/12.
 */
import {RectPart} from "./primitives/RectPart";
import {Feeder} from "./Feeder";
import logger from "../../../logging";
import {DetectablePart, DetectionState} from "./primitives/DetectablePart";
import {CirclePart} from "./primitives/CirclePart";

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
    railPart: any;
    flowDirection: FlowDirection;
    connectedFeeder: Feeder;
    _feederState: FeederState;


    get position() {
        switch(this.flowDirection) {
            case FlowDirection.START_TO_END:
                return this.basePart.getCenterOfBottom();
            case FlowDirection.END_TO_START:
                return this.basePart.getCenterOfTop();
        }
        return this.basePart.getCenterOfBottom();
    }

    get angle() {
        switch(this.flowDirection) {
            case FlowDirection.START_TO_END:
                return this._angle;
            case FlowDirection.END_TO_START:
                return this._angle - 180;
        }
    }

    /**
     * レールパーツにフィーダー差し込み口をセットする。
     * @param {RailPart} railPart
     * @param {FlowDirection} direction
     */
    constructor(railPart: any, direction: FlowDirection =FlowDirection.START_TO_END) {
        let angle = (railPart.startAngle + railPart.endAngle) / 2;
        let rect = new RectPart(railPart.middlePoint, angle,
            FeederSocket.WIDTH, FeederSocket.HEIGHT, FeederSocket.FILL_COLOR_OPEN);
        let circle = new CirclePart(railPart.middlePoint, angle, FeederSocket.HIT_RADIUS, FeederSocket.FILL_COLOR_OPEN);
        super(railPart.position, angle, rect, circle, [FeederSocket.FILL_COLOR_OPEN, FeederSocket.FILL_COLOR_OPEN, FeederSocket.FILL_COLOR_CONNECTING, FeederSocket.FILL_COLOR_CONNECTED]);

        this.railPart = railPart;
        this.flowDirection = direction;
        this.connectedFeeder = null;

        this._setState(FeederState.OPEN);

        // console.log("FeederSocket", this.railPart.path.position);
    }


    setDirection(direction) {
        this.flowDirection = direction;
    }

    /**
     * 電流方向をトグルする。
     */
    toggleDirection() {
       switch(this.flowDirection) {
           case FlowDirection.START_TO_END:
               this.setDirection(FlowDirection.END_TO_START);
               break;
           case FlowDirection.END_TO_START:
               this.setDirection(FlowDirection.START_TO_END);
               break;
       }
    }


    /**
     * このソケットにフィーダーを接続する。
     * @param isDryRun
     */
    connect(isDryRun=false) {
        if (!this.isConnected()) {
            this.connectedFeeder = new Feeder(this);
        }

        if (isDryRun) {
            this._setState(FeederState.CONNECTING);
        } else {
            this._setState(FeederState.CONNECTED);
        }
    }

    /**
     * このソケットからフィーダーを削除する。
     */
    disconnect() {
        this.connectedFeeder.remove();
        this._setState(FeederState.OPEN);
        this.connectedFeeder = null;
    }


    /**
     *
     * @returns {boolean}
     */
    isConnected() {
        return !!this.connectedFeeder;
    }


    /**
     * フィーダーが接続中か否かを返す。
     * @returns {State}
     */
    getState() {
        return this._feederState;
    }

    /**
     * 状態を設定し、フィーダーソケットとフィーダーの色、サイズを変更する。
     * @param state
     * @private
     */
    _setState(state) {
        switch(state) {
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
        this._feederState = state;
    }
}

/**
 * Created by tozawa on 2017/07/12.
 */
import {RectPart} from "./RectPart";
import {Feeder} from "./Feeder";
import logger from "../../../logging";

let log = logger("FeederSocket", "DEBUG");

/**
 * レールの両端の中点に存在するフィーダー差し込み口を表すクラス。
 */
export class FeederSocket extends RectPart{

    static WIDTH = 8;
    static HEIGHT = 12;
    static FILL_COLOR_CONNECTED = "darkgray";
    static FILL_COLOR_CONNECTING = "deepskyblue";
    static FILL_COLOR_OPEN = "red";

    /**
     * フィーダーの状態。
     * @type {{OPEN: Symbol, CONNECTING: Symbol, CONNECTED: Symbol}}
     */
    static State = {
        OPEN: Symbol(),         // 未接続
        CONNECTING: Symbol(),   // 接続試行中
        CONNECTED: Symbol()     // 接続中
    };

    /**
     * フィーダーの電流方向をレールパーツの始点・終点を使って指定するための識別子。
     * @type {{SAME_TO_ANGLE: Symbol, REVERSE_TO_ANGLE: Symbol}}
     */
    static FlowDirection = {
        START_TO_END: Symbol(),
        END_TO_START: Symbol()
    };

    /**
     * レールパーツにフィーダー差し込み口をセットする。
     * @param {RailPart} railPart
     * @param {FlowDirection} direction
     */
    constructor(railPart, direction=FeederSocket.FlowDirection.START_TO_END) {
        super(railPart.middlePoint, (railPart.startAngle + railPart.endAngle) / 2, FeederSocket.WIDTH, FeederSocket.HEIGHT, FeederSocket.FILL_COLOR_OPEN);
        this.railPart = railPart;
        this.flowDirection = direction;
        this.connectedFeeder = null;

        console.log("FeederSocket", this.railPart.path.position);
    }

    /**
     * エディタ上におけるフィーダーの設置角度を返す。
     * @returns {Number} angle
     */
    getFeederAngle() {
        switch(this.flowDirection) {
            case FeederSocket.FlowDirection.START_TO_END:
                return this.angle;
            case FeederSocket.FlowDirection.END_TO_START:
                return this.angle - 180;
        }
    }

    /**
     * エディタ上におけるフィーダーの設置位置を返す。
     * @returns {Point} point
     */
    getFeederPosition() {
        switch(this.flowDirection) {
            case FeederSocket.FlowDirection.START_TO_END:
                return this.getCenterOfBottom();
            case FeederSocket.FlowDirection.END_TO_START:
                return this.getCenterOfTop();
        }
    }

    setDirection(direction) {
        this.flowDirection = direction;
    }

    /**
     * 電流方向をトグルする。
     */
    toggleDirection() {
       switch(this.flowDirection) {
           case FeederSocket.FlowDirection.START_TO_END:
               this.setDirection(FeederSocket.FlowDirection.END_TO_START);
               break;
           case FeederSocket.FlowDirection.END_TO_START:
               this.setDirection(FeederSocket.FlowDirection.START_TO_END);
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
            this._setState(FeederSocket.State.CONNECTING);
        } else {
            this._setState(FeederSocket.State.CONNECTED);
        }
    }

    /**
     * このソケットからフィーダーを削除する。
     */
    disconnect() {
        this.connectedFeeder.remove();
        this._setState(FeederSocket.State.OPEN);
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
     * 指定されたパスがこのジョイントに属するか否かを返す。
     * @param path
     * @returns {boolean}
     */
    containsPath(path) {
        return path.id === this.path.id;
    }

    /**
     * フィーダーが接続中か否かを返す。
     * @returns {State}
     */
    getState() {
        return this.state;
    }

    /**
     * 状態を設定し、フィーダーソケットとフィーダーの色、サイズを変更する。
     * @param state
     * @private
     */
    _setState(state) {
        switch(state) {
            case FeederSocket.State.OPEN:
                this.path.fillColor = FeederSocket.FILL_COLOR_OPEN;
                this.connectedFeeder.path.opacity = 1;
                this.state = state;
                break;
            case FeederSocket.State.CONNECTING:
                this.path.fillColor = FeederSocket.FILL_COLOR_CONNECTING;
                this.connectedFeeder.path.opacity = 0.5;
                this.state = state;
                break;
            case FeederSocket.State.CONNECTED:
                this.path.fillColor = FeederSocket.FILL_COLOR_CONNECTED;
                this.connectedFeeder.path.opacity = 1;
                this.state = state;
                break;
        }
    }
}

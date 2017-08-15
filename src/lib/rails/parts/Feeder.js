/**
 * Created by tozawa on 2017/07/03.
 */

import {TrianglePart} from "./primitives/TrianglePart";

/**
 * フィーダークラス。
 * このクラスはエディタ上の表示とイベントハンドリングのために存在し、フィーダーの実際の機能はFeederSocketクラスに集約している。
 */
export class Feeder extends TrianglePart {

    static WIDTH = 30;
    static HEIGHT = 30;
    static FILL_COLOR_OPEN = "grey";
    static FILL_COLOR_CONNECTING = "red";
    static FILL_COLOR_CONNECTED = "black";

    /**
     * フィーダーを指定のフィーダーソケットに作成する
     * @param {FeederSocket} feederSocket
     */
    constructor(feederSocket) {
        super(feederSocket.getFeederPosition(), feederSocket.getFeederAngle(), Feeder.WIDTH, Feeder.HEIGHT, Feeder.FILL_COLOR_OPEN);

        this.railPart = feederSocket.railPart;
        this.feederSocket = feederSocket;

        // feederSocket.pathGroup.addChild(this.path);

        this.move(feederSocket.getFeederPosition(), this.getCenterOfTop());
        // this.rotate(angle, this.getPosition());
        // this.disconnect();
    }

    /**
     * イベントハンドリング用のIDをセットする。
     * @param {String} name
     */
    setName(name) {
        this.path.name = name;
    }

    /**
     * イベントハンドリング用のIDを取得する。
     * @param {String} name
     */
    getName(name) {
        return this.path.name;
    }
}

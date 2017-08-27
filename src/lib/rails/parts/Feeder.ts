/**
 * Created by tozawa on 2017/07/03.
 */

import {TrianglePart} from "./primitives/TrianglePart";
import {FeederSocket, FeederState} from "./FeederSocket";
import logger from "../../../logging";
let log = logger("Feeder");

/**
 * フィーダークラス。
 * このクラスはエディタ上の表示とイベントハンドリングのために存在し、フィーダーの実際の機能はFeederSocketクラスに集約している。
 */
export class Feeder extends TrianglePart {

    static WIDTH = 30;
    static HEIGHT = 30;
    static FILL_COLOR_OPEN = "grey";

    feederSocket: FeederSocket;

    get visible() { return super.visible; }
    set visible(isVisible: boolean) {
        super.visible = isVisible;
        log.debug(`Feeder @${this.feederSocket ? this.feederSocket.name : null}: visible=${this.visible}`);
    }

    set state(state: FeederState) {
        // フィーダーソケットの色に合わせるだけ
        this.path.fillColor = this.feederSocket.fillColors[state];
    }

    /**
     * フィーダーを指定のフィーダーソケットに作成する。
     * @param {FeederSocket} feederSocket
     */
    constructor(feederSocket: FeederSocket) {
        super(feederSocket.feederPosition, feederSocket.angle, Feeder.WIDTH, Feeder.HEIGHT, "black");

        this.feederSocket = feederSocket;

        // フィーダーソケットのパスグループに追加
        feederSocket.pathGroup.addChild(this.path);

        this.move(feederSocket.feederPosition, this.getCenterOfTop());

        // 有効化
        this.visible = true;
        this.state = feederSocket.feederState;
    }
}

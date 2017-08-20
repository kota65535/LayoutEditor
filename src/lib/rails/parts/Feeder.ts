/**
 * Created by tozawa on 2017/07/03.
 */

import {TrianglePart} from "./primitives/TrianglePart";
import {FeederSocket, FeederState} from "./FeederSocket";
import {PaletteItem, PaletteItemType} from "./PaletteItem";
import logger from "../../../logging";
let log = logger("Feeder");

/**
 * フィーダークラス。
 * このクラスはエディタ上の表示とイベントハンドリングのために存在し、フィーダーの実際の機能はFeederSocketクラスに集約している。
 */
export class Feeder extends TrianglePart implements PaletteItem {

    static WIDTH = 30;
    static HEIGHT = 30;
    static FILL_COLOR_OPEN = "grey";

    feederSocket: FeederSocket;

    get visible() { return super.visible; }
    set visible(isVisible: boolean) {
        super.visible = isVisible;
        log.info(`Feeder @${this.feederSocket ? this.feederSocket.name : null}: visible=${this.visible}`);
    }

    /**
     * フィーダーを指定のフィーダーソケットに作成する。
     * @param {FeederSocket} feederSocket
     */
    constructor(feederSocket: FeederSocket) {
        super(feederSocket.position, feederSocket.angle, Feeder.WIDTH, Feeder.HEIGHT, "black");

        this.feederSocket = feederSocket;

        // フィーダーソケットのパスグループに追加
        feederSocket.pathGroup.addChild(this.path);

        this.move(feederSocket.position, this.getCenterOfTop());

        // 有効化
        this.visible = true;
        this.setState(feederSocket._feederState);
    }

    setState(state: FeederState) {
        // フィーダーソケットの色に合わせるだけ
        this.path.fillColor = this.feederSocket.fillColors[state];
    }

    getItemType(): PaletteItemType {
        return PaletteItemType.FEEDER;
    }
}

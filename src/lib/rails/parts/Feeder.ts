/**
 * Created by tozawa on 2017/07/03.
 */

import {TrianglePart} from "./primitives/TrianglePart";
import {FeederSocket, FeederState} from "./FeederSocket";
import {PaletteItem, PaletteItemType} from "./PaletteItem";

/**
 * フィーダークラス。
 * このクラスはエディタ上の表示とイベントハンドリングのために存在し、フィーダーの実際の機能はFeederSocketクラスに集約している。
 */
export class Feeder extends TrianglePart implements PaletteItem {

    static WIDTH = 30;
    static HEIGHT = 30;
    static FILL_COLOR_OPEN = "grey";
    static FILL_COLOR_CONNECTING = "red";
    static FILL_COLOR_CONNECTED = "black";

    railPart: any;
    feederSocket: FeederSocket;
    _isEnabled: boolean;

    /**
     * フィーダーを指定のフィーダーソケットに作成する
     * @param {FeederSocket} feederSocket
     */
    constructor(feederSocket: FeederSocket) {
        super(feederSocket.position, feederSocket.angle, Feeder.WIDTH, Feeder.HEIGHT, Feeder.FILL_COLOR_OPEN);

        this.railPart = feederSocket.railPart;
        this.feederSocket = feederSocket;
        this.path.moveBelow(this.feederSocket.pathGroup);

        // feederSocket.pathGroup.addChild(this.path);

        this.move(feederSocket.position, this.getCenterOfTop());
        // this.rotate(angle, this.getPosition());
        // this.disconnect();
        this.setState(feederSocket._feederState);
        this.setEnabled(feederSocket._isEnabled);
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
    getName() {
        return this.path.name;
    }

    setState(state: FeederState) {
        // switch(state) {
        //     case FeederState.OPEN:
        //         this.path.visible = true;
        //         break;
        //     case FeederState.CONNECTING:
        //         this.path.visible = true;
        //         break;
        //     case FeederState.CONNECTED:
        //         this.path.visible = true;
        //         break;
        // }
        // 色はソケットに合わせる
        this.path.fillColor = this.feederSocket.fillColors[state];
    }

    setEnabled(isEnabled) {
        if (isEnabled) {
            this.path.visible = true;
        } else {
            this.path.visible = false;
        }
        this._isEnabled = isEnabled;
    }

    getItemType(): PaletteItemType {
        return PaletteItemType.FEEDER;
    }
}

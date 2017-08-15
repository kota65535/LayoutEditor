/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import {FeederSocket} from "./rails/parts/FeederSocket";
import {Rail} from "./rails/Rail";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import {LayoutManager} from "./LayoutManager";
import {LayoutSimulator} from "./LayoutSimulator";
import logger from "../logging";

let log = logger("LayoutEditor", "DEBUG");

// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.remove = function() {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


export class LayoutEditor {


    constructor(gridPaper) {

        // GridPaperインスタンスへの参照
        this.gridPaper =  gridPaper;


        // 選択中のレール
        this.paletteRail = null;
        // マウスカーソルで触れたフィーダーソケット
        this.touchedFeederSocket = null;

        // レール設置ガイドの自分の接続しているジョイントのインデックス
        this.jointIndexOfGuide = null;

        this.layoutManager = new LayoutManager();
        this.layoutSimulator = new LayoutSimulator();

        // 現在押されている修飾キー
        // this.modifierKeys = [];
    }

    /**
     * 保存されていたレイアウトをロードし、エディタ上に配置する。
     *
     * @param layoutData
     */
    loadLayout(layoutData) {
        this.layoutManager.loadLayout(layoutData);
    }

    /**
     * 設置するレールを選択する。
     * @param {Rail} rail
     *
     */
    selectRail(rail) {
        // 接続可能なジョイントに近づくまで透明化する
        this.paletteRail = rail;
        this.paletteRail.setOpacity(0);
    }

    /**
     * 設置されるレールのガイドを半透明で表示する。
     * @param {Joint} toJoint
     */
    showRailToPut(toJoint) {
        this.paletteRail.setOpacity(0.5);
        // レール選択直後の場合、対向レールの種類にもとづいてレールガイドの初期向きを設定する
        if (this.jointIndexOfGuide === null) {
            this.initJointOfGuide(toJoint);
        }
        this.paletteRail.connect(this.getCurrentJointOfGuide(), toJoint, true);
    }

    /**
     * 設置されるレールのガイドを消去する。
     */
    hideRailToPut() {
        this.paletteRail.setOpacity(0);
        this.paletteRail.disconnect();
        this.paletteRail.move(new paper.Point(0,0), this.paletteRail.joints[0]);
    }

    /**
     * レールガイドが自身のどのジョイントで対向レールに接続するかを決定するインデックスを初期化する。
     * @param toJoint
     */
    initJointOfGuide(toJoint) {
        // 対向レールとパレットレールの両者がカーブレールの場合、カーブの向きを揃える。
        // TODO: ジョイントの個数が２であることが前提になっている。より汎用的なロジックを考える。
        let opponentRail = this.layoutManager.getRailFromJoint(toJoint);
        if (this.paletteRail.constructor.name === "CurveRail"
            && opponentRail.constructor.name === "CurveRail") {
            this.jointIndexOfGuide = opponentRail.joints.indexOf(toJoint) ^ 1;
        } else {
            this.jointIndexOfGuide = 0;
        }
        log.info(`init joint index of guide with ${this.jointIndexOfGuide}`);
    }

    /**
     * レールガイドが接続する自身のジョイントのインデックスを取得する。
     * @returns {Number}
     */
    getCurrentJointOfGuide() {
        return this.paletteRail.joints[this.jointIndexOfGuide];
    }

    /**
     * レールガイドが接続する自身のジョイントのインデックスをインクリメントする。
     */
    incrementJointIndexOfGuide() {
        this.jointIndexOfGuide = (this.jointIndexOfGuide + 1) % this.paletteRail.joints.length;
    }

    /**
     * 選択されたレールを設置する。
     * @param {Joint} toJoint
     */
    putSelectedRail(toJoint) {
        let result = this.layoutManager.putRail(this.paletteRail, this.getCurrentJointOfGuide(), toJoint);
        if (result) {
            this.gridPaper.paths.push(this.paletteRail.pathGroup);
            this.selectRail(cloneRail(this.paletteRail));
            this.jointIndexOfGuide = null;
        }
    }

    /**
     * 設置されるフィーダーのガイドを半透明で表示する。
     * @param {FeederSocket} feederSocket at the mouse cursor
     */
    showFeederToPut(feederSocket) {
        this.touchedFeederSocket = feederSocket;
        console.log("connect");
        this.touchedFeederSocket.connect(true);
    }

    /**
     * 設置されるフィーダーのガイドを消去する。
     */
    hideFeederToPut() {
        // 接続試行中ならガイドを消去する
        if (this.touchedFeederSocket && this.touchedFeederSocket.getState() === FeederSocket.State.CONNECTING) {
            this.touchedFeederSocket.disconnect();
        }
        // このとき接触しているフィーダーは無い
        this.touchedFeederSocket = null;
    }

    /**
     * フィーダーを設置する。
     */
    putFeeder() {
        this.layoutManager.putFeeder(this.touchedFeederSocket);
    }

    /**
     * マウス移動時のハンドラ
     * @param {ToolEvent} event
     */
    handleMouseMove(event) {
        // 何にも接触していない場合、各種ガイドを消す
        if (!event.item) {
            this.hideRailToPut();
            this.hideFeederToPut();
            return;
        }

        // ジョイント上かつ接続中でないならレール設置ガイドを表示する
        let joint = this.layoutManager.getJoint(event.point);
        if (joint && ! (joint.getState() === Joint.State.CONNECTED)) {
            this.showRailToPut(joint);
        } else {
            this.hideRailToPut();
        }

        // フィーダーソケット上かつ接続中でないならフィーダー設置ガイドを表示する
        let feederSocket = this.layoutManager.getFeederSocket(event.point);
        if (feederSocket && ! (feederSocket.getState() === FeederSocket.State.CONNECTED)) {
            this.showFeederToPut(feederSocket);
        } else {
            this.hideFeederToPut();
        }

    }

    /**
     * マウスクリック時のハンドラ
     * @param {ToolEvent} event
     */
    handleMouseDown(event) {
        let buttons = {
            0: "Left",
            2: "Right"
        }
        let buttonName = buttons[event.event.button]
        if (buttonName) {
            this[this.handleMouseDown.name + buttonName](event);
        }
    }

    /**
     * マウス左クリック時のハンドラ。以下の処理を行う。
     *   - 未接続のジョイント上ならば、現在選択中のレールと接続する。
     *   - レールならば、そのレールを選択する。
     *
     * @param {ToolEvent} event
     */
    handleMouseDownLeft(event) {

        // ジョイント結合・レール設置処理
        let joint = this.layoutManager.getJoint(event.point);
        if (joint && joint.getState() !== Joint.State.CONNECTED) {
            this.putSelectedRail(joint);
            return;
        }

        // フィーダー結合処理
        let feederSocket = this.layoutManager.getFeederSocket(event.point);
        if (feederSocket && feederSocket.getState() !== FeederSocket.State.CONNECTED) {
            this.putFeeder(feederSocket);
            return;
        }

        // 何もなければ何もしない
        if (!event.item) {
            return;
        }

        // レールの選択状態をトグルする
        let rail = this.layoutManager.getRail(event.item);
        if (rail) {
            event.item.selected = !event.item.selected; // 選択を反転
            return;
        }

        // フィーダーの選択状態をトグルする
        let feeder = this.layoutManager.getFeeder(event.item);
        if (feeder) {
            event.item.selected = !event.item.selected; // 選択を反転
            return;
        }
    }

    /**
     * マウス右クリック時のハンドラ。以下の処理を行う。
     *   - 未接続のジョイント上ならば、現在選択中のレールの向きを変える。
     *
     * @param {ToolEvent} event
     */
    handleMouseDownRight(event) {
        let joint = this.layoutManager.getJoint(event.point);
        if (joint && joint.getState() !== Joint.State.CONNECTED) {
            joint.disconnect();
            this.incrementJointIndexOfGuide();
            this.showRailToPut(joint);
        }

        let feederSocket = this.layoutManager.getFeederSocket(event.point);
        if (feederSocket && feederSocket.getState() !== FeederSocket.State.CONNECTED) {
            feederSocket.toggleDirection();
            feederSocket.disconnect();
            this.showFeederToPut(feederSocket);
        }
    }

    /**
     * マウスドラッグ時のハンドラ。
     * @param event
     */
    handleMouseDrag(event) {
        log.info("down point: ", event.downPoint);
        log.info("event point: ", event.point);
        log.info("delta ", event.delta);
    }

    /**
     * キーボード押下された時のハンドラ。以下の処理を行う。
     *   - DEL:   選択中のレールを削除する。
     *   - F:     選択中のレールにフィーダーを差す。
     *   - SPACE: 導通を確認する。
     *   - S:     選択中のレールの導通方向を切り替える。切り替え後は導通確認を再度実行する。
     *
     * @param {KeyEvent} event
     */
    handleKeyDown(event) {
        // 選択されたレールを取得する
        let selectedRails = paper.project.selectedItems
            .map(item => this.layoutManager.getRail(item))
            .filter(Boolean);
        let selectedFeeders = paper.project.selectedItems
            .map(item => this.layoutManager.getFeeder(item))
            .filter(Boolean);
        log.info("Selected rail: ", selectedRails);
        log.info("Selected feeder: ", selectedFeeders);
        switch (event.key) {
            case "backspace":
                selectedRails.forEach(r => this.layoutManager.removeRail(r));
                selectedFeeders.forEach(f => this.layoutManager.removeFeeder(f));
                break;
            case "space":
                // 全てのレールを未チェック状態にする
                this.layoutSimulator.resetFlowSimulation();
                break;
            case "f":
                this.layoutSimulator.init(this.layoutManager.rails, this.layoutManager.feeders);
                this.layoutSimulator.resetFlowSimulation();
                this.layoutSimulator.simulateFlow();
                break;
            case "s":
                selectedRails.forEach(r => r.toggleSwitch());
                this.layoutSimulator.resetFlowSimulation();
                this.layoutSimulator.simulateFlow();
                break;
            // case "shift":
            //     this.modifierKeys.push("shift");
            //     break;
            // case "alt":
            //     this.modifierKeys.push("alt");
            //     break;
            // case "control":
            //     this.modifierKeys.push("control");
            //     break;
            // case "meta":
            //     this.modifierKeys.push("meta");
            //     break;
            // case "up":
            //     request = new XMLHttpRequest();
            //     request.open("POST", "http://0.0.0.0:5000/serial");
            //     request.send("f 1 c 30");
            //     break;
            // case "down":
            //     request = new XMLHttpRequest();
            //     request.open("POST", "http://0.0.0.0:5000/serial");
            //     request.send("f 1 c -30");
            //     break;
            // case "d":
            //     request = new XMLHttpRequest();
            //     request.open("POST", "http://0.0.0.0:5000/serial");
            //     request.send("f 1 d");
            //     break;
        }

        log.info("Modifiers: ", this.modifierKeys);
    }

    handleKeyUp(event) {
        // switch (event.key) {
        //     case "shift":
        //         this.modifierKeys.remove("shift");
        //         log.info(this.modifierKeys);
        //         break;
        //     case "alt":
        //         this.modifierKeys.remove("alt");
        //         log.info(this.modifierKeys);
        //         break;
        //     case "control":
        //         this.modifierKeys.remove("control");
        //         break;
        //     // case "meta":
        //     //     this.modifierKeys.remove("meta");
        //     //     break;
        // }
        // log.info("Modifiers: ", this.modifierKeys);
    }

    handleOnFrame(event) {
        this.layoutManager.rails.forEach( rail => rail.animate(event));
    }
}

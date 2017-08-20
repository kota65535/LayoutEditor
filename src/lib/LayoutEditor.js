/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint, JointDirection, JointState} from "./rails/parts/Joint";
import {FeederSocket, FeederState} from "./rails/parts/FeederSocket";
import {Rail} from "./rails/Rail";
import {CurveRail} from "./rails/CurveRail";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import {LayoutManager} from "./LayoutManager";
import {LayoutSimulator} from "./LayoutSimulator";
import {hitTest, hitTestAll} from "./utils";
import logger from "../logging";
import {PaletteItemType} from "./rails/parts/PaletteItem";

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
        this.paletteRailAngle = 0;
        // マウスカーソルで触れたフィーダーソケット
        this.touchedFeederSocket = null;

        // レール設置ガイドの自分の接続しているジョイントのインデックス
        this.jointIndexOfGuide = null;

        this.layoutManager = new LayoutManager();
        this.layoutSimulator = new LayoutSimulator();

        // 最初のレールを配置するためのグリッド上のジョイント
        this.gridJoints = [];
        this.gridJointsAngle = 0;
    }


    //====================
    // モード遷移
    //====================

    isRailMode() {
        return this.paletteRail.getItemType() === PaletteItemType.RAIL;
    }

    isFeederMode() {
        return this.paletteRail.getItemType() === PaletteItemType.FEEDER;
    }

    isGapJoinerMode() {
        return this.paletteRail.getItemType() === PaletteItemType.FEEDER;
    }

    changeToRailMode(paletteItem) {
        this.layoutManager.rails.forEach(rail => {
            rail.joints.forEach(j => j.setEnabled(true));
        });
        this.layoutManager.rails.forEach(rail => {
            rail.feederSockets.forEach(fs => fs.enabled = false);
        });
        this.selectRail(paletteItem);
    }

    changeToFeederMode(paletteItem) {
        this.layoutManager.rails.forEach(rail => {
            rail.joints.forEach(j => j.setEnabled(false));
        });
        this.layoutManager.rails.forEach(rail => {
            rail.feederSockets.forEach(fs => fs.enabled = true);
        });
        this.paletteRail = paletteItem;
        // this.selectRail(paletteItem);
    }

    selectPaletteItem(paletteItem) {
        switch (paletteItem.getItemType()) {
            case PaletteItemType.RAIL:
                this.changeToRailMode(paletteItem);
                break;
            case PaletteItemType.FEEDER:
                this.changeToFeederMode(paletteItem);
                break;
            case PaletteItemType.GAP_JOINER:
                // this.selectFeeder(paletteItem);
                // break;
        }
    }


    /**
     * 保存されていたレイアウトをロードし、エディタ上に配置する。
     * @param layoutData
     */
    loadLayout(layoutData) {
        // グリッドジョイントがあれば削除する
        this.removeJointsOnGrid();
        this.layoutManager.loadLayout(layoutData);
        // ロードしたレールのパスをグリッドペーパーに認識させる
        this.layoutManager.rails.forEach(rail => {
            this.gridPaper.paths.push(rail.pathGroup);
        });
        // 何も選択していない状態にする
        paper.project.deselectAll();
    }

    /**
     * 現在のレイアウトデータをシリアライズしたオブジェクトを返す。
     * @returns {{rails: Array}}
     */
    saveLayout() {
        return this.layoutManager.saveLayout();
    }

    /**
     * レイアウトが空（レールが一本も配置されていない）か否かを返す。
     * @returns {boolean}
     */
    isLayoutBlank() {
        return this.layoutManager.rails.length === 0;
    }

    //==============================
    // 一本目のレール設置時特有のメソッド
    //==============================

    /**
     * 一本目のレールを配置するための透明なジョイント（以降、グリッドジョイント）をグリッド上に配置する。
     */
    putJointsOnGrid(cursorPosition) {
        // マウスカーソルの周囲のグリッドの座標を取得する
        let topLeft = cursorPosition.subtract(new paper.Point(this.gridPaper.gridSize, this.gridPaper.gridSize));
        let bottomRight = cursorPosition.add(new paper.Point(this.gridPaper.gridSize, this.gridPaper.gridSize));
        let gridPoints = this.gridPaper.getGridPoints(topLeft, bottomRight);

        // 更新のためいったん全て消す
        this.removeJointsOnGrid();

        if (this.isLayoutBlank()) {
            // グリッド上に透明なジョイントを作成
            gridPoints.forEach(point => {
                let joint = new Joint(point, this.gridJointsAngle, JointDirection.SAME_TO_ANGLE, null);
                // TODO: デバッグ用
                joint.basePart.setOpacity(0);
                // joint.setOpacity(0);
                joint.basePart.setVisible(false);
                this.gridJoints.push(joint);
            });
        }
    }

    /**
     * 全てのグリッドジョイントを削除する。
     */
    removeJointsOnGrid() {
        this.gridJoints.forEach(joint => joint.remove());
        this.gridJoints = [];
    }

    /**
     * 指定の位置のグリッドジョイントを返す。
     * @param point
     * @returns {*}
     */
    searchJointsOnGrid(point) {
        let hitResult = hitTest(point);
        if (!hitResult) {
            return null;
        }
        return this.gridJoints.find(joint => joint.containsPath(hitResult.item));
    }

    /**
     * 指定の位置のジョイントを取得する。グリッドジョイントも含む。
     * @param point
     * @returns {*}
     */
    getJoint(point) {
        let joint;
        if (this.isLayoutBlank()) {
            joint = this.searchJointsOnGrid(point);
        } else {
            // カーソル上のジョイントのうち、最も近いものを選択する。
            joint = this.layoutManager.getJoint(point);
        }
        return joint;
    }

    //==============================
    // レール設置機能に関するメソッド
    //==============================

    /**
     * 設置するレールを選択する。
     * @param {Rail} rail
     *
     */
    selectRail(rail) {
        // TODO: パレットを連打すると、その分だけ不可視のレールが生成されてしまう
        this.paletteRail = rail;
        this.paletteRail.rotate(this.paletteRailAngle, this.paletteRail.startPoint);
        // 不可視の状態で置いておく
        this.paletteRail.setVisible(false);
    }

    /**
     * 設置されるレールのガイドを半透明で表示する。
     * @param {Joint} toJoint
     */
    showRailToPut(toJoint) {
        this.paletteRail.setVisible(true);
        this.paletteRail.setOpacity(0.5);
        // レール選択直後の場合、対向レールの種類にもとづいてレールガイドの初期向きを設定する
        if (this.jointIndexOfGuide === null) {
            this.initJointOfGuide(toJoint);
        }
        // 接続先のレール（レイアウトが空ならジョイント）を最上部に表示する。
        // 接続先のジョイントに対するカーソルの当たり判定維持のため。
        if (this.isLayoutBlank()) {
            toJoint.pathGroup.bringToFront();
        } else {
            toJoint.rail.pathGroup.bringToFront();
        }
        this.paletteRail.connect(this.getCurrentJointOfGuide(), toJoint, true);
    }

    /**
     * 設置されるレールのガイドを消去する。
     */
    hideRailToPut() {
        this.paletteRail.setVisible(false);
        this.paletteRail.setOpacity(0.2);
        this.paletteRail.disconnect();
        this.paletteRail.move(new paper.Point(0,0), this.paletteRail.joints[0]);
    }

    /**
     * ガイドレールが自身のどのジョイントで対向レールに接続するかを決定するインデックスを初期化する。
     * カーブレールが続く場合、弧の向きに合わせてガイドレールの初期接続ジョイントを一定に保つ。
     * @param toJoint
     */
    initJointOfGuide(toJoint) {
        // 対向レールとパレットレールの両者がカーブレールの場合、カーブの向きを揃える。
        // TODO: ジョイントの個数が２であることが前提になっている。より汎用的なロジックを考える。
        let opponentRail = toJoint.rail;
        if (!opponentRail) {
            // グリッドジョイントの場合は向きは変えない
            this.jointIndexOfGuide = 0;
            return;
        }
        if (this.paletteRail instanceof CurveRail && opponentRail instanceof CurveRail) {
            // 自分も相手もカーブレールの場合
            if (this.layoutManager.rails.length === 1) {
                // 一本目のレールがカーブレールの場合、両方のジョイントに対して弧の向きを揃えることはできない・・・
                // 割り切って向きは変えないことにする。
                this.jointIndexOfGuide = 0;
            } else {
                this.jointIndexOfGuide = opponentRail.joints.indexOf(toJoint) ^ 1;
            }
        } else {
            // カーブレール以外なら向きは変えなくてもいいよね？
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
        // 接続先のレールよりも上に移動する。設置したレールのジョイントの当たり判定を優先したいので。
        this.paletteRail.pathGroup.bringToFront();
        let result = this.layoutManager.putRail(this.paletteRail, this.getCurrentJointOfGuide(), toJoint);
        if (result) {
            this.gridPaper.paths.push(this.paletteRail.pathGroup);
            this.selectRail(cloneRail(this.paletteRail));
            this.jointIndexOfGuide = null;
        }
    }

    //==============================
    // フィーダー設置機能に関わるメソッド
    //==============================


    selectFeeder() {
        this.layoutManager.rails.forEach(rail => {
            rail.feederSockets.forEach(fs => fs.setState(FeederState.OPEN));
        });
        this.showFeederSockets();
        log.info("Feeder selected");
    }

    showFeederSockets() {
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
        if (this.touchedFeederSocket && this.touchedFeederSocket.feederState === FeederState.CONNECTING) {
            this.touchedFeederSocket.disconnect();
        }
        // このとき接触しているフィーダーは無い
        this.touchedFeederSocket = null;
    }

    /**
     * フィーダーを設置する。
     */
    putFeeder(feederSocket) {
        this.layoutManager.putFeeder(feederSocket);
    }


    //====================
    // UIイベントハンドラ
    //====================

    /**
     * マウス移動時のハンドラ
     * @param {ToolEvent} event
     */
    handleMouseMove(event) {

        // レイアウトが空ならグリッドジョイントをカーソルの周囲に生成する
        if (this.isLayoutBlank()) {
            this.putJointsOnGrid(event.point);
        }

        // 何にも接触していない場合、各種ガイドを消す

        // ジョイント上にマウスが乗った時の処理
        if (this.isRailMode()) {
            this.hideRailToPut();
            this.handleMouseMoveOnJoint(event);
        }

        // フィーダー上にマウスが乗った時の処理
        if (this.isFeederMode()) {
            this.hideFeederToPut();
            this.handleMouseMoveOnFeeder(event);
        }
    }

    /**
     * ジョイント上にマウスが乗った時の処理
     * @param event
     */
    handleMouseMoveOnJoint(event) {
        // 乗っているジョイントを取得
        let joint = this.getJoint(event.point);
        // ジョイント上かつ接続中でないならレール設置ガイドを表示する
        if (joint && ! (joint.jointState === JointState.CONNECTED)) {
            this.showRailToPut(joint);
        } else {
            this.hideRailToPut();
        }
    }

    /**
     * フィーダー上にマウスが乗った時の処理
     * @param event
     */
    handleMouseMoveOnFeeder(event) {
        // 乗っているフィーダーを取得
        let feederSocket = this.layoutManager.getFeederSocket(event.point);

        // フィーダーソケット上かつ下記の条件に当てはまればフィーダーガイドを表示
        //  - フィーダーが選択されている
        //  - フィーダーが未接続または接続試行中である
        if (feederSocket
            && [FeederState.OPEN, FeederState.CONNECTING].includes(feederSocket.feederState)) {
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

        // ジョイント上でマウス左クリックした時の処理
        if (this.isRailMode()) {
            this.handleMouseDownLeftOnJoint(event);
            return;
        }

        // フィーダー結合処理
        if (this.isFeederMode()) {
            let feederSocket = this.layoutManager.getFeederSocket(event.point);
            if (feederSocket && feederSocket.feederState !== FeederState.CONNECTED) {
                this.putFeeder(feederSocket);
                return;
            }
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
     * ジョイント上でマウス左クリックした時の処理
     * @param event
     */
    handleMouseDownLeftOnJoint(event) {
        let joint = this.getJoint(event.point);
        let isLayoutBlank = this.isLayoutBlank();

        // ジョイント結合・レール設置処理
        if (joint && joint.jointState !== JointState.CONNECTED) {
            this.putSelectedRail(joint)
            // レイアウトが空だったらグリッドジョイントを削除する
            if (isLayoutBlank) {
                this.removeJointsOnGrid();
            }
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
        let joint = this.getJoint(event.point);
        if (joint && joint.jointState !== JointState.CONNECTED) {
            joint.disconnect();
            this.incrementJointIndexOfGuide();
            this.showRailToPut(joint);
        }

        let feederSocket = this.layoutManager.getFeederSocket(event.point);
        if (feederSocket && feederSocket.feederState !== FeederState.CONNECTED) {
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
            // case "space":
            //     // 全てのレールを未チェック状態にする
            //     this.layoutSimulator.resetFlowSimulation();
            //     break;
            // case "f":
            //     this.layoutSimulator.init(this.layoutManager.rails, this.layoutManager.feeders);
            //     this.layoutSimulator.resetFlowSimulation();
            //     this.layoutSimulator.simulateFlow();
            //     break;
            // case "s":
            //     selectedRails.forEach(r => r.toggleSwitch());
            //     this.layoutSimulator.resetFlowSimulation();
            //     this.layoutSimulator.simulateFlow();
            //     break;
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

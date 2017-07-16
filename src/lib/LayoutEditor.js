/**
 * Created by tozawa on 2017/07/12.
 */

export class LayoutEditor {
    constructor() {
        // 設置したレールのリスト
        this.rails = [];
        // 選択中のレール
        this.selectedRail = null;
        // 選択中のレールの向き
        this.selectedRailDirection = 0;

        this.nextId = 1;

        this.handlerMap = {
            "MouseEvent": {
                "mousemove": "handleMouseMove",
                "mousedown": "handleMouseDown"
            }
        };
        // レール設置ガイド表示中か否か
        this.isShowingRailToPut = false;
    }


    /**
     * 設置するレールを選択する。
     * @param rail
     */
    selectRail(rail) {
        // 接続可能なジョイントに近づくまで透明化する
        this.selectedRail = rail;
        this.selectedRail.setOpacity(0);
    }

    /**
     * 選択されたレールを設置する。
     * @param {Joint} toJoint
     */
    putSelectedRail(toJoint) {
        this.selectedRail.setOpacity(1.0);
        this.selectedRail.connect(this.selectedRail.joints[this.selectedRailDirection], toJoint);
        this.putRail(this.selectedRail);
        this.selectRail(this.selectedRail.clone());
        // this.selectedRail.move(new Point(0, 0), this.selectedRail.joints[0]);
    }

    handleEvents(event) {
        let eventName = event.event.constructor.name;
        let eventType = event.event.type;

        let handlerName = this.handlerMap[eventName][eventType];
        console.log("handler: " + handlerName);
        if (handlerName) {
            this[handlerName](event.event, event.item)
        }
    }

    /**
     * マウス移動時のハンドラ
     * @param {MouseEvent} event
     * @param {Path} path
     */
    handleMouseMove(event, path) {
        if (path) {
            let joint = this.getJoint(path);
            console.log("Joint" + joint);
            if (joint && !joint.isConnected()) {
                this.showRailToPut(joint);
            }
        } else {
            this.hideRailToPut();
        }
    }

    handleMouseDown(event, path) {
        let buttons = {
            0: "Left",
            2: "Right"
        }
        let buttonName = buttons[event.button]
        if (buttonName) {
            this[this.handleMouseDown.name + buttonName](event, path);
        }
    }

    /**
     * マウス左クリック時のハンドラ
     * @param {MouseEvent} event
     * @param {Path} path
     */
    handleMouseDownLeft(event, path) {
        let joint = this.getJoint(path);
        if (joint && this.isShowingRailToPut) {
            this.putSelectedRail(joint);
        }
    }

    /**
     * マウス右クリック時のハンドラ
     * @param {MouseEvent} event
     * @param {Path} path
     */
    handleMouseDownRight(event, path) {
        let joint = this.getJoint(path);
        if (joint && joint.isConnected()) {
            this._getNextDirectionOfSelectedRail();
            joint.disconnect();
            this.showRailToPut(joint);
        }
    }


    /**
     * 設置されるレールのガイドを半透明で表示する。
     * @param toJoint
     */
    showRailToPut(toJoint) {
        this.selectedRail.setOpacity(0.5);
        this.selectedRail.connect(this.selectedRail.joints[this.selectedRailDirection], toJoint);
        this.isShowingRailToPut = true;
    }

    /**
     * 設置されるレールのガイドを消去する。
     * @param toJoint
     */
    hideRailToPut() {
        this.selectedRail.setOpacity(0.1);
        this.selectedRail.disconnect();
        this.selectedRail.move(new Point(100,100), this.selectedRail.joints[0]);
        this.isShowingRailToPut = false;
    }

    _getNextDirectionOfSelectedRail() {
        this.selectedRailDirection = (this.selectedRailDirection + 1) % this.selectedRail.joints.length;
    }

    /**
     * レールオブジェクトを設置し、管理下におく。
     * レールには一意のIDが割り当てられる。
     * @param {Rail} rail
     */
    putRail(rail) {
        this.selectedRail.id = this._getNextId();
        this.rails.push(rail);
    }

    /**
     * パスオブジェクトが属するレールオブジェクトを取得する。
     * @param {Path} path
     * @return {Rail}
     */
    getRail(path) {
        return this.rails.find( elem => elem.containsPath(path));
    }

    /**
     * パスオブジェクトが属するジョイントオブジェクトを取得する
     * @param path
     * @returns {Joint}
     */
    getJoint(path) {
        // 全てのレールのジョイントを取得
        let allJoints = [].concat.apply([], this.rails.map( r => r.joints));
        return allJoints.find( elem => elem.containsPath(path));
    }

    hitTest(event) {
        let hitOptions = {
            fill: true,
            tolerance: 5
        };
        let hitResult = project.hitTest(event.point, hitOptions);
        if (hitResult) {

        }
    }

    _getNextId() {
        return this.nextId++;
    }
}

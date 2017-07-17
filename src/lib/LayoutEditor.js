/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import logger from "../logging";

let log = logger("LayoutEditor");


export class LayoutEditor {

    constructor() {
        // 設置したレールのリスト
        this.rails = [];
        // 選択中のレール
        this.selectedRail = null;

        this.nextId = 1;

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
        this.selectedRail.connect(this.selectedRail.getCurrentJoint(), toJoint);
        this.putRail(this.selectedRail);
        this.selectRail(this.selectedRail.clone());
        // this.selectedRail.move(new Point(0, 0), this.selectedRail.joints[0]);
    }

    /**
     * マウス移動時のハンドラ
     * @param {ToolEvent} event
     */
    handleMouseMove(event) {
        // 何にも無ければ何もしない
        if (!event.item) {
            this.hideRailToPut();
            return;
        }
        // console.log(event.item);
        // レールであるか確かめる
        // let rail = this.getRail(event.item);
        // レールでない場合はレール設置ガイドを消去する
        // if (!rail) {
        //     this.hideRailToPut();
        //     project.selectedItems.forEach(item => item.selected = false);
        //     return;
        // }

        // ジョイント上かつ接続中でないならレール設置ガイドを表示する
        let joint = this.getJoint(event.point);
        // console.log("Joint" + joint);
        if (joint && ! (joint.getState() === Joint.State.CONNECTED)) {
            this.showRailToPut(joint);
        } else {
            this.hideRailToPut();
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
     * マウス左クリック時のハンドラ
     * @param {ToolEvent} event
     * @param {Path} path
     */
    handleMouseDownLeft(event) {
        // event.item.selected = true;
        let joint = this.getJoint(event.point);
        if (joint && this.isShowingRailToPut) {
            this.putSelectedRail(joint);
        }
    }

    /**
     * マウス右クリック時のハンドラ
     * @param {MouseEvent} event
     * @param {Path} path
     */
    handleMouseDownRight(event) {
        let joint = this.getJoint(event.point);
        if (joint && joint.getState() !== Joint.State.CONNECTED) {
            this.selectedRail.getNextJoint();
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
        this.selectedRail.connect(this.selectedRail.getCurrentJoint(), toJoint, true);
        this.isShowingRailToPut = true;
    }

    /**
     * 設置されるレールのガイドを消去する。
     * @param toJoint
     */
    hideRailToPut() {
        this.selectedRail.setOpacity(0);
        this.selectedRail.disconnect();
        this.selectedRail.move(new Point(0,0), this.selectedRail.joints[0]);
        this.isShowingRailToPut = false;
    }

    // _getNextDirectionOfSelectedRail() {
    //     this.selectedRailDirection = (this.selectedRailDirection + 1) % this.selectedRail.joints.length;
    // }

    /**
     * レールオブジェクトを設置し、管理下におく。
     * レールには一意のIDが割り当てられる。
     * @param {Rail} rail
     */
    putRail(rail) {
        let id = this._getNextId();
        rail.setName(id);
        this.rails.push(rail);

        log.info("PUT begin-----");
        project.activeLayer.children.forEach( c => {
            if (c.constructor.name === "Group") {
                log.info("PUT Group " + c.id + ": " + c.children.map(cc => cc.id).join(","));
            } else {
                log.info("PUT " + c.id);
            }
        })
        log.info("PUT end-----");
    }

    /**
     * パスオブジェクトが属するレールオブジェクトを取得する。
     * @param {Path} path
     * @return {Rail}
     */
    getRail(path) {
        return this.rails.find( rail => rail.getName() === path.name);
    }

    /**
     * 与えられた位置のジョイントを取得する。
     * @param point
     * @returns {Joint}
     */
    getJoint(point) {
        let hitResult = this._hitTest(point);
        if (!hitResult) {
            return null;
        }
        // console.log(hitResult);
        // project.selectedItems.forEach(item => item.selected = false);
        let allJoints = [].concat.apply([], this.rails.map( r => r.joints));
        // console.log("joint?: " + hitResult.item.id)
        // console.log(allJoints.map( j => j.path.id ).join(","));
        // for (let i=0 ; i < allJoints.length ; i++) {
        //     console.log(allJoints[i].path.position)
        // }
        return allJoints.find( joint => joint.containsPath(hitResult.item));
    }

    _hitTest(point) {
        let hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            // tolerance: 5
        };
        let hitResult = project.hitTest(point, hitOptions);
        if (hitResult) {
            // console.log(point);
            // console.log(hitResult);
            // console.log(hitResult.point);
        }
        return hitResult;
    }

    _getNextId() {
        return this.nextId++;
    }
}

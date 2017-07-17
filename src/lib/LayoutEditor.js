/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import logger from "../logging";

let log = logger("LayoutEditor");

// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};


export class LayoutEditor {

    static JOINT_TOLERANCE = 2;

    constructor() {
        // 設置したレールのリスト
        this.rails = [];
        // 選択中のレール
        this.paletteRail = null;

        this.nextId = 1;
    }


    /**
     * 設置するレールを選択する。
     * @param rail
     */
    selectRail(rail) {
        // 接続可能なジョイントに近づくまで透明化する
        this.paletteRail = rail;
        this.paletteRail.setOpacity(0);
    }

    /**
     * レール設置時に、逆側のジョイントが他の未接続のジョイントと十分に近ければ接続する。
     */
    connectOtherJoints() {
        let openFromJoints = this.paletteRail.joints.filter(j => j.getState() === Joint.State.OPEN);
        let openToJoints = this.rails.flatMap( r => r.joints ).filter(j => j.getState() === Joint.State.OPEN);

        openFromJoints.forEach( fj => {
            openToJoints.forEach( tj => {
                let distance = fj.getPosition().getDistance(tj.getPosition());
                log.info("Distance:", distance);
                if (distance < LayoutEditor.JOINT_TOLERANCE) {
                    log.info("Connected other joint");
                    fj.connect(tj);
                }
            })
        })
    }


    /**
     * レール設置時に他のレールに重なっていないか確認する。
     * TODO: 判別条件がイケてないので修正
     * @returns {boolean}
     */
    canPutSelectedRail() {
        let intersections = [];
        this.paletteRail.railParts.forEach(part => {
            this.rails.forEach( rail => {
                rail.railParts.forEach( otherPart => {
                    intersections = intersections.concat(part.path.getIntersections(otherPart.path));
                })
            })
        });
        log.info("Intersections:", intersections.length, intersections.map( i => i.point));
        // intersections.forEach( i => {
        //     new Path.Circle({
        //         center: i.point,
        //         radius: 5,
        //         fillColor: '#009dec'});
        //     log.info(i.isTouching(), i.isCrossing(), i.hasOverlap());
        // });
        return intersections.length <= this.paletteRail.joints.length * 3;
    }

    /**
     * 選択されたレールを設置する。
     * @param {Joint} toJoint
     */
    putSelectedRail(toJoint) {
        if (!this.canPutSelectedRail()) {
            log.warn("The rail cannot be put because of intersection.");
            return;
        }
        this.canPutSelectedRail();
        this.paletteRail.connect(this.paletteRail.getCurrentJoint(), toJoint);
        this.paletteRail.setOpacity(1.0);
        this.connectOtherJoints();
        this.putRail(this.paletteRail);
        this.selectRail(this.paletteRail.clone());
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
     * マウス左クリックされた時のハンドラ。以下の処理を行う。
     *   - 未接続のジョイント上ならば、現在選択中のレールと接続する。
     *   - レールならば、そのレールを選択する。
     *
     * @param {ToolEvent} event
     * @param {Path} path
     */
    handleMouseDownLeft(event) {
        let joint = this.getJoint(event.point);
        if (joint && joint.getState() !== Joint.State.CONNECTED) {
            this.putSelectedRail(joint);
            return;
        }

        // 何もなければ何もしない
        if (!event.item) {
            return;
        }

        let rail = this.getRail(event.item);
        if (rail) {
            event.item.selected = !event.item.selected; // 選択を反転
            return;
        }
    }

    /**
     * マウス右クリックされた時のハンドラ。以下の処理を行う。
     *   - 未接続のジョイント上ならば、現在選択中のレールの向きを変える。
     *
     * @param {MouseEvent} event
     * @param {Path} path
     */
    handleMouseDownRight(event) {
        let joint = this.getJoint(event.point);
        if (joint && joint.getState() !== Joint.State.CONNECTED) {
            this.paletteRail.getNextJoint();
            joint.disconnect();
            this.showRailToPut(joint);
        }
    }

    /**
     * キーボード押下された時のハンドラ。以下の処理を行う。
     *   - DEL: 選択中のレールを削除する。
     *
     * @param {KeyEvent} event
     */
    handleKeyEvent(event) {
        switch (event.key) {
            case "backspace":
                log.info(project.selectedItems);
                let selectedRails = project.selectedItems
                    .map(item => this.getRail(item))
                    .filter(Boolean);
                selectedRails.forEach(r => this.removeRail(r));
                break;
        }
    }


    /**
     * 設置されるレールのガイドを半透明で表示する。
     * @param toJoint
     */
    showRailToPut(toJoint) {
        this.paletteRail.setOpacity(0.5);
        this.paletteRail.connect(this.paletteRail.getCurrentJoint(), toJoint, true);
    }

    /**
     * 設置されるレールのガイドを消去する。
     */
    hideRailToPut() {
        this.paletteRail.setOpacity(0);
        this.paletteRail.disconnect();
        this.paletteRail.move(new Point(0,0), this.paletteRail.joints[0]);
    }

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
        });
        log.info("PUT end-----");
    }

    /**
     * レールを削除する。
     * @param {Rail} rail
     */
    removeRail(rail) {
        rail.remove()
        let index = this.rails.indexOf(rail);
        if(index !== -1) {
            this.rails.splice(index, 1);
        }
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

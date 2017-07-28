/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import logger from "../logging";

let log = logger("LayoutEditor", "DEBUG");

// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};


/**
 * 構築されたレイアウトの電気的なシミュレーションを行うクラス。
 */
export class LayoutSimulator {

    constructor() {
        // レイアウト上のレールのリスト
        this.rails = [];
        this.railData = [];

        this.nextId = 0;
    }

    setRails(rails) {
        this.rails = rails;
    }


    /**
     * 与えられたレールから導通している全てのレールを描画する。
     * @param {Rail} rail
     */
    checkConduction(rail) {
        rail.renderConduction();
        rail.joints.forEach( joint => {
            joint.rendered = true;
            if (joint.connectedJoint) {
                this._checkConductionInner(joint.connectedJoint);
            }
        });
        // this._checkConductionInner()
        // rail.renderConduction();
        // rail.joints.forEach( joint => this._checkConductionInner(joint))
    }

    /**
     * @param {Joint} joint
     */
    _checkConductionInner(joint) {
        if (!joint) return;
        joint.rail.renderConduction();
        joint.rendered = true;
        let conductiveJoints = joint.rail.getConductiveJointsToRender(joint);
        if (conductiveJoints) {
            let nextJointsToRender = conductiveJoints
                .filter(condJ => condJ.connectedJoint)
                .map(condJ => condJ.connectedJoint);
            // .filter( nextJ => nextJ.rail.rendered === false);
            nextJointsToRender.forEach(nextJ => this._checkConductionInner(nextJ));
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
     * @param {Point} point
     * @returns {Joint}
     */
    getJoint(point) {
        let hitResult = this._hitTest(point);
        if (!hitResult) {
            return null;
        }
        let allJoints = [].concat.apply([], this.rails.map( r => r.joints));
        return allJoints.find( joint => joint.containsPath(hitResult.item));
    }


    /**
     * レール設置時に他のレールに重なっていないか確認する。
     * TODO: 判別条件がイケてないので修正
     * @param {Rail} rail
     * @returns {boolean}
     */
    _canPutRail(rail) {
        let intersections = [];
        rail.railParts.forEach(part => {
            this.rails.forEach( rail => {
                rail.railParts.forEach( otherPart => {
                    intersections = intersections.concat(part.path.getIntersections(otherPart.path));
                })
            })
        });
        log.info("Intersections:", intersections.length, intersections.map( i => i.point));
        return intersections.length <= rail.joints.length * 3;
    }

    /**
     * レール設置時に、逆側のジョイントが他の未接続のジョイントと十分に近ければ接続する。
     *
     * @param {Rail} rail
     */
    _connectOtherJoints(rail) {
        let openFromJoints = rail.joints.filter(j => j.getState() === Joint.State.OPEN);
        let openToJoints = this.rails.flatMap( r => r.joints ).filter(j => j.getState() === Joint.State.OPEN);

        openFromJoints.forEach( fj => {
            openToJoints.forEach( tj => {
                let distance = fj.getPosition().getDistance(tj.getPosition());
                log.info("Distance:", distance);
                if (distance < LayoutManager.JOINT_TOLERANCE) {
                    log.info("Connected other joint");
                    fj.connect(tj);
                }
            })
        })
    }

    /**
     * レールオブジェクトをレイアウトに登録する。
     * レールには一意のIDが割り当てられる。
     * @param {Rail} rail
     */
    _registerRail(rail) {
        let id = this._getNextId();
        rail.setName(id);
        this.rails.push(rail);

        let serializedRail = serialize(rail);

        log.info("Added: ", serialize(rail));

        this.railData.push(serializedRail);

        log.debug("ActiveLayer.children begin-----");
        project.activeLayer.children.forEach( c => {
            if (c.constructor.name === "Group") {
                log.debug("PUT Group " + c.id + ": " + c.children.map(cc => cc.id).join(","));
            } else {
                log.debug("PUT " + c.id);
            }
        });
        log.debug("ActiveLayer.children end  -----");
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
            // log.debug("Hit Test:");
            // log.debug(point);
            // log.debug(hitResult);
            // log.debug(hitResult.point);
        }
        return hitResult;
    }

    _getNextId() {
        return this.nextId++;
    }
}

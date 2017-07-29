/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FeederSocket, FlowDirection} from "./rails/parts/FeederSocket";
import {RailPart} from "./rails/parts/RailPart";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import logger from "../logging";

let log = logger("LayoutSimulator", "DEBUG");

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

    init(rails, feeders) {
        this.rails = rails;
        this.feeders = feeders;
    }

    resetFlowSimulation() {
        this.rails.forEach(rail => {
            rail.railParts.forEach(part => {
                part.setFlowDirection(FlowDirection.NONE);
            })
        })
    }

    simulateFlow() {
        let feeder = this.feeders[0];
        feeder.railPart.setFlowDirection(feeder.flowDirection);
        let rail = this.getRailFromRailPart(feeder.railPart);
        let startJoint, endJoint;
        [startJoint, endJoint] = rail.getJointsFromRailPart(feeder.railPart);

        switch (feeder.flowDirection) {
            case FlowDirection.START_TO_END:
                this.traceFlowRecursively(startJoint, true);
                this.traceFlowRecursively(endJoint, false);
                break;
            case FlowDirection.END_TO_START:
                this.traceFlowRecursively(startJoint, false);
                this.traceFlowRecursively(endJoint, true);
                break;
        }
    }

    traceFlowRecursively(joint, isReversed) {
        if (!joint.connectedJoint) {
            return;
        }
        let rail = this.getRailFromJoint(joint.connectedJoint);
        let railPart = rail.getConductiveRailPart(joint.connectedJoint);
        if (!railPart) {
            return;
        }
        let startJoint, endJoint;
        [startJoint, endJoint] = rail.getJointsFromRailPart(railPart);

        let flowDirection, nextJoint;
        if (joint.connectedJoint === startJoint) {
            flowDirection = isReversed ? FlowDirection.END_TO_START : FlowDirection.START_TO_END;
            nextJoint = endJoint;
        }
        if (joint.connectedJoint === endJoint) {
            flowDirection = isReversed ? FlowDirection.START_TO_END : FlowDirection.END_TO_START;
            nextJoint = startJoint;
        }

        log.info(flowDirection, nextJoint);
        railPart.setFlowDirection(flowDirection);

        if (nextJoint) {
            this.traceFlowRecursively(nextJoint, isReversed);
        }
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
     *
     * @param {RailPart} railPart
     * @returns {Array<Joint>}
     */
    getJoints(railPart) {
        this.rails.forEach(rail => {
            rail.railParts.forEach(part => {
                let startJoint = rail.joints.find(joint => joint.getPosition().isClose(part.startPoint, 0));
                let endJoint = rail.joints.find(joint => joint.getPosition().isClose(part.endPoint, 0));
                if (startJoint && endJoint) {
                    return [startJoint, endJoint];
                }
            })
        });
        return null;
    }

    getRailFromJoint(joint) {
        let ret = null;
        this.rails.forEach(rail => {
            rail.joints.forEach(j => {
                if (j === joint) {
                    ret = rail;
                }
            });
        })
        return ret;
    }

    getRailFromRailPart(railPart) {
        let ret = null;
        this.rails.forEach(rail => {
            rail.railParts.forEach(p => {
                if (p === railPart) {
                    ret = rail;
                }
            });
        })
        return ret;
        // for (let a of [new Point(1,1), new Point(2,1)]) {
        //     console.log(a);
        // }

        // for (let rail of this.rails) {
        //     console.log(rail);
        //     for (let part of rail.railParts) {
        //         if (part === railPart) {
        //             return rail;
        //         }
        //     }
        // }
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

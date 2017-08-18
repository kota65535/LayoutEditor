/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint, JointState} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FeederSocket} from "./rails/parts/FeederSocket";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import logger from "../logging";

let log = logger("LayoutEditor", "DEBUG");

// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};


/**
 * レールを設置・結合することでレイアウトを構築する手段を提供するクラス。
 * UIがからむ処理はできるだけLayoutEditorで行い、本クラスはUIと疎結合にする方針を取る。
 */
export class LayoutManager {

    // ジョイント間の距離がこの値よりも近い場合は接続している扱いにする
    static JOINT_TO_JOINT_TOLERANCE = 2;

    constructor() {
        // レイアウト上のレールのリスト
        this.rails = [];
        // フィーダーのリスト
        this.feeders = [];
        this.railData = [];

        this._nextRailId = 0;
        this._nextFeederId = 0;
    }

    /**
     * レイアウト上のレールを全て削除する。
     */
    destroyLayout() {
        this.rails.forEach( r => {
            r.remove();
        });
        this.rails = [];
        this.railData = [];
    }

    /**
     * 保存されていたレイアウトをロードする。
     *
     * @param {Array<String>} layoutData シリアライズされたRailオブジェクトのリスト
     */
    loadLayout(layoutData) {
        this.destroyLayout();
        layoutData["rails"].forEach( rail => {
            let railObject = deserialize(rail);
            this._registerRail(railObject);
        })
    }

    /**
     * レイアウトをシリアライズして保存可能な状態にする。
     * @returns {{rails: Array}}
     */
    saveLayout() {
        let layoutData = {
            rails: this.rails.map(r => serialize(r))
        };
        return layoutData;
    }

    /**
     * レールを任意のジョイントと結合して設置する。
     * @param {Rail} rail
     * @param {Joint} fromJoint
     * @param {Point,Joint} to
     * @returns {Boolean} true if succeeds, false otherwise.
     */
    putRail(rail, fromJoint, to) {
        if (!this._canPutRail(rail)) {
            log.warn("The rail cannot be put because of intersection.");
            return false;
        }
        if (to.constructor.name === "Joint") {
            rail.connect(fromJoint, to);
            this._connectOtherJoints(rail);
        } else {
            // 動くか？
            rail.move(to, rail.startPoint);
        }
        rail.setVisible(true);
        rail.setOpacity(1.0);
        this._registerRail(rail);
        return true;
    }


    /**
     * レールを削除する。
     * @param {Rail} rail
     */
    removeRail(rail) {
        rail.remove();
        let index = this.rails.indexOf(rail);
        if(index !== -1) {
            this.rails.splice(index, 1);
            log.info("Removed rail: ", rail);
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
     * @returns {Joint} joint at the point
     */
    getJoint(point) {
        let hitResult = this._hitTest(point);
        if (!hitResult) {
            return null;
        }
        // hitResults[0].item.fillColor = 'red';
        // hitResults[1].item.fillColor = 'blue';


        let allJoints = [].concat.apply([], this.rails.map( r => r.joints));
        return allJoints.find( joint => joint.containsPath(hitResult.item));
    }


    /**
     * パスが属するフィーダーソケットオブジェクトを取得する。
     * @param {Point} point
     * @return {FeederSocket} feederSocket at the point
     */
    getFeederSocket(point) {
        let hitResult = this._hitTest(point);
        if (!hitResult) {
            return null;
        }
        let allFeederSockets = [].concat.apply([], this.rails.map( r => r.feederSockets));
        return allFeederSockets.find( socket => socket.containsPath(hitResult.item));
    }

    /**
     * パスが属するフィーダーオブジェクトを取得する。
     * @param {Path} path
     * @returns {Feeder} Feeder at the point
     */
    getFeeder(path) {
        return this.feeders.find(feeder => feeder.getName() === path.name);
        // let hitResult = this._hitTest(point);
        // if (!hitResult) {
        //     return null;
        // }
        // let allFeeders = [].concat.apply([], this.rails.map( r => r.feeders.map(socket => socket.connectedFeeder)))
        // return allFeeders.find( feeder => feeder.containsPath(hitResult.item));
    }


    /**
     * フィーダーを設置する。
     * @param {FeederSocket} feederSocket where a feeder to be connected
     */
    putFeeder(feederSocket) {
        feederSocket.connect();
        let id = this._getNextFeederId();
        feederSocket.connectedFeeder.setName(id);
        this.feeders.push(feederSocket.connectedFeeder);
    }

    /**
     * フィーダーを削除する。
     * @param {Feeder} feeder to be removed
     */
    removeFeeder(feeder) {
        feeder.feederSocket.disconnect();
        let index = this.feeders.indexOf(feeder);
        if(index !== -1) {
            this.feeders.splice(index, 1);
        }
    }

    /**
     * ジョイントからレールを取得する。
     * @param {Joint} joint
     * @returns {Rail}
     */
    getRailFromJoint(joint) {
        let ret = null;
        this.rails.forEach(rail => {
            rail.joints.forEach(j => {
                if (j === joint) {
                    ret = rail;
                }
            });
        });
        return ret;
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
            this.rails.forEach( otherRail => {
                otherRail.railParts.forEach( otherPart => {
                    intersections = intersections.concat(part.path.getIntersections(otherPart.path, (location) => {
                        let isIntersectionNearJoints = rail.joints.map( j => {
                            log.info("Intersection:" ,location, " Joint:", j.position);
                            log.info("Distance", location.point.getDistance(j.position));
                            return location.point.isClose(j.position, Joint.HEIGHT/2);
                        }).includes(true);

                        return ! isIntersectionNearJoints;
                    }));
                })
            })
        });
        log.info("Intersections:", intersections.length, intersections.map( i => i.point));
        // デバッグ用
        // intersections.forEach( i => {
        //     new paper.Path.Circle({
        //         center: i.point,
        //         radius: 5,
        //         fillColor: '#009dec'});
        //     log.info(i.isTouching(), i.isCrossing(), i.hasOverlap());
        // });
        return intersections.length === 0;
    }

    /**
     * レール設置時に、逆側のジョイントが他の未接続のジョイントと十分に近ければ接続する。
     *
     * @param {Rail} rail
     */
    _connectOtherJoints(rail) {
        let openFromJoints = rail.joints.filter(j => j.jointState === JointState.OPEN);
        let openToJoints = this.rails.flatMap( r => r.joints ).filter(j => j.jointState === JointState.OPEN);

        openFromJoints.forEach( fj => {
            openToJoints.forEach( tj => {
                let distance = fj.position.getDistance(tj.position);
                log.info("Distance:", distance);
                if (distance < LayoutManager.JOINT_TO_JOINT_TOLERANCE) {
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
        let id = this._getNextRailId();
        rail.setName(id);
        this.rails.push(rail);

        let serializedRail = serialize(rail);

        log.info("Added: ", serialize(rail));

        this.railData.push(serializedRail);

        log.debug("ActiveLayer.children begin-----");
        paper.project.activeLayer.children.forEach( c => {
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
        let hitResult = paper.project.hitTest(point, hitOptions);
        if (hitResult) {
            // log.info(hitResult.item.position);
            // log.info(hitResult.item.id);
            // log.debug("Hit Test:");
            // log.debug(point);
            // log.debug(hitResult);
            // log.debug(hitResult.point);
        }
        return hitResult;
    }

    _hitTestAll(point) {
        let hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            // tolerance: 5
        };
        let hitResults = paper.project.hitTestAll(point, hitOptions);
        let hitResultsPathOnly = hitResults.filter(r => r.item instanceof paper.Path);
        return hitResultsPathOnly;
    }

    _getNextRailId() {
        return this._nextRailId++;
    }

    _getNextFeederId() {
        return `feeder-${this._nextFeederId++}`;
    }
}

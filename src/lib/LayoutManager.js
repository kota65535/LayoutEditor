/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
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

    static JOINT_TOLERANCE = 2;

    constructor() {
        // レイアウト上のレールのリスト
        this.rails = [];
        this.feeders = [];
        this.railData = [];

        this.nextId = 0;
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
        layoutData.forEach( rail => {
            let railObject = deserialize(rail);
            this._registerRail(railObject);
        })
    }

    /**
     * レールを任意のジョイントと結合して設置する。
     * @param {Rail} rail
     * @param {Point,Joint} to
     */
    putRail(rail, to) {
        if (!this._canPutRail(rail)) {
            log.warn("The rail cannot be put because of intersection.");
            return;
        }
        if (to.constructor.name === "Joint") {
            rail.connect(rail.getCurrentJoint(), to);
            this._connectOtherJoints(rail);
        } else {
            // 動くか？
            rail.move(to, rail.startPoint);
        }
        rail.setOpacity(1.0);
        this._registerRail(rail);
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
        let allFeederSockets = [].concat.apply([], this.rails.map( r => r.feeders));
        return allFeederSockets.find( socket => socket.containsPath(hitResult.item));
    }

    /**
     * フィーダーを設置する。
     */
    putFeeder(feederSocket) {
        feederSocket.connect();
        this.feeders.push(feederSocket);
    }

    /**
     * レールを削除する。
     * @param {Rail} rail
     */
    removeFeeder(feeder) {
        feeder.remove();
        rail.remove();
        let index = this.rails.indexOf(rail);
        if(index !== -1) {
            this.rails.splice(index, 1);
        }
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

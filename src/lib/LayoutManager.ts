/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint, JointState} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FeederSocket, FlowDirection} from "./rails/parts/FeederSocket";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import {hitTest, hitTestAll} from "./utils";
import logger from "../logging";
import {Path, Point} from "paper";
import {Feeder} from "./rails/parts/Feeder";

let log = logger("LayoutManager");

class MyArray<T> extends Array<T> {
    // [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
    flatMap(lambda) {
        return Array.prototype.concat.apply([], this.map(lambda));
    };
}


export interface LayoutData {
    nextRailId: number,
    nextFeederId: number,
    rails: RailData[],
    feeders: FeederData[],
}

export interface RailData {
    name: string,
    data: string
}

export interface FeederData {
    name: string,
    railPartName: string
}


/**
 * レールを設置・結合することでレイアウトを構築する手段を提供するクラス。
 * UIがからむ処理はできるだけLayoutEditorで行い、本クラスはUIと疎結合にする方針を取る。
 */
export class LayoutManager {

    // ジョイント間の距離がこの値よりも近い場合は接続している扱いにする
    static JOINT_TO_JOINT_TOLERANCE = 2;

    rails: MyArray<Rail>;
    feeders: Feeder[];

    _nextRailId: number;
    _nextFeederId: number;


    constructor() {
        // レイアウト上のレールのリスト
        this.rails = new MyArray();
        // フィーダーのリスト
        this.feeders = [];

        this._nextRailId = 0;
        this._nextFeederId = 0;
    }

    //====================
    // レイアウト管理系メソッド
    //====================

    /**
     * レイアウトを削除する。
     */
    destroyLayout() {
        this.rails.forEach( r => {
            r.remove();
        });
        this.rails = new MyArray();
    }

    /**
     * レイアウトをロードする。
     *
     * @param {Array<String>} layoutData シリアライズされたRailオブジェクトのリスト
     */
    loadLayout(layoutData: LayoutData) {
        this.destroyLayout();
        if (!layoutData) return;

        this._nextRailId = layoutData.nextRailId;
        this._nextFeederId = layoutData.nextFeederId;

        if (layoutData.rails) {
            layoutData.rails.forEach( entry => {
                // Railオブジェクトにデシリアライズ
                let railObject = <Rail>deserialize(entry.data);
                // IDを復元
                // railObject.name = entry["id"];
                // railObject.railParts.forEach((part, i) => part.name = `${railObject.name}-${i}`)
                // 近いジョイント同士は接続する
                this._connectNearJoints(railObject);
                this.rails.push(railObject);
            })
        }

        if (layoutData.feeders) {
            layoutData.feeders.forEach( entry => {
                let railPart = this.rails.flatMap(rail => rail.railParts)
                    .find(part => part.name === entry.railPartName);
                if (railPart) {
                    let feederSocket = new FeederSocket(railPart, FlowDirection.NONE);
                    feederSocket.connect(false);
                    feederSocket.connectedFeeder.setName(entry.name);
                    this.feeders.push(feederSocket.connectedFeeder);
                }
            })

        }
    }

    /**
     * 現在のレイアウトデータをシリアライズしたオブジェクトを返す。
     * @returns {LayoutData}
     */
    saveLayout(): LayoutData {
        return {
            nextRailId: this._nextRailId,
            nextFeederId: this._nextFeederId,
            rails: this.rails.map(rail => {
                return {
                    name: rail.getName(),
                    data: serialize(rail)
                }
            }),
            feeders: this.feeders.map(feeder => {
                return {
                    name: feeder.getName(),
                    railPartName: feeder.railPart.name
                }
            })
        };
    }

    //====================
    // レール設置系メソッド
    //====================

    /**
     * レールを任意のジョイントと結合して設置する。
     * @param {Rail} rail
     * @param {Joint} fromJoint
     * @param {Joint} to
     * @returns {Boolean} true if succeeds, false otherwise.
     */
    putRail(rail: Rail, fromJoint: Joint, to: Joint|Point) {
        if (!this._canPutRail(rail)) {
            log.warn("The rail cannot be put because of intersection.");
            return false;
        }
        if (to instanceof Joint) {
            rail.connect(fromJoint, to);
            this._connectNearJoints(rail);
        } else {
            // 動くか？
            rail.move(to, rail.startPoint);
        }
        rail.setOpacity(1.0);
        this._registerRail(rail);
        return true;
    }

    /**
     * レールを削除する。
     * @param {Rail} rail
     */
    removeRail(rail: Rail) {
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
     * 指定の位置にあるジョイントを取得する。
     * ジョイント同士が重なっている場合は、最も近いものを返す。
     * @param {Point} point
     * @returns {Joint} joint at the point
     */
    getJoint(point: Point): Joint {
        let hitResults = hitTestAll(point);
        if (!hitResults) {
            // 何のパスにもヒットしなかった場合
            return null;
        }

        // レイアウト上の全てのジョイントを取得
        let allJoints = [].concat.apply([], this.rails.map( r => r.joints));
        // ヒットしたパスを含むジョイントを選択
        let matchedJoints = allJoints.filter( joint =>
            hitResults.map(result => joint.containsPath(result.item)).includes(true)
        );
        log.info(`${matchedJoints.length} Joints found.`)

        // 最も近い位置にあるジョイントを選択
        let joint = matchedJoints.sort( (a, b) => a.position.getDistance(point) - b.position.getDistance(point))[0];
        return joint;
    }

    // /**
    //  * ジョイントからレールを取得する。
    //  * @param {Joint} joint
    //  * @returns {Rail}
    //  */
    // getRailFromJoint(joint: Joint): Rail {
    //     let ret = null;
    //     this.rails.forEach(rail => {
    //         rail.joints.forEach(j => {
    //             if (j === joint) {
    //                 ret = rail;
    //             }
    //         });
    //     });
    //     return ret;
    // }


    //====================
    // フィーダー設置系メソッド
    //====================

    /**
     * 指定の位置にあるフィーダーソケットオブジェクトを取得する。
     * @param {Point} point
     * @return {FeederSocket} feederSocket at the point
     */
    getFeederSocket(point: Point): FeederSocket {
        let hitResult = hitTest(point);
        if (!hitResult) {
            // 何のパスにもヒットしなかった場合
            return null;
        }
        // レイアウト上の全てのフィーダーソケットを取得
        let allFeederSockets = [].concat.apply([], this.rails.map( r => r.feederSockets));
        // ヒットしたパスを含むフィーダーソケットを選択
        return allFeederSockets.find( socket => socket.containsPath(hitResult.item));
    }

    /**
     * 指定の位置にあるフィーダーオブジェクトを取得する。
     * @param {Path} path
     * @returns {Feeder} Feeder at the point
     */
    getFeeder(path: Path): Feeder {
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
    putFeeder(feederSocket: FeederSocket) {
        feederSocket.connect();
        let id = this._getNextFeederId();
        feederSocket.connectedFeeder.setName(id);
        this.feeders.push(feederSocket.connectedFeeder);
    }

    /**
     * フィーダーを削除する。
     * @param {Feeder} feeder to be removed
     */
    removeFeeder(feeder: Feeder) {
        feeder.feederSocket.disconnect();
        let index = this.feeders.indexOf(feeder);
        if(index !== -1) {
            this.feeders.splice(index, 1);
        }
    }

    /**
     * レール設置時に他のレールに重なっていないか確認する。
     * TODO: 判別条件がイケてないので修正
     * @param {Rail} rail
     * @returns {boolean}
     */
    private _canPutRail(rail) {
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
     * @param {Rail} rail
     */
    private _connectNearJoints(rail: Rail) {
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
    private _registerRail(rail) {
        let id = this._getNextRailId();
        rail.setName(id);
        this.rails.push(rail);

        log.info("Added: ", serialize(rail));

        // log.debug("ActiveLayer.children begin-----");
        // paper.project.activeLayer.children.forEach( c => {
        //     if (c.constructor.name === "Group") {
        //         log.debug("PUT Group " + c.id + ": " + c.children.map(cc => cc.id).join(","));
        //     } else {
        //         log.debug("PUT " + c.id);
        //     }
        // });
        // log.debug("ActiveLayer.children end  -----");
    }

    /**
     * レールの一意のIDを生成する。
     * @returns {string}
     * @private
     */
    _getNextRailId() {
        return `rail-${this._nextRailId++}`;
    }

    _getNextFeederId() {
        return `feeder-${this._nextFeederId++}`;
    }
}

/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint, JointState} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FeederSocket, FlowDirection} from "./rails/parts/FeederSocket";
import { cloneRail, serialize, deserialize } from "./RailUtil";
import {hitTest, hitTestAll} from "./utils";
import logger from "../logging";
import {Group, Path, Point} from "paper";
import {RailPart} from "./rails/parts/RailPart";
import {GapSocket} from "./rails/parts/GapSocket";

let log = logger("LayoutManager");

class MyArray<T> extends Array<T> {
    // [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
    flatMap(lambda) {
        return Array.prototype.concat.apply([], this.map(lambda));
    };
    remove() {
        let what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    }
}


export interface LayoutData {
    nextRailId: number,
    rails: RailData[],
    feeders: FeederData[],
    gaps: GapData[]
}

export interface RailData {
    name: string,
    data: string
}

export interface FeederData {
    name: string,
    direction: FlowDirection
}

export interface GapData {
    name: string
}


/**
 * レールを設置・結合することでレイアウトを構築する手段を提供するクラス。
 * UIがからむ処理はできるだけLayoutEditorで行い、本クラスはUIと疎結合にする方針を取る。
 */
export class LayoutManager {

    // ジョイント間の距離がこの値よりも近い場合は接続している扱いにする
    static JOINT_TO_JOINT_TOLERANCE = 2;

    rails: MyArray<Rail>;           // レイアウトを構成するレール
    feederSockets: FeederSocket[];  // フィーダーがささっているフィーダーソケット
    gapSockets: GapSocket[];        // ギャップを

    _nextRailId: number;


    get allJoints(): Joint[] {
        return [].concat.apply([], this.rails.map( r => r.joints));
    }
    get allFeederSockets(): FeederSocket[] {
        return [].concat.apply([], this.rails.map( r => r.feederSockets));
    }
    get allRailParts(): RailPart[] {
        return [].concat.apply([], this.rails.map( r => r.railParts));
    }
    get allGapSockets(): GapSocket[] {
        return [].concat.apply([], this.rails.map( r => r.gapSockets));
    }

    constructor() {
        this.rails = new MyArray();
        this.feederSockets = [];
        this.gapSockets = [];
        this._nextRailId = 0;
    }

    //====================
    // レイアウト管理系メソッド
    //====================

    /**
     * レイアウトを削除する。
     */
    destroyLayout() {
        this.rails.forEach(r =>  r.remove());
        this.rails = new MyArray();
        this.feederSockets.forEach(f => f.remove());
        this.feederSockets = [];
        this.gapSockets.forEach(g => g.remove());
        this.gapSockets = [];
    }

    /**
     * レイアウトをロードする。
     *
     * @param {Array<String>} layoutData シリアライズされたRailオブジェクトのリスト
     */
    loadLayout(layoutData: LayoutData) {
        this.destroyLayout();
        if (!layoutData) return;

        this.showLayoutInfo(layoutData);

        this._nextRailId = layoutData.nextRailId;

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
                let feederSocket = this.allFeederSockets.find(fs => fs.name === entry.name);
                feederSocket.enabled = true;
                feederSocket.flowDirection = entry.direction;
                feederSocket.connect();
                this.feederSockets.push(feederSocket);
            })
        }

        if (layoutData.gaps) {
            layoutData.gaps.forEach( entry => {
                let gapSocket = this.allGapSockets.find(fs => fs.name === entry.name);
                gapSocket.enabled = true;
                gapSocket.connect();
                this.gapSockets.push(gapSocket);
            })
        }
    }

    /**
     * 現在のレイアウトデータをシリアライズしたオブジェクトを返す。
     * @returns {LayoutData}
     */
    saveLayout(): LayoutData {
        let layoutData = {
            nextRailId: this._nextRailId,
            rails: this.rails.map(rail => {
                return {
                    name: rail.name,
                    data: serialize(rail)
                }
            }),
            feeders: this.feederSockets.map(feeder => {
                return {
                    name: feeder.name,
                    direction: feeder.flowDirection
                }
            }),
            gaps: this.gapSockets.map(gap => {
                return {
                    name: gap.name
                }
            })
        };
        this.showLayoutInfo(layoutData);

        return layoutData;
    }

    showLayoutInfo(layoutData: LayoutData) {
        log.info("showLayoutInfo START--------------------")
        layoutData.rails.forEach(rail => {
            log.info(`${rail.name}: ${rail.data}`)
        });
        layoutData.feeders.forEach(feeder => {
            log.info(`${feeder.name}: direction: ${feeder.direction}`)
        });
        layoutData.gaps.forEach(gap => {
            log.info(`${gap.name}: `)
        });
        log.info("showLayoutInfo END--------------------")
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
        return this.rails.find( rail => rail.name === path.name);
    }

    /**
     * パスオブジェクトが属するレールオブジェクトを取得する。
     * @param {Point} point
     * @return {Rail}
     */
    getRailPart(point: Point) {
        let hitResult = hitTest(point);
        if (!hitResult) {
            // 何のパスにもヒットしなかった場合
            return null;
        }
        // レイアウト上の全てのレールパーツを取得
        return this.allRailParts.find( part => part.containsPath(hitResult.item));
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

        // ヒットしたパスを含むジョイントを選択
        let matchedJoints = this.allJoints.filter( joint =>
            hitResults.map(result => joint.containsPath(result.item)).includes(true)
        );
        log.debug(`${matchedJoints.length} Joints found.`)

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
     * フィーダーが挿さっている場合はこれも検出の対象になる。
     * @param {Point} point
     * @return {FeederSocket} feederSocket at the point
     */
    getFeederSocket(point: Point): FeederSocket {
        let hitResults = hitTestAll(point);
        if (!hitResults) {
            return null;
        }
        let matchedFeederSockets = this.allFeederSockets.filter( fs =>
            hitResults.map(result => fs.containsPath(result.item)).includes(true)
        );
        log.debug(`${matchedFeederSockets.length} FeederSockets found.`)
        // 最も近い位置にあるフィーダーソケットを選択
        let feederSocket = matchedFeederSockets.sort( (a, b) => a.position.getDistance(point) - b.position.getDistance(point))[0];
        return feederSocket;
    }

    /**
     * フィーダーを設置する。
     * @param {FeederSocket} feederSocket
     */
    putFeeder(feederSocket: FeederSocket) {
        feederSocket.connect();
        // feederSocket.name = this._getNextFeederSocketId();
        this.feederSockets.push(feederSocket);
    }

    /**
     * フィーダーを削除する。
     * @param {FeederSocket} feederSocket
     */
    removeFeeder(feederSocket: FeederSocket) {
        let index = this.feederSockets.indexOf(feederSocket);
        if(index !== -1) {
            this.feederSockets.splice(index, 1);
        }
        feederSocket.disconnect();
    }

    //====================
    // ギャップジョイナー設置系メソッド
    //====================

    /**
     * 指定の位置にあるフィーダーソケットオブジェクトを取得する。
     * フィーダーが挿さっている場合はこれも検出の対象になる。
     * @param {Point} point
     * @return {FeederSocket} feederSocket at the point
     */
    getGapSocket(point: Point): GapSocket {
        let hitResults = hitTestAll(point);
        if (!hitResults) {
            return null;
        }
        let matchedGapSockets = this.allGapSockets.filter( fs =>
            hitResults.map(result => fs.containsPath(result.item)).includes(true)
        );
        log.debug(`${matchedGapSockets.length} GapSockets found.`);
        matchedGapSockets.forEach(gs => gs.showInfo());
        // 最も近い位置にあるギャップソケットを選択
        let gapSocket = matchedGapSockets.sort( (a, b) => a.position.getDistance(point) - b.position.getDistance(point))[0];
        return gapSocket;
    }

    /**
     * ギャップを設置する。
     * ジョイントが接続済みの場合、対向ジョイントのギャップも設置する。
     * @param {GapSocket} gapSocket
     */
    putGap(gapSocket: GapSocket) {
        gapSocket.connect();
        this.gapSockets.push(gapSocket);
        if (gapSocket.joint.isConnected()) {
            let opponentGap = gapSocket.joint.connectedJoint.gapSocket;
            opponentGap.connect();
            this.gapSockets.push(opponentGap);
        }
    }

    /**
     * ギャップを削除する。
     * @param {GapSocket} gapSocket
     */
    removeGap(gapSocket: GapSocket) {
        let index = this.gapSockets.indexOf(gapSocket);
        if(index !== -1) {
            this.gapSockets.splice(index, 1);
        }
        gapSocket.disconnect();
        if (gapSocket.joint.isConnected()) {
            gapSocket.joint.connectedJoint.gapSocket.disconnect();
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
                            // log.info("Intersection:" ,location, " Joint:", j.position);
                            // log.info("Distance", location.point.getDistance(j.position));
                            return location.point.isClose(j.position, Joint.HEIGHT/2);
                        }).includes(true);

                        return ! isIntersectionNearJoints;
                    }));
                })
            })
        });
        // log.info("Intersections:", intersections.length, intersections.map( i => i.point));
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
                log.debug("Distance:", distance);
                if (distance < LayoutManager.JOINT_TO_JOINT_TOLERANCE) {
                    log.debug("Connected other joint");
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
        rail.name = this._getNextRailId();
        this.rails.push(rail);
        log.info("Added: ", serialize(rail));
    }

    /**
     * レールの一意のIDを生成する。
     * @returns {string}
     * @private
     */
    _getNextRailId() {
        return `r${this._nextRailId++}`;
    }


    getRailFromRailPartPath(path: Path) {
        let part = this.allRailParts.find(part => part.containsPath(path));
        return part ? part.rail : null;
    }

    getFeederSocketFromPath(path: Path) {
        return this.allFeederSockets.find(fs => fs.containsPath(path));
    }

    getGapSocketFromPath(path: Path) {
        return this.allGapSockets.find(gs => gs.containsPath(path));
    }
}

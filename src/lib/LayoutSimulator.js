/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FlowDirection} from "./rails/parts/FeederSocket";
import {RailPart} from "./rails/parts/RailPart";
import logger from "../logging";

let log = logger("LayoutSimulator", "DEBUG");


/**
 * 構築されたレイアウトの電気的なシミュレーションを行うクラス。
 */
export class LayoutSimulator {

    constructor() {
        // レイアウト上のレールのリスト
        this.rails = [];
        this.railData = [];

        this._nextRailId = 0;
    }

    init(rails, feeders) {
        this.rails = rails;
        this.feeders = feeders;
    }

    resetFlowSimulation() {
        this.rails.forEach(rail => {
            rail.railParts.forEach(part => {
                part.setFlowDirection(FlowDirection.NONE);
                part.setSimulated(false);
            })
        })
    }

    simulateFlow() {
        let feeder = this.feeders[0].feederSocket;
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

    /**
     * 指定されてたジョイントから再帰的にレールを辿り、各レールパーツの導電状態を設定する。
     * @param {Joint} joint
     * @param {Boolean} isReversed
     */
    traceFlowRecursively(joint, isReversed) {
        // ジョイントの先が繋がっていなければ終了
        if (!joint.connectedJoint) {
            return;
        }
        // ジョイントの先のレールを取得
        let rail = this.getRailFromJoint(joint.connectedJoint);
        // 導電状態かつこのジョイントに繋がっているレールパーツを取得する。
        // 存在しないか、すでに処理済みであれば終了
        let railPart = rail.getConductiveRailPartOfJoint(joint.connectedJoint);
        if (!railPart || railPart.isSimulated()) {
            return;
        }
        // レールパーツ両端のジョイントを取得して電流方向を調べる。同時に次のジョイントも
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

        // 電流方向をセットし、処理済みであることをマークする
        railPart.setFlowDirection(flowDirection);
        railPart.setSimulated(true);

        // 導電状態を更新したこのレールパーツが上になるよう描画する
        rail.railParts.forEach(otherPart => {
            if (otherPart !== railPart) {
                railPart.path.moveAbove(otherPart.path);
            }
        });

        // 次のジョイントに対して同じことを繰り返す
        if (nextJoint) {
            this.traceFlowRecursively(nextJoint, isReversed);
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
     * レールパーツからレールを取得する。
     * @param {RailPart} railPart
     * @returns {Rail}
     */
    getRailFromRailPart(railPart) {
        let ret = null;
        this.rails.forEach(rail => {
            rail.railParts.forEach(p => {
                if (p === railPart) {
                    ret = rail;
                }
            });
        });
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

}

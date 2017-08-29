/**
 * Created by tozawa on 2017/07/12.
 */
import {Joint} from "./rails/parts/Joint";
import {Rail} from "./rails/Rail";
import {FeederSocket, FlowDirection} from "./rails/parts/FeederSocket";
import {RailPart} from "./rails/parts/RailPart";
import logger from "../logging";
import {GapSocket} from "./rails/parts/GapSocket";

let log = logger("LayoutSimulator");


/**
 * 構築されたレイアウトの電気的なシミュレーションを行うクラス。
 */
export class LayoutSimulator {

    rails: Rail[]                   // レイアウトを構成するレール
    feederSockets: FeederSocket[];  // フィーダーがささっているフィーダーソケット
    gapSockets: GapSocket[];        // ギャップを

    temporaryFlowDirections: Map<string, Map<string, FlowDirection>>;

    constructor() {
    }

    init(rails: Rail[], feederSockets: FeederSocket[], gapSockets: GapSocket[]) {
        this.rails = rails;
        this.feederSockets = feederSockets;
        this.gapSockets = gapSockets;
        this.temporaryFlowDirections = new Map<string, Map<string, FlowDirection>>();
        this.rails.forEach(r => r.railParts.forEach(part => {
            this.temporaryFlowDirections.set(part.name, new Map<string, FlowDirection>());
        }));
    }

    /**
     * 全てのレールの電流状態を初期状態に戻す。
     */
    resetFlowSimulation() {
        this.rails.forEach(rail => {
            rail.railParts.forEach(part => {
                part.flowDirection = FlowDirection.NONE;
            })
        })
    }


    simulateAllFeeders() {
        this.feederSockets.forEach(fs => this.simulateFlow(fs));
        this.validateTemporaryFlows();
    }

    validateTemporaryFlows() {
        this.rails.forEach(r => r.railParts.forEach(part => {
            // let dirs = this.temporaryFlowDirections[part.name].values();
            let dirs = [...this.temporaryFlowDirections.get(part.name).values()];
            if (dirs.length === 0) {
                part.flowDirection = FlowDirection.NONE;
                return;
            }

            if (dirs.every( v => v === dirs[0])) {
                part.flowDirection = dirs[0];
            } else {
                part.flowDirection = FlowDirection.ILLEGAL;
            }
        }))

    }


    simulateFlow(feeder: FeederSocket) {
        // フィーダーの刺さっているレールパーツの電流方向を設定
        // feeder.railPart.flowDirection = feeder.flowDirection;
        this._setTemporaryFlowDirection(feeder.railPart, feeder, feeder.flowDirection);
        // this.temporaryFlowDirections[feeder.railPart.name][feeder.name] = feeder.flowDirection;
        // レールパーツの両端のジョイントを取得する
        let rail = feeder.railPart.rail;
        let startJoint, endJoint;
        [startJoint, endJoint] = rail.getJointsFromRailPart(feeder.railPart);

        switch (feeder.flowDirection) {
            case FlowDirection.START_TO_END:
                this.traceTemporaryFlowRecursively(feeder, startJoint, true);
                this.traceTemporaryFlowRecursively(feeder, endJoint, false);
                break;
            case FlowDirection.END_TO_START:
                this.traceTemporaryFlowRecursively(feeder, startJoint, false);
                this.traceTemporaryFlowRecursively(feeder, endJoint, true);
                break;
        }
    }

    /**
     * 指定されてたジョイントから再帰的にレールを辿り、各レールパーツの導電状態を設定する。
     * @param {Joint} joint
     * @param {Boolean} isReversed
     */
    traceTemporaryFlowRecursively(feederSocket: FeederSocket, joint: Joint, isReversed: boolean) {
        // ジョイントの先が繋がっていなければ終了
        if (! joint.isConnected()) {
            return;
        }
        // ジョイントの先のレールを取得
        let rail = joint.connectedJoint.rail;
        // 導電可能かつ、このジョイントに繋がっているレールパーツを取得する。
        // 存在しないか、すでに処理済みであれば終了
        let conductiveRailPart = rail.getConductiveRailPartOfJoint(joint.connectedJoint);
        if (!conductiveRailPart || this._getTemporaryFlowDirection(conductiveRailPart, feederSocket)) {
            return;
        }
        // レールパーツ両端のジョイントを取得して電流方向を調べる。同時に次のジョイントも
        let startJoint, endJoint;
        [startJoint, endJoint] = conductiveRailPart.joints;

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
        this._setTemporaryFlowDirection(conductiveRailPart, feederSocket, flowDirection);
        // conductiveRailPart.flowDirection = flowDirection;
        // conductiveRailPart.simulated = true;

        // 導電状態を更新したこのレールパーツが上になるよう描画する
        rail.railParts.forEach(otherPart => {
            if (otherPart !== conductiveRailPart) {
                conductiveRailPart.path.moveAbove(otherPart.path);
            }
        });

        // 次のジョイントに対して同じことを繰り返す
        if (nextJoint) {
            this.traceTemporaryFlowRecursively(feederSocket, nextJoint, isReversed);
        }
    }


    _getTemporaryFlowDirection(railPart: RailPart, feederSocket: FeederSocket): FlowDirection {
        log.info(`FlowDirection @${feederSocket.name}@${railPart.name} = ${this.temporaryFlowDirections.get(railPart.name).get(feederSocket.name)}}`);
        return this.temporaryFlowDirections.get(railPart.name).get(feederSocket.name);
    }

    _setTemporaryFlowDirection(railPart: RailPart, feederSocket: FeederSocket, flowDirection: FlowDirection) {
        log.info(`FlowDirection @${feederSocket.name}@${railPart.name} <= ${flowDirection}`);
        this.temporaryFlowDirections.get(railPart.name).set(feederSocket.name, flowDirection);
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
        // for (let a of [new paper.Point(1,1), new paper.Point(2,1)]) {
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

/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import { Joint,Direction } from "./Joint";

/**
 * レールの基底クラス。レールはレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class Rail {

    /**
     * レールの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでレールパーツの追加と移動・回転を行う。
     *
     * @param {number} angle
     */
    constructor(angle) {
        this.RAIL_SPACE = 38;

        this.railParts = [];
        this.joints = [];
        this.angle = angle;
    }

    /**
     * レールを構成するレールパーツを追加し、さらにその両端にジョイントを追加する。
     * Constructorからのみ呼ばれることを想定。
     * @param {RailPart} railPart
     * @private
     */
    _addRailPart(railPart) {
        this.railParts.push(railPart);
        let startJoint = new Joint(railPart.startPoint, railPart.startAngle, Direction.REVERSE_TO_ANGLE);
        let endJoint = new Joint(railPart.endPoint, railPart.endAngle, Direction.SAME_TO_ANGLE);
        this.joints.push(startJoint, endJoint);
    }

    /**
     * 任意のジョイントを基準に、絶対座標で移動する。
     * @param {Point} point
     * @param {Joint} joint
     */
    move(point, joint) {
        let difference = point.subtract(joint.getPosition());
        this.moveRelatively(difference);
    }

    /**
     * 現在からの相対座標で移動する。
     * @param {Point} difference
     */
    moveRelatively(difference) {
        this.railParts.forEach( part => {
            part.moveRelatively(difference);
        });
        this.joints.forEach( joint => {
            joint.moveRelatively(difference);
        })
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle
     * @param {Joint} joint
     */
    rotate(angle, joint) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, joint);
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} angle
     * @param {Joint} joint
     */
    rotateRelatively(angle, joint) {
        this.railParts.forEach( part => {
            part.rotateRelatively(angle, joint.getPosition())
        });
        this.joints.forEach( j => {
            j.rotateRelatively(angle, joint.getPosition());
        })
        this.angle += angle;
    }

    /**
     * 任意のジョイントに対して接続する。
     * @param {Joint} fromJoint こちら側のジョイント
     * @param {Joint} toJoint 接続先のジョイント
     */
    connect(fromJoint, toJoint) {
        // console.log(sprintf("Connecting: (%.3f, %.3f) | %.3f) -> (%.3f, %.3f) | %.3f)",
        //     fromJoint.getPosition().x, fromJoint.getPosition().y, fromJoint.getDirection(),
        //     toJoint.getPosition().x, toJoint.getPosition().y, toJoint.getDirection()));
        // console.log(sprintf("Move to (%.3f, %.3f) | %.3f) -> (%.3f, %.3f) | %.3f)",
        //     fromJoint.getPosition().x, fromJoint.getPosition().y, fromJoint.getDirection(),
        //         toJoint.getPosition().x, toJoint.getPosition().y, toJoint.getDirection()));
        this.move(toJoint.getPosition(), fromJoint);
        let angle = toJoint.getDirection() - fromJoint.getDirection() + 180;
        // console.log(sprintf("Rotate %.3f around (%.3f, %.3f)",
        //     angle, toJoint.getPosition().x, toJoint.getPosition().y));
        this.rotateRelatively(angle, toJoint);
    }

    /**
     * 始点・始点角度、終点・終点角度を表示する。デバッグ用。
     */
    showInfo() {
    }

    /**
     * ジョイント情報を表示する。デバッグ用。
     */
    showJoints() {
        this.joints.forEach( joint => {
            joint.showInfo();
        });
    }
}

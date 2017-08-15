/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import { Joint } from "./parts/Joint.js";
import { FeederSocket } from "./parts/FeederSocket";
import logger from "../../logging";

let log = logger("Rail");

/**
 * レールの基底クラス。レールはレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class Rail {

    // レール間の間隔
    static SPACE = 38;

    // ジョイントの位置とレールパーツの両端の位置の間で許される誤差
    static JOINT_TO_RAIL_PART_TOLERANCE = 0.1;


    /**
     * レールの初期化。基底クラスでは特に重要な処理は行わない。
     * 子クラスではここでレールパーツの追加と移動・回転を行う。
     *
     * @param {Point} startPoint
     * @param {number} angle
     */
    constructor(startPoint, angle) {
        this.railParts = [];
        this.joints = [];
        this.feederSockets = [];
        this.startPoint = startPoint;
        this.angle = angle;

        this.pathGroup = new paper.Group();
        this.jointOrder = [];
        this.currentJointIndex = 0;
        // どのレールパーツに電気が流れるかを表す導電状態マップ。
        // 状態ID: 導電しているRailPartのIndexのArray
        this.conductionMap = {
            0: [0]
        };
        // 現在の導電状態
        this.conductionState = 0;

        this.rendered = false;
    }

    /**
     * レールを構成するレールパーツを追加し、さらにその両端にジョイントを追加する。
     * Constructorからのみ呼ばれることを想定。
     * @param {RailPart} railPart
     */
    addRailPart(railPart) {
        this.railParts.push(railPart);
        // レールパーツは最も下に描画
        this.pathGroup.insertChild(0, railPart.path);

        // 重複が無いか確認してからジョイントを追加する
        if ( ! this._isJointDuplicate(railPart.startPoint) ) {
            let startJoint = new Joint(railPart.startPoint, railPart.startAngle, Joint.Direction.REVERSE_TO_ANGLE, this);
            this.joints.push(startJoint);
            // ジョイントは常にレールパーツの上に描画
            this.pathGroup.addChild(startJoint.path);
        }
        if ( ! this._isJointDuplicate(railPart.endPoint) ) {
            let endJoint = new Joint(railPart.endPoint, railPart.endAngle, Joint.Direction.SAME_TO_ANGLE, this);
            this.joints.push(endJoint);
            this.pathGroup.addChild(endJoint.path);
        }

        // フィーダーソケットの追加
        this.railParts.forEach(part => {
            if (part.hasFeederSocket()) {
                let feederSocket = new FeederSocket(part);
                this.feederSockets.push(feederSocket);
                this.pathGroup.addChild(feederSocket.path)
            }
        });
    }

    /**
     * 与えられた座標にジョイントが存在するか否かを返す。
     * @param {Point} point
     * @returns {boolean}
     * @private
     */
    _isJointDuplicate(point) {
        let duplicates = this.joints.filter( jo => jo.getPosition().isClose(point, 0.1));
        return duplicates.length > 0;
    }


    /**
     * ジョイントのペアから、両者を繋ぐレールパーツを取得する。
     * @param {Joint} joint1
     * @param {Joint} joint2
     * @returns {*}
     * @private
     */
    _getRailPartFromJoints(joint1, joint2) {
        let parts = this.railParts.filter( part => {
            return (joint1.getPosition().isClose(part.startPoint, 0.1) && joint2.getPosition().isClose(part.endPoint, 0.1))
                || (joint2.getPosition().isClose(part.startPoint, 0.1) && joint1.getPosition().isClose(part.endPoint, 0.1))
        });
        if (parts.length === 1) {
            return parts[0];
        } else if (parts.length > 1) {
            log.warn("Multiple rail part found on 2 joints");
        } else {
            log.warn("No rail part found on 2 joints");
        }
        return null;
    }


    /**
     * 任意のジョイントを基準に、絶対座標で移動する。
     * @param {Point} point 移動先の座標
     * @param {Point,Joint} anchor 基準とする座標またはジョイント
     */
    move(point, anchor) {
        if (anchor.constructor.name === "Joint") {
            anchor = anchor.getPosition();
        }
        let difference = point.subtract(anchor);
        this.moveRelatively(difference);
    }

    /**
     * 現在からの相対座標で移動する。
     * @param {Point} difference 移動先の現在位置に対する相対座標
     */
    moveRelatively(difference) {
        this.railParts.forEach( part => {
            part.moveRelatively(difference);
        });
        this.joints.forEach( joint => {
            joint.moveRelatively(difference);
        });
        this.feederSockets.forEach( feeder => {
            feeder.moveRelatively(difference);
        });
        this._updatePoints();
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle 回転角度
     * @param {Point,Joint} anchor 基準とするジョイント
     */
    rotate(angle, anchor) {
        if (anchor.constructor.name === "Joint") {
            anchor = anchor.getPosition();
        }
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, anchor);
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} angle 回転角度
     * @param {Point,Joint} anchor 基準とするジョイント
     */
    rotateRelatively(angle, anchor) {
        if (anchor.constructor.name === "Joint") {
            anchor = anchor.getPosition();
        }
        this.railParts.forEach( part => {
            part.rotateRelatively(angle, anchor)
        });
        this.joints.forEach( j => {
            j.rotateRelatively(angle, anchor);
        })
        this.feederSockets.forEach( f => {
            f.rotateRelatively(angle, anchor);
        })
        this.angle += angle;
        this._updatePoints();
    }

    /**
     * 任意のジョイントに対して接続する。
     * @param {Joint} fromJoint こちら側のジョイント
     * @param {Joint} toJoint 接続先のジョイント
     */
    connect(fromJoint, toJoint, isDruRun=false) {

        this.move(toJoint.getPosition(), fromJoint);
        let angle = toJoint.getDirection() - fromJoint.getDirection() + 180;

        log.debug(sprintf("Rotate %.3f around (%.3f, %.3f)",
            angle, toJoint.getPosition().x, toJoint.getPosition().y));

        this.rotateRelatively(angle, toJoint);
        fromJoint.connect(toJoint, isDruRun);
    }

    /**
     * このレールに属する全てのジョイントを切断する。
     */
    disconnect() {
        this.joints.forEach(elem => elem.disconnect());
    }

    /**
     * 指定されたパスがこのレールに属するものか否かを返す。
     * @param {Path} path
     * @returns {boolean}
     */
    containsPath(path) {
        return !!this.railParts.find(elem => elem.path.id === path.id)
            || !!this.joints.find(elem => elem.path.id === path.id);
        // this.railParts.forEach( elem => log.debug(elem.path.id + " " + path.id));
    }

    /**
     * このレールを削除する。
     */
    remove() {
        this.disconnect();
        this.railParts.forEach(elem => elem.remove());
        this.joints.forEach(elem => elem.remove());
        this.feederSockets.forEach(elem => elem.remove());
    }

    /**
     * このレールの透明度を設定する
     * @param value
     */
    setOpacity(value) {
        this.railParts.forEach(elem => elem.path.opacity = value);
        this.joints.forEach(elem => elem.path.opacity = value);
        this.feederSockets.forEach(elem => elem.path.opacity = value);
    }

    /**
     * ジョイント情報を表示する。デバッグ用。
     */
    showJoints() {
        this.joints.forEach( joint => {
            joint.showInfo();
        });
    }

    /**
     * このレールを構成するパスグループに名前を付け、イベントハンドリング時に参照できるようにする。
     * @param name
     */
    setName(name) {
        this.pathGroup.name = name;
    }

    getName(name) {
        return this.pathGroup.name;
    }

    /**
     * 導電状態をトグルスイッチ的に変更する。
     */
    toggleSwitch() {
        let numStates = Object.keys(this.conductionMap).length;
        this.conductionState = (this.conductionState + 1) % numStates;
        this.switch(this.conductionState);
    }

    /**
     * 導電状態を変更する。
     * @param state
     */
    switch(state) {
        let numStates = Object.keys(this.conductionMap).length;
        if (state > numStates) {
            log.error("No conduction state", state);
            return;
        }
        this.conductionState = state;
    }


    /**
     * レールパーツの両端のジョイントを取得する。開始点、終了点の順に取得される。
     * @param {RailPart} railPart
     * @returns {Array<Joint>}
     */
    getJointsFromRailPart(railPart) {
        let ret = null;
        console.log(railPart.startPoint, railPart.endPoint);
        let startJoint = this.joints.find( j => this._isReasonablyClose(j.getPosition(), railPart.startPoint));
        let endJoint = this.joints.find( j => this._isReasonablyClose(j.getPosition(), railPart.endPoint));
        if (startJoint && endJoint) {
            return [startJoint, endJoint];
        }
    }

    /**
     * 現在の導電状態で導電しているレールパーツを取得する。
     * @returns {Array<RailPart>}
     */
    getConductiveRailParts() {
        return this.conductionMap[this.conductionState].map( index => this.railParts[index])
    }

    /**
     * 現在の導電状態で導電しており、かつ指定のジョイントに接しているレールパーツを取得する。
     * @param {Joint}joint
     * @returns {RailPart}
     */
    getConductiveRailPartOfJoint(joint) {
        let ret = this.getConductiveRailParts().find(part => {
            return joint.getPosition().isClose(part.startPoint, 0.1) || joint.getPosition().isClose(part.endPoint, 0.1);
        });
        return ret;
    }


    /**
     * 内部情報を更新する。開始点のみ。
     * @private
     */
    _updatePoints() {
        this.startPoint = this.railParts[0].startPoint;
    }


    /**
     * レール全体のバウンディングボックスを取得する。パレット用。
     * @returns {Rectangle}
     */
    getBounds() {
        return this.pathGroup.bounds;
    }

    /**
     * レールの拡大縮小を行う。パレット用。
     * @param hor
     * @param ver
     */
    scale(hor, ver) {
        this.pathGroup.scale(hor, ver);
    }

    animate(event) {
        this.railParts.forEach(rp => rp.animate(event));
    }

    /**
     * 2点が十分に近いことを示す。
     * ジョイントがレールパーツの両端のいずれかに存在するか調べるときに使う。
     * @param point1
     * @param point2
     * @return {Boolean}
     * @private
     */
    _isReasonablyClose(point1, point2) {
        return point1.isClose(point2, Rail.JOINT_TO_RAIL_PART_TOLERANCE);
    }
}


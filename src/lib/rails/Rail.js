/**
 * Created by tozawa on 2017/07/03.
 */
import {sprintf} from "sprintf-js";
import { Joint } from "./parts/Joint.js";

/**
 * レールの基底クラス。レールはレールパーツとジョイントにより構成される。
 * 単独ではなく、継承されて使用される想定。
 */
export class Rail {

    static SPACE = 38;

    static State = {
        OPEN: Symbol(),         // 未接続
        CONNECTING: Symbol(),   // 接続試行中
        CONNECTED: Symbol()     // 接続中
    }

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
        this.startPoint = startPoint;
        this.angle = angle;

        this.pathGroup = new Group();
    }

    /**
     * レールを構成するレールパーツを追加し、さらにその両端にジョイントを追加する。
     * Constructorからのみ呼ばれることを想定。
     * @param {RailPart} railPart
     * @private
     */
    _addRailPart(railPart) {
        this.railParts.push(railPart);
        let startJoint = new Joint(railPart.startPoint, railPart.startAngle, Joint.Direction.REVERSE_TO_ANGLE);
        let endJoint = new Joint(railPart.endPoint, railPart.endAngle, Joint.Direction.SAME_TO_ANGLE);
        this.joints.push(startJoint, endJoint);

        this.pathGroup.addChild(railPart.path);
        this.pathGroup.addChild(startJoint.path);
        this.pathGroup.addChild(endJoint.path);
    }

    /**
     * レール全体のバウンディングボックスを取得する。
     * @returns {Rectangle}
     */
    getBounds() {
        return this.pathGroup.bounds;
    }

    moveTest(point, anchor) {
        let difference = point.subtract(anchor);
        this.moveRelatively(difference);
    }

    scale(hor, ver) {
        this.pathGroup.scale(hor, ver);
    }

    /**
     * 任意のジョイントを基準に、絶対座標で移動する。
     * @param {Point} point 移動先の座標
     * @param {Joint} joint 基準とするジョイント
     */
    move(point, joint) {
        let difference = point.subtract(joint.getPosition());
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
        })
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りの絶対角度で回転する。
     * @param {number} angle 回転角度
     * @param {Joint} joint 基準とするジョイント
     */
    rotate(angle, joint) {
        let relAngle = angle - this.angle;
        this.rotateRelatively(relAngle, joint);
    }

    /**
     * 任意のジョイントを中心に、X軸から時計回りで現在からの相対角度で回転する。
     * @param {number} angle 回転角度
     * @param {Joint} joint 基準とするジョイント
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
    connect(fromJoint, toJoint, isDruRun=false) {
        this.move(toJoint.getPosition(), fromJoint);
        let angle = toJoint.getDirection() - fromJoint.getDirection() + 180;
        // console.log(sprintf("Rotate %.3f around (%.3f, %.3f)",
        //     angle, toJoint.getPosition().x, toJoint.getPosition().y));
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
        // this.railParts.forEach( elem => console.log(elem.path.id + " " + path.id));
    }

    /**
     * このレールを削除する。
     */
    remove() {
        this.railParts.forEach(elem => elem.remove());
        this.disconnect();
    }

    setOpacity(value) {
        this.railParts.forEach(elem => elem.path.opacity = value);
        this.joints.forEach(elem => elem.path.opacity = value);
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
     * 自らと同じレールを複製する目的で、eval()で使用するための文字列を生成する。
     * 子クラスでこの文字列をevalすると、constructorの引数名と同名のプロパティの値を利用してオブジェクトを生成する。
     * DeepCopyではnewを呼び出さないため、paper.Pathの生成が行われないため作成した。
     * @param rail {Rail}
     * @returns {string}
     */
    static evalMeToClone(rail) {
        let paramNames = Rail._getParamNames(rail.constructor);
        paramNames = paramNames.map( p => "this." + p);
        let evalStr = sprintf("new %s(%s)", rail.constructor.name, paramNames.join(","));
        console.log("evalStr: " + evalStr);
        return evalStr;
    }

    /**
     * ある関数の引数名を、文字列の配列として取得する。
     * @param func
     * @returns {Array|{index: number, input: string}}
     * @private
     */
    static _getParamNames(func) {
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null)
            result = [];
        return result;
    }


}



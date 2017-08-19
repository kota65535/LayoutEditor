/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { RailPartAnchor } from "./parts/RailPart";
import { StraightRailPart } from "./parts/StraightRailPart";
import {Point} from "paper";


export class StraightRail extends Rail {

    length: number;
    hasFeederSocket: boolean;

    /**
     * ストレートレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     * @param {boolean} hasFeederSocket
     */
    constructor(startPoint: Point, angle: number, length: number, hasFeederSocket: boolean) {
        super(startPoint, 0);

        this.length = length;

        this.hasFeederSocket = hasFeederSocket;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPartAnchor.START, hasFeederSocket));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

export class DoubleStraightRail extends Rail {

    length: number;

    /**
     * 複線のダブルストレートレールを作成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, angle);

        this.length = length;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPartAnchor.START, true));
        this.addRailPart(new StraightRailPart(new Point(startPoint.x, startPoint.y + Rail.SPACE), 0, length, RailPartAnchor.START, true));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

export class GappedStraightRail extends Rail {

    length: number;

    /**
     * 両ギャップレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, 0);

        this.length = length;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPartAnchor.START, false));

        this.conductionMap = {
            0: []
        };

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

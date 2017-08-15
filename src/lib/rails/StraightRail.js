/**
 * Created by tozawa on 2017/07/03.
 */
import { Rail } from "./Rail";
import { RailPart } from "./parts/RailPart";
import { StraightRailPart } from "./parts/StraightRailPart";


export class StraightRail extends Rail {

    /**
     * ストレートレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     * @param {boolean} hasFeederSocket
     */
    constructor(startPoint, angle, length, hasFeederSocket) {
        super(startPoint, 0);

        this.length = length;

        this.hasFeederSocket = hasFeederSocket;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPart.Anchor.START, hasFeederSocket));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

export class DoubleStraightRail extends Rail {

    /**
     * 複線のダブルストレートレールを作成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, angle);

        this.length = length;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPart.Anchor.START, true));
        this.addRailPart(new StraightRailPart(new paper.Point(startPoint.x, startPoint.y + Rail.SPACE), 0, length, RailPart.Anchor.START, true));

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

export class GappedStraightRail extends Rail {

    /**
     * 両ギャップレールを生成する。
     * @param {Point} startPoint
     * @param {number} angle
     * @param {number} length
     */
    constructor(startPoint, angle, length) {
        super(startPoint, 0);

        this.length = length;

        this.addRailPart(new StraightRailPart(startPoint, 0, length, RailPart.Anchor.START, false));

        this.conductionMap = {
            0: []
        };

        this.move(startPoint, this.joints[0]);
        this.rotate(angle, this.joints[0]);

        this.showJoints();
    }
}

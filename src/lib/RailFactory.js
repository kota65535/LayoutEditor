/**
 * Created by tozawa on 2017/07/16.
 */
import { StraightRail, DoubleStraightRail } from "./rails/StraightRail";
import { CurveRail, DoubleCurveRail } from "./rails/CurveRail";

export class RailFactory {
    constructor() {
    }

    S280() {
        return new StraightRail(new Point(0, 0), 0, 280);
    }
    S140() {
        return new StraightRail(new Point(0, 0), 0, 140);
    }
    S70() {
        return new StraightRail(new Point(0, 0), 0, 70);
    }
    C280_45() {
        return new CurveRail(new Point(0, 0), 0, 280, 45);
    }
    C280_15() {
        return new CurveRail(new Point(0, 0), 0, 280, 15);
    }
}
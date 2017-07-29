/**
 * Created by tozawa on 2017/07/16.
 */
import { StraightRail, DoubleStraightRail, GappedStraightRail } from "./rails/StraightRail";
import { CurveRail, DoubleCurveRail } from "./rails/CurveRail";
import { SimpleTurnout, SymmetricalTurnout, Direction } from "./rails/Turnout";

export class RailFactory {
    constructor() {
    }

    S280() {
        return new StraightRail(new Point(0, 0), 0, 280, true);
    }
    S140() {
        return new StraightRail(new Point(0, 0), 0, 140, true);
    }
    S70() {
        return new StraightRail(new Point(0, 0), 0, 70, true);
    }
    S99() {
        return new StraightRail(new Point(0, 0), 0, 99, true);
    }
    S33() {
        return new StraightRail(new Point(0, 0), 0, 33, true);
    }
    S18_5() {
        return new StraightRail(new Point(0, 0), 0, 18.5, false);
    }
    S70G() {
        return new GappedStraightRail(new Point(0, 0), 0, 70);
    }
    C317_45() {
        return new CurveRail(new Point(0, 0), 0, 317, 45);
    }
    C280_45() {
        return new CurveRail(new Point(0, 0), 0, 280, 45);
    }
    C280_15() {
        return new CurveRail(new Point(0, 0), 0, 280, 15);
    }
    C541_15() {
        return new CurveRail(new Point(0, 0), 0, 541, 15);
    }
    PL541_15() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 541, 15, Direction.LEFT);
    }
    PR541_15() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 541, 15, Direction.RIGHT);
    }
    PL280_30() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 280, 30, Direction.LEFT);
    }
    PR280_30() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 280, 30, Direction.RIGHT);
    }
    PY280_15() {
        return new SymmetricalTurnout(new Point(0, 0), 0, 280, 15);
    }
}


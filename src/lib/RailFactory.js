/**
 * Created by tozawa on 2017/07/16.
 */
import { StraightRail, DoubleStraightRail } from "./rails/StraightRail";
import { CurveRail, DoubleCurveRail } from "./rails/CurveRail";
import { SimpleTurnout, SymmetricalTurnout, Direction } from "./rails/Turnout";

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
    C541_15() {
        return new CurveRail(new Point(0, 0), 0, 541, 15);
    }
    PL541_15() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 541, 15, Direction.LEFT);
    }
    PR541_15() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 541, 15, Direction.RIGHT);
    }
    PR541_15() {
        return new SimpleTurnout(new Point(0, 0), 0, 140, 541, 15, Direction.RIGHT);
    }
    PY280_15() {
        return new SymmetricalTurnout(new Point(0, 0), 0, 280, 15);
    }
}


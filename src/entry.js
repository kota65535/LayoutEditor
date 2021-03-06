/**
 * Created by tozawa on 2017/07/02.
 */

import { AnchorType } from "./RailPart";
import { Direction, SimpleTurnout,SymmetricalTurnout,CurvedTurnout } from "./Turnout";
import { CurveRailPart } from "./CurveRailPart";
import { StraightRailPart } from "./StraightRailPart";
import { StraightRail, DoubleStraightRail } from "./StraightRail";
import { CurveRail, DoubleCurveRail } from "./CurveRail";
import { Joint } from "./Joint"

paper.install(window);
window.onload = () => {
    paper.setup("myCanvas");

    createGrid(50);

    var secondLayer = new Layer();

    // testJoint();
    // testStraightRailPart();
    testCurveRailPart();
    console.log("----------------");
    // testStraightRail();
    // new StraightRailPart(new Point(100, 0), 30, 100);
    // new CurveRailPart(new Point(100, 0), 30, 100, 45);

    // var d1 = new DoubleStraightRail(new Point(200, 400), 30, 200);
    // d1.move(new Point(300, 400), d1.joints[0]);
    // d1.rotate(0, d1.joints[0]);
    // var d2 = new DoubleStraightRail(new Point(400, 500), 0, 200);
    // d2.connect(d2.joints[0], d1.joints[1]);
    //
    // var d3 = new DoubleCurveRail(new Point(300, 200), 0, 138, 100, 45);
    // d3.move(new Point(300, 400), d3.joints[2]);
    // d3.rotate(90, d3.joints[2]);
    // // d2.connect(d2.joints[0], d1.joints[1]);
    //
    // let c1 = new CurveRail(new Point(200, 100), 0, 100, 45);

    let p1 = new SimpleTurnout(new Point(100, 400), 0, 140, 514, 15, Direction.LEFT);
    let p2 = new SimpleTurnout(new Point(100, 500), 0, 140, 280, 30, Direction.LEFT);
    let p3 = new SimpleTurnout(new Point(100, 300), 0, 140, 514, 15, Direction.LEFT);
    let p7 = new SimpleTurnout(new Point(100, 600), 0, 140, 514, 15, Direction.LEFT);
    let p8 = new SimpleTurnout(new Point(100, 700), 0, 140, 514, 15, Direction.LEFT);
    p3.connect(p3.joints[2], p1.joints[2]);
    p7.connect(p7.joints[0], p1.joints[2]);
    p8.connect(p8.joints[1], p1.joints[2]);
    p2.connect(p2.joints[1], p1.joints[1]);
    // let p4 = new SymmetricalTurnout(new Point(100, 300), 0, 280, 15);
    // let p5 = new CurvedTurnout(new Point(100, 300), 0, 317, 280, 45, Direction.LEFT);
    // let p6 = new CurvedTurnout(new Point(100, 300), 0, 317, 280, 45, Direction.RIGHT);


    // new StraightRail(new Point(100, 100), 45, 100);
    // new StraightRail(new Point(150, 150), 0, 100);
    // new StraightRail(new Point(200, 100), 0, 100);
    // let c2 = new CurveRail(c1.joints[1], 100, 45);
    // let c3 = new CurveRail(c2.joints[1], 100, 45);
    // let c4 = new CurveRail(c3.joints[1], 100, 45);
    // let c5 = new CurveRail(c4.joints[1], 100, 45);
    // let c6 = new CurveRail(c5.joints[1], 100, 45);

    // console.log(project.activeLayer.children)



    // let a = new StraightRail(new Joint(100, 100, 0), 100);
    // new StraightRail(a.getJoints()[1], 100);
    // let b = new StraightRail(new Joint(100, 100, 45), 100);
    // let c = new StraightRail(b.getJoints()[1], 100);
    //
    // let c1 = new CurveRail(new Joint(100, 100, 0), 100, 45);
    // let c2 = new CurveRail(c1.getJoints()[1], 100, 45);
    //
    // let joint = new Joint(200, 200, 45);
    //
    //
    let tool = new Tool();

    tool.onMouseMove = (event) => {
        project.activeLayer.selected = false;
        if (event.item) {
            event.item.selected = true;
        }
    }

};


function createGrid(size) {
    for (let i=1 ; i <= 10 ; i++) {
        let line;
        line = new Path.Line(new paper.Point(size*i,0), new paper.Point(size*i, 1000));
        line.strokeColor = 'grey';
        line = new Path.Line(new paper.Point(0, size*i), new paper.Point(1000, size*i));
        line.strokeColor = 'grey';
    }
}

function testJoint() {

    let j1 = new Joint(new Point(50, 50), 0);
    j1.rotate(135, new Point(50, 50));
    let j2 = new Joint(new Point(50, 50), 0);
    j2.move(new Point(50, 100));
    j2.rotate(90, new Point(100, 100));
    let j3 = new Joint(new Point(30, 30), 45);
    j3.moveRelatively(new Point(120, 120));
    j3.rotateRelatively(45, new Point(100, 100));
    // j3.rotateRelatively(45, new Point(50, 100));
}

function testStraightRailPart() {

    let r1 = new StraightRailPart(new Point(100, 100), 0, 100);
    r1.rotate(90, r1.endPoint);
    let r2 = new StraightRailPart(new Point(200, 100), 90, 100);
    let r3 = new StraightRailPart(new Point(50, 50), 45, 100);
    r3.move(new Point(200, 200), r3.startPoint);
    r3.move(new Point(200, 200), r3.startPoint);
    r3.rotateRelatively(45, r3.startPoint);
    let r4 = new StraightRailPart(new Point(200, 200), 90, 100);
    r4.moveRelatively(new Point(0, 100));
    let r5 = new StraightRailPart(new Point(200, 200), 45, 100, AnchorType.END);
}

function testCurveRailPart() {

    // let r1 = new CurveRailPart(new Point(300, 100), 0, 100, 45);
    // let r2 = new CurveRailPart(new Point(300, 100), 45, 100, 45);
    // let r3 = new CurveRailPart(new Point(300, 100), 90, 100, 45);
    // let r4 = new CurveRailPart(new Point(300, 100), 135, 100, 45);
    // let r5 = new CurveRailPart(new Point(300, 100), 180, 100, 45);
    // let r6 = new CurveRailPart(new Point(300, 100), 225, 100, 45);
    // let r7 = new CurveRailPart(new Point(300, 100), 270, 100, 45);
    // let r8 = new CurveRailPart(new Point(300, 100), 315, 100, 45);
    // let r9 = new CurveRailPart(new Point(300, 100), 0, 100, 45);
    // r9.rotate(r1.endAngle-180, r9.endPoint);
    // let r10 = new StraightRailPart(new Point(300, 300), 0, 50);
    // let r11 = new CurveRailPart(new Point(300, 300), 0, 100, 30);
    // r11.move(r10.endPoint, r11.startPoint);
    // r11.rotate(r10.endAngle-180, r11.startPoint);
    //
    // let r12 = new CurveRailPart(new Point(300, 300), 0, 100, 30);
    // r12.move(r10.endPoint, r12.endPoint);
    // // r12.rotate(r10.endAngle, r12.endPoint);

    let r13 = new CurveRailPart(new Point(250, 300), -180, 100, 30, AnchorType.END);


    // r1.rotate(0, r1.startPoint);
    // let r2 = new CurveRailPart(new Point(200, 100), 0, 100, 45);
    // r2.move(r1.endPoint, r2.startPoint);
    // r2.rotate(r1.endAngle, r2.startPoint);
    // let r3 = new CurveRailPart(r2.endPoint, r2.endAngle + 45, 100, 45);
    // r3.rotateRelatively(-45, r2.endPoint)
    // let r4 = new CurveRailPart(new Point(0, 0), 0, 100, 45);
    // r4.move(r3.endPoint, r4.endPoint);
    // r4.rotate(0, r4.endPoint);


    // let r4 = new CurveRailPart(new Point(200, 100), 0, 100, 45, Anchor.END);
    // r1.rotate(135);
    // r3.moveRelatively(new Point(0, 100));
    // r3.rotateRelatively(45, Anchor.START);
    // r3.rotateRelatively(45, Anchor.START);
    // r4.rotate(r1.endAngle, Anchor.END);

}


function testStraightRail() {

    let r1 = new StraightRail(new Point(300, 100), 0, 100);
    // let r2 = new StraightRail(new Point(300, 200), 45, 100);
    // let r3 = new StraightRail(new Point(0, 0), 0, 100);
    // let r4 = new StraightRail(new Point(0, 0), 0, 100);
    // r1.move(new Point(300, 150));
    // r1.rotate(135);
    // r3.connect(r2.joints[1]);
    // r4.connect(r2.joints[0]);


}

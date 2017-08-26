import {RectPart} from "../../src/lib/rails/parts/primitives/RectPart";
import {Point} from "paper";
import {customMatchers, initCanvas} from "../spec_helper";

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});

describe('RectPart', function() {
    beforeAll(function() {
        initCanvas();
    })
    it('creates rectangle at specified position, angle and size.', function() {
        new RectPart(new Point(100,100), 0, 50, 50, 'black');
        new RectPart(new Point(200,100), 45, 50, 50, 'black');
        new RectPart(new Point(300,100), 45, 50, 50, 'black');
    });

    it('moves to specified point on the basis of the position', function() {
        let part = new RectPart(new Point(50, 50), 0, 50, 50, 'blue');
        part.move(new Point(100, 200));
        expect(part.position).toBeAt(new Point(100,200));
    });
    it('moves to specified point on the basis of the center of top', function() {
        let part = new RectPart(new Point(50, 50), 0, 50, 50, 'blue');
        part.move(new Point(200, 200), part.getCenterOfTop());
        expect(part.position).toBeAt(new Point(200,225));
    });
    it('moves relatively by specified distance on the basis of the position', function() {
        let part = new RectPart(new Point(50, 50), 45, 50, 50, 'blue');
        part.moveRelatively(new Point(250, 150));
        expect(part.position).toBeAt(new Point(300, 200));
    });

    it('rotates to specified angle around the position', function() {
        let part = new RectPart(new Point(100, 300), 30, 50, 50, 'green');
        part.rotate(45);
        expect(part.position).toBeAt(new Point(100, 300));
        expect(part.angle).toBe(45);
    });
    it('rotates to specified angle around the specified position', function() {
        let part = new RectPart(new Point(200, 300), 0, 50, 50, 'green');
        part.rotate(90, part.getCenterOfTop());
        expect(part.position).toBeAt(new Point(175, 275));
        expect(part.angle).toBe(90);
    });
    it('rotates by specified angle around the position', function() {
        let part = new RectPart(new Point(300, 300), 30, 50, 50, 'green');
        part.rotateRelatively(15);
        expect(part.position).toBeAt(new Point(300, 300));
        expect(part.angle).toBe(45);
    });

    it('removes existing part', function() {
        let part = new RectPart(new Point(100, 400), 30, 50, 50, 'green');
        part.remove();
    });
    it('set visibility', function() {
        let part = new RectPart(new Point(200, 400), 30, 50, 50, 'green');
        part.visible = false;
        expect(part.visible).toBe(false);
    });
    it('set opacity', function() {
        let part = new RectPart(new Point(300, 400), 30, 50, 50, 'green');
        part.opacity = 0.5;
        expect(part.opacity).toBe(0.5);
    });
    // it('rotates to specified angle around the position', function() {
    //     let part = new RectPart(new Point(50, 50), 45, 50, 50, 'blue');
    //     part.rotate(new Point(50, 250));
    //     expect(part.position).toBeAt(new Point(100, 300));
    // });
});

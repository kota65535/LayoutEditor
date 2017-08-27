"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paper_1 = require("paper");
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.remove = function () {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
/**
 * 複数の配列の全ての要素の組み合わせを返す。
 * @returns {Array}
 */
function cartesian() {
    let r = [], arg = arguments, max = arg.length - 1;
    function helper(arr, i) {
        for (let j = 0, l = arg[i].length; j < l; j++) {
            let a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i == max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
}
exports.cartesian = cartesian;
/**
 * Paper.js におけるHitTestのWrapper
 * @param point
 * @returns {"paper".HitResult | *}
 */
function hitTest(point) {
    let hitOptions = {
        class: paper_1.Path,
        segments: true,
        stroke: true,
        fill: true,
    };
    let hitResult = paper_1.project.hitTest(point, hitOptions);
    if (hitResult) {
        // log.info(hitResult.item.position);
        // log.info(hitResult.item.id);
        // log.debug("Hit Test:");
        // log.debug(point);
        // log.debug(hitResult);
        // log.debug(hitResult.point);
    }
    return hitResult;
}
exports.hitTest = hitTest;
/**
 * Paper.js におけるHitTestAllのWrapper
 * @param point
 */
function hitTestAll(point) {
    let hitOptions = {
        class: paper_1.Path,
        segments: true,
        stroke: true,
        fill: true,
    };
    let hitResults = paper_1.project.hitTestAll(point, hitOptions);
    // Groupがひっかかるとうざいので取り除く
    // let hitResultsPathOnly = hitResults.filter(r => r.item instanceof paper.Path);
    // return hitResultsPathOnly;
    return hitResults;
}
exports.hitTestAll = hitTestAll;
//# sourceMappingURL=utils.js.map
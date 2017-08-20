/**
 * 複数の配列の全ての要素の組み合わせを返す。
 * @returns {Array}
 */
export function cartesian() {
    var r = [], arg = arguments, max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}


/**
 * Paper.js におけるHitTestのWrapper
 * @param point
 * @returns {"paper".HitResult | *}
 */
export function hitTest(point) {
    let hitOptions = {
        class: paper.Path,
        segments: true,
        stroke: true,
        fill: true,
        // tolerance: 5
    };
    let hitResult = paper.project.hitTest(point, hitOptions);
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

/**
 * Paper.js におけるHitTestAllのWrapper
 * @param point
 */
export function hitTestAll(point) {
    let hitOptions = {
        class: paper.Path,
        segments: true,
        stroke: true,
        fill: true,
        // tolerance: 5
    };
    let hitResults = paper.project.hitTestAll(point, hitOptions);
    // Groupがひっかかるとうざいので取り除く
    // let hitResultsPathOnly = hitResults.filter(r => r.item instanceof paper.Path);
    // return hitResultsPathOnly;
    return hitResults;
}

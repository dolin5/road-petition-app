define(["require", "exports", "../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getSectionGraphics(fl) {
        fl.queryFeatures({
            where: '1=1',
            outFields: ['*'],
            outSpatialReference: main_1.view.spatialReference,
            returnGeometry: true
        }).then(function (_a) {
            var features = _a.features;
            exports.sectionGraphics = features;
        });
    }
    exports.getSectionGraphics = getSectionGraphics;
    function displaySection(section) {
        var fs = exports.sectionGraphics.filter(function (g) {
            return (g.attributes.SECTION == section.s &&
                g.attributes.TOWN == section.t &&
                g.attributes.N_S == section.ns &&
                g.attributes.RANGE == section.r &&
                g.attributes.E_W == section.ew);
        });
        if (fs.length) {
            fs[0].symbol = {
                type: "simple-fill",
                outline: { width: 2.25, color: [0, 255, 197, 1] },
                color: [0, 169, 230, 0]
            };
            main_1.view.graphics.removeAll();
            main_1.view.graphics.add(fs[0]);
        }
    }
    exports.displaySection = displaySection;
});
//# sourceMappingURL=sectionUtils.js.map
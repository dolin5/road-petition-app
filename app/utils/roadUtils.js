define(["require", "exports", "../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRoads = exports.getRoadGraphics = void 0;
    var roadGraphics;
    function getRoadGraphics(fl) {
        var outFields = ['DIRPRE', 'ROADNAME', 'ROADTYPE', 'DIRSUF'];
        fl.queryFeatures({
            where: "1=1",
            outFields: outFields,
            outSpatialReference: main_1.view.spatialReference,
            returnGeometry: true
        }).then(function (_a) {
            var features = _a.features;
            roadGraphics = features.map(function (feature) {
                feature.roadName = outFields.reduce(function (roadName, field) {
                    return feature.attributes[field] ? (roadName + " " + feature.attributes[field]).trim() : roadName;
                }, "");
                return feature;
            });
        });
    }
    exports.getRoadGraphics = getRoadGraphics;
    function getRoads(roadNames) {
        return roadGraphics.filter(function (feature) {
            return roadNames.indexOf(feature.roadName) >= 0;
        });
    }
    exports.getRoads = getRoads;
});
//# sourceMappingURL=roadUtils.js.map
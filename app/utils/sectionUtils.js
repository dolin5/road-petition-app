var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "esri/geometry/geometryEngine", "../main"], function (require, exports, geometryEngine, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeSectionHighlightGraphic = exports.getSectionGeoms = exports.displaySection = exports.getSectionGraphics = exports.highlightGraphic = exports.selectionSections = exports.sectionGraphics = void 0;
    geometryEngine = __importStar(geometryEngine);
    function getSectionGraphics(fl) {
        fl.queryFeatures({
            where: "1=1",
            outFields: ["*"],
            outSpatialReference: main_1.view.spatialReference,
            returnGeometry: true
        }).then(function (_a) {
            var features = _a.features;
            exports.sectionGraphics = features.map(function (feature) {
                feature.section = {
                    s: feature.attributes.SECTION,
                    t: feature.attributes.TOWN + feature.attributes.N_S,
                    r: feature.attributes.RANGE + feature.attributes.E_W
                };
                return feature;
            });
        });
    }
    exports.getSectionGraphics = getSectionGraphics;
    function displaySection(section) {
        var fs = exports.sectionGraphics.filter(function (g) {
            return (g.attributes.SECTION === section.s &&
                g.attributes.TOWN === section.t &&
                g.attributes.N_S === section.ns &&
                g.attributes.RANGE === section.r &&
                g.attributes.E_W === section.ew);
        });
        if (fs.length) {
            fs[0].symbol = {
                type: "simple-fill",
                outline: { width: 2.25, color: [0, 255, 197, 1] },
                color: [0, 169, 230, 0]
            };
            //view.graphics.removeAll();
            main_1.view.graphics.remove(exports.highlightGraphic);
            exports.highlightGraphic = fs[0];
            main_1.view.graphics.add(exports.highlightGraphic);
        }
    }
    exports.displaySection = displaySection;
    function trimBySections(geoms, sections) {
        var paths = [];
        for (var _i = 0, geoms_1 = geoms; _i < geoms_1.length; _i++) {
            var geom = geoms_1[_i];
            geometryEngine.intersect(geoms, sections);
        }
    }
    function getSectionGeoms(rPSections) {
        return exports.sectionGraphics.filter(function (sg) {
            for (var _i = 0, rPSections_1 = rPSections; _i < rPSections_1.length; _i++) {
                var rPSection = rPSections_1[_i];
                if (sg.section.s === rPSection.s && sg.section.t === rPSection.t && sg.section.r === rPSection.r) {
                    return true;
                }
            }
            return false;
        }).map(function (sG) {
            return sG.geometry;
        });
    }
    exports.getSectionGeoms = getSectionGeoms;
    function removeSectionHighlightGraphic() {
        main_1.view.graphics.remove(exports.highlightGraphic);
    }
    exports.removeSectionHighlightGraphic = removeSectionHighlightGraphic;
});
//# sourceMappingURL=sectionUtils.js.map
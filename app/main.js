var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/Basemap", "esri/layers/VectorTileLayer", "esri/layers/TileLayer", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "./utils/roadPetitions", "./utils/search"], function (require, exports, Map_1, MapView_1, Basemap_1, VectorTileLayer_1, TileLayer_1, MapImageLayer_1, FeatureLayer_1, roadPetitions_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    Basemap_1 = __importDefault(Basemap_1);
    VectorTileLayer_1 = __importDefault(VectorTileLayer_1);
    TileLayer_1 = __importDefault(TileLayer_1);
    MapImageLayer_1 = __importDefault(MapImageLayer_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    var basemap = new Basemap_1.default({
        baseLayers: [
            new TileLayer_1.default({
                portalItem: {
                    id: "1b243539f4514b6ba35e7d995890db1d" // World Hillshade
                }
            }),
            new VectorTileLayer_1.default({
                portalItem: {
                    id: "c120ccac56e64e5a94d58d86063799d3"
                }
            })
        ]
    });
    var townshipsLayer = new FeatureLayer_1.default({
        url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver/2"
    });
    var sectionsLayer = new FeatureLayer_1.default({
        url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver/3"
    });
    var roadsVTLayer = new VectorTileLayer_1.default({
        portalItem: {
            id: "107474a0debf4232a68c93690eaf3e84"
        }
    });
    exports.gcLayer = new MapImageLayer_1.default({
        url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver",
        opacity: 0
    });
    exports.gcLayer.when(roadPetitions_1.makeFeatureLayers);
    var map = new Map_1.default({
        basemap: basemap,
        layers: [exports.gcLayer, sectionsLayer, townshipsLayer, roadsVTLayer]
    });
    exports.view = new MapView_1.default({
        map: map,
        container: "viewDiv",
        center: [-111.244, 45.752],
        zoom: 10,
        constraints: {
            rotationEnabled: false
        },
        padding: {
            top: 50
        },
        popup: {
            actions: [],
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
                position: 'top-right'
            }
        }
    });
    search_1.makeSearchWidget(exports.view);
    exports.view.when(function () {
        exports.view.popup.autoOpenEnabled = false;
        exports.view.on("click", function (event) {
            exports.view.graphics.removeAll();
            if (event && event.mapPoint) {
                roadPetitions_1.populatePopup(exports.view.popup, event.mapPoint);
            }
            else {
                exports.view.popup.open({
                    // Set the popup's title to the coordinates of the location
                    title: "Invalid point location",
                    location: event.mapPoint,
                    content: "Please click on a valid location."
                });
            }
        });
    });
});
//# sourceMappingURL=main.js.map
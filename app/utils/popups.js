var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "../main", "esri/tasks/QueryTask", "esri/core/promiseUtils", "esri/request"], function (require, exports, main_1, QueryTask_1, promiseUtils, request_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    QueryTask_1 = __importDefault(QueryTask_1);
    promiseUtils = __importStar(promiseUtils);
    request_1 = __importDefault(request_1);
    var roadsFL;
    var sectionsFL;
    var commissionMinutes;
    var currentRoadName;
    var legalDescription;
    var originalRoadName;
    var roadPetition;
    function makeFeatureLayers(gcLayer) {
        var _this = this;
        var _a;
        (_a = gcLayer === null || gcLayer === void 0 ? void 0 : gcLayer.sublayers) === null || _a === void 0 ? void 0 : _a.forEach(function (sublayer) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(sublayer.title == "Roads")) return [3 /*break*/, 2];
                        return [4 /*yield*/, sublayer.createFeatureLayer()];
                    case 1:
                        roadsFL = _a.sent();
                        console.log(roadsFL);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(sublayer.title == "Sections")) return [3 /*break*/, 4];
                        return [4 /*yield*/, sublayer.createFeatureLayer()];
                    case 3:
                        sectionsFL = _a.sent();
                        console.log(sectionsFL);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        request_1.default(gcLayer.url, {
            query: {
                f: "json"
            },
            responseType: "json"
        }).then(queryTables);
    }
    exports.makeFeatureLayers = makeFeatureLayers;
    function queryTables(gcServiceData) {
        var _this = this;
        promiseUtils.eachAlways(gcServiceData.data.tables.map(function (t) {
            return promiseUtils.create(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                var qt, results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            qt = new QueryTask_1.default({
                                url: gcServiceData.url + "/" + t.id
                            });
                            return [4 /*yield*/, qt.execute({
                                    outFields: ["*"],
                                    where: "1=1"
                                })];
                        case 1:
                            results = _a.sent();
                            res({ results: results, table: t });
                            return [2 /*return*/];
                    }
                });
            }); });
        })).then(populateTableArrays);
    }
    function populateTableArrays(tableResults) {
        tableResults.forEach(function (response) {
            var tr = response.value;
            switch (tr.table.name) {
                case "Commission_Minutes": {
                    commissionMinutes = tr.results.features;
                    break;
                }
                case "Current_Road_Name": {
                    currentRoadName = tr.results.features;
                    break;
                }
                case "Legal_Description": {
                    legalDescription = tr.results.features;
                    break;
                }
                case "Original_Road_Name": {
                    originalRoadName = tr.results.features;
                    break;
                }
                case "Road_Petition": {
                    roadPetition = tr.results.features;
                    break;
                }
            }
        });
    }
    function populatePopup(popup, mapPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var popupContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        popup.open({
                            title: "loading..."
                        });
                        return [4 /*yield*/, queryRoadPetitions(mapPoint)]; //.then(makePopupContent);
                    case 1:
                        popupContent = _a.sent() //.then(makePopupContent);
                        ;
                        popup.content = popupContent;
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.populatePopup = populatePopup;
    function queryRoadPetitions(mapPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = {
                            //query object
                            geometry: mapPoint,
                            units: "meters",
                            distance: 5 * main_1.view.resolution,
                            spatialRelationship: "intersects",
                            returnGeometry: true,
                            outFields: ["*"],
                        };
                        return [4 /*yield*/, promiseUtils.eachAlways([roadsFL.queryFeatures(query), sectionsFL.queryFeatures(query)]).then(function (results) {
                                var roadResults = results[0].value;
                                var sectionResults = results[1].value;
                                var roadPetitions = [];
                                if (roadResults.features.length && sectionResults.features.length) {
                                    return getPetitionsByRoadAndSection(roadResults.features, sectionResults.features);
                                }
                                if (!roadResults.features.length && sectionResults.features.length)
                                    return "section";
                                if (!sectionResults.features.length)
                                    return "none";
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function getPetitionsByRoadAndSection(roads, sections) {
    }
    var makePopupContent = function () { };
});
//# sourceMappingURL=popups.js.map
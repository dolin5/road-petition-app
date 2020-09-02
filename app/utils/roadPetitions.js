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
define(["require", "exports", "../main", "esri/tasks/QueryTask", "esri/tasks/support/Query", "esri/geometry/geometryEngine", "esri/core/promiseUtils", "esri/request", "./sectionUtils", "./roadUtils", "esri/Graphic"], function (require, exports, main_1, QueryTask_1, Query_1, geometryEngine, promiseUtils, request_1, sectionUtils_1, roadUtils_1, Graphic) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makePopupContent = exports.populatePopup = exports.makeFeatureLayers = exports.petitions = exports.originalRoadNameList = exports.currentRoadNameList = exports.roadsFL = exports.Petition = void 0;
    QueryTask_1 = __importDefault(QueryTask_1);
    Query_1 = __importDefault(Query_1);
    geometryEngine = __importStar(geometryEngine);
    promiseUtils = __importStar(promiseUtils);
    request_1 = __importDefault(request_1);
    var Petition = /** @class */ (function () {
        function Petition(params) {
            this.petitionNumber = params["Petition_Number"];
            this.type = params["Type"];
            this.dateFiled = params["Date_Filed"].replace(" 0:00:000", "");
            this.actionTaken = params["Action_Taken"];
            this.dateOfAction = params["Date_of_Action"];
            this.resolutionNumber = params["Resolution_Number"];
            this.notes = params["Notes"];
            this.petitionImages = params["Petition_Images"];
            this.otherPetitionImages = params["Other_Petition_Images"];
            this.dateRecordAdded = params["DateRecordAdded"];
            this.updated = params["Updated"];
        }
        return Petition;
    }());
    exports.Petition = Petition;
    var sectionsFL;
    var commissionMinutesList;
    var legalDescriptionList;
    var roadPetitionList;
    exports.petitions = {};
    function makeFeatureLayers(gcLayer) {
        var _this = this;
        var _a;
        (_a = gcLayer === null || gcLayer === void 0 ? void 0 : gcLayer.sublayers) === null || _a === void 0 ? void 0 : _a.forEach(function (sublayer) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(sublayer.title === "Roads")) return [3 /*break*/, 2];
                        return [4 /*yield*/, sublayer.createFeatureLayer()];
                    case 1:
                        exports.roadsFL = _a.sent();
                        roadUtils_1.getRoadGraphics(exports.roadsFL);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(sublayer.title === "Sections")) return [3 /*break*/, 4];
                        return [4 /*yield*/, sublayer.createFeatureLayer()];
                    case 3:
                        sectionsFL = _a.sent();
                        //getSectionGraphics(sectionsFL);
                        sectionUtils_1.getSectionGraphics(sectionsFL);
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
                    commissionMinutesList = tr.results.features;
                    break;
                }
                case "Current_Road_Name": {
                    exports.currentRoadNameList = tr.results.features;
                    processRoadNames();
                    break;
                }
                case "Legal_Description": {
                    legalDescriptionList = tr.results.features;
                    break;
                }
                case "Original_Road_Name": {
                    exports.originalRoadNameList = tr.results.features;
                    break;
                }
                case "Road_Petition": {
                    roadPetitionList = tr.results.features;
                    break;
                }
            }
        });
        createPetitions();
    }
    function createPetitions() {
        roadPetitionList.forEach(function (rp) {
            var petition = new Petition(rp.attributes);
            petition.currentRoadNames = exports.currentRoadNameList.reduce(function (roadNames, rN) {
                if (rN.attributes.Petition_Number === petition.petitionNumber) {
                    var roadName = rN.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
                    roadName = roadName.replace(/ ROAD$/, " RD").replace(/ AVENUE$/, " AVE").replace(/ TRAIL$/, " TRL").replace(/ LANE$/, " LN").replace(/\.$/, "");
                    roadNames.push(roadName);
                }
                return roadNames;
            }, []).sort();
            petition.originalRoadNames = exports.originalRoadNameList.reduce(function (roadNames, rN) {
                if (rN.attributes.Petition_Number === petition.petitionNumber) {
                    var roadName = rN.attributes["Original_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
                    roadName = roadName.replace(/ ROAD$/, " RD").replace(/ AVENUE$/, " AVE").replace(/ TRAIL$/, " TRL").replace(/ LANE$/, " LN").replace(/\.$/, "");
                    roadNames.push(roadName);
                }
                return roadNames;
            }, []).sort();
            petition.legalDescriptions = legalDescriptionList.reduce(function (sections, lD) {
                if (lD.attributes.Petition_Number === petition.petitionNumber) {
                    var section = {
                        s: lD.attributes.Section,
                        t: lD.attributes.Township.toUpperCase(),
                        r: lD.attributes.Range.toUpperCase()
                    };
                    sections.push(section);
                }
                return sections;
            }, []).sort(function (a, b) {
                if (a.t !== b.t) {
                    return (a.t < b.t) ? -1 : 1;
                }
                else if (a.r !== b.r) {
                    return (a.r < b.r) ? -1 : 1;
                }
                else if (a.s !== b.s) {
                    return (a.s < b.s) ? -1 : 1;
                }
                return 0;
            });
            petition.commissionMinutes = commissionMinutesList.reduce(function (minutes, cM) {
                if (cM.attributes.Petition_Number === petition.petitionNumber) {
                    var minute = {
                        book: cM.attributes.Book,
                        page: cM.attributes.Page
                    };
                    minutes.push(minute);
                }
                return minutes;
            }, []).sort(function (a, b) {
                if (a.book !== b.book) {
                    return (a.book < b.book) ? -1 : 1;
                }
                else if (a.page !== a.page) {
                    return (a.page < b.page) ? -1 : 1;
                }
                return 0;
            });
            exports.petitions[petition.petitionNumber] = petition;
        });
    }
    function processRoadNames() {
        var roadTypes = exports.currentRoadNameList.map(function (f) {
            var roadNameSplit = f.attributes["Current_Road_Name"].trim().toUpperCase().split(" ");
            return roadNameSplit[roadNameSplit.length - 1];
        });
    }
    function populatePopup(popup, mapPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var popupParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        popup.open({
                            title: "loading..."
                        });
                        return [4 /*yield*/, queryRoadPetitions(mapPoint).then(makePopupContent)];
                    case 1:
                        popupParams = _a.sent();
                        popup.content = popupParams.content;
                        popup.title = popupParams.title;
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
                        query = new Query_1.default({
                            //query object
                            geometry: mapPoint,
                            units: "meters",
                            distance: 5 * main_1.view.resolution,
                            spatialRelationship: "intersects",
                            returnGeometry: true,
                            outFields: ["*"]
                        });
                        return [4 /*yield*/, promiseUtils.eachAlways([exports.roadsFL.queryFeatures(query), sectionsFL.queryFeatures(query)]).then(function (results) {
                                var roadResults = results[0].value.features;
                                var sectionResults = results[1].value.features;
                                var petitionsByRoadName;
                                var petitionsBySection;
                                var title = "Road petitions";
                                if (roadResults.length) {
                                    petitionsByRoadName = getPetitionsByRoadName(roadResults);
                                }
                                if (sectionResults.length) {
                                    petitionsBySection = getPetitionsBySection(sectionResults);
                                }
                                if (petitionsByRoadName === null || petitionsByRoadName === void 0 ? void 0 : petitionsByRoadName.selectedRoadNames.length) {
                                    title += " for";
                                    petitionsByRoadName.selectedRoadNames.forEach(function (rN) {
                                        title += " " + rN + " or ";
                                    });
                                    title = title.slice(0, -4);
                                }
                                if (petitionsBySection.selectedTRSs.length) {
                                    title += " in";
                                    petitionsBySection.selectedTRSs.forEach(function (tRS) {
                                        title += " " + tRS + " or ";
                                    });
                                    title = title.slice(0, -4);
                                }
                                var petitionResults = [];
                                if (roadResults.length) {
                                    petitionsBySection.petitions.forEach(function (sP) {
                                        petitionsByRoadName.petitions.forEach(function (rNP) {
                                            if (rNP.attributes["Petition_Number"] === sP.attributes["Petition_Number"]) {
                                                petitionResults.push(exports.petitions[rNP.attributes.Petition_Number]);
                                            }
                                        });
                                    });
                                }
                                else {
                                    petitionsBySection.petitions.forEach(function (sP) {
                                        petitionResults.push(exports.petitions[sP.attributes.Petition_Number]);
                                    });
                                }
                                var uniquePetitionNumbers = [];
                                petitionResults = petitionResults.filter(function (p, idx) {
                                    if (uniquePetitionNumbers.indexOf(p.petitionNumber) > -1) {
                                        return false;
                                    }
                                    uniquePetitionNumbers.push(p.petitionNumber);
                                    return true;
                                });
                                return { title: title, roadPetitions: petitionResults.sort(function (a, b) { return a.petitionNumber - b.petitionNumber; }) };
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function makePopupContent(params) {
        var title = params.title;
        var roadPetitions = params.roadPetitions;
        var accordion = document.createElement("calcite-accordion");
        Object.assign(accordion, { scale: "s", selectionMode: "single", iconPosition: "start" });
        roadPetitions.forEach(function (rP) {
            rP.accordionItem = document.createElement("calcite-accordion-item");
            rP.accordionItem.itemTitle = "Petition #" + rP.petitionNumber;
            //const rPTemplate = document.createElement('template');
            var rPFragment = document.createRange().createContextualFragment("\n      <span><strong>Petition #&nbsp;:</strong> " + rP.petitionNumber + "</span>\n      <span><strong>Type:</strong> " + rP.type + "</span>\n      <span><strong>Date Filed:</strong> " + rP.dateFiled + "</span>\n      <span><strong>Original Road Name(s):</strong></span>\n      <table name=\"original-road\">\n      <tbody>\n      </tbody>\n      </table>\n      <span><strong>Current Road Name(s)</strong></span>\n      <table name=\"current-road\">\n      <tbody>      \n      </tbody>\n      </table>      \n      <span><strong>Action Taken:</strong> " + rP.actionTaken + "</span>\n      <span><strong>Resolution #:</strong> " + rP.resolutionNumber + "</span>\n      <span><strong>Notes:</strong> " + rP.notes + "</span>\n      <span><strong>Commission Minutes:</strong></span>\n      <table name=\"commission-minutes\">\n      <tbody>\n      </tbody>\n      </table>\n      <span><strong>Legal Description:</strong></span>\n      <table name=\"legal-description\">\n      <tbody>\n      <tr>\n      <td>Section</td>\n      <td>Township</td>\n      <td>Range</td>\n      </tr>\n      </tbody>\n      </table>\n      <span><strong>Petition Images:</strong> " + rP.petitionImages + "</span>\n      <span><strong>Other Petition Images:</strong> " + rP.otherPetitionImages + "</span>");
            Array.from(rPFragment.children).forEach(function (e) {
                if (e.tagName === "SPAN") {
                    e.classList.add("road-petition-field");
                }
                else if (e.tagName === "TABLE") {
                    e.classList.add("road-petition-table");
                    switch (e.getAttribute("name")) {
                        case "original-road":
                            if (!rP.originalRoadNames.length) {
                                var row = e.insertRow();
                                row.innerText = "none";
                            }
                            rP.originalRoadNames.forEach(function (rN) {
                                var row = e.insertRow();
                                row.innerText = rN;
                            });
                            break;
                        case "current-road":
                            if (!rP.currentRoadNames.length) {
                                var row = e.insertRow();
                                row.innerText = "none";
                            }
                            rP.currentRoadNames.forEach(function (rN) {
                                var row = e.insertRow();
                                row.innerText = rN;
                            });
                            break;
                        case "commission-minutes":
                            rP.commissionMinutes.forEach(function (cM) {
                                var row = e.insertRow();
                                row.innerText = "Book " + cM.book + " Page " + cM.page;
                            });
                            break;
                        case "legal-description":
                            rP.legalDescriptions.forEach(function (lD) {
                                var row = e.insertRow();
                                Object.values(lD).forEach(function (val) {
                                    var cell = row.insertCell();
                                    cell.innerText = val;
                                });
                                row.addEventListener("mouseenter", function (e) {
                                    //mouseIn=true;
                                    row.classList.add("blue-row");
                                    legalDescriptionHover(lD);
                                });
                                row.addEventListener("mouseleave", function () {
                                    row.classList.remove("blue-row");
                                    sectionUtils_1.removeSectionHighlightGraphic();
                                });
                                //row.innerText = lD.s + "     " + lD.t + "     "+ lD.r;
                            });
                            break;
                    }
                }
                rP.accordionItem.appendChild(e);
            });
            rP.accordionItem.addEventListener("calciteAccordionItemSelected", function (e) {
                main_1.view.goTo(sectionUtils_1.getSectionGeoms(rP.legalDescriptions));
                for (var _i = 0, _a = accordion.children; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (item !== rP.accordionItem) {
                        item.active = false;
                    }
                }
                rP.accordionItem.active ? main_1.view.graphics.removeAll() : highlightRoads(rP);
            });
            accordion.appendChild(rP.accordionItem);
        });
        return { title: title, content: accordion };
    }
    exports.makePopupContent = makePopupContent;
    function getPetitionsByRoadName(roads) {
        //perhaps force the user to click on a single roadName?
        var selectedRoadNames = Array.from(new Set(roads.map(function (f) {
            //let roadName = "";
            return ["DIRPRE", "ROADNAME", "ROADTYPE", "DIRSUF"].reduce(function (roadName, a) {
                return roadName += (f.attributes[a] || "") + " ";
            }, "").split(" ").join(" ").trim();
        })));
        return { selectedRoadNames: selectedRoadNames, petitions: exports.currentRoadNameList.filter(function (f) {
                var roadName = f.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
                roadName = roadName.replace(/ ROAD$/, " RD").replace(/ AVENUE$/, " AVE").replace(/ TRAIL$/, " TRL").replace(/ LANE$/, " LN").replace(/\.$/, "");
                return selectedRoadNames.indexOf(roadName) > -1;
            }) };
    }
    function getPetitionsBySection(sections) {
        //perhaps force the user to click on a single roadName?
        var selectedTRSs = Array.from(new Set(sections.map(function (f) {
            //let roadName = "";
            return ["T" + f.attributes["TOWN"] + f.attributes["N_S"], "R" + f.attributes["RANGE"] + f.attributes["E_W"], "S" + f.attributes["SECTION"]].join(" ");
        })));
        return { selectedTRSs: selectedTRSs, petitions: legalDescriptionList.filter(function (f) {
                var tRS = ["T" + f.attributes["Township"], "R" + f.attributes["Range"], "S" + f.attributes["Section"]].join(" ");
                return selectedTRSs.indexOf(tRS) > -1;
            }) };
    }
    function legalDescriptionHover(lD) {
        sectionUtils_1.displaySection({ s: lD.s, t: Number(lD.t.slice(0, -1)), ns: lD.t.split("").pop(), r: Number(lD.r.slice(0, -1)), ew: lD.r.split("").pop() });
    }
    function highlightRoads(rP) {
        main_1.view.graphics.removeAll();
        var sections = geometryEngine.union(sectionUtils_1.getSectionGeoms(rP.legalDescriptions));
        var roads = roadUtils_1.getRoads(rP.currentRoadNames.concat(rP.originalRoadNames));
        var intersections = geometryEngine.intersect(roads.map(function (r) { return r.geometry; }), sections);
        intersections.map(function (intersection) {
            intersection && main_1.view.graphics.add(new Graphic({
                geometry: intersection,
                symbol: intersection.type === "polyline" ?
                    { type: "simple-line", width: 2.5, color: [255, 66, 66, 1] } :
                    { type: "simple-marker", color: [32, 174, 50, 1] }
            }));
        });
    }
});
//# sourceMappingURL=roadPetitions.js.map
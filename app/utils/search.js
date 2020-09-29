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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Search", "esri/widgets/Search/SearchSource", "esri/core/promiseUtils", "./roadPetitions"], function (require, exports, Search_1, SearchSource_1, promiseUtils, roadPetitions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeSearchWidget = void 0;
    Search_1 = __importDefault(Search_1);
    SearchSource_1 = __importDefault(SearchSource_1);
    promiseUtils = __importStar(promiseUtils);
    var searchWidget;
    var petitionsByNumber = new SearchSource_1.default({
        name: "Petitions by Number",
        placeholder: "petition number",
        getSuggestions: getSuggestionsByNumber,
        getResults: getResultsByNumber,
        popupEnabled: false
    });
    var petitionsByRoadName = new SearchSource_1.default({
        name: "Petitions by Road Name",
        placeholder: "road name",
        getSuggestions: getSuggestionsByRoadName,
        getResults: getResultsByRoadName,
        popupEnabled: false
    });
    function makeSearchWidget(view) {
        searchWidget = new Search_1.default({
            view: view,
            searchAllEnabled: true,
            sources: [petitionsByRoadName, petitionsByNumber],
            allPlaceholder: 'road name or petition number',
            locationEnabled: false,
            includeDefaultSources: false
        });
        view.ui.add(searchWidget, "top-right");
    }
    exports.makeSearchWidget = makeSearchWidget;
    function getSuggestionsByNumber(params) {
        return promiseUtils.create(function (res, rej) {
            try {
                res(Object.keys(roadPetitions_1.petitions).filter(function (petitionNumber) {
                    return String(petitionNumber).startsWith(params.suggestTerm.trim());
                }).map(function (petitionNumber) {
                    return {
                        key: "petitionNumber",
                        text: petitionNumber,
                        sourceIndex: params.sourceIndex
                    };
                }));
            }
            catch (error) {
                rej();
            }
        });
    }
    function getResultsByNumber(params) {
        var popup = params.view.popup;
        console.log(params.suggestResult);
        var term = params.suggestResult.text.trim();
        return promiseUtils.create(function (res, rej) {
            try {
                var results = Object.values(roadPetitions_1.petitions).filter(function (petition) {
                    return String(petition.petitionNumber).startsWith(term);
                });
                var title = "Search Results";
                if (results.length) {
                    popup.open({
                        title: "loading..."
                    });
                    var popupParams = roadPetitions_1.makePopupContent({ title: title, roadPetitions: results });
                    popup.content = popupParams.content;
                    popup.title = popupParams.title;
                    res([{
                            extent: null,
                            feature: { attributes: {}, geometry: null },
                            name: null
                        }]);
                }
            }
            catch (error) {
                rej(error);
            }
        });
    }
    function getSuggestionsByRoadName(params) {
        var searchTerm = params.suggestTerm.trim().split(" ").join(" ").toUpperCase();
        return promiseUtils.create(function (res, rej) {
            try {
                var roadNamesList_1 = Object.values(roadPetitions_1.petitions).reduce(function (roadNames, petition) {
                    roadNames.push.apply(roadNames, getRoadNames(petition, searchTerm));
                    return roadNames;
                }, []);
                roadNamesList_1 = roadNamesList_1.filter(function (rn, index) {
                    return roadNamesList_1.indexOf(rn) === index;
                }).sort();
                res(roadNamesList_1.map(function (roadName) {
                    return {
                        key: "roadName",
                        text: roadName,
                        sourceIndex: params.sourceIndex
                    };
                }));
            }
            catch (error) {
                console.log(error);
                rej(error);
            }
        });
    }
    function getResultsByRoadName(params) {
        var popup = params.view.popup;
        console.log(params.suggestResult);
        var term = params.suggestResult.text.trim().split(" ").join(" ").toUpperCase();
        return promiseUtils.create(function (res, rej) {
            try {
                var results = Object.values(roadPetitions_1.petitions).filter(function (petition) {
                    return getRoadNames(petition, term).length;
                }).sort(function (a, b) {
                    return a.petitionNumber - b.petitionNumber;
                });
                var title = "Search Results";
                if (results.length) {
                    popup.open({
                        title: "loading..."
                    });
                    var popupParams = roadPetitions_1.makePopupContent({ title: title, roadPetitions: results });
                    popup.content = popupParams.content;
                    popup.title = popupParams.title;
                    res([{
                            extent: null,
                            feature: { attributes: {}, geometry: null },
                            name: null
                        }]);
                }
            }
            catch (error) {
                console.error(error);
                rej(error);
            }
        });
    }
    function getRoadNames(petition, searchTerm) {
        var roadNames = [];
        roadNames.push.apply(roadNames, petition.currentRoadNames.filter(function (rn) {
            return rn.includes(searchTerm);
        }));
        roadNames.push.apply(roadNames, petition.originalRoadNames.filter(function (rn) {
            return rn.includes(searchTerm);
        }));
        return roadNames;
    }
});
//# sourceMappingURL=search.js.map
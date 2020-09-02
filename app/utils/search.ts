import SearchWidget from "esri/widgets/Search";
import SearchSource from "esri/widgets/Search/SearchSource";
import esriRequest from "esri/request";
import * as promiseUtils from "esri/core/promiseUtils";
import { roadsFL, petitions, makePopupContent, currentRoadNameList, originalRoadNameList, Petition } from "./roadPetitions";
import esri = __esri;

let searchWidget: esri.widgetsSearch;

const petitionsByNumber = new SearchSource({
  name: "Petitions by Number",
  placeholder: "petition number",
  getSuggestions: getSuggestionsByNumber,
  getResults: getResultsByNumber,
  popupEnabled: false
});

const petitionsByRoadName = new SearchSource({
  name: "Petitions by Road Name",
  placeholder: "road name",
  getSuggestions: getSuggestionsByRoadName,
  getResults: getResultsByRoadName,
  popupEnabled: false
});

export function makeSearchWidget(view) {
  searchWidget = new SearchWidget({
    view,
    searchAllEnabled: true,
    sources: [petitionsByRoadName, petitionsByNumber],
    includeDefaultSources: false 
  });
  view.ui.add(searchWidget, "top-left");  
}


function getSuggestionsByNumber(params) {
  return promiseUtils.create((res, rej) => {
    try {
      res(Object.keys(petitions).filter(petitionNumber => {
        return String(petitionNumber).startsWith(params.suggestTerm.trim());
      }).map(petitionNumber => {
        return {
          key: "petitionNumber",
          text: petitionNumber,
          sourceIndex: params.sourceIndex
        };
      }));      
    } catch (error) {
      rej();      
    }
    
  });
    
}
function getResultsByNumber(params) {
  let popup = params.view.popup;
  console.log(params.suggestResult);
  const term = params.suggestResult.text.trim();
  return promiseUtils.create((res, rej) => {
    try {
      let results = Object.values(petitions).filter(petition => {
        return String(petition.petitionNumber).startsWith(term);
      });    
      let title = "Search Results";
      if (results.length) {
        popup.open({
          title: "loading..."
        });        
        const popupParams = makePopupContent({title, roadPetitions: results});
        popup.content = popupParams.content;
        popup.title = popupParams.title;
        res([{
          extent: null,
          feature: {attributes: {}, geometry: null},
          name: null
        }]);
      }
    } catch (error) {
      rej(error);      
    }

  });
}

function getSuggestionsByRoadName(params) {
  const searchTerm = params.suggestTerm.trim().split(" ").join(" ").toUpperCase();
  return promiseUtils.create((res, rej) => {
    try {
      let roadNamesList = Object.values(petitions).reduce((roadNames, petition) => {
        roadNames.push(...getRoadNames(petition, searchTerm));
        return roadNames;
      }, []);
      roadNamesList = roadNamesList.filter((rn, index) => {
        return roadNamesList.indexOf(rn) === index;
      }).sort();
      res(roadNamesList.map(roadName => {
        return {
          key: "roadName",
          text: roadName,
          sourceIndex: params.sourceIndex
        };
      }));      
    } catch (error) {
      console.log(error);
      rej(error);      
    }    
  });    
}
function getResultsByRoadName(params) {
  let popup = params.view.popup;
  console.log(params.suggestResult);
  const term = params.suggestResult.text.trim().split(" ").join(" ").toUpperCase();
  return promiseUtils.create((res, rej) => {
    try {
      let results = Object.values(petitions).filter(petition => {
        return getRoadNames(petition, term).length;
      }).sort((a, b) => {
        return a.petitionNumber - b.petitionNumber;
      });
      let title = "Search Results";
      if (results.length) {
        popup.open({
          title: "loading..."
        });        
        const popupParams = makePopupContent({title, roadPetitions: results});
        popup.content = popupParams.content;
        popup.title = popupParams.title;
        res([{
          extent: null,
          feature: {attributes: {}, geometry: null},
          name: null
        }]);
      }
    } catch (error) {
      console.error(error);
      rej(error);      
    }
  });
}

function getRoadNames(petition: Petition, searchTerm: string) {
  const roadNames = [];
  roadNames.push(...petition.currentRoadNames.filter(rn => {
    return rn.includes(searchTerm);
  }));
  roadNames.push(...petition.originalRoadNames.filter(rn => {
    return rn.includes(searchTerm);
  }));
  return roadNames;
}

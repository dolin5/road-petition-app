import esri = __esri;
import {view} from "../main";
import PopupTemplate from "esri/PopupTemplate";
import QueryTask from "esri/tasks/QueryTask";
import * as promiseUtils from "esri/core/promiseUtils";
import esriRequest from "esri/request";

let roadsFL:esri.FeatureLayer;
let sectionsFL:esri.FeatureLayer;
let commissionMinutes:esri.Graphic[];
let currentRoadName:esri.Graphic[];
let legalDescription :esri.Graphic[];
let originalRoadName :esri.Graphic[];
let roadPetition:esri.Graphic[];

export function makeFeatureLayers(gcLayer:esri.MapImageLayer){
  gcLayer?.sublayers?.forEach(async (sublayer: esri.Sublayer) => {
    if (sublayer.title == "Roads") {
      roadsFL = await sublayer.createFeatureLayer();
      console.log(roadsFL);
    }
    else if (sublayer.title == "Sections") {
      sectionsFL = await sublayer.createFeatureLayer();
      console.log(sectionsFL);
    }
  });

  esriRequest(gcLayer.url, {
    query: {
        f: "json"
      },
      responseType: "json"
    }).then(queryTables);



}

function queryTables(gcServiceData:esri.RequestResponse){
  promiseUtils.eachAlways( gcServiceData.data.tables.map(t => {
    return promiseUtils.create(async(res,rej)=>{
      const qt = new QueryTask({
        url:gcServiceData.url+"/"+t.id
      })
      let results = await qt.execute({
        outFields:["*"],
        where:"1=1"
      })
      res({results,table:t});
    })        
  })).then(populateTableArrays)
}

function populateTableArrays(tableResults:esri.EachAlwaysResult){
  tableResults.forEach(response => {
    const tr = response.value;
    switch (tr.table.name) {
      case "Commission_Minutes":{
        commissionMinutes = tr.results.features;
        break;
      }
      case "Current_Road_Name":{
        currentRoadName = tr.results.features;
        break;
      }
      case "Legal_Description":{
        legalDescription = tr.results.features;
        break;
      }
      case "Original_Road_Name":{
        originalRoadName = tr.results.features;
        break;
      }
      case "Road_Petition":{
        roadPetition = tr.results.features;
        break;
      }
    }    
  });
}


export async function populatePopup(popup:esri.Popup,mapPoint:esri.Point){
  popup.open({
    title:"loading..."
  });
  const popupContent = await queryRoadPetitions(mapPoint)//.then(makePopupContent);
  popup.content = popupContent;
}

async function queryRoadPetitions(mapPoint:esri.Point){
  let query = {
    //query object
    geometry: mapPoint,
    units:"meters",
    distance: 5*view.resolution,
    spatialRelationship:"intersects",
    returnGeometry: true,
    outFields: ["*"],
  }
  return await promiseUtils.eachAlways([roadsFL.queryFeatures(query),sectionsFL.queryFeatures(query)]).then(results=>{
    const roadResults = results[0].value;
    const sectionResults = results[1].value;
    const roadPetitions = [];
    if (roadResults.features.length && sectionResults.features.length){
      return getPetitionsByRoadAndSection(roadResults.features,sectionResults.features);
    }
    if (!roadResults.features.length && sectionResults.features.length) return "section"
    if (!sectionResults.features.length) return "none"
  })
}

function getPetitionsByRoadAndSection(roads,sections){

  //perhaps force the user to click on a single roadName?
  let roadNames = Array.from(new Set(roads.map((f:esri.Graphic) => {
    //let roadName = "";
    return ["DIRPRE","ROADNAME","ROADTYPE","DIRSUF"].reduce((roadName,a)=>{
      return roadName += (f.attributes[a] || "")+" ";
    },"").split(" ").join(" ").trim();
  })));
  let section = sections[0];

  let roadNamePetitions = currentRoadName.filter(f=>{
    let roadName:string = f.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
    roadName = roadName.replace(/ ROAD$/," RD");
    return roadNames.indexOf(roadName)>-1;   
  })

  console.log(roadNames);
  

}

const makePopupContent= ()=>{};

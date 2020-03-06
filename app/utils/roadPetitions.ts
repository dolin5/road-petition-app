import esri = __esri;
import {view} from "../main";
import PopupTemplate from "esri/PopupTemplate";
import QueryTask from "esri/tasks/QueryTask";
import * as promiseUtils from "esri/core/promiseUtils";
import esriRequest from "esri/request";

interface Section {
  s:number;
  t:string;
  r:string;
}

interface CommissionMinutes {
  book:number;
  page:number;
}

interface PetitionParameters {
  Petition_Number:number
  Type:string
  Date_Filed:string
  Action_Taken:string
  Date_of_Action:string
  Resolution_Number:string
  Notes:string
  Petition_Images:string
  Other_Petition_Images:string
  DateRecordAdded:string
  Updated:Date;
  Test:string
}

class Petition {
  petitionNumber:number;
  type:string;
  dateFiled:string;
  actionTaken:string;
  dateOfAction:string;
  resolutionNumber:string;
  notes:string;
  petitionImages:string;
  otherPetitionImages:string;
  dateRecordAdded:string;
  updated:Date;
  currentRoadNames:string[];
  originalRoadNames:string[];
  commissionMinutes: CommissionMinutes[];
  legalDescriptions:Section[];
  constructor(params:PetitionParameters) {
    this.petitionNumber = params["Petition_Number"];
    this.type = params["Type"];
    this.dateFiled = params["Date_Filed"];
    this.actionTaken = params["Action_Taken"];
    this.dateOfAction = params["Date_of_Action"];
    this.resolutionNumber = params["Resolution_Number"];
    this.notes = params["Notes"];
    this.petitionImages = params["Petition_Images"];
    this.otherPetitionImages = params["Other_Petition_Images"];
    this.dateRecordAdded= params["DateRecordAdded"];
    this.updated= params["Updated"];
  }
}

let roadsFL:esri.FeatureLayer;
let sectionsFL:esri.FeatureLayer;
let commissionMinutesList:esri.Graphic[];
let currentRoadNameList:esri.Graphic[];
let legalDescriptionList :esri.Graphic[];
let originalRoadNameList :esri.Graphic[];
let roadPetitionList:esri.Graphic[];
let petitions:{number:Petition} = {};

export function makeFeatureLayers(gcLayer:esri.MapImageLayer){
  gcLayer?.sublayers?.forEach(async (sublayer: esri.Sublayer) => {
    if (sublayer.title == "Roads") {
      roadsFL = await sublayer.createFeatureLayer();
    }
    else if (sublayer.title == "Sections") {
      sectionsFL = await sublayer.createFeatureLayer();
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
        commissionMinutesList = tr.results.features;
        break;
      }
      case "Current_Road_Name":{
        currentRoadNameList = tr.results.features;
        processRoadNames();
        break;
      }
      case "Legal_Description":{
        legalDescriptionList = tr.results.features;
        break;
      }
      case "Original_Road_Name":{
        originalRoadNameList = tr.results.features;
        break;
      }
      case "Road_Petition":{
        roadPetitionList = tr.results.features;
        break;
      }
    }    
  });
  createPetitions();
}

function createPetitions(){
  roadPetitionList.forEach(rp => {
    let petition = new Petition(rp.attributes);
    petition.currentRoadNames = currentRoadNameList.reduce((roadNames:string[],rN:esri.Graphic)=>{
      if (rN.attributes.Petition_Number == petition.petitionNumber){
        let roadName:string = rN.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
        roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/\.$/,"");
        roadNames.push(roadName);
      }
      return roadNames;    
    },[])
    petition.originalRoadNames = originalRoadNameList.reduce((roadNames:string[],rN:esri.Graphic)=>{
      if (rN.attributes.Petition_Number == petition.petitionNumber){
        let roadName:string = rN.attributes["Original_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
        roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/\.$/,"");
        roadNames.push(roadName);
      }
      return roadNames;    
    },[])
  
    petition.legalDescriptions = legalDescriptionList.reduce((sections:Section[],lD:esri.Graphic)=>{
      if (lD.attributes.Petition_Number == petition.petitionNumber){
        let section:Section = {
          s:lD.attributes.Section,
          t:lD.attributes.Township,
          r:lD.attributes.Range
        };
        sections.push(section);
      }
      return sections;    
    },[])

    petition.commissionMinutes = commissionMinutesList.reduce((minutes:CommissionMinutes[],cM:esri.Graphic)=>{
      if (cM.attributes.Petition_Number == petition.petitionNumber){
        let minute:CommissionMinutes = {
          book:cM.attributes.Book;
          page:cM.attributes.Page
        };
        minutes.push(minute);
      }
      return minutes;    
    },[])
    petitions[petition.petitionNumber]= petition;
  });
};

function processRoadNames(){
  let roadTypes = currentRoadNameList.map(f=>{
    let roadNameSplit = f.attributes["Current_Road_Name"].trim().toUpperCase().split(" ");
    return roadNameSplit[roadNameSplit.length-1];   
  })
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
    let petitionsByRoadName:esri.Graphic[] = [];
    let petitionsBySection:esri.Graphic[] = []
    if (roadResults.features.length){
      petitionsByRoadName = getPetitionsByRoadName(roadResults.features);
    }
    if (sectionResults.features.length){
      petitionsBySection = getPetitionsBySection(sectionResults.features);
    }
    let petitionResults = []
    petitionsBySection.forEach(sP=>{


      petitionsByRoadName.forEach(rNP=>{

        if (rNP.attributes["Petition_Number"]===sP.attributes["Petition_Number"]){
          petitionResults.push(petitions[rNP.attributes.Petition_Number]);
        }
      })
    })

    return petitionResults;

    if (!roadResults.features.length && sectionResults.features.length) return "section"
    if (!sectionResults.features.length) return "none"
  })
}

function getPetitionsByRoadName(roads:esri.Graphic[]){
  //perhaps force the user to click on a single roadName?
  let selectedRoadNames = Array.from(new Set(roads.map((f) => {
    //let roadName = "";
    return ["DIRPRE","ROADNAME","ROADTYPE","DIRSUF"].reduce((roadName,a)=>{
      return roadName += (f.attributes[a] || "")+" ";
    },"").split(" ").join(" ").trim();
  })));

  return currentRoadNameList.filter(f=>{
    let roadName:string = f.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
    roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/\.$/,"");
    return selectedRoadNames.indexOf(roadName)>-1;   
  })
}

function getPetitionsBySection(sections:esri.Graphic[]){
  //perhaps force the user to click on a single roadName?
  let selectedTRSs = Array.from(new Set(sections.map((f) => {
    //let roadName = "";
    return f.attributes["TOWN"]+f.attributes["N_S"] + " " + f.attributes["RANGE"] + f.attributes["E_W"] + " " + f.attributes["SECTION"];
  })));
 
  return legalDescriptionList.filter(f=>{
    let tRS:string = [f.attributes["Township"],f.attributes["Range"],f.attributes["Section"]].join(" ");
   
    return selectedTRSs.indexOf(tRS)>-1;   
  })

}

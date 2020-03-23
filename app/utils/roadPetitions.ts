import esri = __esri;
import {view} from "../main";
import PopupTemplate from "esri/PopupTemplate";
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";
import * as promiseUtils from "esri/core/promiseUtils";
import esriRequest from "esri/request";

interface Table {
  id:number;
  name:string;
}

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
    this.dateFiled = params["Date_Filed"].replace(" 0:00:000","");
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
let petitions:{number?:Petition} = {};
let highlightGraphic:esri.Graphic;
let mouseIn:boolean=false;

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
  promiseUtils.eachAlways( gcServiceData.data.tables.map((t:Table) => {
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

function populateTableArrays(tableResults:esri.EachAlwaysResult[]){
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
        roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/ LANE$/," LN").replace(/\.$/,"");
        roadNames.push(roadName);
      }
      return roadNames;    
    },[]).sort()
    petition.originalRoadNames = originalRoadNameList.reduce((roadNames:string[],rN:esri.Graphic)=>{
      if (rN.attributes.Petition_Number == petition.petitionNumber){
        let roadName:string = rN.attributes["Original_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
        roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/ LANE$/," LN").replace(/\.$/,"");
        roadNames.push(roadName);
      }
      return roadNames;    
    },[]).sort()
  
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
    },[]).sort((a,b)=>{
      if (a.t != b.t){
        return (a.t<b.t)?-1:1
      }        
      else if (a.r != a.r){
        return (a.r<b.r)?-1:1
      }
      else if (a.s != b.s){
        return (a.s<b.s)?-1:1
      }
      return 0;
    })

    petition.commissionMinutes = commissionMinutesList.reduce((minutes:CommissionMinutes[],cM:esri.Graphic)=>{
      if (cM.attributes.Petition_Number == petition.petitionNumber){
        let minute:CommissionMinutes = {
          book:cM.attributes.Book,
          page:cM.attributes.Page
        };
        minutes.push(minute);
      }
      return minutes;    
    },[]).sort((a,b)=>{
      if (a.book != b.book){
        return (a.book<b.book)?-1:1
      }        
      else if (a.page != a.page){
        return (a.page<b.page)?-1:1
      }
      return 0;
    })
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
  const popupParams = await queryRoadPetitions(mapPoint).then(makePopupContent);
  popup.content = popupParams.content;
  popup.title = popupParams.title;
}

async function queryRoadPetitions(mapPoint:esri.Point){
  let query = new Query({
    //query object
    geometry: mapPoint,
    units:"meters",
    distance: 5*view.resolution,
    spatialRelationship:"intersects",
    returnGeometry: true,
    outFields: ["*"],
  })
  return await promiseUtils.eachAlways([roadsFL.queryFeatures(query),sectionsFL.queryFeatures(query)]).then((results:esri.EachAlwaysResult)=>{
    const roadResults = results[0].value.features;
    const sectionResults = results[1].value.features;
    let petitionsByRoadName:{selectedRoadNames:string[],petitions:(esri.Graphic[])};
    let petitionsBySection:{selectedTRSs:string[],petitions:(esri.Graphic[])};
    let title = "Road petitions";
    if (roadResults.length){
      petitionsByRoadName = getPetitionsByRoadName(roadResults);
    }
    if (sectionResults.length){
      petitionsBySection = getPetitionsBySection(sectionResults);
    }

    if (petitionsByRoadName?.selectedRoadNames.length){
      title += " for";
      petitionsByRoadName.selectedRoadNames.forEach(rN => {
        title += " " + rN + " or ";        
      });
      title = title.slice(0,-4);
    }

    if (petitionsBySection.selectedTRSs.length){
      title += " in";
      petitionsBySection.selectedTRSs.forEach(tRS=>{
        title+= " " + tRS + " or ";      
      })
      title = title.slice(0,-4);
    }
    let petitionResults:Petition[] = [];
    if (roadResults.length){
      petitionsBySection.petitions.forEach(sP=>{
        petitionsByRoadName.petitions.forEach(rNP=>{
          if (rNP.attributes["Petition_Number"]===sP.attributes["Petition_Number"]){
            petitionResults.push(petitions[rNP.attributes.Petition_Number]);
          }
        })
      })
    }
    else {
      petitionsBySection.petitions.forEach(sP=>{
        petitionResults.push(petitions[sP.attributes.Petition_Number]);
      })
    }
    let uniquePetitionNumbers = [];

    let petitionResults = petitionResults.filter((p,idx)=>{
      if (uniquePetitionNumbers.indexOf(p.petitionNumber)>-1){
        return false
      }
      uniquePetitionNumbers.push(p.petitionNumber);
      return true;      
    })
    

    return {title,roadPetitions:petitionResults.sort((a,b)=>{return a.petitionNumber-b.petitionNumber})};
  })
}

function makePopupContent(params){
  let title = params.title;
  let roadPetitions = params.roadPetitions;
  const accordion = document.createElement('calcite-accordion');
  Object.assign(accordion,{scale:"s",selectionMode:"single",iconPosition:"start"});
  roadPetitions.forEach(rP=>{
    const accordionItem = document.createElement('calcite-accordion-item');
    accordionItem.itemTitle = "Petition # "+rP.petitionNumber;
    //const rPTemplate = document.createElement('template');
    const parser = new DOMParser()
    const rPFragment = document.createRange().createContextualFragment(`
      <span><strong>Petition #&nbsp;:</strong> ${rP.petitionNumber}</span>
      <span><strong>Type:</strong> ${rP.type}</span>
      <span><strong>Date Filed:</strong> ${rP.dateFiled}</span>
      <span><strong>Original Road Name(s):</strong></span>
      <table name="original-road">
      <tbody>
      </tbody>
      </table>
      <span><strong>Current Road Name(s)</strong></span>
      <table name="current-road">
      <tbody>      
      </tbody>
      </table>      
      <span><strong>Action Taken:</strong> ${rP.actionTaken}</span>
      <span><strong>Resolution #:</strong> ${rP.resolutionNumber}</span>
      <span><strong>Notes:</strong> ${rP.notes}</span>
      <span><strong>Commission Minutes:</strong></span>
      <table name="commission-minutes">
      <tbody>
      </tbody>
      </table>
      <span><strong>Legal Description:</strong></span>
      <table name="legal-description">
      <tbody>
      <tr>
      <td>Section</td>
      <td>Township</td>
      <td>Range</td>
      </tr>
      </tbody>
      </table>
      <span><strong>Petition Images:</strong> ${rP.petitionImages}</span>
      <span><strong>Other Petition Images:</strong> ${rP.otherPetitionImages}</span>`
    )
    Array.from(rPFragment.children).forEach(e=>{
      if (e.tagName === "SPAN"){
        e.classList.add("road-petition-field")
      }  
      else if (e.tagName === "TABLE"){
        e.classList.add("road-petition-table")
        switch (e.getAttribute('name')){
          case "original-road": 
            if (!rP.originalRoadNames.length){
              const row = (e as HTMLTableElement).insertRow();
              row.innerText = "none";
            }
            rP.originalRoadNames.forEach(rN=>{
              const row = (e as HTMLTableElement).insertRow();
              row.innerText = rN;
            })
            break;                   
          case "current-road": 
            if (!rP.currentRoadNames.length){
              const row = (e as HTMLTableElement).insertRow();
              row.innerText = "none";
            }
            rP.currentRoadNames.forEach(rN=>{
              const row = (e as HTMLTableElement).insertRow();
              row.innerText = rN;
            })            
            break;     
          case "commission-minutes": 
            rP.commissionMinutes.forEach(cM=>{
              const row = (e as HTMLTableElement).insertRow();
              row.innerText = "Book "+cM.book + " Page " + cM.page;
            })
            break;    
          case "legal-description":             
            rP.legalDescriptions.forEach(lD=>{
              const row = (e as HTMLTableElement).insertRow();
              Object.values(lD).forEach(val=>{
                const cell = row.insertCell();
                cell.innerText = val;
              })
              row.addEventListener("mouseenter",()=>{
                mouseIn=true;
                row.classList.add("blue-row");
                legalDescriptionEnter(lD)
              });
              row.addEventListener("mouseleave",()=>{
                mouseIn=false;
                row.classList.remove("blue-row");
                view.graphics.removeAll();
              })
              //row.innerText = lD.s + "     " + lD.t + "     "+ lD.r;
            })
            break;     
        }
      }    
      accordionItem.appendChild(e);
    })
    accordion.appendChild(accordionItem);
  })
  return {title,content:accordion};
}
 
function getPetitionsByRoadName(roads:esri.Graphic[]){
  //perhaps force the user to click on a single roadName?
  let selectedRoadNames = Array.from(new Set(roads.map((f) => {
    //let roadName = "";
    return ["DIRPRE","ROADNAME","ROADTYPE","DIRSUF"].reduce((roadName,a)=>{
      return roadName += (f.attributes[a] || "")+" ";
    },"").split(" ").join(" ").trim();
  })));

  return {selectedRoadNames,petitions:currentRoadNameList.filter(f=>{
    let roadName:string = f.attributes["Current_Road_Name"].split(" ").join(" ").trim(" ").toUpperCase();
    roadName = roadName.replace(/ ROAD$/," RD").replace(/ AVENUE$/," AVE").replace(/ TRAIL$/," TRL").replace(/ LANE$/," LN").replace(/\.$/,"");
    return selectedRoadNames.indexOf(roadName)>-1;   
  })}
}

function getPetitionsBySection(sections:esri.Graphic[]){
  //perhaps force the user to click on a single roadName?
  let selectedTRSs = Array.from(new Set(sections.map((f) => {
    //let roadName = "";
    return ["T"+f.attributes["TOWN"]+f.attributes["N_S"], "R"+f.attributes["RANGE"] + f.attributes["E_W"], "S" +f.attributes["SECTION"]].join(" ");
  })));
 
  return {selectedTRSs,petitions:legalDescriptionList.filter(f=>{
    let tRS:string = ["T"+f.attributes["Township"],"R"+f.attributes["Range"],"S"+f.attributes["Section"]].join(" ");
    return selectedTRSs.indexOf(tRS)>-1;   
  })}

}

function legalDescriptionEnter(lD:Section){
  const TOWN = lD.t.slice(0,-1);
  const NS = lD.t.split("").pop();
  const RANGE = lD.r.slice(0,-1);
  const EW = lD.r.split("").pop();  
  const where = `SECTION = ${lD.s} AND TOWN = ${TOWN} AND N_S = '${NS}' AND RANGE = ${RANGE} AND E_W = '${EW}'`;  
  sectionsFL.queryFeatures({
    where,
    outFields:[],
    returnGeometry:true
  }).then(results=>{
    results.features.forEach(f=>{
      if (mouseIn){
        f.symbol = {
          type: "simple-fill",
          outline: { width: 2.25, color: [0, 255, 197, 1] },
          color: [0, 169, 230, 0]
        };
        view.graphics.removeAll();
        view.graphics.add(f);
      }
      
    })
  })
}

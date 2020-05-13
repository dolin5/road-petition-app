import {view} from "../main";
import esri = __esri;

let roadGraphics: esri.Graphic[];

export function getRoadGraphics(fl: esri.FeatureLayer) {
  let outFields = ['DIRPRE','ROADNAME','ROADTYPE','DIRSUF'];
  fl.queryFeatures({
    where: "1=1",
    outFields,
    outSpatialReference: view.spatialReference,
    returnGeometry: true
  }).then(({features}: {features: esri.Graphic[]}) => {
    roadGraphics = features.map(feature => {
      feature.roadName = outFields.reduce((roadName,field)=>{
        return feature.attributes[field] ? (roadName + " " + feature.attributes[field]).trim() : roadName;
    },"") 
      return feature;
    });
  });
}

export function getRoads(roadNames:string[]){
  return roadGraphics.filter(feature=>{
    return roadNames.indexOf(feature.roadName)>=0;
  });
}
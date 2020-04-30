import GraphicsLayer from "esri/layers/GraphicsLayer";
import {view} from "../main"
import esri = __esri;

interface Section {
  s:number;
  t:number;
  ns:string;
  r:number;
  ew:string;
}

//let sectionGraphicsLayer = new GraphicsLayer();

export let sectionGraphics:esri.Graphic[];

export function getSectionGraphics(fl:esri.FeatureLayer){
  fl.queryFeatures({
    where:'1=1',
    outFields:['*'],
    outSpatialReference:view.spatialReference,
    returnGeometry:true
  }).then(({features}:{features:esri.Graphic[]})=>{
    sectionGraphics = features;
  })
}

export function displaySection(section:Section){
  let fs = sectionGraphics.filter(g=>{
    return (
      g.attributes.SECTION == section.s &&
      g.attributes.TOWN == section.t &&
      g.attributes.N_S == section.ns &&
      g.attributes.RANGE == section.r &&
      g.attributes.E_W == section.ew)
  });
  if (fs.length){
    fs[0].symbol = {
      type: "simple-fill",
      outline: { width: 2.25, color: [0, 255, 197, 1] },
      color: [0, 169, 230, 0]
    };
    view.graphics.removeAll();
    view.graphics.add(fs[0]);
  }
} 
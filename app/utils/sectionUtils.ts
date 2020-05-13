import GraphicsLayer from "esri/layers/GraphicsLayer";
import * as geometryEngine from "esri/geometry/geometryEngine";
import { view } from "../main";
import esri = __esri;

interface PetitionSection {
  s: number;
  t: string;
  r: string;
}

interface Section {
  s: number;
  t: number;
  ns: string;
  r: number;
  ew: string;
}

export let sectionGraphics: esri.Graphic[];
export let selectionSections: esri.Graphic[];
export let highlightGraphic:esri.Graphic

export function getSectionGraphics(fl: esri.FeatureLayer) {
  fl.queryFeatures({
    where: "1=1",
    outFields: ["*"],
    outSpatialReference: view.spatialReference,
    returnGeometry: true
  }).then(({features}: {features: esri.Graphic[]}) => {
    sectionGraphics = features.map(feature => {
      feature.section = {
        s: feature.attributes.SECTION, 
        t: feature.attributes.TOWN + feature.attributes.N_S,
        r: feature.attributes.RANGE + feature.attributes.E_W
      };
      return feature;
    });
  });
}

export function displaySection(section: Section) {
  let fs = sectionGraphics.filter(g => {
    return (
      g.attributes.SECTION === section.s &&
      g.attributes.TOWN === section.t &&
      g.attributes.N_S === section.ns &&
      g.attributes.RANGE === section.r &&
      g.attributes.E_W === section.ew);
  });
  if (fs.length) {
    fs[0].symbol = {
      type: "simple-fill",
      outline: { width: 2.25, color: [0, 255, 197, 1] },
      color: [0, 169, 230, 0]
    };
    //view.graphics.removeAll();
    view.graphics.remove(highlightGraphic);
    highlightGraphic = fs[0];    
    view.graphics.add(highlightGraphic);
  }
} 

function trimBySections(geoms: esri.Polyline[], sections: Section[]) {
  let paths = [];
  for (let geom of geoms) {
    geometryEngine.intersect(geoms, sections);
  }
}

export function getSectionGeoms(rPSections: PetitionSection[]) {
  return sectionGraphics.filter((sg) => {
    for (let rPSection of rPSections) {
      if (sg.section.s === rPSection.s && sg.section.t === rPSection.t && sg.section.r === rPSection.r) {
        return true;
      }
    }
    return false;
  }).map(sG=>{
    return sG.geometry;
  });
}

export function removeSectionHighlightGraphic(){
  view.graphics.remove(highlightGraphic);
}
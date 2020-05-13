import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Search from "esri/widgets/Search";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";
import TileLayer from "esri/layers/TileLayer";
import MapImageLayer from "esri/layers/MapImageLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import * as watchUtils from "esri/core/watchUtils";
import { populatePopup, makeFeatureLayers } from "./utils/roadPetitions";
import { makeSearchWidget } from "./utils/search";
import esri = __esri;

const basemap = new Basemap({
  baseLayers: [
    new TileLayer({
      portalItem: {
        id: "1b243539f4514b6ba35e7d995890db1d" // World Hillshade
      }
    }),
    new VectorTileLayer({
      portalItem: {
        id: "c120ccac56e64e5a94d58d86063799d3"
      }
    }) 
  ]  
});

const townshipsLayer = new FeatureLayer({
  url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver/2"
});

const sectionsLayer = new FeatureLayer({
  url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver/3"
});

const roadsVTLayer = new VectorTileLayer({
  portalItem: {
    id: "107474a0debf4232a68c93690eaf3e84"
  }
});

export const gcLayer = new MapImageLayer({
  url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver",
  opacity: 0
});

gcLayer.when(makeFeatureLayers);

const map = new EsriMap({
  basemap,
  layers: [gcLayer, sectionsLayer, townshipsLayer, roadsVTLayer]
});

export const view = new MapView({
  map: map,
  container: "viewDiv",
  center: [-111.244, 45.752], 
  zoom: 10,
  constraints: {
    rotationEnabled: false
  },
  padding: {
    top: 50
  },
  popup: {
    actions: [],
    dockEnabled: true,
    dockOptions: {
      buttonEnabled: true,
      breakpoint: false
    }
  }
});

makeSearchWidget(view);


view.when(() => {
  view.popup.autoOpenEnabled = false;
  view.on("click", function(event) {
    view.graphics.removeAll();
    if (event && event.mapPoint) {
      populatePopup(view.popup, event.mapPoint);
    } else {
      view.popup.open({
        // Set the popup's title to the coordinates of the location
        title: "Invalid point location",
        location: event.mapPoint, // Set the location of the popup to the clicked location
        content: "Please click on a valid location."
      });
    }
  });
});

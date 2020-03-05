import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";
import TileLayer from "esri/layers/TileLayer";
import MapImageLayer from "esri/layers/MapImageLayer";
import * as watchUtils from "esri/core/watchUtils";
import { populatePopup, makeFeatureLayers } from "./utils/roadPetitions";

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

const gcLayer = new MapImageLayer({
  url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/RoadPetition/Mapserver"
});

gcLayer.when(makeFeatureLayers);

const map = new EsriMap({
  basemap,
  layers: [gcLayer]
});

export const view = new MapView({
  map: map,
  container: "viewDiv",
  center: [-111.244, 45.752], 
  zoom: 10,
  popup: {
    actions: [],
    dockEnabled: true,
    dockOptions: {
      buttonEnabled: true,
      breakpoint: false
    }
  }
});

view.when(() => {
  view.popup.autoOpenEnabled = false;
          view.on("click", function(event) {
            // Make sure that there is a valid latitude/longitude

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

let numDays = 9;
var selectDate, legend, map, layer, EPSG4326, dayInput, imageInput;
var currentDay, currentImage;

// -----------------------------------------------------
// Create date inputs
// -----------------------------------------------------
var today = new Date();
var day = new Date(today.getTime());
var dates = [];
var datesHTML = "<select id=dates><option>Select a Date</option>";

for (let i = 0; i < numDays; i++) {
  newDay = new Date(today.getTime());
  newDay.setUTCDate(today.getUTCDate() - Number.parseInt(i));
  newDay = newDay.toISOString().split("T")[0];
  dates.push(newDay);

  datesHTML += "<option>";
  datesHTML += newDay;
  datesHTML += "</option>";
}
datesHTML += "</select>";

// -----------------------------------------------------
// Create image inputs
// -----------------------------------------------------
var imagesHTML = "<select id=images><option>Select Imagery</option>";
imagesHTML +=
  "<option>" + "MODIS_Terra_CorrectedReflectance_TrueColor" + "</option>";
imagesHTML +=
  "<option>" + "MODIS_Terra_CorrectedReflectance_Bands721" + "</option>";
imagesHTML +=
  "<option>" + "MODIS_Terra_CorrectedReflectance_Bands367" + "</option>";
imagesHTML += "</select>";

// -----------------------------------------------------
// Set up application
// -----------------------------------------------------
function setup() {
  startDay = dates[2];
  xStart = 32.814474854149005;
  yStart = -117.21163006825216;
  zoomStart = 6;
  startImage = "MODIS_Terra_CorrectedReflectance_TrueColor";

  noCanvas();
  makeMap(xStart, yStart, zoomStart);
  addImagery(startImage, startDay);
}

// -----------------------------------------------------
// Define functions
// -----------------------------------------------------
function makeMap(xIn, yIn, zoomIn) {
  EPSG4326 = new L.Proj.CRS(
    "EPSG:4326",
    "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    {
      origin: [-180, 90],
      resolutions: [
        0.5625,
        0.28125,
        0.140625,
        0.0703125,
        0.03515625,
        0.017578125,
        0.0087890625,
        0.00439453125,
        0.002197265625,
      ],
      bounds: L.Bounds([
        [-180, -90],
        [180, 90],
      ]),
    }
  );

  map = L.map("map", {
    center: [xIn, yIn],
    zoom: zoomIn,
    maxZoom: 12,
    crs: EPSG4326,
    maxBounds: [
      [-120, -220],
      [120, 220],
    ],
    fadeAnimation: false,
  });
}

function addImagery(imageName, dayIn) {
  var template =
    "//gibs-{s}.earthdata.nasa.gov/wmts/epsg4326/best/" +
    "{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg";

  layer = L.tileLayer(template, {
    layer: imageName,
    tileMatrixSet: '250m',
    time: dayIn,
    tileSize: '512',
    subdomains: "abc",
    noWrap: true,
    continuousWorld: true,
    bounds: [
      [-89.9999, -179.9999],
      [89.9999, 179.9999],
    ],
    attribution:
      '<a href="https://wiki.earthdata.nasa.gov/display/GIBS">' +
      "NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;",
  });
  map.addLayer(layer);
  console.log(layer.options.time);

  currentDay = layer.options.time;
  currentImage = layer.options.layer;
  
  layerName = layer.options.layer;
  layerName = layerName.replace(/[_-]/g, " ");
  layerDate = layer.options.time;
  layerResolution = layer.options.tileMatrixSet;

  legend = L.control({ position: "topright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>" + layerName + "</h4>";
    div.innerHTML += "Date: " + layerDate + ", ";
    div.innerHTML += "Resolution: " + layerResolution + "<br>";
    return div;
  };
  legend.addTo(map);

  selectImage = L.control({ position: "topright" });
  selectImage.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = imagesHTML;
    div.firstChild.onmousedown = div.firstChild.ondblclick =
      L.DomEvent.stopPropagation;
    return div;
  };
  selectImage.addTo(map);

  $("#images").change(function () {
    newImage = this.value;       
    map.removeLayer(layer);
    map.removeControl(legend);
    map.removeControl(selectDate);
    map.removeControl(selectImage);
    addImagery(newImage, currentDay);
  });

  selectDate = L.control({ position: "topright" });
  selectDate.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = datesHTML;
    div.firstChild.onmousedown = div.firstChild.ondblclick =
      L.DomEvent.stopPropagation;
    return div;
  };
  selectDate.addTo(map);

  $("#dates").change(function () {
    newDay = this.value;
    map.removeLayer(layer);
    map.removeControl(legend);
    map.removeControl(selectDate);
    map.removeControl(selectImage);
    addImagery(currentImage, newDay);
  });
}

// -----------------------------------------------------
// Resources, Works Referenced, and Authorship
// -----------------------------------------------------
// NASA GIBS Web Examples:
// https://github.com/nasa-gibs/gibs-web-examples
//
// Packages:
// Leaflet (https://github.com/Leaflet/Leaflet)
// jQuery 3.6.0 slim (https://github.com/jquery/jquery)
// proj4 (https://github.com/proj4js/proj4js)
// proj4leaflet (https://kartena.github.io/Proj4Leaflet/)
//
// Written by Emily Deardorff, Nov 2021

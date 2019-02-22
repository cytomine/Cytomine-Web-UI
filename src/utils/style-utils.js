import {Style, Stroke, Fill, Circle, Text} from "ol/style"; // TODO: use vuelayers functions?
import {MultiPoint} from "ol/geom";
import {asArray as hexToRgb} from "ol/color";

// -----

export function isCluster(feature) {
    let annot = feature.get("annot");
    if(annot == null) {
        return;
    }
    return annot.count != null;
}

// -----

function createStroke(opacity=0.5) {
    return new Stroke({color: [0, 0, 0, opacity], width: 2});
}

export function createColorStyle(color, opacity=0.5) {
    let colorArray = hexToRgb(color);

    let colorWithOpacity = colorArray.slice();
    colorWithOpacity[3] = opacity;
    let fill = new Fill({color: colorWithOpacity});

    let circleStyle = new Circle({
        radius: 5,
        fill: new Fill({color: colorArray}),
        stroke: createStroke(1),
    });
    circleStyle.setOpacity(opacity);

    return new Style({
        fill,
        stroke: createStroke(opacity),
        image: circleStyle
    });
}

// -----

let textFill = new Fill({color: "#fff"});
let textStroke = new Stroke({color: "#000", width: 3});

export function createTextStyle(text, fontSize="22px", fill=textFill, stroke=textStroke) {
    return new Style({
        text: new Text({
            text,
            font: `${fontSize} Arial, sans-serif`,
            overflow: true,
            fill,
            stroke
        })
    });
}

// -----

let width = 2;

let blue = [0, 153, 255, 1];
let white = [255, 255, 255, 1];
let orange = [255, 204, 0];

let blueStroke = new Stroke({color: blue, width: width});
let orangeStroke = new Stroke({color: orange, width: width});
let whiteStroke = new Stroke({color: white, width: width + 2});

export let selectStyles = [
    new Style({ stroke: whiteStroke }),
    new Style({ stroke: blueStroke }),
    new Style({ image: new Circle({radius: 6, stroke: blueStroke}) })
];

export let verticesStyle = new Style({
    image: new Circle({radius: width + 1, fill: new Fill({color: blue})}),
    geometry: function(feature) {
        // return the coordinates of the first ring of the polygon
        var coordinates = feature.getGeometry().getCoordinates()[0];
        return new MultiPoint(coordinates);
    }
});

export let highlightStyles = [
    new Style({ stroke: whiteStroke }),
    new Style({ stroke: orangeStroke }),
    new Style({ image: new Circle({radius: 6, stroke: orangeStroke}) })
];

// -----

export function changeOpacity(style, opacity) {
    let color = style.getStroke().getColor();
    color[3] = opacity;
    color = style.getFill().getColor();
    color[3] = opacity;
    style.getImage().setOpacity(opacity);
}

// -----

function createDefaultColor(name, hexaCode) {
    return {
        name,
        fill: new Fill({color: "#" + hexaCode}),
        hexaCode
    };
}

export const defaultColors = Object.freeze([
    createDefaultColor("black", "000000"),
    createDefaultColor("white", "ffffff"),
    createDefaultColor("red", "ff0000"),
    createDefaultColor("orange", "ff6600"),
    createDefaultColor("yellow", "ffff00"),
    createDefaultColor("green", "008000"),
    createDefaultColor("blue", "0000ff"),
    createDefaultColor("purple", "800080")
]);

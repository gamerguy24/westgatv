const key = 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=y9ll4swt9c9AYv0zu5O6';
const map = L.map('mapid', {
    zoomControl: false,
    minZoom: 2.5,
    zoomSnap: 0,
    terrainControl: false,
    geolocateControl: false,
    easeLinearity: 0.4,
    bounceAtZoomLimits: false,
    maxBounds: [[-84, -180], [84, 180]], // Restrict map boundaries
    maxBoundsViscosity: 0.9 // Ensure the map view stops at the boundaries
}).setView([38.0, -100.4], 4);

/*
// Save position feature
map.on('moveend', () => {
    const bounds = map.getBounds();
    const zoomLevel = map.getZoom();

    setTimeout(() => map.resize(), 0);

    // Fetch data based on the current bounds and zoom level if needed
});
*/

// Create custom pane for label overlay
map.createPane('labelPane');
map.getPane('labelPane').style.zIndex = 200; // Higher z-index for labels

// Light Mode Layer
const lightModeLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/d3bdcfa3-d8d8-4bc1-958d-6d1780cb4de1/style.json?key=drXsj04WIDowwjjOrinL'
});

// Dark Mode Layer (base layer)
const darkModeLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/3d1b9c2b-3b90-4457-8310-fbd15c34d453/style.json?key=HKGa1lnD7ToUuzx5Ohp0'
});

// Label Layer (overlay on top of all modes)
const darkModeLabelLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/645f642d-36b4-42d1-8b02-b9968eff3443/style.json?key=HKGa1lnD7ToUuzx5Ohp0',
    pane: 'labelPane', // Higher z-index pane for overlay
    navigationControl: false,
    geolocateControl: false
});

// Satellite Layer
const satelliteLayer = L.maptilerLayer({
    apiKey: key,
    style: 'https://api.maptiler.com/maps/dd940e48-cc35-41f3-b8e6-3942e4a1f75b/style.json?key=HKGa1lnD7ToUuzx5Ohp0'
});

let currentMapLayer;

// Add after existing variable declarations

// Function to set the map type and manage layers
function setMapType(type) {
    // Remove the current base layer
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }

    // Remove dark mode layer if switching away from dark mode
    if (type !== 'dark' && map.hasLayer(darkModeLayer)) {
        map.removeLayer(darkModeLayer);
    }

    // Set the base layer based on the selected type
    if (type === 'light') {
        currentMapLayer = lightModeLayer;
        map.addLayer(darkModeLabelLayer);  // Add label layer to light mode
    } else if (type === 'dark') {
        currentMapLayer = darkModeLayer;
        map.addLayer(darkModeLayer);       // Add dark mode base layer
        map.addLayer(darkModeLabelLayer);  // Add label layer to dark mode
    } else if (type === 'satellite') {
        currentMapLayer = satelliteLayer;
        map.addLayer(darkModeLabelLayer);  // Add label layer to satellite mode
    }

    // Add the selected base layer to the map
    if (currentMapLayer) {
        map.addLayer(currentMapLayer);
    }

    // Shift the map slightly to the right
    const center = map.getCenter();
    map.setView([center.lat, center.lng + 0.000000001], map.getZoom(), { animate: false });

    // Save selected map type to localStorage
    localStorage.setItem('selectedMapLayer', type);
}

// Function to load the saved map type or default to dark mode
function loadSavedMapType() {
    const savedType = localStorage.getItem('selectedMapLayer') || 'dark'; // Default to dark
    setMapType(savedType);

    // Ensure the corresponding radio button is checked
    document.querySelector(`input[name="map-type"][value="${savedType}"]`).checked = true;
}

// Call the function to load the map type on page load
loadSavedMapType();


map.attributionControl.setPrefix(false); // Removes the "Leaflet" text
// Remove the attribution control if it exists
if (map.attributionControl) {
    map.attributionControl.remove();
}
        var apiData = {};
        var mapFrames = [];
        var lastPastFramePosition = -1;
        var radarLayers = [];
        var polygons = [];

const reportMarkers = {};


        
        var doFuture = true;
        
        var optionKind = 'radar';
        
        var optionTileSize = 256;
        var optionColorScheme = 6; // Default color scheme for radar
        var optionSmoothData = 1;
        var optionSnowColors = 1;
        
        var radarOpacity = 0.7;
        var alertOpacity = 0.4;
        var watchOpacity = 0.6;
        
        var animationPosition = 0;
        var animationTimer = false;
        
        var loadingTilesCount = 0;
        var loadedTilesCount = 0;

        var radarON = true;
        var satelliteON = false;
        var alertON = true;
        var watchesON = true;
        var allalerts = [];
        
        var displayTorReports = true;
        var displayWndReports = true;
        var displayHalReports = true;

        var alertData = [];
        var allalerts = [];
        
        var displayFloodWarnings = true;
        var displayFFloodWarnings = true;
        var displayOtherWarnings = true;
        var displaySpecWarnings = true;
        var displayTorWarnings = true;
        var displaySvrWarnings = true;
        var displayTorWatches = true;
        var displaySvrWatches = true;

        var watchPolygons = {};

var watchesLoaded = false;
var alertsLoaded = false;

// Save settings to localStorage
function saveSettings() {
    const settings = {
        radarOpacity,
        alertOpacity,
        watchOpacity,
        optionKind,
        optionTileSize,
        optionColorScheme,
        optionSmoothData,
        optionSnowColors,
        radarON,
        satelliteON,
        alertON,
        watchesON,
        reportsON, // Save the report markers toggle state
        hurricanesON, // Save the hurricane layers toggle state
        spottersON, // Save the spotter toggle state
        selectedOutlooks: [], // Store selected checkmarks
        mapType: currentMapLayer ? currentMapLayer.options.style : 'light', // Save the current map type
    };

    // Save selected checkmarks for outlooks
    document.querySelectorAll('input[type=checkbox]').forEach((elem) => {
        if (elem.checked) {
            settings.selectedOutlooks.push(elem.value);
        }
    });

    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('weatherAppSettings'));
    if (settings) {
        radarOpacity = settings.radarOpacity;
        alertOpacity = settings.alertOpacity;
        watchOpacity = settings.watchOpacity;
        optionKind = settings.optionKind || 'radar'; // Default to 'radar' if not set
        optionTileSize = settings.optionTileSize;
        optionColorScheme = settings.optionColorScheme;
        optionSmoothData = settings.optionSmoothData;
        optionSnowColors = settings.optionSnowColors;
        radarON = settings.radarON;
        satelliteON = settings.satelliteON;
        alertON = settings.alertON;
        watchesON = settings.watchesON;
        reportsON = settings.reportsON;
        hurricanesON = settings.hurricanesON !== undefined ? settings.hurricanesON : true; // Default to true if not set
        spottersON = settings.spottersON || false;

        // Load and apply selected checkmarks for outlooks
        if (settings.selectedOutlooks && settings.selectedOutlooks.length > 0) {
            settings.selectedOutlooks.forEach(outlookType => {
                const checkbox = document.querySelector(`input[value="${outlookType}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    const day = outlookType.split('_')[1];
                    updateOutlookType(day, outlookType); // Load the corresponding outlook layer
                }
            });
        }

        // Restore the map view (center and zoom)
        if (settings.mapCenter && settings.mapZoom) {
            const center = [settings.mapCenter.lat, settings.mapCenter.lng];
            map.setView(center, settings.mapZoom);
        }

        // Restore report markers toggle
        if (settings.reportsON) {
            reportsON = settings.reportsON;
            if (reportsON) {
                startAutoRefresh(); // Start auto-refreshing if reports are on
            } else {
                stopAutoRefresh();
            }
        }

        // Restore spotter toggle
        const spotterButton = document.getElementById('spotter-button');
        if (spotterButton) {
            if (spottersON) {
                spotterButton.style.backgroundColor = "white";
                spotterButton.style.color = "#7F1DF0";
                spotterButton.style.border = "2px solid #636381";
                updateSpotters();
                if (!spotterUpdateInterval) {
                    spotterUpdateInterval = setInterval(updateSpotters, 60000);
                }
            } else {
                spotterButton.style.backgroundColor = "#636381";
                spotterButton.style.color = "white";
                spotterButton.style.border = "2px solid white";
            }
        }

        // Update UI labels, sliders, and buttons
        document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
        document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
        document.getElementById('colors').value = optionColorScheme;

        // Update sliders and their values
        document.getElementById('alert-opacity-slider').value = alertOpacity;
        document.getElementById('alert-opacity-value').textContent = alertOpacity;
        document.getElementById('radar-opacity-slider').value = radarOpacity;
        document.getElementById('radar-opacity-value').textContent = radarOpacity;

        // Update radar type radio button
        document.querySelector(`input[name="radar-type"][value="${optionKind}"]`).checked = true;

        // Update button styles based on state
        const alertButton = document.getElementById("refreshalerts");
        alertButton.style.backgroundColor = alertON ? "white" : "#636381";
        alertButton.style.color = alertON ? "#7F1DF0" : "white";
        alertButton.style.border = alertON ? "#636381 2px solid" : "2px solid white";

        const alertsMenuButton = document.getElementById("alerts-menu-button");
        alertsMenuButton.style.backgroundColor = alertON ? "white" : "#636381";
        alertsMenuButton.style.color = alertON ? "#7F1DF0" : "white";
        alertsMenuButton.style.border = alertON ? "#636381 2px solid" : "2px solid white";

        const watchButton = document.getElementById("togglewatches");
        watchButton.style.backgroundColor = watchesON ? "white" : "#636381";
        watchButton.style.color = watchesON ? "#7F1DF0" : "white";
        watchButton.style.border = watchesON ? "#636381 2px solid" : "2px solid white";

        // Update hurricane button state
        const hurricaneButton = document.getElementById("toggle-hurricanes");
        hurricaneButton.style.backgroundColor = hurricanesON ? "white" : "#636381";
        hurricaneButton.style.color = hurricanesON ? "#7F1DF0" : "white";

        // Toggle hurricane layer based on saved settings
        toggleHurricanes(hurricanesON);
    } else {
        // If no settings found, ensure default state
        hurricanesON = true; // Default hurricane layer to ON
        toggleHurricanes(hurricanesON); // Show the hurricane layer by default
    }

    // Ensure initialization with the loaded radar type
    initialize(apiData, optionKind);
}

// Event listener for checkboxes to toggle outlook layers and save settings
document.querySelectorAll('input[type=checkbox]').forEach((elem) => {
    elem.addEventListener('change', function () {
        const outlookType = this.value;
        if (this.checked) {
            // Uncheck all other checkboxes before checking the current one
            document.querySelectorAll('input[type=checkbox]').forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });

            const day = outlookType.split('_')[1];
            updateOutlookType(day, outlookType);
        } else if (!this.checked && currentLayer) {
            removeCurrentLayer(() => {
                lastSelectedOutlook = '';
            });
        }

        // Save settings after any change
        saveSettings();
    });
});

// Call loadSettings when the page is ready to load saved settings
document.addEventListener('DOMContentLoaded', function () {
    loadSettings();
});

map.createPane('polygonPane');
map.getPane('polygonPane').style.zIndex = 400; // higher z-index for polygon

map.createPane('borderPane');
map.getPane('borderPane').style.zIndex = 300; // lower z-index for border


let isThrottled = false;
map.on('move', () => {
    if (!isThrottled) {
        isThrottled = true;
        setTimeout(() => {
            // Update radar loop or data
            isThrottled = false;
        }, 400); // Adjust delay as needed
    }
});

function debounce(fn, delay, immediate = false) {
    let timer = null;
    return function (...args) {
        const context = this;

        const later = () => {
            timer = null;
            if (!immediate) fn.apply(context, args);
        };

        const callNow = immediate && !timer;

        clearTimeout(timer);
        timer = setTimeout(later, delay);

        if (callNow) fn.apply(context, args);
    };
}



document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // Load settings when the page loads
});
        function formatTimestamp(isoTimestamp) {
            const date = new Date(isoTimestamp);
            const options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
            };
            return date.toLocaleString('en-US', options);
        }
        
        function reverseSubarrays(arr) {
            return arr.map(subArr => subArr.slice().reverse());
        }
        
        function findPair(list, target) {
            for (let i = 0; i < list.length; i++) {
                if (list[i][0] === target) {
                    return list[i][1];
                }
            }
            return null;
        }
        
         document.querySelectorAll("a").forEach(function(item) {
            if (item.href == "https://www.maptiler.com/") {
                item.style.bottom = "58px";
                item.style.left = "6px";
            }
        });
        
        function findPairInDictionary(dicts, target) {
            for (const dict of dicts) {
                console.log(dict + " with target " + target);
                console.log(alertData);
                if (target in dict) {
                    return dict[target];
                }
            }
            console.log("Couldn't find obj.");
        }
        
        function convertDictsToArrayOfArrays(arr) {
            return arr.map(obj => Object.values(obj));
        }
        
       function getAlert(alertInfo) {
    var alertTitle = document.getElementById('alert_title');
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "gold";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph") || alertInfo.properties.description.toLowerCase().includes("destructive")) {
            alertBorderColor = "gold";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "maroon";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#ecd4b1";
    }
 if (alertInfo.properties.event.includes("Special Marine")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "orange";
    }
     if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "pink";
    }
     if (alertInfo.properties.event.includes("Snow Squall")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#5DE2E7";
    }
    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>';
    
    try {
        var hazards = alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " ");
    } catch {
        var hazards = "No hazards identified.";
    }
    
    construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>';

try {
    // Match everything after "IMPACTS..." until we hit two newlines, an asterisk, or the end of the string
    var impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
        .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
        .trim(); // Clean up any leading or trailing whitespace
} catch {
    try {
        // Match everything after "IMPACT..." until we hit two newlines, an asterisk, or the end of the string
        var impacts = alertInfo.properties.description.match(/IMPACT?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch {
        // If no impacts found, set default message
        var impacts = "No impacts identified.";
    }
}

// Add the impacts to the constructed content
construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br>';


    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR|SMW)\d{4}/g, "").replace(/\n/g, "<br>");
    construct = construct + '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct = construct + '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(date);
}

function formatWatchDate(timestamp) {
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));
    
    return new Date(Date.UTC(year, month, day, hour, minute));
}



function formatDate(inputDateString) {
    const inputDate = new Date(inputDateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(inputDate);
}

function getAlert(alertInfo) {
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";
    
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "gold";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph wind gusts") || alertInfo.properties.description.toLowerCase().includes("destructive storm")) {
            alertBorderColor = "gold";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "maroon";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#ecd4b1";
    }
      if (alertInfo.properties.event.includes("Special Marine")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "orange";
    }
    if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "pink";
    }
    if (alertInfo.properties.event.includes("Snow Squall")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "#5DE2E7";
    }


    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div>';
    
    var customMessages = '';
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    }
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    }

   else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div>';
    }
   else if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div>';
    } else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }
else if (alertInfo.properties.description.includes("Two inch hail")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }
else if (alertInfo.properties.description.includes("Tennis")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }

    // Extract source from the description
    let source = "No source identified.";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    construct += customMessages;
    construct += '<div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct += '<p style="margin: 0;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct += '<p style="margin: 0;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct += '<p style="margin: 0;"><b>Source:</b> ' + source + '</p><br>';

    // Extracting hazards
    var hazards = "No hazards identified.";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }
    construct += '<p style="margin: 0;"><b>Hazards: </b>' + hazards + '</p>';

// Extracting impacts
var impacts = "No impacts identified.";
try {
    // Match everything after "IMPACTS..." until we hit two newlines, an asterisk, or the end of the string
    var impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
        .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
        .trim(); // Clean up any leading or trailing whitespace
} catch {
    try {
        // Match everything after "IMPACT..." until we hit two newlines, an asterisk, or the end of the string
        var impacts = alertInfo.properties.description.match(/IMPACT?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch {
        // If no impacts found, set default message
        var impacts = "No impacts identified.";
    }
}

// Adding the impacts to the construct
construct += '<p style="margin: 0;"><b>Impacts: </b>' + impacts + '</p><br>';

    // Extracting description
    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\n/g, "<br>");
    construct += '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct += '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZoneName: 'short'
    }).format(date);
}


function changeRadarPosition(position, preloadOnly, force) {
    while (position >= mapFrames.length) {
        position -= mapFrames.length;
    }
    while (position < 0) {
        position += mapFrames.length;
    }

    var currentFrame = mapFrames[animationPosition];
    var nextFrame = mapFrames[position];

    addLayer(nextFrame);

    if (preloadOnly || (isTilesLoading() && !force)) {
        return;
    }

    animationPosition = position;

    if (radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(0);
    }
    radarLayers[nextFrame.path].setOpacity(radarOpacity);

    var pastOrForecast = nextFrame.time > Date.now() / 1000 ? 'Future' : (nextFrame.time === mapFrames[lastPastFramePosition].time ? 'Current' : 'Past');

    document.getElementById("timestamp").innerHTML = pastOrForecast + " • " + formatDate(new Date(nextFrame.time * 1000).toISOString());
}

function logAlert(alertInfo) {
    var alertLog = document.getElementById('alert-log');
    var noAlertsMessage = document.getElementById('no-alerts-message');
    var alertClass = '';

    // Determine the alert class based on the event type
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertClass = 'alert-severe-thunderstorm';
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertClass = 'alert-tornado';
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertClass = 'alert-flash-flood';
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertClass = 'alert-special-weather';
    } else if (alertInfo.properties.event.includes("Special Marine")) {
        alertClass = 'alert-special-marine';
    } else if (alertInfo.properties.event.includes("Extreme Wind")) {
        alertClass = 'alert-extreme-wind';
    }
     else if (alertInfo.properties.event.includes("Snow Squall")) {
        alertClass = 'alert-snow-squall';
    }

    if (alertClass) {
        var listItem = document.createElement('li');

        // Check for duplicate alerts
        var alertExists = false;
        for (var i = 0; i < alertLog.children.length; i++) {
            var child = alertLog.children[i];
            if (child.getAttribute('data-alert-id') === alertInfo.properties.id) {
                alertExists = true;
                break;
            }
        }
        if (alertExists) {
            return; // Alert already exists, skip adding it
        }

        // Set data attributes for alert ID and issued time
        listItem.setAttribute('data-alert-id', alertInfo.properties.id);
        listItem.setAttribute('data-issued-time', alertInfo.properties.sent);

        // Build the innerHTML of the list item
        listItem.innerHTML = 
            `<div class="alert-header ${alertClass}" style="padding: 8px; font-size: 17px; font-weight: bolder;">
                ${alertInfo.properties.event}
            </div>
            <div style="margin-top: 2px; font-size: 16px;">
                <b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br>
                <b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br>
                <b>Areas:</b> ${alertInfo.properties.areaDesc}
            </div>
            <div class="alert-buttons" style="margin-top: 2px;">
                <button class="more-info-button" onclick="showAlertPopup(${JSON.stringify(alertInfo).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-info-circle"></i> More Info
                </button>
                <button class="more-info-button" onclick="zoomToAlert(${JSON.stringify(alertInfo.geometry.coordinates).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-eye"></i> Show Me
                </button>
            </div>`;

        // Insert the alert in reverse chronological order based on issued time
        let inserted = false;
        const newAlertTime = new Date(alertInfo.properties.sent);
        for (let i = 0; i < alertLog.children.length; i++) {
            const existingAlertTime = new Date(alertLog.children[i].getAttribute('data-issued-time'));

            // If the new alert is more recent, insert it before the older alert
            if (newAlertTime > existingAlertTime) {
                alertLog.insertBefore(listItem, alertLog.children[i]);
                inserted = true;
                break;
            }
        }

        // If the alert is the oldest, append it at the end of the list
        if (!inserted) {
            alertLog.appendChild(listItem);
        }

        // Hide the "No active alerts" message since we have at least one alert
        noAlertsMessage.style.display = 'none';
        noAlertsMessage.classList.remove('centered-alert');
    }

    // Show "No active alerts" message if there are no alerts and alerts are turned on
    if (alertLog.children.length === 0 && alertON) {
        noAlertsMessage.style.display = 'block';
        noAlertsMessage.querySelector('p').innerText = 'No active alerts';
        noAlertsMessage.classList.add('centered-alert');
        document.getElementById('toggle-alerts-button').style.display = 'none'; 
    } else {
        noAlertsMessage.classList.remove('centered-alert');
    }
}

function updateAlertList(newAlerts) {
    var alertLog = document.getElementById('alert-log');
    alertLog.innerHTML = ''; // Clear existing alerts

    // Sort new alerts by 'sent' date in descending order (newest first)
    newAlerts.sort((a, b) => new Date(b.properties.sent) - new Date(a.properties.sent));

    // Add sorted alerts to the log
    newAlerts.forEach(alert => logAlert(alert));
}


function showAlertPopup(alertInfo) {
    document.getElementById('popup-title').innerText = alertInfo.properties.event;
    document.getElementById('popup-title').style.backgroundColor = getAlertHeaderColor(alertInfo.properties.event);

    // Custom messages
    let customMessages = '';
    
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }
    else if (alertInfo.properties.description.includes("Two inch hail")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("Tennis")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }

    // Extract source from the description
    let source = "No source identified.";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    document.getElementById('popup-details').innerHTML = `${customMessages}<b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br><b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br><b>Source:</b> ${source}`;

    // Extract hazards and impacts
    let hazards = "No hazards identified.";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }

    let impacts = "No impacts identified.";
    try {
        impacts = alertInfo.properties.description.match(/IMPACTS?\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
            .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
            .trim(); // Clean up any leading or trailing whitespace
    } catch (e) {
        try {
            impacts = alertInfo.properties.description.match(/IMPACT\.\.\.(.*?)(?:\n\n|\*|$)/s)[1]
                .replace(/\n/g, " ") // Replace newlines within the impacts with spaces for formatting
                .trim(); // Clean up any leading or trailing whitespace
        } catch (e) {
            console.log("Error extracting impacts:", e);
        }
    }

    // Add hazards and impacts to the popup with reduced margin below impacts
    document.getElementById('popup-hazards-impacts').innerHTML = `
        <p style="margin: 0;"><b>Hazards:</b> ${hazards}</p>
        <p style="margin: 0;"><b>Impacts:</b> ${impacts}</p>
    `;

    // Process the description to clean up odd line breaks
    var cleanedDescription = alertInfo.properties.description
        .replace(/(?:SVR|FFW|TOR)\d{4}/g, "") // Remove specific codes like SVR, FFW, and TOR
        .replace(/\*/g, "") // Remove asterisks
        .replace(/\n{2,}/g, "<br><br>") // Replace two or more newlines with two <br> tags for paragraph breaks
        .replace(/\n/g, " "); // Replace single newlines with a space to avoid odd breaks in sentences

    document.getElementById('popup-description').innerHTML = `<b>Description:</b><br>
        <p style="margin: 8px 0 0 4px; padding-left: 10px; border-left: 5px solid ${getAlertHeaderColor(alertInfo.properties.event)}; border-radius: 5px;">
        ${cleanedDescription}
        </p>`;

   document.getElementById('popup-action').innerHTML = `<b>Action Recommended:</b> ${alertInfo.properties.instruction || 'No specific actions recommended.'}<br><br><b>Areas:</b> ${alertInfo.properties.areaDesc || 'No area specified.'}`;

    var popup = document.getElementById('alert-popup');
    popup.classList.add('show');
}



function getAlertHeaderColor(event) {
    if (event.includes("Severe Thunderstorm")) return "gold";
    if (event.includes("Tornado")) return "red";
    if (event.includes("Flash Flood Warning")) return "lime";
    if (event.includes("Special Weather")) return "#ecd4b1";
    if (event.includes("Special Marine")) return "orange";
    if (event.includes("Extreme Wind")) return "pink";
    if (event.includes("Snow Squall")) return "#5DE2E7";
    return "white";
}


function closeAlertPopup() {
    // Get the popup element
    var popup = document.getElementById('alert-popup');

    // Add fade-out class to initiate the animation
    popup.classList.add('fade-out');

    // Set a timeout to remove 'show' and 'fade-out' after the animation ends (300ms)
    setTimeout(() => {
        popup.classList.remove('show', 'fade-out');
    }, 300);

    // Stop the speech synthesis when the popup is closed
    window.speechSynthesis.cancel();
    isPlaying = false;

    // Reset the Play/Pause button to its "Play Alert" state
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Play Alert';
    updateButtonStyle(playPauseBtn, false); // Set to "off" style when popup is closed
}

function zoomToAlert(coordinates) {
    // Reverse the subarrays if necessary (assuming coordinates[0] is an array of [lng, lat] pairs)
    var latLngs = reverseSubarrays(coordinates[0]);

    // Create a LatLngBounds object from the coordinates
    var bounds = L.latLngBounds(latLngs);

    // Calculate the center of the bounds
    var center = bounds.getCenter();

    // Get the zoom level that would fit the bounds
    var targetZoom = map.getBoundsZoom(bounds);

    // Decrease the zoom level by 1 or adjust as needed to zoom out
    var zoomOutLevel = targetZoom - 1; // Adjust this value to zoom out more or less

    // Ensure zoomOutLevel is within the map's min and max zoom levels
    zoomOutLevel = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoomOutLevel));

    // Use flyTo for a smooth animated transition
    map.flyTo(center, zoomOutLevel);
}

function loadAlerts() {
    if (!alertON) return; // Don't load alerts if alertON is false

    console.log("Loading alerts");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');
    xhr.onreadystatechange = function() {
        console.log("running");
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;

            // Assign priority based on event type
            alerts.forEach(function(alert) {
                if (alert.properties.event.includes("Special Marine")) {
                    alert.priority = 7;
                } else if (alert.properties.event.includes("Special Weather")) {
                    alert.priority = 6;
                     } else if (alert.properties.event.includes("Snow Squall")) {
                    alert.priority = 5;
                } else if (alert.properties.event.includes("Flash Flood Warning")) {
                    alert.priority = 4;
                } else if (alert.properties.event.includes("Severe Thunderstorm")) {
                    alert.priority = 3;
                } else if (alert.properties.event.includes("Extreme Wind")) {
                    alert.priority = 2;
                } else if (alert.properties.event.includes("Tornado")) {
                    alert.priority = 1;
                } else {
                    alert.priority = 8; // Lowest priority for other events
                }
            });

            // Sort by priority and then by sent time (oldest to newest)
            alerts.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority; // Sort by priority
                }
                return new Date(a.properties.sent) - new Date(b.properties.sent); // If same priority, sort by time
            });

            // Clear existing polygons and borders
            polygons.forEach(function(polygon) {
                map.removeLayer(polygon);
            });
            polygons = []; // Reset the polygons array

            document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log

            // Reverse to display newest first within each priority
            alerts.reverse().forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    console.log(thisItem);
                    var polygonOptions = {};
                    if (alert.properties.event.includes("Severe Thunderstorm")) {
                        polygonOptions.color = 'gold';
                        if (alert.properties.description.toLowerCase().includes("80 mph") || alert.properties.description.toLowerCase().includes("destructive")) {
                            polygonOptions.color = 'gold';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Tornado")) {
                        polygonOptions.color = 'red';
                        if (alert.properties.description.toLowerCase().includes("tornado emergency")) {
                            polygonOptions.color = 'maroon';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Flash Flood Warning")) {
                        polygonOptions.color = 'lime';
                        if (alert.properties.description.toLowerCase().includes("flash flood emergency")) {
                            polygonOptions.color = 'darkgreen';
                            polygonOptions.weight = 7;
                        }
                    } else if (alert.properties.event.includes("Special Weather")) {
                        polygonOptions.color = '#ecd4b1';
                    } else if (alert.properties.event.includes("Special Marine")) {
                        polygonOptions.color = 'orange';
                    }
                      else if (alert.properties.event.includes("Snow Squall")) {
                        polygonOptions.color = '#5DE2E7';
                    }

                    if (polygonOptions.color) {
                        // Create and add the polygon to the map with the custom pane
                        var polygon = L.polygon(reverseSubarrays(thisItem), Object.assign({}, polygonOptions, {pane: 'polygonPane'})).addTo(map);
                        polygon.setStyle({fillOpacity: alertOpacity});

                        // Add border to the map with the custom pane
                        var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6.5, fillOpacity: 0, pane: 'borderPane'}).addTo(map);

                        // Add both polygon and border to polygons array to keep track
                        polygons.push(polygon);
                        polygons.push(border);  // Keep border synchronized with the polygon

                        var thisAlert = [];
                        thisAlert.push(polygon.getLatLngs().join());
                        thisAlert.push(alert.properties.id);
                        allalerts.push(thisAlert);

                        // Bind popup to polygon
                        polygon.bindPopup(getAlert(alert), {
                            autoPan: true,
                            maxheight: '200',
                            maxWidth: '350',
                            className: 'alertpopup'
                        });

                        polygon.on('click', function (e) {
                            e.originalEvent.stopPropagation();
                        });
                    }
                    logAlert(alert);
                } catch (error) {
                    console.log("No coords for obj or error:", error);
                }
            });
        } else {
            console.log("API Error");
        }
    };
    xhr.send();
}



// Refresh alert list dynamically every minute
setInterval(() => {
    loadAlerts(); // Reload alerts to refresh polygons and borders together
}, 60000); // Refresh every 60 seconds
// Ensure the alert list is refreshed dynamically
setInterval(() => {
    document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log
    polygons.forEach(polygon => {
        const alertId = allalerts.find(alert => alert[0] === polygon.getLatLngs().join())[1];
        const alertInfo = findPairInDictionary(alertData, alertId);
        if (alertInfo) {
            logAlert(alertInfo);
        }
    });
}, 60000); // Refresh every minute



function getWatchRisk(percentage, type) {
    let category = 'Very Low';
    let style = 'background-color: beige; color: black;';

    if (type === 'EF2-EF5 tornadoes') {
        if (percentage < 2) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage > 2) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 3 && percentage < 25) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
       } else if (percentage >= 26 && percentage < 100) {
            category = 'High';
            style = 'background-color: pink; color: magenta; font-weight: bold;';
        }
    } else {
        if (percentage < 5) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage >= 5 && percentage < 25) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 26 && percentage < 69) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
        } else if (percentage >= 70) {
            category = 'High';
            style = 'background-color: magenta; color: white; font-weight: bold;';
        }
    }

    return `<span class="risk-level" style="${style}">${category}</span>`;
}

function toggleAlertListMenu() {
    const menu = document.getElementById('alert-list-menu');
    const currentDisplay = window.getComputedStyle(menu).display;
    menu.style.display = currentDisplay === 'none' ? 'block' : 'none';
}

function toggleMainMenu(menuId) {
    const menus = [
        'layers-menu',
        'info-menu',
        'radar-settings',
        'alerts-settings',
        'map-settings',
        'hurricane-settings',
        'lightning-settings',
        'outlooks-settings',
        'reports-settings',
        'weather-radio-settings',
        'general-info',
        'attributions'
    ];
    
    const clickedMenu = document.getElementById(menuId);
    const isMenuVisible = clickedMenu && clickedMenu.style.display === 'block';
    
    // Hide all menus first
    menus.forEach(menu => {
        const element = document.getElementById(menu);
        if (element) {
            element.style.display = 'none';
        }
    });

    // If the clicked menu was already visible, don't show it again (effectively closing it)
    if (!isMenuVisible && menuId) {
        const menuToShow = document.getElementById(menuId);
        if (menuToShow) {
            menuToShow.style.display = 'block';
        }
    }
}

function toggleSubMenu(menuId, action = 'show') {
    const infoMenu = document.getElementById('info-menu');
    const subMenu = document.getElementById(menuId);
    const layersMenu = document.getElementById('layers-menu');
    
    if (!subMenu) return;

    // For info menu subtabs (general-info and updates-info)
    if (menuId === 'general-info' || menuId === 'updates-info') {
        infoMenu.style.display = 'none';
        subMenu.style.display = 'block';
        return;
    }

    // For other submenus
    if (action === 'back') {
        subMenu.classList.remove('active');
        layersMenu.classList.add('active');
    } else {
        if (subMenu.classList.contains('active')) {
            subMenu.classList.remove('active');
            layersMenu.classList.add('active');
        } else {
            layersMenu.classList.remove('active');
            subMenu.classList.add('active');
        }
    }
}

// Update the back button functionality for info submenus
function returnToInfoMenu() {
    const infoMenu = document.getElementById('info-menu');
    const generalInfo = document.getElementById('general-info');
    const updatesInfo = document.getElementById('updates-info');
    
    generalInfo.style.display = 'none';
    updatesInfo.style.display = 'none';
    infoMenu.style.display = 'block';
}

function getWatch(watch) {
    const alertTitlecolor = 'white';
    const alertTitlebackgroundColor = watch.properties.TYPE == "SVR" ? "#998207" : "#841213";
    const alertTitle = `${watch.properties.TYPE == "TOR" ? "Tornado Watch #" : "Severe T-Storm Watch #"}${watch.properties.NUM}`;

    const issuedDate = formatWatchDate(watch.properties.ISSUE);
    const expiresDate = formatWatchDate(watch.properties.EXPIRE);

    const issuedFormatted = issuedDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    const expiresFormatted = expiresDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    let construct = `
        <div style="overflow-y: auto; color: white;">
            <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ${alertTitlebackgroundColor}; color: ${alertTitlecolor};">
                ${alertTitle}
            </div>`;
    
    if (watch.properties.IS_PDS) {
        construct += `
            <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
                <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
            </div>`;
    }
    
    construct += `
            <br>
            <p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>
            <p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>
            <p style="margin: 0px;"><b>Max Hail Size:</b> ${watch.properties.MAX_HAIL}"</p>
            <p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(watch.properties.MAX_GUST * 1.15077945)} mph</p><br>
            <button class="more-info-button" onclick="showWatchPopup(${JSON.stringify(watch).replace(/"/g, '&quot;')})"><i class="fa-solid fa-info-circle"></i> More Info</button>
        </div>`;

    return construct;
}

function showWatchPopup(alertInfo) {
    var popup = document.getElementById('watch-popup');
    document.getElementById('watch-popup-title').innerText = alertInfo.properties.TYPE === "TOR" ? "Tornado Watch #" + alertInfo.properties.NUM : "Severe T-Storm Watch #" + alertInfo.properties.NUM;
    document.getElementById('watch-popup-title').style.backgroundColor = alertInfo.properties.TYPE === "TOR" ? "#841213" : "#998207";

    var issuedDate = new Date(formatWatchDate(alertInfo.properties.ISSUE).getTime());
    var expiresDate = new Date(formatWatchDate(alertInfo.properties.EXPIRE).getTime());
    
    var issuedFormatted = issuedDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    var expiresFormatted = expiresDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true,
        timeZoneName: 'short'
    });

    var details = `<p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>`;
    details += `<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>`;
    details += `<p style="margin: 0px;"><b>Max Hail Size:</b> ${alertInfo.properties.MAX_HAIL}"</p>`;
    details += `<p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945)} mph</p><br>`;
    
    if (alertInfo.properties.IS_PDS) {
        details += `
            <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
                <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
            </div>`;
    }
    
    var probabilities = '<h3>Probabilities</h3>';
    probabilities += '<p style="margin: 5px 0;"><b>Tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TORTWO) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TOREF2) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND65) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Severe hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL2I) + '</p>';

    document.getElementById('watch-popup-details').innerHTML = details;
    document.getElementById('watch-popup-probabilities').innerHTML = probabilities;
    popup.classList.add('show');
}

    function closeWatchPopup() {
        var popup = document.getElementById('watch-popup');
        popup.classList.add('fade-out');
        setTimeout(() => {
            popup.classList.remove('show', 'fade-out');
        }, 300);
    }

    // Add this function to convert date strings to Date objects
    function formatWatchDate(timestamp) {
        const year = parseInt(timestamp.slice(0, 4));
        const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
        const day = parseInt(timestamp.slice(6, 8), 10);
        const hour = parseInt(timestamp.slice(8, 10), 10);
        const minute = parseInt(timestamp.slice(10, 12), 10);

        return new Date(Date.UTC(year, month, day, hour, minute));
    }


// Checks watches to make sure they are not expired
function isWatchValid(timestamp) {
    // Parse the timestamp
    const year = parseInt(timestamp.slice(0, 4), 10);
    const month = parseInt(timestamp.slice(4, 6), 10) - 1; // Months are 0-based in JS
    const day = parseInt(timestamp.slice(6, 8), 10);
    const hours = parseInt(timestamp.slice(8, 10), 10);
    const minutes = parseInt(timestamp.slice(10, 12), 10);

    // Create a Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes));

    // Get the current time in UTC
    const nowUTC = new Date();

    // Compare the two dates
    return (dateUTC > nowUTC);
}

    
function loadWatches() {
    if (!watchesON) return;

    console.log("Getting watches");
    const xhr = new XMLHttpRequest();
    const currentDate = new Date();
    xhr.open('GET', `https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=${currentDate.getFullYear()}&month1=${currentDate.getMonth() + 1}&day1=${currentDate.getDate()}&hour1=0&minute1=0&year2=${currentDate.getFullYear()}&month2=${currentDate.getMonth() + 1}&day2=${currentDate.getDate()}&hour2=23&minute2=0&format=geojson`, true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const watches = JSON.parse(xhr.responseText).features;
watches.forEach(function(watch) {
    const thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
    
    if (isWatchValid(watch.properties.EXPIRE)) {
        if ((watch.properties.TYPE == "SVR" && displaySvrWatches) || (watch.properties.TYPE == "TOR" && displayTorWatches)) {
            // Create the white border polygon
            const border = L.polygon(thisItem, {
                color: 'black',
                weight: 6, // Border weight
                fillOpacity: 0 // Ensure border has no fill
            }).addTo(map);

            // Create the main watch polygon
            const polygon = L.polygon(thisItem, {
                color: watch.properties.TYPE == "SVR" ? '#998207' : '#841213', // Main color
                weight: 3, // Main polygon weight, smaller than the border
                fillOpacity: 0 // No fill for alert polygons
            }).addTo(map);

            polygon.bindPopup(getWatch(watch), {
                autoPan: true,
                maxHeight: '600',
                maxWidth: '500',
                className: 'alertpopup'
            });

            polygon.on('click', function (e) {
                e.originalEvent.stopPropagation();
            });

            // Store the polygon with its expiration time for potential cleanup
            const expirationTime = formatWatchDate(watch.properties.EXPIRE).getTime();
            watchPolygons[expirationTime] = polygon;

            console.log(`Added watch: ${JSON.stringify(watch.properties)}`);
            console.log(`Watch expiration time: ${new Date(expirationTime).toISOString()} (${expirationTime})`);
        }
    }
});

            watchesLoaded = true;
            checkIfLoadingComplete();
        }
    };
    xhr.send();
}

let currentLocationMarker = null;
let watchId = null;
let isLocationOn = false;

function startUpdatingLocation() {
    if (navigator.geolocation) {
        if (watchId === null) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Place or update the custom circle marker at the user's location
                   if (currentLocationMarker) {
    currentLocationMarker.setLatLng([lat, lon]);
} else {
    currentLocationMarker = L.circleMarker([lat, lon], {
        radius: 10, // Adjust the size as needed
        fillColor: '#7F1DF0', // Purple fill color
        color: '#FFFFFF', // White border color
        weight: 5, // Border width
        opacity: 1,
        fillOpacity: 1,
        interactive: false // Make it non-clickable
    }).addTo(map);

    // Only center the map on the location when first adding the marker
    if (isLocationOn) {
        map.flyTo([lat, lon], 8); // Adjust the zoom level as needed
    }
}

                },
                (error) => {
                    console.error("Error getting current location: ", error);
                },
                {
                    enableHighAccuracy: true, // Request the most accurate position
                    maximumAge: 5000, // Do not use cached position
                }
            );
        }
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function clearCurrentLocationMarker() {
    if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
        currentLocationMarker = null;
    }
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function toggleLocation() {
    isLocationOn = !isLocationOn;

    const locationButton = document.getElementById('current-location-button');

    if (isLocationOn) {
        locationButton.style.backgroundColor = "white";
        locationButton.style.color = "#7F1DF0";
        locationButton.style.border = "2px solid #636381";
        startUpdatingLocation();
    } else {
        locationButton.style.backgroundColor = "#636381";
        locationButton.style.color = "white";
        locationButton.style.border = "2px solid white";
        clearCurrentLocationMarker();
    }
}

document.getElementById('current-location-button').addEventListener('click', toggleLocation);

// Clear the location marker on page unload
window.addEventListener('beforeunload', clearCurrentLocationMarker);

// Function to initialize button states
function initializeButtonStates() {
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");
    var watchButton = document.getElementById("togglewatches");
    var locationButton = document.getElementById('current-location-button');
    var reportsButton = document.getElementById("togglereports"); // Added reports button
    var spotterButton = document.getElementById('spotter-button'); // Added spotter button

    // Initialize alert button states
    if (alertON) {
        alertButton.style.backgroundColor = "white";
        alertButton.style.color = "#7F1DF0";
        alertButton.style.border = "2px solid #636381 !important"; // Normal border

        alertsMenuButton.style.backgroundColor = "white";
        alertsMenuButton.style.color = "#7F1DF0";
        alertsMenuButton.style.border = "2px solid #636381 !important"; // Normal border
    } else {
        alertButton.style.backgroundColor = "#636381";
        alertButton.style.color = "white";
        alertButton.style.border = "2px solid white"; // White border when toggled off

        alertsMenuButton.style.backgroundColor = "#636381";
        alertsMenuButton.style.color = "white";
        alertsMenuButton.style.border = "2px solid white"; // White border when toggled off
    }

    // Initialize watches button states
    if (watchesON) {
        watchButton.style.backgroundColor = "white";
        watchButton.style.color = "#7F1DF0";
        watchButton.style.border = "2px solid #636381 !important"; // Normal border
    } else {
        watchButton.style.backgroundColor = "#636381";
        watchButton.style.color = "white";
        watchButton.style.border = "2px solid white"; // White border when toggled off
    }

    // Initialize location button states
    if (isLocationOn) {
        locationButton.style.backgroundColor = "white";
        locationButton.style.color = "#7F1DF0";
        locationButton.style.border = "2px solid #636381";
    } else {
        locationButton.style.backgroundColor = "#636381";
        locationButton.style.color = "white";
        locationButton.style.border = "2px solid white";
    }

    // Initialize reports button states
    if (reportsON) {
        reportsButton.style.backgroundColor = "white";
        reportsButton.style.color = "#7F1DF0";
        reportsButton.style.border = "2px solid #636381"; // Normal border when on
    } else {
        reportsButton.style.backgroundColor = "#636381";
        reportsButton.style.color = "white";
        reportsButton.style.border = "2px solid white"; // White border when toggled off
    }

    // Initialize spotter button states
    if (spottersON) {
        spotterButton.style.backgroundColor = "white";
        spotterButton.style.color = "#7F1DF0";
        spotterButton.style.border = "2px solid #636381"; // Normal border when on
    } else {
        spotterButton.style.backgroundColor = "#636381";
        spotterButton.style.color = "white";
        spotterButton.style.border = "2px solid white"; // White border when toggled off
    }
}


// Call the initialize function on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonStates();
});

// Ensure the map is displayed correctly after the changes
map.invalidateSize();

// Radar refresh interval
setInterval(refreshRadar, 60000); // Refresh radar every 1 minute in the background

// Helper function to log all current watches for debugging
function logCurrentWatches() {
    console.log("Current watches in watchPolygons:");
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        console.log(`Watch expiration time: ${expirationDate.toISOString()} (${parsedExpirationTime})`);
    }
}

// Call logCurrentWatches to see the current watches
logCurrentWatches();

var loadingScreen = document.getElementById('loading-screen');


function checkIfLoadingComplete() {
    if (watchesLoaded && alertsLoaded) {
        // Fade out the loading screen
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            isLoadingScreenVisible = false; // Set flag to false after hiding the loading screen
            checkConnection(); // Check connection after hiding the loading screen
        }, 3500); // Remove loading screen after fade out
    }
}


function updateAlertOpacity(value) {
    alertOpacity = parseFloat(value);
    document.getElementById('alert-opacity-value').textContent = value;
    polygons.forEach(polygon => {
        if (polygon.options.color !== "#516BFF" && polygon.options.color !== "#FE5859") { // Ensure this condition matches your watch polygon colors
            polygon.setStyle({ fillOpacity: alertOpacity });
        }
    });
    saveSettings(); // Save settings after changing alert opacity
}

function updateRadarOpacity(value) {
    radarOpacity = parseFloat(value);
    document.getElementById('radar-opacity-value').textContent = value;
    Object.values(radarLayers).forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            layer.setOpacity(radarOpacity);
        }
    });
    saveSettings(); // Save settings after changing radar opacity
}


        function formatDate(inputDateString) {
            const inputDate = new Date(inputDateString);
          
            const timeString = inputDate.toTimeString();
          
            const hours = inputDate.getHours();
            const minutes = inputDate.getMinutes();
          
            const formattedHours = (hours % 12) || 12;
          
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
          
            const formattedTimeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm}`;
          
            return formattedTimeString;
        }

        function startLoadingTile() {
            loadingTilesCount++;    
        }
        function finishLoadingTile() {
            setTimeout(function() { loadedTilesCount++; }, 250);
        }
        function isTilesLoading() {
            return loadingTilesCount > loadedTilesCount;
        }

        var apiRequest = new XMLHttpRequest();
        
        apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
pane: 'radarPane',
        apiRequest.onload = function(e) {
            apiData = JSON.parse(apiRequest.response);
            console.log("API Data Loaded:", apiData);
            initialize(apiData, optionKind);
        };
        apiRequest.onerror = function(e) {
            console.error("API request error:", e);
        };
        apiRequest.send();

function initialize(api, kind) {
    console.log("Initializing map with kind:", kind);
    for (var i in radarLayers) {
        map.removeLayer(radarLayers[i]);
    }
    for (var j in polygons) {
        map.removeLayer(polygons[j]);
    }
    mapFrames = [];
    radarLayers = [];
    polygons = [];
    animationPosition = 0;

    if (!api) {
        console.error("API data is not available.");
        return;
    }
    if (kind === 'radar' && api.radar && api.radar.past) {
        mapFrames = api.radar.past;
        if (api.radar.nowcast) {
            if (doFuture) {
                mapFrames = mapFrames.concat(api.radar.nowcast);
            }
        }

        lastPastFramePosition = api.radar.past.length - 1;
        showFrame(lastPastFramePosition, true);
    } else if (kind === 'satellite' && api.satellite && api.satellite.infrared) {
        mapFrames = api.satellite.infrared;
        lastPastFramePosition = api.satellite.infrared.length - 1;
        showFrame(lastPastFramePosition, true);
    }

  loadWatches();
    setTimeout(() => {
        loadReports();
        // Fade out the loading screen after the delay
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 3500); // Adjust the delay as needed

    // Load severe weather reports after everything else is set up
    setTimeout(() => {
        loadAlerts();
    }, 800); // Adjust this delay to fit with your existing timings
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to toggle the display of the Toggle Outlooks button
    function showToggleOutlooksButton() {
        document.getElementById('toggle-outlooks').style.display = 'block';
    }

    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="outlook"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.checked) {
                showToggleOutlooksButton();
            }
        });
    });

    // Function to toggle the outlooks
    function toggleOutlooks() {
        let outlooksOn = document.querySelectorAll('input[name="outlook"]:checked').length > 0;
        if (!outlooksOn) {
            document.querySelector('input[value="day1"]').checked = true;
            // Add logic to select the Day 1 Convective Outlook
        } else {
            document.querySelectorAll('input[name="outlook"]').forEach(function(radio) {
                radio.checked = false;
            });
            // Add logic to turn off all outlooks
        }
    }

    // Add event listener to the Toggle Outlooks button
    // Try-catch to prevent errors when no outlook is selected
    try {
        document.getElementById('toggle-outlooks').addEventListener('click', toggleOutlooks);
    } catch {
        console.log("No outlook selected.")
    }
});

function cleanupExpiredWatches() {
    const currentTime = Date.now();
    console.log(`Performing cleanup for expired watches at: ${new Date(currentTime)} (${currentTime})`);
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        const currentDate = new Date(currentTime);
        console.log(`Current time: ${currentDate}, Watch expiration time: ${expirationDate}`);

        if (currentTime > parsedExpirationTime) {
            const polygon = watchPolygons[parsedExpirationTime];
            map.removeLayer(polygon);
            delete watchPolygons[parsedExpirationTime];
            console.log(`Cleaned up expired watch with expiration time: ${expirationDate} (${parsedExpirationTime})`);
        }
    }
}

// Schedule cleanup
setInterval(cleanupExpiredWatches, 60000); // Check every minute



let selectedVoice = null;
let isPlaying = false;
let isPaused = false;
let speechSynthesisUtterance = null;

// Function to populate the voice list
function populateVoiceList() {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
        // Check platform to prioritize voice selection
        const isAppleDevice = /Mac|iPhone|iPod|iPad/.test(navigator.platform);
        
        // For Apple devices, try to find 'Samantha'
        if (isAppleDevice) {
            selectedVoice = voices.find(voice => voice.name.includes('Samantha')) || voices[0];
        } else {
            // For Windows/PC, try to find 'Microsoft David Desktop - English (United States)'
            selectedVoice = voices.find(voice => voice.name === 'Microsoft David Desktop - English (United States)') || voices[0];
        }
        
        console.log("Selected voice:", selectedVoice.name); // Debug: Log the selected voice
    } else {
        console.warn("No voices found!");
    }
}

// Load the voices properly
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}
populateVoiceList();  // Call initially in case voices are already loaded

// Text formatting function
function formatTextForSpeech(text) {
    // Convert "mph" to "miles per hour"
    text = text.replace(/\bmph\b/gi, 'miles per hour');
    
    // Convert "kts" to "knots"
    text = text.replace(/\bkts\b/gi, 'knots');

    // Convert numbers to words (basic case for common speeds, temperatures, etc.)
    text = text.replace(/\b5\b/g, 'five');
    text = text.replace(/\b10\b/g, 'ten');
    text = text.replace(/\b15\b/g, 'fifteen');
    text = text.replace(/\b20\b/g, 'twenty');
    text = text.replace(/\b25\b/g, 'twenty-five');
    text = text.replace(/\b30\b/g, 'thirty');
    text = text.replace(/\b35\b/g, 'thirty-five');
    text = text.replace(/\b40\b/g, 'forty');
    text = text.replace(/\b45\b/g, 'forty-five');
    text = text.replace(/\b50\b/g, 'fifty');
    text = text.replace(/\b55\b/g, 'fifty-five');
    text = text.replace(/\b60\b/g, 'sixty');
    text = text.replace(/\b65\b/g, 'sixty-five');
    text = text.replace(/\b70\b/g, 'seventy');
    text = text.replace(/\b75\b/g, 'seventy-five');
    text = text.replace(/\b80\b/g, 'eighty');
    text = text.replace(/\b85\b/g, 'eighty-five');
    text = text.replace(/\b90\b/g, 'ninety');
    text = text.replace(/\b95\b/g, 'ninety-five');
    text = text.replace(/\bAL\b/g, 'Alabama');
    text = text.replace(/\bAK\b/g, 'Alaska');
    text = text.replace(/\bAZ\b/g, 'Arizona');
    text = text.replace(/\bAR\b/g, 'Arkansas');
    text = text.replace(/\bCA\b/g, 'California');
    text = text.replace(/\bCO\b/g, 'Colorado');
    text = text.replace(/\bCT\b/g, 'Connecticut');
    text = text.replace(/\bDE\b/g, 'Delaware');
    text = text.replace(/\bFL\b/g, 'Florida');
    text = text.replace(/\bGA\b/g, 'Georgia');
    text = text.replace(/\bHI\b/g, 'Hawaii');
    text = text.replace(/\bID\b/g, 'Idaho');
    text = text.replace(/\bIL\b/g, 'Illinois');
    text = text.replace(/\bIN\b/g, 'Indiana');
    text = text.replace(/\bIA\b/g, 'Iowa');
    text = text.replace(/\bKS\b/g, 'Kansas');
    text = text.replace(/\bKY\b/g, 'Kentucky');
    text = text.replace(/\bLA\b/g, 'Louisiana');
    text = text.replace(/\bME\b/g, 'Maine');
    text = text.replace(/\bMD\b/g, 'Maryland');
    text = text.replace(/\bMA\b/g, 'Massachusetts');
    text = text.replace(/\bMI\b/g, 'Michigan');
    text = text.replace(/\bMN\b/g, 'Minnesota');
    text = text.replace(/\bMS\b/g, 'Mississippi');
    text = text.replace(/\bMO\b/g, 'Missouri');
    text = text.replace(/\bMT\b/g, 'Montana');
    text = text.replace(/\bNE\b/g, 'Nebraska');
    text = text.replace(/\bNV\b/g, 'Nevada');
    text = text.replace(/\bNH\b/g, 'New Hampshire');
    text = text.replace(/\bNJ\b/g, 'New Jersey');
    text = text.replace(/\bNM\b/g, 'New Mexico');
    text = text.replace(/\bNY\b/g, 'New York');
    text = text.replace(/\bNC\b/g, 'North Carolina');
    text = text.replace(/\bND\b/g, 'North Dakota');
    text = text.replace(/\bOH\b/g, 'Ohio');
    text = text.replace(/\bOK\b/g, 'Oklahoma');
    text = text.replace(/\bOR\b/g, 'Oregon');
    text = text.replace(/\bPA\b/g, 'Pennsylvania');
    text = text.replace(/\bRI\b/g, 'Rhode Island');
    text = text.replace(/\bSC\b/g, 'South Carolina');
    text = text.replace(/\bSD\b/g, 'South Dakota');
    text = text.replace(/\bTN\b/g, 'Tennessee');
    text = text.replace(/\bTX\b/g, 'Texas');
    text = text.replace(/\bUT\b/g, 'Utah');
    text = text.replace(/\bVT\b/g, 'Vermont');
    text = text.replace(/\bVA\b/g, 'Virginia');
    text = text.replace(/\bWA\b/g, 'Washington');
    text = text.replace(/\bWV\b/g, 'West Virginia');
    text = text.replace(/\bWI\b/g, 'Wisconsin');
    text = text.replace(/\bWY\b/g, 'Wyoming');
    text = text.replace(/\bnm\b/g, 'nautical miles');

    // Time zone formatting (if needed)
    text = text.replace(/\bEDT\b/g, 'Eastern Daylight Time');
    text = text.replace(/\bEST\b/g, 'Eastern Standard Time');
    text = text.replace(/\bCDT\b/g, 'Central Daylight Time');
    text = text.replace(/\bCST\b/g, 'Central Standard Time');
    text = text.replace(/\bMDT\b/g, 'Mountain Daylight Time');
    text = text.replace(/\bMST\b/g, 'Mountain Standard Time');
    text = text.replace(/\bPDT\b/g, 'Pacific Daylight Time');
    text = text.replace(/\bPST\b/g, 'Pacific Standard Time');
    
    return text;
}

// Function to toggle TTS playback and handle radio state
function toggleListen() {
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (!selectedVoice) {
        console.warn("Voice is not loaded yet.");
        return;
    }

    if (isPlaying) {
        if (isPaused) {
            window.speechSynthesis.resume();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Pause Alert';
            isPaused = false;
            updateButtonStyle(playPauseBtn, true); // Apply "on" style
        } else {
            window.speechSynthesis.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Resume Alert';
            isPaused = true;
            updateButtonStyle(playPauseBtn, false, true); // Apply "resume" style
        }
    } else {
        let descriptionText = document.getElementById('popup-description').innerText || '';
        let actionText = document.getElementById('popup-action').innerText || '';
        if (!descriptionText && !actionText) {
            console.warn("No description or action text available!");
            return;
        }

        const alertText = formatTextForSpeech(descriptionText + ' ' + actionText);

        window.speechSynthesis.cancel();
        speechSynthesisUtterance = new SpeechSynthesisUtterance(alertText);
        speechSynthesisUtterance.lang = 'en-US';
        speechSynthesisUtterance.voice = selectedVoice;

        // Check if radio is playing and pause if so
        let player = document.getElementById('global-player');
        if (!player.paused) {
            player.pause();
            weatherRadioWasPlaying = true;
        }

        speechSynthesisUtterance.onend = function() {
            resetSpeechAndButton(playPauseBtn);

            // Resume radio if it was playing before TTS
            if (weatherRadioWasPlaying) {
                player.play();
                weatherRadioWasPlaying = false;
            }
        };

        window.speechSynthesis.speak(speechSynthesisUtterance);
        playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Pause Alert';
        isPlaying = true;
        isPaused = false;
        updateButtonStyle(playPauseBtn, true); // Apply "on" style for Pause Alert
    }
}


// Function to reset TTS state and button appearance
function resetSpeechAndButton(playPauseBtn) {
    window.speechSynthesis.cancel();
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i> Play Alert';
    isPlaying = false;
    isPaused = false;
}

// Helper function to update button styles for on/off states
function updateButtonStyle(button, isOn, isResume = false) {
    if (isResume) {
        // Keep "Resume Alert" the same style as "Play Alert"
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    } else if (isOn) {
        // ON style (when playing)
        button.style.backgroundColor = "white"; 
        button.style.color = "#7F1DF0";  // Purple text
        button.style.border = "2px solid #636381"; // Gray border
    } else {
        // OFF style (for Play Alert or Resume Alert)
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    }
}

// Function to reset the speech synthesis and button states
function resetSpeechAndButton(playPauseBtn) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Reset button state to "Play Alert"
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i>Play Alert';
    updateButtonStyle(playPauseBtn, false);

    isPlaying = false;
    isPaused = false;
}

// Helper function to update button styles for on/off states
function updateButtonStyle(button, isOn) {
    if (isOn) {
        // ON style
        button.style.backgroundColor = "white"; 
        button.style.color = "#7F1DF0";  // Purple text
        button.style.border = "2px solid #636381"; // Gray border
    } else {
        // OFF style
        button.style.backgroundColor = "#636381"; // Gray background
        button.style.color = "white";  // White text
        button.style.border = "2px solid white"; // White border
    }
}

// Function to reset the speech synthesis and button states
function resetSpeechAndButton(playPauseBtn) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Reset button state to "Play Alert"
    playPauseBtn.innerHTML = '<i class="fa-solid fa-volume-up" style="margin-right: 5px;"></i>Play Alert';
    updateButtonStyle(playPauseBtn, false);

    isPlaying = false;
    isPaused = false;
}




var reportsON = true;
var refreshInterval;
var displayTorReports = true;
var displayHalReports = true;
var displayWndReports = true;

// Function to toggle reports on and off
function toggleReports() {
    reportsON = !reportsON;
    var reportsButton = document.getElementById("togglereports");

    console.log("Reports ON:", reportsON);

    if (reportsON) {
        reportsButton.style.backgroundColor = "white";
        reportsButton.style.color = "#7F1DF0";
        reportsButton.style.border = "2px solid #636381";
        loadReports(); // Load reports when toggled on
        startAutoRefresh(); // Start auto-refreshing every minute
    } else {
        reportsButton.style.backgroundColor = "#636381";
        reportsButton.style.color = "white";
        reportsButton.style.border = "2px solid white";
        removeReports(); // Remove reports when toggled off
        stopAutoRefresh(); // Stop auto-refreshing
    }
    saveSettings(); // Save the report toggle state
}

// Function to clear existing markers from the map
function removeReports() {
    console.log("Removing reports...");
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && 
           (layer.options.className === 'tor-marker' || 
            layer.options.className === 'hail-marker' || 
            layer.options.className === 'wind-marker')) {
            map.removeLayer(layer);
            console.log("Removed:", layer.options.className);
        }
    });
}

// Function to start auto-refreshing reports every minute
function startAutoRefresh() {
    refreshInterval = setInterval(loadReports, 60000); // Refresh every 60 seconds
}

// Function to stop auto-refreshing reports
function stopAutoRefresh() {
    clearInterval(refreshInterval);
}


// Initialize button states on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // Load saved settings
    if (reportsON) {
        startAutoRefresh(); // Start auto-refreshing if reports are on
        loadReports(); // Load reports when the page loads
    } else {
        removeReports(); // Remove any existing reports if they are on
    }
    updateButtonState(document.getElementById("togglereports"), reportsON); // Update button appearance
});


// Function to fetch and parse CSV
async function getCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    jsonData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return JSON.stringify(jsonData, null, 2);
}

function getReport(polycoords, type) {
    var alertInfo = polycoords;
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    if (type == "Tornado Report") {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
    } else if (type == "Wind Report") {
        alertTitlebackgroundColor = "blue";
    } else if (type == "Hail Report") {
        alertTitlebackgroundColor = "green";
    }

    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + type + '</div><br>';
    
    const timestamp = alertInfo.Time;
    const hour = parseInt(timestamp.substring(0, 2));
    const minute = parseInt(timestamp.substring(2, 4));
    const reportDate = new Date();
    reportDate.setUTCHours(hour, minute); // Use setUTCHours to set the time in UTC

    // Get the current time
    const currentTime = new Date();

    // Calculate the time difference in hours
    const timeDifference = (currentTime - reportDate) / (1000 * 60 * 60);

    // Skip reports older than 2 hours
    if (timeDifference > 2) {
        return null; // Return null if the report is older than 2 hours
    }

    const options = {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const newTime = reportDate.toLocaleString('en-US', options);

    construct = construct + '<p style="margin: 0px;"><b>Report Time:</b> ' + newTime + '</p>';

    if (type == "Tornado Report") {
        construct = construct + '<p style="margin: 0px;"><b>EF-Rating:</b> ' + alertInfo.F_Scale + '</p>';
    } else if (type == "Wind Report" && alertInfo.Speed != "UNK") {
        construct = construct + '<p style="margin: 0px;"><b>Wind Speed:</b> ' + alertInfo.Speed + 'mph</p>';
    } else if (type == "Hail Report") {
        construct = construct + '<p style="margin: 0px;"><b>Hail Size:</b> ' + Math.ceil(alertInfo.Size / 100) + '"</p>';
    }

    construct = construct + '<p style="margin: 0px;"><b>Location:</b> ' + alertInfo.Location + "; " + alertInfo.County + ", " + alertInfo.State + " (" + alertInfo.Lat + ", " + alertInfo.Lon + ")" + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Comments:</b> ' + alertInfo.Comments + '</p><br>';

    construct = construct + '</div>';

    return construct;
}


async function loadReports() {
    removeReports(); // Clear existing markers before adding new ones

    // Load Tornado Reports
    if (displayTorReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_torn.csv').then(json => {
            var torreps = JSON.parse(json);
            torreps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Tornado Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {
                            className: 'tor-marker'
                        }).addTo(map);
                        marker.setIcon(L.divIcon({ className: 'tor-marker' }));
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });
                        
                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding tornado report:", error);
                }
            });
        });
    }

    // Load Hail Reports
    if (displayHalReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_hail.csv').then(json => {
            var reps = JSON.parse(json);
            reps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Hail Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {
                            className: 'hail-marker'
                        }).addTo(map);
                        marker.setIcon(L.divIcon({ className: 'hail-marker' }));
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });

                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding hail report:", error);
                }
            });
        });
    }

    // Load Wind Reports
    if (displayWndReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_wind.csv').then(json => {
            var reps = JSON.parse(json);
            reps.forEach(report => {
                try {
                    const popupContent = getReport(report, "Wind Report");
                    if (popupContent) { // Only add if the report is within 2 hours
                        const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {
                            className: 'wind-marker'
                        }).addTo(map);
                        marker.setIcon(L.divIcon({ className: 'wind-marker' }));
                        marker.bindPopup(popupContent, { "autoPan": true, 'maxheight': '300', 'maxWidth': '250', 'className': 'alertpopup' });

                        // Check if the report is more than 2 hours old
                        const reportTime = report.Time;
                        const reportDate = getUTCReportDate(reportTime);
                        const now = new Date();
                        const timeDifference = (now - reportDate) / (1000 * 60 * 60); // Difference in hours

                        if (timeDifference > 2) {
                            map.removeLayer(marker); // Remove marker if it's older than 2 hours
                        }
                    }
                } catch (error) {
                    console.warn("Error adding wind report:", error);
                }
            });
        });
    }

    // Return a Promise to ensure proper timing if necessary
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

function getUTCReportDate(reportTime) {
    const hour = parseInt(reportTime.substring(0, 2));
    const minute = parseInt(reportTime.substring(2, 4));
    
    // Get the current date
    const reportDate = new Date();
    const currentDate = new Date();
    
    // Set the report time (UTC hours and minutes)
    reportDate.setUTCHours(hour, minute, 0, 0); // Set report time in UTC

    // If the report time is ahead of the current time, assume it was from yesterday
    if (reportDate > currentDate) {
        reportDate.setUTCDate(reportDate.getUTCDate() - 1);
    }

    return reportDate;
}

// Utility function to update the button appearance based on state
function updateButtonState(button, isActive) {
    if (isActive) {
        button.style.backgroundColor = "white";
        button.style.color = "#7F1DF0";
        button.style.border = "2px solid #636381";
    } else {
        button.style.backgroundColor = "#636381";
        button.style.color = "white";
        button.style.border = "2px solid white";
    }
}

 
        function addLayer(frame) {
        if (!radarLayers[frame.path]) {
            var colorScheme = optionKind == 'satellite' ? 0 : optionColorScheme;
            var smooth = optionSmoothData;
            var snow = optionSnowColors;

            var source = new L.TileLayer(apiData.host + frame.path + '/' + optionTileSize + '/{z}/{x}/{y}/' + colorScheme + '/' + smooth + '_' + snow + '.png', {
                tileSize: 256,
                opacity: 0, // Set initial opacity to 0
                zIndex: frame.time
            });

            source.on('loading', startLoadingTile);
            source.on('load', finishLoadingTile); 
            source.on('remove', finishLoadingTile);

            radarLayers[frame.path] = source;
        }
        if (!map.hasLayer(radarLayers[frame.path])) {
            map.addLayer(radarLayers[frame.path]);
        }
    }

var loadingScreen = document.getElementById('loading-screen');

apiRequest.onload = function(e) {
    apiData = JSON.parse(apiRequest.response);
    console.log("API Data Loaded:", apiData);
    initialize(apiData, optionKind);
    // Remove the loading screen after initializing
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 3200); // Adjust the delay as needed
};

    function updateRadarOpacity(value) {
        radarOpacity = parseFloat(value);
        document.getElementById('radar-opacity-value').textContent = value;
 // Update the opacity of the current frame only
        var currentFrame = mapFrames[animationPosition];
        if (currentFrame && radarLayers[currentFrame.path]) {
            radarLayers[currentFrame.path].setOpacity(radarOpacity);
        }

        saveSettings(); // Save settings after changing radar opacity
    }


let lastFrameTime = 0; // Keep track of the last frame update time
const throttleDelay = 200; // Delay in milliseconds (adjust this as needed)

function showFrame(nextPosition, force) {
    const now = Date.now();

    // If the last frame update was within the throttleDelay, don't proceed
    if (now - lastFrameTime < throttleDelay) return;

    // Update the timestamp of the last frame update
    lastFrameTime = now;

    // Remove the current frame before loading the next one
    var currentFrame = mapFrames[animationPosition];

    // Ensure the current frame exists and remove it
    if (currentFrame && radarLayers[currentFrame.path]) {
        map.removeLayer(radarLayers[currentFrame.path]);
    }

    var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;

    // Load the next frame
    changeRadarPosition(nextPosition, false, force);

    // Optionally preload the next frame in the direction of movement
    changeRadarPosition(nextPosition + preloadingDirection, true);
}

// Add an event listener for the keydown event
document.addEventListener('keydown', function(event) {
    // Check if the 'R' key is pressed
    if (event.key === 'r' || event.key === 'R') {
        refreshRadar(); // Call the radar refresh function
        console.log("Radar refresh triggered by 'R' key");
    }
});


         let animationSpeedMultiplier = parseFloat(localStorage.getItem('animationSpeedMultiplier')) || 1.0;  // Load saved speed or default to 1x
    updateSpeedButton();

    function toggleAnimationSpeed() {
        if (animationSpeedMultiplier === 1.0) {
            animationSpeedMultiplier = 2.0;  // Faster speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        } else if (animationSpeedMultiplier === 2.0) {
            animationSpeedMultiplier = 0.5;  // Slower speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        } else {
            animationSpeedMultiplier = 1.0;  // Back to normal speed
            localStorage.setItem('animationSpeedMultiplier', animationSpeedMultiplier);  // Save to localStorage
        }
        updateSpeedButton();
    }

    function updateSpeedButton() {
        let speedButton = document.getElementById("speed-button");
        if (animationSpeedMultiplier === 1.0) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 1x';
        } else if (animationSpeedMultiplier === 2.0) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 2x';
        } else if (animationSpeedMultiplier === 0.5) {
            speedButton.innerHTML = '<i class="fa-solid fa-forward"></i> Animation Speed: 0.5x';
        }
    }

    function stop() {
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = false;
            return true;
        }
        return false;
    }

    function play() {
        showFrame(animationPosition + 1);

        let delay = animationPosition == 12 ? 1500 : 400;
        delay = delay / animationSpeedMultiplier;  // Adjust delay based on speed multiplier

        animationTimer = setTimeout(play, delay);
    }

    // Load animation speed on page load
    document.addEventListener("DOMContentLoaded", function() {
        animationSpeedMultiplier = parseFloat(localStorage.getItem('animationSpeedMultiplier')) || 1.0;
        updateSpeedButton();
    });


        function playStop() {
            if (!stop()) {
                document.getElementById("stbtn").innerHTML = '<i class="fa-solid fa-pause"></i>';
                play();
            } else {
                document.getElementById("stbtn").innerHTML = '<i class="fa-solid fa-play"></i>';
                stop();
            }
        }

      function setRadarType(kind) {
    if (kind == 'radar' || kind == 'satellite'){
        optionKind = kind;
        initialize(apiData, optionKind);
    } else if (kind == 'future') {
        doFuture = true;
        initialize(apiData, optionKind);
    } else if (kind == 'past') {
        doFuture = false;
        initialize(apiData, optionKind);
    }
    saveSettings(); // Save settings after changing radar type
}

        function setColors() {
            var e = document.getElementById('colors');
            optionColorScheme = e.options[e.selectedIndex].value;
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after changing color scheme
        }

        function toggleHighRes() {
            optionTileSize = optionTileSize == 256 ? 512 : 256;
            document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after toggling resolution
        }

        function toggleSmoothing() {
            optionSmoothData = optionSmoothData == 0 ? 1 : 0;
            document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
            initialize(apiData, optionKind);
            saveSettings(); // Save settings after toggling smoothing
        }

        document.onkeydown = function (e) {
            e = e || window.event;
            switch (e.which || e.keyCode) {
                case 37: // left
                    stop();
                    showFrame(animationPosition - 1, true);
                    break;

                case 39: // right
                    stop();
                    showFrame(animationPosition + 1, true);
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault();
            return false;
        };
async function refreshRadar() {
    console.log("Refreshing radar in the background");
    try {
        const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        if (!response.ok) throw new Error("Failed to fetch radar data");

        const newApiData = await response.json();
        apiData = newApiData; // Update global apiData

        // Check if the radar pane exists; if not, create it
        if (!map.getPane('radarPane')) {
            map.createPane('radarPane');
            map.getPane('radarPane').style.zIndex = 450; // Adjust z-index as needed
        }

        // Reinitialize radar layers with the updated data
        initialize(apiData, optionKind);
    } catch (error) {
        console.error("Error during radar refresh:", error);
    }
}

function toggleAlerts() {
    alertON = !alertON;
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");
    var noAlertsMessage = document.getElementById('no-alerts-message');
    var toggleAlertsButton = document.getElementById('toggle-alerts-button');

    if (alertON) {
        alertButton.style.backgroundColor = "white";
        alertButton.style.color = "#7F1DF0";
        alertButton.style.border = "2px solid #636381"; // Normal border

        alertsMenuButton.style.backgroundColor = "white";
        alertsMenuButton.style.color = "#7F1DF0";
        alertsMenuButton.style.border = "2px solid #636381"; // Normal border

        loadAlerts();

        // Set the "No active alerts" message if there are no alerts
        if (document.getElementById('alert-log').children.length === 0) {
            noAlertsMessage.style.display = 'block';
            noAlertsMessage.querySelector('p').innerText = 'No active alerts';
            toggleAlertsButton.style.display = 'none'; // Hide the button if alerts are on but there are none
        }
    } else {
        alertButton.style.backgroundColor = "#636381";
        alertButton.style.color = "white";
        alertButton.style.border = "2px solid white"; // White border when toggled off

        alertsMenuButton.style.backgroundColor = "#636381";
        alertsMenuButton.style.color = "white";
        alertsMenuButton.style.border = "2px solid white"; // White border when toggled off

        // Remove all alerts from the map
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && layer.options.color !== "#516BFF" && layer.options.color !== "#FE5859") {
                map.removeLayer(layer);
            }
        });

        // Clear all alerts from the log
        document.getElementById('alert-log').innerHTML = '';

        // Show "Alerts are toggled off." message
        noAlertsMessage.style.display = 'block';
        noAlertsMessage.querySelector('p').innerText = 'Alerts are toggled off';
        toggleAlertsButton.style.display = 'block'; // Show the button when alerts are toggled off
    }

    saveSettings(); // Save settings after toggling alerts
}

// Toggle watches function
function toggleWatches() {
    watchesON = !watchesON;
    var watchButton = document.getElementById("togglewatches");

    if (watchesON) {
        watchButton.style.backgroundColor = "white";
        watchButton.style.color = "#7F1DF0";
        watchButton.style.border = "2px solid #636381"; // Normal border

        // Load watches and then re-add alerts with a delay
        loadWatches();
        setTimeout(() => {
            if (alertON) {
                loadAlerts();
            }
        }, 0); // Adjust the delay as needed
    } else {
        watchButton.style.backgroundColor = "#636381";
        watchButton.style.color = "white";
        watchButton.style.border = "2px solid white"; // White border when toggled off

        // Remove watches
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && (layer.options.color === "#516BFF" || layer.options.color === "#FE5859")) {
                map.removeLayer(layer);
            }
        });
    }
    saveSettings(); // Save settings after toggling watches
}
// Call the initialize function on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonStates();
});

function toggleSmoothing() {
    optionSmoothData = optionSmoothData == 0 ? 1 : 0;
    var smoothingButton = document.getElementById('smoothing-button');
    smoothingButton.innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
    smoothingButton.classList.toggle('toggle-off', optionSmoothData == 0);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling smoothing
}

function toggleHighRes() {
    optionTileSize = optionTileSize == 256 ? 512 : 256;
    var highResButton = document.getElementById('highres-button');
    highResButton.innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
    highResButton.classList.toggle('toggle-off', optionTileSize == 256);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling resolution
}

document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault();
    return false;
};

function refreshRadar() {
    console.log("Refreshing radar in the background");
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();

 refreshInvestsLayers();
 refreshHurricaneLayers();
refreshMesoscaleLayer();

}

function toggleLayer(layerType, outlookType = null) {
    if (layerType === 'radar') {
        radarON = !radarON;

        updateToggleButtonState('radar', radarON);

        document.getElementById('smoothing-button').disabled = !radarON;
        document.getElementById('highres-button').disabled = !radarON;
        document.getElementById('colors').disabled = !radarON;

        optionColorScheme = radarON ? 6 : 0;
        optionKind = 'radar';

        if (!radarON && satelliteON) {
            toggleLayer('satellite');
        }
    } else if (layerType === 'satellite') {
        satelliteON = !satelliteON;

        updateToggleButtonState('satellite', satelliteON);

        document.getElementById('smoothing-button').disabled = satelliteON;
        document.getElementById('highres-button').disabled = satelliteON;
        document.getElementById('colors').disabled = satelliteON;

        optionKind = satelliteON ? 'satellite' : 'radar';
        optionColorScheme = satelliteON ? 0 : 6;

        if (!satelliteON && radarON) {
            toggleLayer('radar');
        }
    } else if (layerType === 'hurricanes') {
        hurricanesON = !hurricanesON;
        updateToggleButtonState('hurricanes', hurricanesON);

        if (hurricanesON) {
            if (!map.hasLayer(hurricaneLayer)) map.addLayer(hurricaneLayer);
            if (!map.hasLayer(watchesWarningsLayer)) map.addLayer(watchesWarningsLayer);
            if (!map.hasLayer(coneLayer)) map.addLayer(coneLayer);
            if (!map.hasLayer(windSwathLayer)) map.addLayer(windSwathLayer);
        } else {
            if (map.hasLayer(hurricaneLayer)) map.removeLayer(hurricaneLayer);
            if (map.hasLayer(watchesWarningsLayer)) map.removeLayer(watchesWarningsLayer);
            if (map.hasLayer(coneLayer)) map.removeLayer(coneLayer);
            if (map.hasLayer(windSwathLayer)) map.removeLayer(windSwathLayer);
        }
    } else if (layerType === 'reports') {
        reportsON = !reportsON;
        updateToggleButtonState('reports', reportsON);

        if (reportsON) {
            loadReports();
            startAutoRefresh();
        } else {
            removeReports();
            stopAutoRefresh();
        }
    } else if (layerType === 'outlook' && outlookType) {
        const day = outlookType.split('_')[1];

        if (lastSelectedOutlook === outlookType && currentLayer) {
            removeCurrentLayer(() => {
                lastSelectedOutlook = '';
            });
        } else {
            removeCurrentLayer(() => {
                setTimeout(() => {
                    fetchOutlookData(day, outlookType, () => {
                        lastSelectedOutlook = outlookType; // Save the last selected outlook
                    });
                }, 0);
            });
        }

        saveSettings(); // Save settings whenever an outlook is toggled
    } else if (layerType === 'mesoscale') {
        // Add support for Mesoscale Discussions toggle
        mesoscaleLayerVisible = !mesoscaleLayerVisible;

        updateToggleButtonState('togglediscussions', mesoscaleLayerVisible); // Update button state

        if (mesoscaleLayerVisible) {
            if (mesoscaleLayer) {
                mesoscaleLayer.addTo(map);
            } else {
                // Initialize the layer if it's not yet loaded
                initializeMesoscaleLayer();
            }
        } else {
            if (mesoscaleLayer && map.hasLayer(mesoscaleLayer)) {
                map.removeLayer(mesoscaleLayer);
            }
        }

        // Save the visibility state to localStorage (optional)
        localStorage.setItem('mesoscaleLayerVisible', mesoscaleLayerVisible);
    }

    initialize(apiData, optionKind);
    saveSettings(); // Save settings after any layer change
}



 document.addEventListener('DOMContentLoaded', function() {
            var attributionElements = document.getElementsByClassName('leaflet-control-attribution');
            for (var i = 0; i < attributionElements.length; i++) {
                attributionElements[i].style.display = 'none';
            }
        });

  // Prevent zooming on double-tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 75) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

let currentLayer = null;
let lastSelectedOutlook = ''; // Track the last selected outlook

// Initialize the pane for outlook layers
map.createPane('outlookPane');
map.getPane('outlookPane').style.zIndex = 200;

// Function to update the outlook type when the user clicks a checkbox
function updateOutlookType(day, outlookType) {
    const selectedCheckbox = document.querySelector(`input[value="${outlookType}"]`);

    if (lastSelectedOutlook === outlookType && currentLayer) {
        // If the same outlook is clicked again, remove the layer and uncheck the checkbox
        removeCurrentLayer(() => {
            lastSelectedOutlook = '';
            selectedCheckbox.checked = false;
            saveOutlookState(); // Save the updated state after removing the outlook
        });
    } else {
        // If a different outlook is selected, update the map with the new outlook
        removeCurrentLayer(() => {
            setTimeout(() => {
                fetchOutlookData(day, outlookType, () => {
                    lastSelectedOutlook = outlookType;
                    selectedCheckbox.checked = true; // Ensure the checkbox is checked
                    saveOutlookState(); // Save the updated state after selecting the outlook
                });
            }, 0); // Slight delay before fetching
        });
    }
}

// Remove the current layer from the map
function removeCurrentLayer(callback) {
    if (currentLayer) {
        console.log('Removing current layer:', currentLayer);

        // Remove the layer from the map
        map.removeLayer(currentLayer);

        // Explicitly set it to null to ensure it's fully removed
        currentLayer = null;

        console.log('Layer removed.');
    } else {
        console.log('No layer to remove.');
    }

    // Ensure the callback function is executed after removal
    if (callback) {
        callback();
    }
}

// Fetch the outlook data and add it to the map
async function updateSpotters() {
    try {
        // Clear existing markers
        if (spotterLayer) {
            map.removeLayer(spotterLayer);
        }
        spotterMarkers = [];

        // Updated URL to use HTTPS
        const response = await fetch('https://spotternetwork.org/feeds/rss-positions.xml');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        // Check if parsing was successful
        if (xml.documentElement.nodeName === "parsererror") {
            throw new Error("Failed to parse XML feed");
        }

        const items = xml.getElementsByTagName('item');
        
        if (!items.length) {
            console.warn('No spotter positions found in feed');
            return;
        }

        for (const item of items) {
            try {
                const description = item.getElementsByTagName('description')[0]?.textContent || '';
                const lat = item.getElementsByTagName('geo:lat')[0]?.textContent;
                const lon = item.getElementsByTagName('geo:long')[0]?.textContent;

                if (!lat || !lon) continue;

                // Parse spotter info with more robust regex
                const name = description.match(/\(Name\)\s*([^(]+)/)?.[1]?.trim() || 'Unknown Spotter';
                const phone = description.match(/\(Phone\)\s*([^(]+)/)?.[1]?.trim() || '';
                const note = description.match(/\(Note\)\s*([^(]+)/)?.[1]?.trim() || '';
                const ham = description.match(/\(Ham\)\s*([^(]+)/)?.[1]?.trim() || '';

                const marker = L.marker([parseFloat(lat), parseFloat(lon)], {
                    icon: L.divIcon({
                        className: 'spotter-marker',
                        html: '📍',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20]
                    })
                });

                // Enhanced popup content
                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <strong>${name}</strong><br>
                        ${phone ? `📱 ${phone}<br>` : ''}
                        ${ham ? `📻 ${ham}<br>` : ''}
                        ${note ? `📝 ${note}` : ''}
                    </div>
                `, {
                    maxWidth: 300,
                    className: 'spotter-popup'
                });

                spotterMarkers.push(marker);
            } catch (err) {
                console.warn('Error processing spotter item:', err);
                continue; // Skip problematic items
            }
        }

        if (spotterMarkers.length > 0) {
            spotterLayer = L.layerGroup(spotterMarkers).addTo(map);
        } else {
            console.warn('No valid spotter positions found');
        }

    } catch (error) {
        console.error('Error updating spotters:', error);
        // You can implement a showError function or handle errors as needed
    }
}

let spotterLayer = null;
let spotterMarkers = [];
let spottersON = false;
let spotterUpdateInterval = null;

function toggleSpotters() {
    spottersON = !spottersON;
    const spotterButton = document.getElementById('spotter-button');

    if (spottersON) {
        spotterButton.style.backgroundColor = "white";
        spotterButton.style.color = "#7F1DF0";
        spotterButton.style.border = "2px solid #636381";
        updateSpotters();
        // Start auto-refresh for spotters
        if (!spotterUpdateInterval) {
            spotterUpdateInterval = setInterval(updateSpotters, 60000); // Update every minute
        }
    } else {
        spotterButton.style.backgroundColor = "#636381";
        spotterButton.style.color = "white";
        spotterButton.style.border = "2px solid white";
        if (spotterLayer) {
            map.removeLayer(spotterLayer);
            spotterLayer = null;
        }
        // Clear the update interval
        if (spotterUpdateInterval) {
            clearInterval(spotterUpdateInterval);
            spotterUpdateInterval = null;
        }
    }
    saveSettings();
}

// Clean up spotter interval when the page unloads
window.addEventListener('beforeunload', () => {
    if (spotterUpdateInterval) {
        clearInterval(spotterUpdateInterval);
    }
});
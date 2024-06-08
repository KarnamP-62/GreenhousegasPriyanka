let table;
let countries = [];
let emissionsData = [];
let globalMax = 0; 
let currentYear = 1990;
const excludeEntities = ['Asia', 'Africa', 'Europe', 'European Union (27)', 'North America', 'South America', 'Oceania', 'World', 'High-income countries', 'Upper-middle-income countries', 'Lower-middle-income countries', 'Low-income countries'];
const sectors = ["Agriculture", "fuel_combustion", "Energy_production", "Electricity_and_heat", "Land_use_and_forestry", "Waste", "Buildings", "Transport", "manufacturing_and_construction", "Industry", "bunker_fuels"];
let autoAnimate = true; 

function preload() {
    table = loadTable('greenhousegas.csv', 'csv', 'header');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(`#f7f0e7`);
    initializeCountries();
    loadEmissionsData();
    textFont('Century Gothic');
    // Setup the slider after data is loaded
    yearSlider = createSlider(1990, 2020, 1990, 1);
    yearSlider.position(400, 500);
    yearSlider.style('width', '1700px');
    yearSlider.input(onSliderChange);
    
    // drawSliderWithLabels();
    adjustCanvasSize(currentYear);
    
}

function drawSliderWithLabels() {
    let sliderStart = yearSlider.x;
    let sliderEnd = sliderStart + yearSlider.width;
    textSize(12);
    textAlign(CENTER, BOTTOM);

    for (let year = 1990; year <= 2020; year += 2) { // Increment by 2 years for fewer labels
        let x = map(year, 1990, 2020, sliderStart, sliderEnd);
        text(year, x, yearSlider.y + 25);
    }
}


function adjustCanvasSize(year) {
    if (!emissionsData[year]) return; // Guard against missing data

    let circleDiameter = 400; // Large visual diameter for each "country circle"
    let padding = 90; // Padding between circles
    let columns = 5; // Number of columns
    let rows = Math.ceil(emissionsData[year].length / columns);
    let canvasHeight = rows * (circleDiameter + padding) + 100; // Add some margin at the bottom

    resizeCanvas(windowWidth, canvasHeight); // Adjust canvas size
    console.log("Canvas resized to accommodate " + emissionsData[year].length + " countries.");
}

function onSliderChange() {
    currentYear = yearSlider.value(); // Update to the slider's current value
    autoAnimate = false; // Stop automatic animation on manual interaction
    adjustCanvasSize(currentYear);
    // redraw();
}


function draw() {
    background(`#f7f0e7`);
   
    drawSliderWithLabels();
    
    drawCountries(currentYear);
     
    textAlign(LEFT, CENTER);
    fill('black');
    textSize(93);
    textStyle(BOLD);
    text(`Global Greenhouse gases`,350,100);
    textStyle(NORMAL);
    textSize(49);
    text(` Diversity in Data and the Unity of Climate Action`,350,190);

    // if (autoAnimate) {
    //     if (frameCount % 60 === 0) { // Change year every second if in auto mode
    //         currentYear++;
    //         if (currentYear > 2020) currentYear = 1990;
    //         adjustCanvasSize(currentYear);
    //         yearSlider.value(currentYear);
    //     }
    // }

    // Display the current year
    fill(0);
    noStroke();
    textSize(16);
    textAlign(LEFT,LEFT);
    
    textStyle(BOLD);
    text("Year: " + currentYear, yearSlider.x , yearSlider.y - 20);
    textStyle(NORMAL);
    
}

function drawCountries(year) {
    let circleDiameter = 20;
    let padding = 400;
    let columns = 5;
    let xOffset = (width - (columns * circleDiameter + (columns - 1) * padding) + 100) / 2;
    let yOffset = 800;
    let hoverInfo = null; // To store hover information

    let yearlyData = emissionsData[year];
    if (!yearlyData) return;

    yearlyData.forEach((data, index) => {
        let x = xOffset + (index % columns) * (circleDiameter + padding);
        let y = yOffset + Math.floor(index / columns) * (circleDiameter + padding + 20);
        let totalEmission = 0;
        let countValidSectors = 0;

        sectors.forEach((sector, i) => {
            let sectorValue = data.sectors[sector];
            if (sectorValue != null && !isNaN(sectorValue)) {
                totalEmission += sectorValue; // Include negative values as they are
                countValidSectors++;
            }

            let angle = TWO_PI / sectors.length * i;
            let lineLength = sectorValue === null ? 50 : map(Math.abs(sectorValue), 0, Math.abs(data.maxValue), 50, 150); // Use absolute value only for visual length
            let strokeWidth = sectorValue === null ? 1 : map(Math.abs(sectorValue), 0, Math.abs(data.maxValue), 1, 10); // Use absolute value only for visual thickness
            if (isNaN(lineLength)){
                lineLength = 50;
            }
            let sx = x + cos(angle) * (circleDiameter / 2);
            let sy = y + sin(angle) * (circleDiameter / 2);
            let ex = x + cos(angle) * (circleDiameter / 2 + lineLength);
            let ey = y + sin(angle) * (circleDiameter / 2 + lineLength);

            if (isMouseCloseToLine(mouseX, mouseY, sx, sy, ex, ey)) {
                hoverInfo = { sectorName: sector, value: sectorValue, x: mouseX, y: mouseY };
            }

            strokeColorForValue(sectorValue);
            strokeWeight(strokeWidth);
            line(sx, sy, ex, ey);
        });

        let averageEmission = data.average_emissions;
        let prevYearData = emissionsData[year - 1] && emissionsData[year - 1].find(d => d.country === data.country);
        let trend = prevYearData ? (averageEmission > prevYearData.average_emissions ? "↑" : "↓") : "";

        textAlign(CENTER, CENTER);
        noStroke();
        fill(0);
        textSize(18);
        textStyle(BOLD);
        text(data.country, x, y + circleDiameter / 2 + 180);
        let formattedAvgEmissions = (averageEmission / 1e6).toFixed(2); // Convert to millions for display
        fill(50);
        textSize(14);
        textStyle(NORMAL);
        text(`Avg Emission: ${formattedAvgEmissions} million tons`, x, y + circleDiameter / 2 + 200);
        if (trend === "↑") {
            fill('red');
          
        } else if (trend === "↓") {
            fill('green');
            
        }
        textSize(14); // Bigger size for visibility
        text(trend, x+120, y + circleDiameter / 2 + 200); // Display the arrow
    });

    if (hoverInfo) {
        drawHoverInfo(hoverInfo);
    }
}


function calculateYearlyAverages() {
    let yearlyAverages = {};
    for (let year = 1990; year <= 2020; year++) {
        let sum = 0;
        let count = 0;
        if (emissionsData[year]) {
            emissionsData[year].forEach(data => {
                if (data.Average_Emission) {
                    sum += data.Average_Emission;
                    count++;
                }
            });
            yearlyAverages[year] = count > 0 ? sum / count : 0;
        } else {
            yearlyAverages[year] = 0;
        }
    }
    return yearlyAverages;
}
function drawLineGraph(yearlyAverages) {
    stroke(50, 50, 200); // Set the line color
    strokeWeight(2); // Set the line thickness
    noFill(); // No fill under the line

    beginShape();
    for (let year = 1990; year <= 2020; year++) {
        let x = map(year, 1990, 2020, sliderStart, sliderEnd); // Adjust these to fit your slider positions
        let y = map(yearlyAverages[year], 0, max(Object.values(yearlyAverages)), slider.y - 10, slider.y - 110); // Y-values calculated from slider top position
        vertex(x, y);
    }
    endShape();
}

// Ensure you call this function in the draw function after calculating yearlyAverages and perhaps after drawing the slider


function isMouseCloseToLine(mx, my, x1, y1, x2, y2) {
    const d = distToSegment(mx, my, x1, y1, x2, y2);
    return d < 10; // Threshold distance to detect hover
}

function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = dist(x1, y1, x2, y2) ** 2;
    if (l2 === 0) return dist(px, py, x1, y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

function drawHoverInfo(info) {
    fill(255);
    stroke(0);
    rect(info.x + 10, info.y + 10, 290, 60); // Adjusted the size for better fit
    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    let formattedValue = (info.value / 1e6).toFixed(2); // Convert value to millions and format to two decimal places
    textFont('Century Gothic');
    textSize(14);
    text(`Sector: ${info.sectorName}`, info.x + 15, info.y + 15);
    
    text(`Emission: ${formattedValue} million tons`, info.x + 15, info.y + 35); // Display text with millions
    
}



function strokeColorForValue(value) {
    if (value === null) {
        stroke(93, 93, 93); // Ensure null values are drawn in grey
    } else if (value === 0) {
        stroke("#fcbf49"); // Yellow for zero
    } else if (value > 0) {
        stroke("#ee4272"); // Red for positive values
    } else if (value < 0) {
        stroke("#6a3fbb"); // Blue for negative values
    }
}


function initializeCountries() {
    let entities = table.getColumn('Entity');
    countries = [...new Set(entities)].filter(country => !excludeEntities.includes(country)); // Remove duplicates and exclude specific entities
    console.log("Countries initialized: ", countries);
}
// Assuming you store the average emissions in the data object as 'average_emissions'
function loadEmissionsData() {
    emissionsData = {};
    for (let year = 1990; year <= 2020; year++) {
        emissionsData[year] = [];
    }

    countries.forEach(country => {
        const rows = table.findRows(country, 'Entity');
        rows.forEach(row => {
            let year = row.getNum('Year');
            if (year >= 1990 && year <= 2020) {
                let data = {
                    country: country,
                    sectors: {},
                    maxValue: 0,
                    average_emissions: parseFloat(row.getString('Average_Emission')) || 0
                };
                sectors.forEach(sector => {
                    let value = row.getNum(sector);
                    data.sectors[sector] = value === -9999999 ? null : value;
                });
                data.maxValue = calculateMaxValue(data.sectors);
                emissionsData[year].push(data);
            }
        });
    });

    // Sort each year's data by average emissions value in descending order
    Object.keys(emissionsData).forEach(year => {
        emissionsData[year].sort((a, b) => b.average_emissions - a.average_emissions);
    });
}


function calculateMaxValue(sectors) {
    let values = Object.values(sectors).filter(v => v !== null);
    if (values.length === 0) return 0;
    return Math.max(...values.map(Math.abs)); // Calculate max from absolute values of non-null entries
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(`#f7f0e7`);
    yearSlider.position(100, 100); // Maintain slider position at (100, 100) even after resizing
    drawCountries(currentYear); // Redraw countries for the current year to fit new canvas size
}

let table;
let countries = [];
let emissionsData = [];
let globalMax = 0; 
let currentYear = 1990;
const excludeEntities = ['Asia', 'Africa', 'Europe', 'European Union (27)', 'North America', 'South America', 'Oceania', 'World', 'High-income countries', 'Upper-middle-income countries', 'Lower-middle-income countries', 'Low-income countries'];
const sectors = ["Agriculture", "fuel_combustion", "Energy_production", "Electricity_and_heat", "Land_use_and_forestry", "Waste", "Buildings", "Transport", "manufacturing_and_construction", "Industry", "bunker_fuels"];

function preload() {
    table = loadTable('greenhousegas.csv', 'csv', 'header');
}

 // Start year for animation
 function setup() {
    initializeCountries();
    loadEmissionsData();
    let columns = 5; // Assume 5 columns for layout
    let rows = Math.ceil(Object.keys(emissionsData[1990]).length / columns);
    let circleDiameter = 400; // Height needed for each country circle
    let padding = 90; // Padding between circles
    let canvasHeight = rows * (circleDiameter + padding) + 400; // Calculate total canvas height

    createCanvas(windowWidth, canvasHeight);
    background(255);
}

function draw() {
    background(255);
    drawCountries(currentYear);
    currentYear++;
    if (currentYear > 2020) {
        currentYear = 1990; // Loop back to the first year
    }
    frameRate(1); // Adjust for slower animation
}


function drawCountries(year) {
    let circleDiameter = 20;
    let padding = 400;
    let columns = 5;
    let xOffset = (width - (columns * circleDiameter + (columns - 1) * padding) + 100) / 2;
    let yOffset = 800;

    let yearlyData = emissionsData[year];
    if (!yearlyData) return; 

    yearlyData.forEach((data, index) => {
        let x = xOffset + (index % columns) * (circleDiameter + padding);
        let y = yOffset + Math.floor(index / columns) * (circleDiameter + padding + 20);

        sectors.forEach((sector, i) => {
            let sectorValue = data.sectors[sector];
            let angle = TWO_PI / sectors.length * i;
            let lineLength = sectorValue === null ? 50 : map(Math.abs(sectorValue), 0, data.maxValue, 50, 150); // Default length for null values
            let strokeWidth = sectorValue === null ? 1 : map(Math.abs(sectorValue), 0, data.maxValue, 1, 10); // Default stroke for null values
            if (isNaN(lineLength)){
                lineLength = 50;
            }
            console.log("================");
            console.log(angle);
            console.log(circleDiameter / 2 + lineLength)
            let sx = x + cos(angle) * (circleDiameter / 2);
            let sy = y + sin(angle) * (circleDiameter / 2);
            let ex = x + cos(angle) * (circleDiameter / 2 + lineLength);
            let ey = y + sin(angle) * (circleDiameter / 2 + lineLength);
            console.log(data.country);
            console.log(sectorValue);
            console.log(sx, sy, ex, ey);
            strokeColorForValue(sectorValue);
            strokeWeight(strokeWidth);
            line(sx, sy, ex, ey);
        });

        textAlign(CENTER, CENTER);
        noStroke();
        fill(0);
        text(data.country, x, y + circleDiameter / 2 + 180);
    });
    print("Circles drawn with conditional line visibility");
}

function strokeColorForValue(value) {
    if (value === null) {
        stroke(93, 93, 93); // Ensure null values are drawn in grey
    } else if (value === 0) {
        stroke(255, 255, 0); // Yellow for zero
    } else if (value > 0) {
        stroke(255, 0, 0); // Red for positive values
    } else if (value < 0) {
        stroke(0, 0, 255); // Blue for negative values
    }
}


function initializeCountries() {
    let entities = table.getColumn('Entity');
    countries = [...new Set(entities)].filter(country => !excludeEntities.includes(country)); // Remove duplicates and exclude specific entities
    console.log("Countries initialized: ", countries);
}
function loadEmissionsData() {
    emissionsData = {};
    for (let year = 1990; year <= 2020; year++) {
        emissionsData[year] = [];
    }

    countries.forEach((country) => {
        const rows = table.findRows(country, 'Entity');
        rows.forEach(row => {
            let year = row.getNum('Year');
            if (year >= 1990 && year <= 2020) {
                let data = {
                    country: country,
                    sectors: {},
                    maxValue: 0
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

    // Sort each year's data by max emissions value
    Object.keys(emissionsData).forEach(year => {
        emissionsData[year].sort((a, b) => b.maxValue - a.maxValue);
    });

    console.log("Loaded emissions data for all years.");
}

function calculateMaxValue(sectors) {
    let values = Object.values(sectors).filter(v => v !== null);
    if (values.length === 0) return 0;
    return Math.max(...values.map(Math.abs)); // Calculate max from absolute values of non-null entries
}


function windowResized() {
    let circleDiameter = 400; // Fixed diameter for all circles
    let padding = 90; // Space between circles
    let columns = 4; // Number of columns per row
    let rows = Math.ceil(emissionsData.length / columns);
    let canvasHeight = rows * (circleDiameter + padding + 20) + 400; // Adjust the height calculation

    resizeCanvas(windowWidth, canvasHeight);
    background(255); // Clear the canvas after resizing
    drawCountries(); // Redraw the countries on the resized canvas
}
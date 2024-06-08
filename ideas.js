let table;
let countries = [];
let emissionsData = [];
let globalMax = 0; 

const excludeEntities = ['Asia', 'Africa', 'Europe', 'European Union (27)', 'North America', 'South America', 'Oceania', 'World', 'High-income countries', 'Upper-middle-income countries', 'Lower-middle-income countries', 'Low-income countries'];
const sectors = ["Agriculture", "fuel_combustion", "Energy_production", "Electricity_and_heat", "Land_use_and_forestry", "Waste", "Buildings", "Transport", "manufacturing_and_construction", "Industry", "bunker_fuels"];

function preload() {
    table = loadTable('greenhousegas.csv', 'csv', 'header');
}

function setup() {
    initializeCountries();
    let circleDiameter = 400; // Fixed diameter for all circles
    let padding = 90; // Space between circles
    let columns = 4; // Number of columns per row
    let rows = Math.ceil(countries.length / columns);
    let canvasHeight = rows * (circleDiameter + padding + 20) + 400; // Adjust the height calculation
    createCanvas(windowWidth, canvasHeight);
    background(255);
    loadEmissionsData();
    drawCountries();
}
function drawCountries() {
    let circleDiameter = 20; // Fixed diameter for all circles
    let padding = 400; // Space between circles
    let columns = 5; // Number of columns per row
    let xOffset = (width - (columns * circleDiameter + (columns - 1) * padding) + 100) / 2; // Centering offset
    let yOffset = 800; // Initial y offset for the first row, adjusted to start 100 points lower

    emissionsData.forEach((data, index) => {
        let x = xOffset + (index % columns) * (circleDiameter + padding);
        let y = yOffset + Math.floor(index / columns) * (circleDiameter + padding + 20); // Adding extra space for text

        sectors.forEach((sector, i) => {
            let angle = TWO_PI / sectors.length * i;
            let sectorValue = data.sectors[sector];
            let lineLength = map(sectorValue, 0, globalMax, 50, 150); // Map value linearly for line length
            let strokeWidth = map(sectorValue, 0, globalMax, 1, 10); // Map value linearly for stroke width

            let sx = x + cos(angle) * (circleDiameter / 2);
            let sy = y + sin(angle) * (circleDiameter / 2);
            let ex = x + cos(angle) * (circleDiameter / 2 + lineLength);
            let ey = y + sin(angle) * (circleDiameter / 2 + lineLength);

            strokeWeight(strokeWidth);
            stroke(0);
            line(sx, sy, ex, ey);
        });

        // Draw country name
        textAlign(CENTER, CENTER);
        stroke(0);
        text(data.country, x, y + circleDiameter / 2 + 180); // Adjust text position
    });
}


function initializeCountries() {
    let entities = table.getColumn('Entity');
    countries = [...new Set(entities)].filter(country => !excludeEntities.includes(country)); // Remove duplicates and exclude specific entities
    console.log("Countries initialized: ", countries);
}
function loadEmissionsData() {
    emissionsData = [];

    countries.forEach((country) => {
        let rows = table.findRows(country, 'Entity').filter(row => row.get('Year') == 2000);
        
        if (rows.length > 0) {
            let row = rows[0]; // Assuming there's only one row for the year 2000 per country
            let data = {
                country: country,
                sectors: {}
            };
            sectors.forEach(sector => {
                let absValue = Math.abs(row.getNum(sector));
                data.sectors[sector] = absValue;
                if (absValue > globalMax) { // Update the global maximum if this value is higher
                    globalMax = absValue;
                }
            });
            emissionsData.push(data);
        }
    });

    // Print the global maximum value to the console for debugging
    console.log("Global maximum emissions value: ", globalMax);
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

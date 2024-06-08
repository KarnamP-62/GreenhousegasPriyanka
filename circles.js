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
function circleSize(index) {
    // Set initial circle diameter
    let initialDiameter = 20;
    
    // If the country's index is greater than 40, reduce the size of the circle
    if (index > 40) {
        return initialDiameter / 2;  // Reducing the diameter by half for countries beyond the 40th
    }
    return initialDiameter;
}

function drawCountries() {
    let padding = 400; // Space between circles
    let columns = 5; // Number of columns per row
    let circleDiameter = 20;
    let xOffset = (width - (columns * circleDiameter + (columns - 1) * padding) + 100) / 2; // Centering offset
    let yOffset = 800; // Initial y offset for the first row, adjusted to start 100 points lower

    emissionsData.forEach((data, index) => {
        let circleDiameter = circleSize(index);  // Get the diameter based on the index
        let x = xOffset + (index % columns) * (circleDiameter + padding);
        let y = yOffset + Math.floor(index / columns) * (circleDiameter + padding + 20); // Adding extra space for text

        // Draw sector lines and other elements as needed, adapting sizes and positions accordingly
        sectors.forEach((sector, i) => {
            let angle = TWO_PI / sectors.length * i;
            let sectorValue = data.sectors[sector];
            let lineLength = map(sectorValue, 0, data.maxValue, 50, 150); // Map value to a reasonable length
            let strokeWidth = map(sectorValue, 0, data.maxValue, 1, 10); // Map value to a reasonable stroke width

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
    print("This is drawCountries");
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
                data.sectors[sector] = Math.abs(row.getNum(sector));
            });
            data.maxValue = Math.max(...Object.values(data.sectors)); // Find max value for this country for scaling
            emissionsData.push(data);
        }
    });

    // Sort the array based on average emissions, descending
    emissionsData.sort((a, b) => b.maxValue - a.maxValue);
    
    // Print the emissions data to the console for debugging
    console.log(emissionsData);
    print("Loaded emissions data");
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

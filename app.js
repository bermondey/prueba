// Configuración inicial de la aplicación
const distanceElem = document.getElementById('distance');
const elevationElem = document.getElementById('elevation');
const avgSpeedElem = document.getElementById('avg-speed');
const temperatureElem = document.getElementById('temperature');

// Función para cargar los datos de temperatura desde el archivo JSON
async function loadTemperatureData() {
    try {
        const response = await fetch('temperatures.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo de temperatura');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar el archivo de temperatura:', error);
        return null;
    }
}

// Función para calcular distancia y elevación, y mostrar la temperatura del punto inicial
async function calculateStats(geojson) {
    const coords = geojson.features[0].geometry.coordinates;
    let totalDistance = 0;
    let totalElevation = 0;
    let previousCoord = null;
    
    // Calcular distancia y elevación acumulada
    coords.forEach(coord => {
        if (previousCoord) {
            totalDistance += turf.distance(turf.point(previousCoord), turf.point(coord));
            totalElevation += Math.max(0, coord[2] - previousCoord[2]); // Elevación acumulada
        }
        previousCoord = coord;
    });

    // Actualizar elementos de distancia, elevación y velocidad media
    distanceElem.innerText = `${totalDistance.toFixed(2)} km`;
    elevationElem.innerText = `${totalElevation.toFixed(0)} m`;
    avgSpeedElem.innerText = `${(totalDistance / (geojson.features[0].properties.time / 3600)).toFixed(2)} km/h`;

    // Cargar datos de temperatura y buscar la temperatura en la fecha y ubicación del primer punto
    const temperatureData = await loadTemperatureData();
    const [firstLon, firstLat] = coords[0];
    const date = new Date(geojson.features[0].properties.time).toISOString().split('T')[0];
    const coordKey = `${firstLat.toFixed(1)},${firstLon.toFixed(1)}`;

    // Mostrar la temperatura si está disponible
    if (temperatureData && temperatureData[date] && temperatureData[date][coordKey] !== undefined) {
        const temperature = temperatureData[date][coordKey];
        temperatureElem.innerText = `${temperature} °C`;
    } else {
        temperatureElem.innerText = 'N/A';
    }
}

// Función para cargar y mostrar el archivo GeoJSON
async function loadGeoJSON() {
    try {
        const response = await fetch('ruta.geojson');
        if (!response.ok) throw new Error('No se pudo cargar el archivo GeoJSON');
        const geojson = await response.json();
        calculateStats(geojson);  // Calcular y mostrar estadísticas
        // Aquí puedes agregar el código para visualizar el GeoJSON en el mapa si estás usando una librería como Mapbox
    } catch (error) {
        console.error('Error al cargar el archivo GeoJSON:', error);
    }
}

// Ejecutar la carga del GeoJSON al iniciar la aplicación
loadGeoJSON();

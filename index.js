const searchInput = document.querySelector('#search');
const container = document.querySelector('#container');
const title = document.querySelector('#title');

let countries = [];
// Recuerda usar tu propia llave de OpenWeatherMap aquí
const WEATHER_API_KEY = '8af7fc06c9b10570d70be5805c11c977'; 

// 1. Obtener países con campos específicos para evitar el error 400
const getCountries = async () => {
    try {
        const url = 'https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,subregion,timezones';
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Error en la petición");
        const data = await response.json();
        
        countries = data.map(c => ({
            name: c.name.common,
            flag: c.flags.svg || c.flags.png,
            capital: c.capital && c.capital.length > 0 ? c.capital[0] : 'N/A',
            population: c.population.toLocaleString('es-ES'), // Formato con puntos
            region: c.region,
            subregion: c.subregion || 'N/A',
            timezone: c.timezones ? c.timezones[0] : 'N/A'
        }));
        console.log("Países cargados");
    } catch (error) {
        console.error("Error:", error);
    }
};

// 2. Obtener clima de la capital
const getWeather = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=es`);
        return await response.json();
    } catch (error) { return null; }
};

// 3. Lógica de filtrado por inicio de palabra (.startsWith)
searchInput.addEventListener('input', async (e) => {
    const value = e.target.value.toLowerCase().trim();
    
    if (value === "") {
        title.style.display = "block"; // Home: Título e input
        container.innerHTML = "";
        return;
    }

    title.style.display = "none";
    const filtered = countries.filter(c => c.name.toLowerCase().startsWith(value));

    if (filtered.length > 10) {
        // Estado 1: Mensaje de búsqueda más específica
        container.innerHTML = `<p class="msg">Demasiados paises, especifica mejor tu busqueda</p>`;
    } 
    else if (filtered.length > 1 && filtered.length <= 10) {
        // Estado 2: Lista con nombre y bandera
        renderGrid(filtered);
    } 
    else if (filtered.length === 1) {
        // Estado 3: Un solo país (Detalle + Clima)
        const weather = await getWeather(filtered[0].capital);
        renderDetail(filtered[0], weather);
    } 
    else {
        container.innerHTML = `<p class="msg">No se encontraron resultados</p>`;
    }
});

// 4. Renderizar cuadrícula con evento de clic
function renderGrid(list) {
    container.innerHTML = list.map(c => `
        <div class="country-card" onclick="selectCountry('${c.name}')" style="cursor: pointer;">
            <img src="${c.flag}" alt="flag">
            <p>${c.name}</p>
        </div>
    `).join('');
}

// 5. Función para cuando haces clic en un país de la lista
async function selectCountry(countryName) {
    const country = countries.find(c => c.name === countryName);
    if (country) {
        searchInput.value = country.name; // Actualiza el input con el nombre clicado
        const weather = await getWeather(country.capital);
        renderDetail(country, weather);
    }
}

// 6. Renderizar detalle único (Estilo Venezuela)
function renderDetail(c, w) {
    const temp = w && w.main ? w.main.temp : '--';
    const desc = w && w.weather ? w.weather[0].description : 'Cargando clima...';

    container.innerHTML = `
        <div class="detail-card">
            <div class="detail-flag-container">
                <img src="${c.flag}">
                <div class="weather-bar">
                    <span>☁️ ${desc}</span>
                    <span>|</span>
                    <span>${temp} Celcius</span>
                </div>
            </div>
            <div class="detail-info">
                <h2>${c.name}</h2>
                <p><strong>Capital:</strong> ${c.capital}</p>
                <p><strong>Población:</strong> ${c.population} habitantes</p>
                <p><strong>Región:</strong> ${c.region}</p>
                <p><strong>Subregión:</strong> ${c.subregion}</p>
                <p><strong>Horario:</strong> ${c.timezone}</p>
            </div>
        </div>
    `;
}

getCountries();
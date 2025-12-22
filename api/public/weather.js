/* ======================================================
    DOM REFERENCES
====================================================== */
const fetchBtn = document.getElementById('fetchBtn');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const currentCondition = document.getElementById('condition');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCVG = document.getElementById('weathercvg');
const forecastList = document.getElementById('forecastList');
const navButtons = document.querySelectorAll('nav li');
const indicator = document.querySelector('.indicator');

const aqValue = document.getElementById('aqValue');
const aqText = document.getElementById('aqText');
const sunTimes = document.getElementById('sunTimes');
const sunGraphDiv = document.getElementById('sunGraph');

const windDiv = document.getElementById('wind');
const rainfallDiv = document.getElementById('rainfall');
const humidityDiv = document.getElementById('humidity');

const tempGraphCanvas = document.getElementById('tempGraph').getContext('2d');

/* ======================================================
    STATE
====================================================== */
let tempChart;
let isCelsius = true;
let weatherCache = null;
let currentCity = 'nigeria';

/* ======================================================
    TEMPERATURE HELPERS
====================================================== */
function toF(c) {
    return (c * 9 / 5 + 32).toFixed(1);
}

function formatTemp(c) {
    return isCelsius ? `${c}°C` : `${toF(c)}°F`;
}

/* ======================================================
    UI EVENTS
====================================================== */
document.getElementById('changeTemp').addEventListener('click', () => {
    isCelsius = !isCelsius;
    document.querySelector('.toggle-thumb').textContent = isCelsius ? '°C' : '°F';
    if (weatherCache) renderWeather(weatherCache);
});

fetchBtn.addEventListener('click', () => {
    if (cityInput.value) fetchWeather(cityInput.value);
});

cityInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && cityInput.value) {
    fetchWeather(cityInput.value);
    }
});

navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Move indicator
    indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
    indicator.style.width = `${btn.offsetWidth}px`;

    displayForecast(weatherCache);
    });
});


/* ======================================================
    TIME & SUN UTILITIES
====================================================== */
function timeToRatio(timeStr) {
    const [time, meridian] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (meridian === 'PM' && h !== 12) h += 12;
    if (meridian === 'AM' && h === 12) h = 0;
    return (h + m / 60) / 24;
}

function createSunGraph(sunrise, sunset) {
    const width = 300;
    const height = 60;
    const now = new Date();
    const nowRatio = (now.getHours() + now.getMinutes() / 60) / 24;

    const progress = Math.min(Math.max((nowRatio - sunrise) / (sunset - sunrise), 0), 1);
    const x = progress * width;
    const y = height - (Math.sin(progress * Math.PI) * height) + 25;

    sunGraphDiv.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}">
        <path d="M0 ${height} Q ${width / 2} 0 ${width} ${height}" stroke="gold" stroke-width="2" fill="none"/>
        <circle cx="${x}" cy="${y}" r="8" fill="#FFD700"/>
    </svg>`;
}

/* ======================================================
    WEATHER ICONS
====================================================== */
function getWeatherSVG(condition, size = 64) {
    condition = condition.toLowerCase();

    /* =====================
    THUNDER + RAIN
    ===================== */
    if (
    condition.includes('thunder') ||
    condition.includes('storm')
    ) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="icon thunder">
        <ellipse cx="32" cy="28" rx="18" ry="10" fill="#bbb"/>
        <polygon points="30,38 24,54 32,54 28,64 44,42 36,42 40,32"
            fill="#ffeb3b"/>
        <line x1="20" y1="44" x2="20" y2="56" stroke="#4fc3f7" stroke-width="3"/>
        <line x1="44" y1="44" x2="44" y2="56" stroke="#4fc3f7" stroke-width="3"/>
        </svg>
    `;
    }

    /* =====================
    PATCHY / LIGHT RAIN
    ===================== */
    if (
    condition.includes('patchy rain') ||
    condition.includes('light rain') ||
    condition.includes('rain')
    ) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="icon rain">
        <ellipse cx="32" cy="30" rx="18" ry="10" fill="#ccc"/>
        <line x1="22" y1="44" x2="22" y2="56" stroke="#4fc3f7" stroke-width="3"/>
        <line x1="32" y1="46" x2="32" y2="58" stroke="#4fc3f7" stroke-width="3"/>
        <line x1="42" y1="44" x2="42" y2="56" stroke="#4fc3f7" stroke-width="3"/>
        </svg>
    `;
    }

    /* =====================
    PARTLY CLOUDY
    ===================== */
    if (
    condition.includes('partly') ||
    condition.includes('partly cloudy')
    ) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="icon partly">
        <circle cx="24" cy="24" r="8" fill="gold"/>
        <ellipse cx="36" cy="36" rx="18" ry="10" fill="#ccc"/>
        <ellipse cx="26" cy="32" rx="14" ry="9" fill="#ddd"/>
        </svg>
    `;
    }

    /* =====================
    CLOUDY
    ===================== */
    if (condition.includes('cloud')) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="icon cloud">
        <ellipse cx="32" cy="36" rx="20" ry="12" fill="#ccc"/>
        <ellipse cx="24" cy="30" rx="14" ry="10" fill="#ddd"/>
        <ellipse cx="40" cy="30" rx="14" ry="10" fill="#eee"/>
        </svg>
    `;
    }

    /* =====================
    SUNNY / CLEAR
    ===================== */
    if (condition.includes('sun') || condition.includes('clear')) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" class="icon sun">
        <circle cx="32" cy="32" r="12" fill="gold"/>
        <g stroke="gold" stroke-width="3">
            ${Array.from({ length: 8 })
            .map(
                (_, i) =>
                `<line x1="32" y1="4" x2="32" y2="14"
                    transform="rotate(${i * 45} 32 32)" />`
            )
            .join("")}
        </g>
        </svg>
    `;
    }

    /* =====================
    FALLBACK
    ===================== */
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="10" fill="#999"/>
    </svg>
    `;
}

/* ======================================================
    API
====================================================== */
async function fetchWeather(city) {
if (!navigator.onLine) {
showAlert('No internet connection');
return;
}

setLoading(true);

try {
currentCity = city;
const safeCity = encodeURIComponent(city.trim());

// Request 7 days explicitly
const res = await fetch(`https://wttr.in/${safeCity}?format=j1&num_of_days=7`);
if (!res.ok) throw new Error('Failed request');

const data = await res.json();
if (!data.current_condition) throw new Error('City not found');

weatherCache = data;
renderWeather(data);

} catch (err) {
showAlert(err.message || 'Failed to fetch weather data');
} finally {
setLoading(false);
}
}

/* ======================================================
    RENDERING
====================================================== */
function renderWeather(data) {
    const current = data.current_condition[0];

    cityName.textContent = `${currentCity.charAt(0).toUpperCase() + currentCity.slice(1)}`;
    currentCondition.textContent = `${formatTemp(parseFloat(current.temp_C))} | ${current.weatherDesc[0].value}`;
    weatherIcon.innerHTML = getWeatherSVG(current.weatherDesc[0].value, 96);

    windDiv.innerHTML = `<span>${current.windspeedKmph}</span> <small>km/h</small>`;
    humidityDiv.innerHTML = `<span>${current.humidity}</span> <small>%</small>`;
    rainfallDiv.innerHTML = `<span>${current.precipMM}</span> <small>mm</small>`;

    const astro = data.weather[0].astronomy[0];
    sunTimes.textContent = `🌅 ${astro.sunrise} / 🌇 ${astro.sunset}`;
    createSunGraph(timeToRatio(astro.sunrise), timeToRatio(astro.sunset));

    updateAQI(current);
    displayForecast(data);
    drawTempGraph(data);
}

/* ==============================
DISPLAY FORECAST
============================== */
function expandTo24Hours(hourly) {
    const result = [];

    for (let i = 0; i < hourly.length - 1; i++) {
    const curr = hourly[i];
    const next = hourly[i + 1];

    const startTemp = Number(curr.tempC);
    const endTemp = Number(next.tempC);

    for (let h = 0; h < 3; h++) {
        const temp =
        startTemp + ((endTemp - startTemp) / 3) * h;

        const hour =
        (Number(curr.time) / 100 + h) % 24;

        result.push({
        time: String(hour).padStart(2, '0') + ':00',
        tempC: temp.toFixed(1),
        desc: curr.weatherDesc[0].value
        });
    }
    }

    return result.slice(0, 24);
}


function displayForecast(data) {
if (!data) return;
forecastList.innerHTML = '';
const type = document.querySelector('nav li.active').dataset.type;

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weatherDays = data.weather;

if (type === 'today') {
const todayHourly = weatherDays[0].hourly; // get today’s hourly data

// wttr.in gives 8 data points per day (every 3 hours)
// Expand it to show all 24 hours
const hourly24 = [];
for (let i = 0; i < todayHourly.length; i++) {
    const hourObj = todayHourly[i];
    const startHour = Number(hourObj.time) / 100; // 0, 3, 6...
    const temp = Number(hourObj.tempC);
    const desc = hourObj.weatherDesc[0].value;

    // Create 3 hourly points between each interval
    for (let j = 0; j < 3; j++) {
    const hour = startHour + j;
    hourly24.push({
        time: `${String(hour % 24).padStart(2, '0')}:00`,
        tempC: temp,
        desc: desc
    });
    }
}

// Ensure we only show 24 hours
hourly24.slice(0, 24).forEach(item => {
    forecastList.innerHTML += `
    <div class="data">
        <span class="date">${item.time}</span>
        <div class="mini-icon">${getWeatherSVG(item.desc, 40)}</div>
        <span class="temp">${formatTemp(item.tempC)}</span>
    </div>
    `;
});

} else {
// Weekly forecast (7 days) starting from today
const todayIndex = new Date().getDay();
for (let i = 0; i < 7; i++) {
    const day = weatherDays[i] || weatherDays[weatherDays.length - 1];
    const dayName = daysOfWeek[(todayIndex + i) % 7];

    forecastList.innerHTML += `
    <div class="data">
        <span class="date">${dayName}</span>
        <div class="mini-icon">
        ${getWeatherSVG(day.hourly[4]?.weatherDesc[0]?.value || 'Clear', 40)}
        </div>
        <span class="temp">${formatTemp(day.avgtempC)}</span>
    </div>
    `;
}
}
}


function drawTempGraph(data) {
  if (!data) return;

  let labels = [];
  let temps = [];

  const type = document.querySelector('nav li.active').dataset.type;

  if (type === 'today') {
    // Use the expanded 24-hour data
    const todayHourly = data.weather[0].hourly;
    const hourly24 = [];

    for (let i = 0; i < todayHourly.length; i++) {
      const hourObj = todayHourly[i];
      const startHour = Number(hourObj.time) / 100;
      const startTemp = Number(hourObj.tempC);
      const nextTemp = todayHourly[i + 1] ? Number(todayHourly[i + 1].tempC) : startTemp;
      const desc = hourObj.weatherDesc[0].value;

      // Interpolate 3 hourly points
      for (let j = 0; j < 3; j++) {
        const hour = (startHour + j) % 24;
        const temp = startTemp + ((nextTemp - startTemp) / 3) * j;
        hourly24.push({
          time: `${String(hour).padStart(2, '0')}:00`,
          tempC: temp.toFixed(1),
          desc
        });
      }
    }

    // Limit to 24 hours
    const final24 = hourly24.slice(0, 24);
    labels = final24.map(h => h.time);
    temps = final24.map(h => h.tempC);

  } else {
    // Weekly: use daily avg temp
    labels = data.weather.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    temps = data.weather.map(d => parseFloat(d.avgtempC));
  }

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(tempGraphCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: temps,
        borderColor: 'gold',
        tension: 0.45,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: true },
        y: { display: false }
      }
    }
  });
}


function updateAQI(current) {
    const humidity = parseInt(current.humidity);
    const wind = parseInt(current.windspeedKmph);

    let aq =
    humidity < 40 && wind > 15 ? 1 :
    humidity < 55 ? 2 :
    humidity < 70 ? 3 :
    humidity < 85 ? 4 : 5;

    const levels = [{
        text: 'Good',
        color: '#4CAF50'
    },
    {
        text: 'Fair',
        color: '#8BC34A'
    },
    {
        text: 'Moderate',
        color: '#FFC107'
    },
    {
        text: 'Poor',
        color: '#FF9800'
    },
    {
        text: 'Very Poor',
        color: '#F44336'
    }
    ];

    aqValue.style.width = `${aq * 20}%`;
    aqValue.style.backgroundColor = levels[aq - 1].color;
    aqText.textContent = levels[aq - 1].text;
}

function showAlert(message) {
    alert(message);
}

function autoLocate() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async pos => {
    const {
        latitude,
        longitude
    } = pos.coords;
    const res = await fetch(
        `https://wttr.in/${latitude},${longitude}?format=j1`
    );
    const data = await res.json();
    weatherCache = data;
    currentCity = data.nearest_area[0].areaName[0].value;
    renderWeather(data);
    });
}

window.addEventListener('load', autoLocate);

const CACHE = 'weather-v1';

self.addEventListener('install', e => {
    e.waitUntil(
    caches.open(CACHE).then(cache =>
        cache.addAll(['./', './style.css'])
    )
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
    caches.match(e.request).then(res =>
        res || fetch(e.request).then(fetchRes => {
        const clone = fetchRes.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return fetchRes;
        })
    )
    );
});

function setLoading(isLoading) {
    if (isLoading) {
    fetchBtn.classList.add('loading');
    } else {
    fetchBtn.classList.remove('loading');
    }
}
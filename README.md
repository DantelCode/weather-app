# 🌤️ Weather App

A modern, responsive, and interactive weather application built with **HTML**, **CSS**, and **JavaScript**. The app provides **real-time weather information**, including **current conditions, hourly forecast, weekly forecast, air quality, sunrise/sunset times, wind, humidity, and rainfall**. It features a dynamic **temperature graph** and weather **icons** for a rich visual experience.


## Table of Contents

* [Features](#features)
* [Demo](#demo)
* [Technologies Used](#technologies-used)
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)

## Features

* **Search any city worldwide** to get weather information.
* **Toggle between Celsius and Fahrenheit**.
* **Hourly forecast** for the current day (0–24 hours).
* **Weekly forecast** for 7 days starting from today.
* **Dynamic temperature graph** for both hourly and weekly data.
* **Weather icons** that visually represent conditions: sunny, cloudy, rainy, stormy, etc.
* **Air Quality Index (AQI)** visualization.
* **Sunrise and sunset graph** showing current sun position.
* **Wind, rainfall, and humidity** details.
* **Offline caching** with service worker for faster loading and basic offline support.
* Fully **responsive** and mobile-friendly.


## Demo
![Weather App Screenshot 1](https://github.com/DantelCode/weather-app/blob/main/api/screenshots/1.png)

You can also access the live demo [here](https://weather-nine-indol.vercel.app/).

## Technologies Used

* **HTML5 & CSS3** – Structure and styling
* **JavaScript (Vanilla)** – Application logic, DOM manipulation, and API handling
* **Chart.js** – Interactive temperature graphs
* **wttr.in API** – Weather data (JSON format)
* **Service Workers** – Offline caching and faster load times
* **Google Fonts** – Inter UI for typography

## Getting Started

### Prerequisites

* Modern web browser (Chrome, Firefox, Edge, Safari)
* Internet connection to fetch weather data

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/DantelCode/weather-app.git
```

2. **Navigate into the project directory**

```bash
cd weather-app
```

3. **In terminal run**

```bash
node api/server.js
```

4. **In browser open**

```bash
localhost:3000
```

## Usage

1. **Search for a city** using the search bar and press **Enter** or click **Search**.
2. **Switch temperature units** by clicking the **°C / °F toggle button**.
3. **View hourly forecast** for today or **7-day weekly forecast** by selecting tabs.
4. **Check weather details** like AQI, sunrise/sunset, wind, rainfall, and humidity in the details panel.


## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a **Pull Request**.


## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
* [wttr.in API](https://wttr.in/) for providing weather data.
* [Chart.js](https://www.chartjs.org/) for interactive graphing.


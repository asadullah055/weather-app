const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const cityInput = document.querySelector(".city-input");
const weatherCard = document.querySelector(".weather-cards");
const currentWeather = document.querySelector(".current-weather");
const API_KEY = "77b8fd1ea5375ece87f600bb82a91fb6";

const createWeatherCart = (cityName, weather, index) => {
  if (index === 0) {
    return `<div class="details">
              <h2>${cityName} (${weather.dt_txt.split(" ")[0]})</h2>
              <h4>Temperature: ${(weather.main.temp - 273.15).toFixed()}°C</h4>
              <h4>Wind: ${weather.wind.speed} M/S</h4>
              <h4>Humidity: ${weather.main.humidity}%</h4>
            </div>
            <div class="icon">
              <img
              src="https://openweathermap.org/img/wn/${weather.weather[0].icon
      }@2x.png"
              alt="weather-img"
              />
              <h4>${weather.weather[0].description}</h4>
            </div>`;
  } else {
    return `<li class="card">
              <h3>(${weather.dt_txt.split(" ")[0]})</h3>
              <img
                src="https://openweathermap.org/img/wn/${weather.weather[0].icon
      }@2x.png"
                alt="weather-img"
              />
              <h4>Temperature: ${(weather.main.temp - 273.15).toFixed()}°C</h4>
              <h4>Wind: ${weather.wind.speed} M/S</h4>
              <h4>Humidity: ${weather.main.humidity}%</h4>
            </li>`;
  }
};

const getWeatherDetails = async (cityName, lat, lon) => {
  const weather_api_url = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  try {

    const res = await fetch(weather_api_url);
    const data = await res.json()

    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter((forecast) => {
      const forecastDay = new Date(forecast.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDay)) {
        return uniqueForecastDays.push(forecastDay);
      }
    });

    cityInput.value = "";
    weatherCard.innerHTML = "";
    currentWeather.innerHTML = "";

    fiveDaysForecast.forEach((weather, index) => {
      if (index === 0) {
        currentWeather.innerHTML += createWeatherCart(
          cityName,
          weather,
          index
        );
      } else {
        weatherCard.innerHTML += createWeatherCart(cityName, weather, index);
      }
    });

  } catch (error) {
    console.log(error);
  }
};

const getCity = async () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  try {

    const res = await fetch(GEOCODING_API_URL)
    const data = await res.json()

    if (!data.length) return alert(`${cityName} not found`);
    const { name, lat, lon } = data[0];
    await getWeatherDetails(name, lat, lon);

  } catch (err) {
    console.log(err)
  }

};
const getUserLocation = async () => {

  try {
    const position = await new Promise((resolved, reject) => {
      navigator.geolocation.getCurrentPosition(resolved, reject)
    });

    console.log(position);
    const { latitude, longitude } = position.coords;
    const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    const { name } = data[0];
    await getWeatherDetails(name, latitude, longitude);

  } catch (error) {
    if (error.code === error.PERMISSION_DENIED) {
      alert(
        "Geolocation request denied. Please reset location permission to grant access again."
      );
    }
  }

};

locationBtn.addEventListener("click", getUserLocation);
searchBtn.addEventListener("click", getCity);
cityInput.addEventListener("keyup", e => e.key === 'Enter' && getCity());

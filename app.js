const checkBtn = document.getElementById("checkBtn");
const result = document.getElementById("result");
const recommendation = document.getElementById("recommendation");
const details = document.getElementById("details");

checkBtn.addEventListener("click", () => {
  checkBtn.disabled = true;
  checkBtn.textContent = "Checking weather...";

  if (!navigator.geolocation) {
    showResult("Location not supported", "Your browser does not support location services.");
    resetButton();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const weather = await getWeather(latitude, longitude);
        const advice = getWateringAdvice(weather);
        showResult(advice.title, advice.message);
      } catch (error) {
        showResult("Error", "I could not check the weather. Please try again.");
      }

      resetButton();
    },
    () => {
      showResult("Location blocked", "Please allow location access to check your local weather.");
      resetButton();
    }
  );
});

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  return await response.json();
}

function getWateringAdvice(weather) {
  const maxTemp = weather.daily.temperature_2m_max[0];
  const precipitation = weather.daily.precipitation_sum[0];
  const rainProbability = weather.daily.precipitation_probability_max[0];

  if (precipitation >= 2 || rainProbability >= 60) {
    return {
      title: "No need to water today",
      message: `Rain is expected. Max temperature: ${maxTemp}°C. Rain probability: ${rainProbability}%. Expected precipitation: ${precipitation} mm.`
    };
  }

  if (maxTemp >= 27 && rainProbability < 40) {
    return {
      title: "Yes, water today",
      message: `It will be warm and dry. Max temperature: ${maxTemp}°C. Rain probability: ${rainProbability}%.`
    };
  }

  return {
    title: "Check soil before watering",
    message: `Weather is moderate. Max temperature: ${maxTemp}°C. Rain probability: ${rainProbability}%. Water only if soil feels dry.`
  };
}

function showResult(title, message) {
  recommendation.textContent = title;
  details.textContent = message;
  result.classList.remove("hidden");
}

function resetButton() {
  checkBtn.disabled = false;
  checkBtn.textContent = "Should I water today?";
}

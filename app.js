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





const identifyBtn = document.getElementById("identifyBtn");
const plantImage = document.getElementById("plantImage");
const plantResult = document.getElementById("plantResult");
const plantName = document.getElementById("plantName");
const plantDetails = document.getElementById("plantDetails");

const PLANTNET_API_KEY = "PASTE_YOUR_API_KEY_HERE";

identifyBtn.addEventListener("click", async () => {
  const file = plantImage.files[0];

  if (!file) {
    alert("Please select or take a plant photo first.");
    return;
  }

  identifyBtn.disabled = true;
  identifyBtn.textContent = "Identifying...";

  try {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("organs", "leaf");

    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${2b10AaK4yh5uGYuj9BiiL1M9oO}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      showPlantResult("No plant found", "Try another photo with better lighting.");
      return;
    }

    const bestMatch = data.results[0];
    const commonName =
      bestMatch.species.commonNames && bestMatch.species.commonNames.length > 0
        ? bestMatch.species.commonNames[0]
        : "No common name available";

    const scientificName = bestMatch.species.scientificNameWithoutAuthor;
    const score = Math.round(bestMatch.score * 100);

    showPlantResult(
      commonName,
      `Scientific name: ${scientificName}. Confidence: ${score}%.`
    );
  } catch (error) {
    showPlantResult("Error", "Could not identify the plant. Please try again.");
  }

  identifyBtn.disabled = false;
  identifyBtn.textContent = "Identify Plant";
});

function showPlantResult(title, message) {
  plantName.textContent = title;
  plantDetails.textContent = message;
  plantResult.classList.remove("hidden");
}


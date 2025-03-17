const APIWEATHER = "6TEA3GTKUM9R2ZQ75GABG2VHZ";
const APIYANDEX = "abd5809c-26be-409f-b7dc-f6533a0fe6c0";

async function getGeolocation() {
  if (!("geolocation" in navigator)) {
    throw new Error("Геолокация не поддерживается вашим браузером.");
  }

  const location = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  console.log(location);
  const { latitude, longitude } = location.coords;
  return { latitude, longitude };
}
//Адресс по координатам
async function getAdress({ latitude, longitude }) {
  const response = await fetch(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${APIYANDEX}&geocode=${longitude},${latitude}&format=json`
  );
  const responseJSON = await response.json();
  const descriptionAdress =
    responseJSON.response?.GeoObjectCollection?.featureMember[0]?.GeoObject
      ?.description;

  if (!descriptionAdress) {
    throw new Error("Адрес не найден в ответе API");
  }

  const formatedAdres = descriptionAdress.split(',');
  
  console.log("Ваш Адрес:", formatedAdres);
  return descriptionAdress;
}

//Погода по координатам
async function getWether(location) {
    const loc =
      typeof location === "string"
        ? location
        : `${location.latitude},${location.longitude}`;

    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${loc}/?key=${APIWEATHER}&unitGroup=metric&lang=ru`
    );

    if (!response.ok) {
      throw new Error('Ошибка в HTTP getWeather: ',response.status)
    }

    const responseJSON = await response.json();


    const descriptionDay = responseJSON.days[0].conditions;
    const temp = responseJSON.currentConditions.temp;
    const feelslikeDay = responseJSON.currentConditions.feelslike;
    const humidity = responseJSON.currentConditions.humidity;
    const cloudcover = responseJSON.currentConditions.cloudcover;
    const windspeed = responseJSON.currentConditions.windspeed;

    console.log(responseJSON);
    console.log(`Температура ${temp}° градусов`);
    console.log("Температура ощущается: ", feelslikeDay);
    console.log(`Состояние дня: `, descriptionDay);
    console.log("Влажность: ", humidity);
    console.log("Облачность: ", cloudcover);
    console.log("Скорость ветра: ", windspeed);
    return {
      responseJSON,
      temp,
      descriptionDay,
      feelslikeDay,
      humidity,
      cloudcover,
      windspeed,
    };
}

function rendertCitySection ({
  responseJSON,
  temp,
  descriptionDay,
  feelslikeDay,
  humidity,
  cloudcover,
  windspeed,
},formatedAdres) {
  const tempCity = document.querySelector('.weatherCitySection__degrees')
  const 

  tempCity.innerHTML = `${temp}°`
}









(async () => {
  try {
    console.log('lol')
    const coordinates = await getGeolocation();
    const weather = await getWether(coordinates);
    const adress = getAdress(coordinates);
    rendertCitySection(weather,adress);
    console.log(coordinates);
    getWether(coordinates);
  } catch (error) {
    if (error.code === 1) {
      console.log("Пользователь отклонил запрос на геолокацию.");
    } else {
      console.error("Ошибка: ", error.message);
    }

  }
})();

const APIWEATHER = "6TEA3GTKUM9R2ZQ75GABG2VHZ";
const APIYANDEX = "abd5809c-26be-409f-b7dc-f6533a0fe6c0";

async function getGeolocation() {
  if (!("geolocation" in navigator)) {
    throw new Error("Геолокация не поддерживается вашим браузером.");
  }

  const location = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

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
  
  return formatedAdres[0];
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
  const nameCity = document.querySelector('.weatherCitySection__city')
  const tempCity = document.querySelector('.weatherCitySection__degrees')
  const timeCite = document.querySelector('.weatherCitySection__time')

console.log('')
  const dateNow = new Date();
  const daysWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота"
  ];
  const ArrayMonths = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря"
  ];
  const hourse = dateNow.getHours();
  const minutes = ()=> {
    if (dateNow.getMinutes()> 9) {
      return dateNow.getMinutes().toString();
    }
    return ("0" + dateNow.getMinutes())
  }
  const day = daysWeek[dateNow.getDay()];
  const dayMonth = dateNow.getDate();
  const month = ArrayMonths[dateNow.getMonth()];
  const year = dateNow.getFullYear();

  nameCity.innerHTML = `${formatedAdres}`
  tempCity.innerHTML = `${Math.floor(temp)}°`
  timeCite.innerHTML = `${hourse}:${minutes()} - ${day}, ${dayMonth} ${month} ‘${year}`
}

function renderMoreDetailed ({
  responseJSON,
  temp,
  descriptionDay,
  feelslikeDay,
  humidity,
  cloudcover,
  windspeed,
}) {
  const moreDetailed = document.querySelector('.moreDetailed__description')
  const tempNow = document.querySelector('.tempNow__meaning')
  const tempFeels = document.querySelector('.tempFeels__meaning')
  const humidityBlock = document.querySelector('.humidity__meaning')
  const cloudcoverBlock = document.querySelector('.cloudcover__meaning')
  const windSpeedBlock = document.querySelector('.windspeed__meaning')

  moreDetailed.innerHTML = `${descriptionDay}`
  tempNow.innerHTML = `${temp}°`
  tempFeels.innerHTML = `${feelslikeDay}°`
  humidityBlock.innerHTML = `${humidity}%`
  cloudcoverBlock.innerHTML = `${cloudcover}%`
  windSpeedBlock.innerHTML = `${windspeed}%`
}


function addCiteWeatherListener() {
  const input = document.querySelector('.search-form__input')
  const form = document.querySelector('.search-form')

  input.addEventListener('change',async function (event) {
    const city = event.target.value
    console.log("Вот адресс тут для евента",city)
    const weatherCity = await getWether(city);
    console.log(weatherCity)
    rendertCitySection(weatherCity,city);
    renderMoreDetailed(weatherCity)
  })

  form.addEventListener('submit',function(event) {
    event.preventDefault();

  })
}






(async () => {
  try {
    const coordinates = await getGeolocation();
    const weather = await getWether(coordinates);
    const adress = await getAdress(coordinates);
    rendertCitySection(weather,adress);
    renderMoreDetailed(weather)
    addCiteWeatherListener() 
  } catch (error) {
    if (error.code === 1) {
      console.log("Пользователь отклонил запрос на геолокацию.");
    } else {
      console.error("Ошибка: ", error.message);
    }
  }
})();

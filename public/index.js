const tempText = document.querySelector("#temp");
const feelsLikeText = document.querySelector("#feelsLike");
const minTempText = document.querySelector("#minTempText");
const maxTempText = document.querySelector("#maxTempText");
const humidityText = document.querySelector("#humidityText");
const windText = document.querySelector("#windText");
const sunriseText = document.querySelector("#sunriseText");
const sunsetText = document.querySelector("#sunsetText");
const weatherIcon = document.querySelector("#weatherIcon");
const searchBtn = document.querySelector("#searchBtn");
const searchBar = document.querySelector("#searchBar");
const errorMessage = document.querySelector("#errorMessage");
const newLocationBtn = document.querySelector("#newLocation");
const newLocationWindow = document.querySelector("#locationSelector");
const newLocationTextBar = document.querySelector("#newLocationText");
const errorMessage2 = document.querySelector("#errorMessage2");
const successMessage = document.querySelector("#successMessage");
const submitBtn = document.querySelector("#submitBtn");
const closeBtn = document.querySelector("#closeBtn");
const fahrenheitRadio = document.querySelector("#fahrenheit");
const celsiusRadio = document.querySelector("#celsius");

let pastUnit = "°F";
let unit = "°F";
let temp;
let feelsLike;
let minTemp;
let maxTemp;

async function getWeather(city){

    if(city == ""){
        errorMessage.style.visibility = "visible";
        return;
    }

    const apiResponse = await fetch(`/api?city=${city}`);
    console.log(apiResponse.weather);
    //Check to make sure valid info is returned (city entered properly)
    console.log(apiResponse.ok);
    if(apiResponse.ok){
        errorMessage.style.visibility = "hidden";

        var data = await apiResponse.json();
        temp = Math.round(data.main.temp);
        feelsLike = Math.round(data.main.feels_like);
        minTemp = Math.round(data.main.temp_min);
        maxTemp = Math.round(data.main.temp_max);

        // If the unit is °C, then change the temperatures gathered to Celcsius
        if(unit == "°C"){
            changeTemps();
        }

        changeInfo(data.name, temp, feelsLike, minTemp, maxTemp,Math.round(data.main.humidity),Math.round(data.wind.speed),
            calcTime(data.sys.sunrise*1000, data.timezone), calcTime(data.sys.sunset*1000, data.timezone), data.weather[0].icon, data.weather[0].description, data.timezone);

    }else{
        errorMessage.style.visibility = "visible";
    }

}

function calcTime(sec, offset){
    // Get the offset in hours and minutes just in case
    let offsetMin = offset % 3600;
    offset = Math.floor(offset/3600);
    // Get the date based off the milliseconds given
    date = new Date(sec);
    //Get Hours in UTC time
    let hours = date.getUTCHours();
    //Convert from military time to regualr
    hours = (hours > 12) ? hours -12 : hours;
    if(hours == 0) hours = 12;
    // Add the offset to hours
    hours += offset;
    hours = (hours <= 0) ? hours + 12 : hours;
    //Convert from military time to regular
    hours = (hours > 12) ? hours -12 : hours;
    // Minutes will usuallt be the same
    let minutes = date.getUTCMinutes() + offsetMin;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    // Format the time
    let newTime = hours +  ":" + minutes;
    return newTime;

}

searchBtn.addEventListener("click", function(){
    getWeather(searchBar.value);
});

fahrenheitRadio.addEventListener("click", function(){
    pastUnit = unit;
    unit = "°F";
    if(unit != pastUnit){
        changeUnit(unit);
    }
    
});

celsiusRadio.addEventListener("click", function(){
    pastUnit = unit;
    unit = "°C";
    if(unit != pastUnit){
        changeUnit(unit);
    }
});

newLocationBtn.addEventListener("click", function(){
    newLocationWindow.style.display = "block";

});

closeBtn.addEventListener("click", function(){
    newLocationWindow.style.display = "none"
    successMessage.style.display = "none";
    errorMessage2.style.display = "none";
    newLocationTextBar.value = "";
});

searchBar.addEventListener("keyup", function(event){
    if(event.keyCode == 13){
        searchBtn.click();
    }
});

newLocationTextBar.addEventListener("keyup", function(event){
    if(event.keyCode == 13){
        submitBtn.click();
    }
});


submitBtn.addEventListener("click", function(){
    let newLoc = newLocationTextBar.value;

    if(newLoc==""){
        errorMessage2.style.display = "block";
        return;
    }

    let result = checkCity(newLocationTextBar.value);    

    // This si basically the same function as getWeather(), except it creates a cookies if a location is valid
    async function checkCity(city){

        const apiResponse = await fetch(`/api?city=${city}`);
        
        if(!apiResponse.ok){
            errorMessage2.style.display = "block";
            errorMessage.style.visibility = "hidden";
            successMessage.style.display = "none";
            return;
        }else{
            // Set up new default location cookie
            const date = new Date();
            date.setTime(date.getTime() +  (730 * 24 * 60 * 60 * 1000));
            let expires = "expires=" + date.toUTCString();
            document.cookie = `defaultLocation=${newLoc}; ${expires}; path=/`;

            successMessage.style.display = "block";
            errorMessage2.style.display = "none";
            errorMessage.style.visibility = "hidden";
            ////

            var data = await apiResponse.json();

            temp = Math.round(data.main.temp);
            feelsLike = Math.round(data.main.feels_like);
            minTemp = Math.round(data.main.temp_min);
            maxTemp = Math.round(data.main.temp_max);

            // If the unit is °C, then change the temperatures gathered to Celcsius
            if(unit == "°C"){
                changeTemps();
            }

            changeInfo(data.name, temp, feelsLike, minTemp, maxTemp,Math.round(data.main.humidity),Math.round(data.wind.speed),
                calcTime(data.sys.sunrise*1000, data.timezone), calcTime(data.sys.sunset*1000, data.timezone), 
                data.weather[0].icon, data.weather[0].description);

        }
    }

    
});

//This is used to change the unit if the location is not changed
function changeUnit(unit){

    changeTemps();
   
    tempText.textContent = temp + unit;
    feelsLikeText.textContent = "Feels Like: "+ feelsLike + unit;
    minTempText.textContent = minTemp + unit;
    maxTempText.textContent = maxTemp + unit;

}

function toF(temp){
    return Math.round((temp * 1.8) + 32);

}

function toCelsius(temp){
    return Math.round((temp - 32) * (5/9));
}


function changeTemps(){

    if(pastUnit == "°F"){
        temp = toCelsius(temp);
        feelsLike = toCelsius(feelsLike);
        minTemp = toCelsius(minTemp);
        maxTemp = toCelsius(maxTemp);
    }else{
        temp = toF(temp);
        feelsLike = toF(feelsLike);
        minTemp = toF(minTemp);
        maxTemp = toF(maxTemp);
    }
}

function changeInfo(location, temp, feelsLike, minTemp, macTemp, humidity, wind, sunrise, sunset, weather, description, offSet){
    
    document.querySelector("#location h2").textContent = location;
    tempText.textContent = temp + unit;
    feelsLikeText.textContent = "Feels Like: "+ feelsLike + unit;
    minTempText.textContent = minTemp + unit;
    maxTempText.textContent = maxTemp + unit;
    humidityText.textContent = humidity + "%";
    windText.textContent = wind + " MPH";
    sunriseText.textContent = sunrise + " AM";
    sunsetText.textContent = sunset + " PM";

    weatherIcon.src = `images/${weather}.png`;
    weatherIcon.title = description;

    searchBar.value = "";

    if(weather[2] == 'n'){
        document.querySelector("#basicInfo").style.backgroundImage = "linear-gradient(to right, rgb(17, 17, 128), rgb(28, 27, 88))";
        document.querySelector("#advancedInfo").style.backgroundImage = "linear-gradient(to right, rgb(28, 27, 88), rgb(17, 17, 128))";
    }else if(weather[2] == 'd'){
        document.querySelector("#basicInfo").style.backgroundImage = "linear-gradient(to right, rgb(37, 195, 248) , rgb(77, 77, 185))";
        document.querySelector("#advancedInfo").style.backgroundImage = "linear-gradient(to right, rgb(77, 77, 185), rgb(37, 195, 248))";
    }

    
}

// Function that happens when the website is opened or refreshed
function startup(){

    let result = getCookie("defaultLocation");

    if(result == null){
        const date = new Date();
        date.setTime(date.getTime() +  (730 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString();
        document.cookie = `defaultLocation=New York; ${expires}; path=/`
        getWeather("New York");
    }else{
        getWeather(result);
    }

    function getCookie(name){
        const cDecoded = decodeURIComponent(document.cookie);
        const cArray = cDecoded.split("; ");
        let result = null;
        
        cArray.forEach(element => {
            if(element.indexOf(name) == 0){
                result = element.substring(name.length + 1)
            }
        });
        return result;
    }


}

startup();


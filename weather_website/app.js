const express = require('express');
require('dotenv').config();

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=";
const apiKey = process.env.API_KEY;

const app = express();

app.use(express.static('public'));

app.get('/api', async (request, response) => {
    const city = request.query.city;
    const apiResponse = await fetch(apiUrl + city + `&appid=${apiKey}`);
    let data;

    //Check to see if API succeeded
    if(apiResponse.status == 404){
        //If it failed send back an error
        response.status(404).json({error: "API Failed."});
        return;
    }else{
        //If it succeeded snef back a success status code and the data from API
        data = await apiResponse.json();
        response.status(201).json(data);
        return;
    }

});


app.listen(3000, () => {
    console.log("App listening on port 3000.")
})
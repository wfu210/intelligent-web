function adEvent(){
    var formArray= $("form").serializeArray();
    var data={};
    for (index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    // const data = JSON.stringify($(this).serializeArray());
    sendAjaxQuery("/", data);
    event.preventDefault();
}

function sendAjaxQuery(url, data) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            addToResults(dataR);
            storeCachedData(dataR.location, dataR);
            if (document.getElementById('offline_div')!=null)
                document.getElementById('offline_div').style.display='none';
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}


/**
 * called by the HTML onload
 * showing any cached forecast data and declaring the service worker
 */
function initWeatherForecasts() {
    loadData();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('./service-worker.js')
          .then(function() { console.log('Service Worker Registered'); })
          .catch ( function(error) {
              console.log(error.message);
          });
    }
    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
}

/**
 * given the list of cities created by the user, it will retrieve all teh data from
 * the server (or failing that) from the database
 */
function loadData(){
    var eventList=JSON.parse(localStorage.getItem('events'));
    eventList=removeDuplicates(eventList);
    // retrieveAllCitiesData(eventList, new Date().getTime());
    retrieveAllCitiesData(eventList)
}

/**
 * it cycles through the list of cities and requests the data from the server for each
 * city
 * @param cityList the list of the cities the user has requested
 * @param date the date for the forecasts (not in use)
 */
// function retrieveAllCitiesData(cityList, date){
function retrieveAllCitiesData(cityList){
    refreshCityList();
    for (index in cityList)
        loadCityData(cityList[index]);
}

/**
 * given one city and a date, it queries the server via Ajax to get the latest
 * weather forecast for that city
 * if the request to the server fails, it shows the data stored in the database
 * @param city
 * @param date
 */
// function loadCityData(city, date){
function loadCityData(event){
    const input = JSON.stringify({name:event1,location:loc1,date:new Date().getDate()});
    $.ajax({
        url: '/',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            addToResults(dataR);
            storeCachedData(dataR.location, dataR);
            if (document.getElementById('offline_div')!=null)
                    document.getElementById('offline_div').style.display='none';
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            showOfflineWarning();
            addToResults(getCachedData(city, date));
            const dvv= document.getElementById('offline_div');
            if (dvv!=null)
                    dvv.style.display='block';
        }
    });
    // hide the list of cities if currently shown
    if (document.getElementById('city_list')!=null)
        document.getElementById('city_list').style.display = 'none';
}


///////////////////////// INTERFACE MANAGEMENT ////////////


/**
 * given the forecast data returned by the server,
 * it adds a row of weather forecasts to the results div
 * @param dataR the data returned by the server:
 * class WeatherForecast{
  *  constructor (location, date, forecast, temperature, wind, precipitations) {
  *    this.location= location;
  *    this.date= date,
  *    this.forecast=forecast;
  *    this.temperature= temperature;
  *    this.wind= wind;
  *    this.precipitations= precipitations;
  *  }
  *}
 */
function addToResults(dataR) {
    if (document.getElementById('results') != null) {
        const row = document.createElement('div');
        // appending a new row
        document.getElementById('results').appendChild(row);
        // formatting the row by applying css classes
        row.classList.add('card');
        row.classList.add('my_card');
        row.classList.add('bg-faded');
        // the following is far from ideal. we should really create divs using javascript
        // rather than assigning innerHTML
        row.innerHTML = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-xs-2'><h4 class='card-title'>" + dataR.location + "</h4></div>" +
            // "<div class='col-xs-2'>" + getForecast(dataR.forecast) + "</div>" +
            // "<div class='col-xs-2'>" + getTemperature(dataR) + "</div>" +
            // "<div class='col-xs-2'>" + getPrecipitations(dataR) + "</div>" +
            // "<div class='col-xs-2'>" + getWind(dataR) + "</div>" +
            // "<div class='col-xs-2'>" + getHumidity(dataR) + "</div>" +
            "<div class='col-xs-2'></div></div></div>";
    }
}


/**
 * it removes all forecasts from the result div
 */
function refreshCityList(){
    if (document.getElementById('results')!=null)
        document.getElementById('results').innerHTML='';
}


/**
 * it enables selecting the city from the drop down menu
 * it saves the selected city in the database so that it can be retrieved next time
 * @param city
 * @param date
 */
function selectCity(city, date) {
    var cityList=JSON.parse(localStorage.getItem('cities'));
    if (cityList==null) cityList=[];
    cityList.push(city);
    cityList = removeDuplicates(cityList);
    localStorage.setItem('cities', JSON.stringify(cityList));
    retrieveAllCitiesData(cityList, date);
}



/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    console.log("You are online");
    hideOfflineWarning();
    loadData();
}, false);


function showOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}



/**
 * Given a list of cities, it removes any duplicates
 * @param cityList
 * @returns {Array}
 */
function removeDuplicates(cityList) {
    // remove any duplicate
       var uniqueNames=[];
       $.each(cityList, function(i, el){
           if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
       });
       return uniqueNames;
}


function sendLoginInfo(url, data) {
    $.ajax({
        url: url ,
        data: data,
        dataType: 'json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            var ret = dataR;
            // in order to have the object printed by alert
            // we need to JSON stringify the object

            // $('result').text('The page has been successfully loaded');
            document.getElementById('results').innerHTML= JSON.stringify(ret);
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}


function onSubmit(url) {
    // var eml = $("#eml").val();
    // var psw = $("#psw").val();
    // var loginData={'email': eml, 'password':psw};
    event.preventDefault();
    console.log('login info snet')
    var loginData = $("form").serialize();
    sendLoginInfo(url, loginData);
    console.log('login info snet')

}

// function onSubmit(url) {
//     var formArray= $("form").serializeArray();
//     var data={};
//     for (index in formArray){
//         data[formArray[index].name]= formArray[index].value;
//     }
//     // const data = JSON.stringify($(this).serializeArray());
//     sendLoginInfo(url, data);
//     event.preventDefault();
// }

function checkForErrors(isLoginCorrect){
    if (!isLoginCorrect){
        alert('login or password is incorrect');
    }
}
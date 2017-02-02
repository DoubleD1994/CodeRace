$( document ).ready(function(){
                    navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 30000});
                    
                    function onSuccess(position){
                    
                    

                    
                    var lat=position.coords.latitude;
                    var lang=position.coords.longitude;
                    var iconBase = "img/";
                    //Google Maps - first three variables can be used to initialise game
                    //it gets players location and marks it on the map
                    //then centers the map to there location.
                    var myLatlng = new google.maps.LatLng(lat, lang);
                    var mapOptions = {zoom: 15,center: myLatlng}
                    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                    var marker = new google.maps.Marker({position: myLatlng,map: map, icon: iconBase + 'playerLocation.PNG'});
                    
                    
                    //var icons = {locations: {icon: iconBase + 'logo.PNG'}}
                    
                    var url="http://ddryburgh.comli.com/getLocationInfo.php";
                    
                    $.getJSON(url, function(result){
                              console.log(result);
                              $.each(result, function(i, field){
                                     
                                     var locationLat=field.latitude;
                                     var locationLong=field.longitude;
                                     var clue = field.clue;
                                     var correctAnswer = field.answer;
                                     var location = new google.maps.LatLng(locationLat, locationLong);
                                     var newMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'logo.PNG'});
                                     newMarker.addListener('click', function(){
                                                           var answer = prompt(clue, "")
                                                           
                                                                if(answer==correctAnswer)
                                                                {
                                                                    alert("Your answer was correct");
                                                                }
                                                                else
                                                                {
                                                                    alert("Wrong! The correct answer was: " + correctAnswer);
                                                                }
                                                           
                                                           
                                                           });
                                     });
                              });
                    

                    }
                    
                    function onError(error) {
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    }
                    
                    google.maps.event.addDomListener(window, 'load', onSuccess);
});

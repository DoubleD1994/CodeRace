$( document ).ready(function(){
                    
                    
                    //Google Maps - first three variables can be used to initialise game
                    //it gets players location and marks it on the map
                    //then centers the map to there location.
                    //var map;
                    var marker;
                    //var myLatlng;
                    
                    
                    
                    //initialise the map
                    //function initMap(){
                    
                        var mapOptions = {zoom: 15,center: {lat: 55.932875, lng: -3.214545}}
                        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                     //   alert("hi");
                   // }
                    
                    
                    navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true, timeout: 30000, maximumAge: 3000});
                    
                    //get the players location
                    function onSuccess(position){
                    
                        var lat=position.coords.latitude;
                        var lang=position.coords.longitude;
                                        //Google Maps - first three variables can be used to initialise game
                        //it gets players location and marks it on the map
                        //then centers the map to there location.
                        //myLatlng = new google.maps.LatLng(lat, lang);
                        //var mapOptions = {zoom: 15,center: myLatlng}
                        //var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                    
                        displayMarker(lat, lang);
                        theLocations();
                        //initMap();
                    }
                    
                    //initMap();
                    
                    //display player location on map and send locaiton to db
                    function displayMarker(lat, lang){
                    
                    var myLatlng = new google.maps.LatLng(lat, lang);
                    
                    var iconBase = "img/";
                    marker = new google.maps.Marker({position: myLatlng,map: map, icon: iconBase + 'playerLocation.PNG'});
                    //var icons = {locations: {icon: iconBase + 'logo.PNG'}}
                    
                    //The players marker should always be at the front
                    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                    
                    //send players location to the database
                    $.ajax({
                           url: 'https://api.mlab.com/api/1/databases/coderace/collections/players/'+localStorage.username+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O',
                           data: JSON.stringify({
                                                "username": localStorage.username,
                                                "password": localStorage.password,
                                                "team_id": localStorage.team,
                                                "latitude": lat,
                                                "longitude": lang
                                                }),
                           type: 'PUT',
                           contentType: "application/json",
                           success: function(data){},
                           error: function(xhr, status, err)
                           {
                           alert(err);
                           }
                           
                    });
                    }
                    
                    
                    
                    //To show other players locations
                    $("#showTask").click(function(){
                                  var iconBase = "img/";
                                         
                                         //get players locations from database
                                         $.ajax({
                                            url: "https://api.mlab.com/api/1/databases/coderace/collections/players?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                                         }).done(function(data){
                                                        
                                                        $.each(data, function(i, data){
                                                               
                                                               //display location of other players
                                                               var playerLat=data.latitude;
                                                               var playerLong=data.longitude;
                                                               
                                                               var playerLocation = new google.maps.LatLng(playerLat, playerLong);
                                                               
                                                               var playerMarker = new google.maps.Marker({position: playerLocation, map: map, icon: iconBase + 'otherPlayers.PNG'});
                                                               
                                                               
                                                               
                                                        });
                                                        
                                         });
                    });
                    
                    
                    //get the locations of the markers
                    function theLocations(){
                    
                    var iconBase = "img/";
                    
                    //This ajax to loop through the locations documents to get markers
                    $.ajax({
                        url: "https://api.mlab.com/api/1/databases/coderace/collections/locations?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                    }).done(function(data){
                              $.each(data, function(i, data){
                                     
                                     //set variables to each locations attributes
                                     var locationLat=data.latitude;
                                     var locationLong=data.longitude;
                                     var clue = data.clue;
                                     var correctAnswer = data.answer;
                                     var isClaimed = data.claimed
                                     
                                     //set the location on google maps api
                                     var location = new google.maps.LatLng(locationLat, locationLong);
                                     
                                     //add new marker for unclaimed location
                                     var locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'logo.PNG'});;
                                     
                                     //check is location is already claimed
                                     if(isClaimed=="false")
                                     {
                                     
                                     
                                     
                                     //add listener for when a marker is clicked
                                     locationMarker.addListener('click', function(){
                                                           //display answer box
                                                           var answer = prompt(clue, "")
                                                                //check if answer is correct
                                                                if(answer==correctAnswer)
                                                                {
                                                                    //Little pop up message to alert player if correct answer
                                                                    var x = document.getElementById("correct")
                                                                    x.className = "show";
                                                                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
                                                           
                                                                    //change marker from claimable to claimed
                                                                    locationMarker.setIcon(iconBase + 'claimed.PNG');
                                                                    //locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'claimed.PNG'});
                                                           
                                                                    //loop through teams in db
                                                                    $.ajax({
                                                                           url: "https://api.mlab.com/api/1/databases/coderace/collections/team?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                                                                           }).done(function(data){
                                                                                   $.each(data, function(i, data){
                                                                                                //get teams current score
                                                                                                var score = data.score;
                                                                                          
                                                                                                //find the players team
                                                                                                if(data.team_name==localStorage.team)
                                                                                                {
                                                                                                    var url = 'https://api.mlab.com/api/1/databases/coderace/collections/team/'+data.team_name+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O';
                                                                                                    score++;
                                                                                          
                                                                                                    //update teams score
                                                                                                    $.ajax({
                                                                                                            url: url,
                                                                                                            data: JSON.stringify({
                                                                                                                                 "team_name":data.team_name,
                                                                                                                                 "score":score
                                                                                                                      }),
                                                                                                            type: 'PUT',
                                                                                                            contentType: "application/json",
                                                                                                            success: function(data){
                                                                                                           
                                                                                                                var newUrl = 'https://api.mlab.com/api/1/databases/coderace/collections/locations/'+correctAnswer+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O';
                                                                                                                var beenClaimed = "true";
                                                                                                           
                                                                                                                //Update markers in database to show location claimed
                                                                                                                $.ajax({
                                                                                                                       url: newUrl,
                                                                                                                       data: JSON.stringify({
                                                                                                                                            "latitude": locationLat,
                                                                                                                                            "longitude": locationLong,
                                                                                                                                            "clue": clue,
                                                                                                                                            "answer": correctAnswer,
                                                                                                                                            "claimed": beenClaimed
                                                                                                                       }),
                                                                                                                       type: 'PUT',
                                                                                                                       contentType: "application/json",
                                                                                                                       success: function(data){},
                                                                                                                       error: function(xhr, status, err)
                                                                                                                       {
                                                                                                                        alert(err);
                                                                                                                       }
                                                                                                           
                                                                                                                });
                                                                                                           
                                                                                                            },
                                                                                                            error: function(xhr, status, err)
                                                                                                            {
                                                                                                                alert(err);
                                                                                                            }
                                                                                                            });
                                                                                                }
                                                                                          });
                                                                                   });
                                                                }
                                                                else
                                                                {
                                                                    //Little pop up message to alert player if correct answer
                                                                    var x = document.getElementById("wrong")
                                                                    x.className = "show";
                                                                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
                                                                }
                                                           
                                                           
                                                           });
                                     }
                                     else
                                     {
                                        //add new marker for unclaimed location
                                        //newMarker.setVisible(false);
                                        //place marker to say location claimed
                                        //locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'claimed.PNG'});
                                        locationMarker.setIcon(iconBase + 'claimed.PNG');
                                     }
                                     });
                              });
                    

                    }
                    
                    function onError(error) {
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    }
                    
              //google.maps.event.addDomListener(window, 'load', initMap);
});



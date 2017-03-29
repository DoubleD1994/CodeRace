$( document ).ready(function(){
                    
                    
                    var map;
                    var marker;
                    var runInitMap = 0;
                    
                    //an array to store player marker and location markers
                    //this will be emptied on each refresh in order to update map information
                    var allMarkers = [];
                    
                    function loadAsynchonousScript(){
                    var script = document.createElement('script');
                    script.type='text/javascript';
                    script.src='http://maps.googleapis.com/maps/api/js?key=AIzaSyAirR6LINaMUr8Sj17doOCvs3euBvz7-cs&sensor=false&libraries=places&callback=initialize';
                    document.body.appendChild(script);
                    
                    }
                    
                    //initialise the map
                   function initMap(latitude, longitude){
                    
                    //Little pop up message to alert player if correct answer
                    var x = document.getElementById("theTime")
                    x.className = "show";
                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000000);
                    
                    //center map to players current location, don't allow players to use the google street view
                    var mapOptions = {zoom: 15,center: {lat: latitude, lng: longitude}, streetViewControl: false}
                    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                   }
                    
                    //get the location of the player and update it as they move
                    navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true, timeout: 30000, maximumAge: 3000});
                    
                    //run the function to get a players location
                    function onSuccess(position){
                    
                        var lat=position.coords.latitude;
                        var lang=position.coords.longitude;
                    
                    
                        //remove all markers from the map and set the array length to 0
                        while(allMarkers.length) { allMarkers.pop().setMap(null);}
                        allMarkers.length=0;
                    
                        mapBlock();
                        theLocations();
                        displayMarker(lat, lang);
                    
                        //so the map only loads once
                        if(runInitMap<5)
                        {
                            initMap(lat, lang);
                            runInitMap=10;
                        }
                    }
                    
                    
                    //display player location on map and send locaiton to db
                    function displayMarker(lat, lang){
                    
                        var myLatlng = new google.maps.LatLng(lat, lang);
                    
                        var iconBase = "img/";
                        marker = new google.maps.Marker({position: myLatlng,map: map, icon: iconBase + 'playerLocation.PNG'});
                    
                        //add marker to array
                        allMarkers.push(marker);
                    
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
                           //alert(err);
                           }
                           
                        });
                    }
                    
                    var thePlayerMarkers = [];
                    var refreshInterval;
                    var clickNumber = 0;
                    //To show other players locations
                    $("#showTask").click(function(){
                                
                                //for first click show players. second click hide players
                                if(clickNumber==0){
                                         //run the function every second to get an update on players current locations
                                         refreshInterval = setInterval(showFunction, 1000);
                                         clickNumber=1;
                                         $("#showTask").html('Hide');
                                }
                                else
                                {
                                         //end the refresh interval so that other players locations are hidden
                                         clearInterval(refreshInterval);
                                         while(thePlayerMarkers.length) { thePlayerMarkers.pop().setMap(null);}
                                         thePlayerMarkers.length=0;
                                         clickNumber=0;
                                         $("#showTask").html('Show');
                                }
                                         
                                //function to run that get location of other players
                                function showFunction(){
                                  
                                  //clear the players locations array on each update
                                  while(thePlayerMarkers.length) { thePlayerMarkers.pop().setMap(null);}
                                  thePlayerMarkers.length=0;
                                         
                                  var iconBase = "img/";
                                         //get players locations from database
                                         $.ajax({
                                            url: "https://api.mlab.com/api/1/databases/coderace/collections/players?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                                         }).done(function(data){
                                                        
                                                        $.each(data, function(i, data){
                                                               
                                                               //display location of other players
                                                               var playerLat=data.latitude;
                                                               var playerLong=data.longitude;
                                                               var playerTeam=data.team_id;
                                                               
                                                               var playerLocation = new google.maps.LatLng(playerLat, playerLong);
                                                               
                                                               //check what team a player is to display appropriate marker
                                                               if(playerTeam==localStorage.team)
                                                               {
                                                                    //to make sure the players location isn't shown twice
                                                                    if(!(data.username==localStorage.username))
                                                                    {
                                                                        var playerMarker = new google.maps.Marker({position: playerLocation, map: map, icon: iconBase + 'sameTeamPlayers.PNG'});
                                                                        thePlayerMarkers.push(playerMarker);
                                                                    }
                                                               }
                                                               else
                                                               {
                                                                var playerMarker = new google.maps.Marker({position: playerLocation, map: map, icon: iconBase + 'otherPlayers.PNG'});
                                                                thePlayerMarkers.push(playerMarker);
                                                               }
                                                        });
                                                        
                                         });
                                }
                                        
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
                                     var isClaimed = data.claimed;
                                     var isVisible = data.visible;
                                     var difficulty = data.difficulty;
                                     
                                     //need isVisible function
                                     
                                     //set the location on google maps api
                                     var location = new google.maps.LatLng(locationLat, locationLong);
                                     
                                     //add new marker for unclaimed location
                                     var locationMarker
                                     
                                     //check is location is already claimed
                                     if(isClaimed=="false" && isVisible=="true")
                                     {
                                        //check difficulty ratings so that appropriate marker displayed
                                        if(difficulty=="easy")
                                        {
                                            //add listener for when a marker is clicked
                                            locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'logo.PNG'});
                                        }
                                        else if(difficulty=="medium")
                                        {
                                            locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'medium.PNG'});
                                        }
                                        else if(difficulty=="hard")
                                        {
                                            locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'hard.PNG'});
                                        }
                                        else if(difficulty=="point swing")
                                        {
                                            locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'pointSwing.PNG'});
                                        }
                                        else if(difficulty=="hide map")
                                        {
                                            locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'hideMaps.PNG'});
                                        }
                                     
                                     
                                        //add location markers to the array
                                        allMarkers.push(locationMarker);
                                     
                                        locationMarker.addListener('click', function(){
                                                           //display answer box
                                                           var answer = prompt(clue, "")
                                                                //check if answer is correct
                                                                if(answer==correctAnswer)
                                                                {
                                                                   
                                                                   var markerScore = 0;
                                                                   //depending on marker difficulty, add the correct points score to the teams score
                                                                   if(difficulty=="easy")
                                                                   {
                                                                        markerScore = 1;
                                                                   }
                                                                   else if(difficulty=="medium")
                                                                   {
                                                                        markerScore = 2;
                                                                   }
                                                                   else if(difficulty=="hard")
                                                                   {
                                                                        markerScore = 3;
                                                                   }
                                                                   else if(difficulty=="point swing")
                                                                   {
                                                                        //if the marker is the point swing marker, then add 3 to players team
                                                                        markerScore = 3;
                                                                   
                                                                        //loop through teams in db so that other teams score lose 2 points
                                                                        $.ajax({
                                                                               url: "https://api.mlab.com/api/1/databases/coderace/collections/team?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                                                                          }).done(function(data){
                                                                                  $.each(data, function(i, data){
                                                                                         //get teams current score
                                                                                         var score = data.score;
                                                                                         
                                                                                         //find the players team
                                                                                         if(!(data.team_name==localStorage.team))
                                                                                         {
                                                                                         var url = 'https://api.mlab.com/api/1/databases/coderace/collections/team/'+data.team_name+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O';
                                                                                         score=score-2;
                                                                                         
                                                                                         //update teams score
                                                                                         $.ajax({
                                                                                                url: url,
                                                                                                data: JSON.stringify({
                                                                                                                     "team_name":data.team_name,
                                                                                                                     "score":score
                                                                                                                     }),
                                                                                                type: 'PUT',
                                                                                                contentType: "application/json",
                                                                                                success: function(data){},
                                                                                                error: function(xhr, status, err)
                                                                                                {
                                                                                                //alert(err);
                                                                                                }
                                                                                                });
                                                                                         }
                                                                                         });
                                                                                  });
                                                                   
                                                                   }
                                                                   //if a player claims this marker, players on other team will have there map hidden for 1 minute
                                                                   else if(difficulty=="hide map")
                                                                   {
                                                                        markerScore = 1;
                                                                   
                                                                        $.ajax({
                                                                          url: "https://api.mlab.com/api/1/databases/coderace/collections/players?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O",
                                                                          }).done(function(data){
                                                                                  $.each(data, function(i, data){
                                                                                         
                                                                                         var player=data.username;
                                                                                         var team=data.team_id;
                                                                                         var takeEffect="false";
                                                                                         
                                                                                         if(!(team==localStorage.team))
                                                                                         {
                                                                                            $.ajax({
                                                                                                url: "https://api.mlab.com/api/1/databases/coderace/collections/hideplayermaps?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O",
                                                                                                data: JSON.stringify({
                                                                                                                     "_id":player,
                                                                                                                     "player": player,
                                                                                                                     "team": team,
                                                                                                                     "takeEffect": takeEffect
                                                                                                                     }),
                                                                                                type: 'POST',
                                                                                                contentType: "application/json",
                                                                                                success: function(data){},
                                                                                                error: function(xhr, status, err)
                                                                                                {
                                                                                                //alert(err);
                                                                                                }
                                                                                            });
                                                                                         }
                                                                                         });
                                                                                  
                                                                                  });
                                                                   
                                                                   
                                                                   }
                                                                   
                                                                    //Little pop up message to alert player if correct answer
                                                                    var x = document.getElementById("correct")
                                                                    x.className = "show";
                                                                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
                                                                
                                                                    //change marker from claimable to claimed
                                                                    locationMarker.setIcon(iconBase + 'claimed.PNG');
                                                                
                                                                
                                                           
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
                                                                                                    score=score+markerScore;
                                                                                          
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
                                                                                                                                            "claimed": beenClaimed,
                                                                                                                                            "visible": "true",
                                                                                                                                            "difficulty": difficulty
                                                                                                                       }),
                                                                                                                       type: 'PUT',
                                                                                                                       contentType: "application/json",
                                                                                                                       success: function(data){},
                                                                                                                       error: function(xhr, status, err)
                                                                                                                       {
                                                                                                                        //alert(err);
                                                                                                                       }
                                                                                                           
                                                                                                                });
                                                                                                           
                                                                                                            },
                                                                                                            error: function(xhr, status, err)
                                                                                                            {
                                                                                                                //alert(err);
                                                                                                            }
                                                                                                            });
                                                                                                }
                                                                                          });
                                                                                   });
                                                                
                                                                //This ajax to loop through the locations documents to get markers
                                                                $.ajax({
                                                                       url: "https://api.mlab.com/api/1/databases/coderace/collections/locations?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                                                                       }).done(function(data){
                                                                               
                                                                               //counter so that only 2 new locations become visible
                                                                               var counter = 0;
                                                                               
                                                                               //loop through each marker
                                                                               $.each(data, function(i, data){
                                                                                      //get 2 markers which has visible set to false and update them so that they become visible
                                                                                      if(counter<2)
                                                                                      {
                                                                                      if(data.visible=="false")
                                                                                      {
                                                                                      var markerUrl = 'https://api.mlab.com/api/1/databases/coderace/collections/locations/'+data.answer+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O';
                                                                                      
                                                                                      //Update markers in database to show 2 more locations
                                                                                      $.ajax({
                                                                                             url: markerUrl,
                                                                                             data: JSON.stringify({
                                                                                                                  "latitude": data.latitude,
                                                                                                                  "longitude": data.longitude,
                                                                                                                  "clue": data.clue,
                                                                                                                  "answer": data.answer,
                                                                                                                  "claimed": data.claimed,
                                                                                                                  "visible": "true",
                                                                                                                  "difficulty": data.difficulty
                                                                                                                  }),
                                                                                             type: 'PUT',
                                                                                             contentType: "application/json",
                                                                                             success: function(data){},
                                                                                             error: function(xhr, status, err)
                                                                                             {
                                                                                             //alert(err);
                                                                                             }
                                                                                             
                                                                                             });
                                                                                      counter++
                                                                                      }
                                                                                      
                                                                                      }
                                                                                      
                                                                                      });
                                                                               });
                                                                }
                                                                else
                                                                {
                                                                    //Little pop up message to alert player if wrong answer
                                                                    var x = document.getElementById("wrong")
                                                                    x.className = "show";
                                                                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
                                                                }
                                                           
                                                           
                                                           });
                                     }
                                     else if(isClaimed=="true" && isVisible=="true")
                                     {
                                        //add new marker for unclaimed location
                                        //newMarker.setVisible(false);
                                        //place marker to say location claimed
                                        locationMarker = new google.maps.Marker({position: location, map: map, icon: iconBase + 'claimed.PNG'});
                                        //locationMarker.setIcon(iconBase + 'claimed.PNG');
                                     }
                                     });
                              });
                    

                    }
                    
                    function mapBlock(){
                        $.ajax({
                           url: "https://api.mlab.com/api/1/databases/coderace/collections/hideplayermaps?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                           }).done(function(data){
                                   $.each(data, function(key,data){
                                        if(data.player==localStorage.username&&data.takeEffect=="false")
                                        {
                                          var updateUrl = 'https://api.mlab.com/api/1/databases/coderace/collections/hideplayermaps/'+data.player+'?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O';
                                          var takeEffect = "true";
                                          
                                          $.ajax({
                                                 url: updateUrl,
                                                 data: JSON.stringify({
                                                                      "player": data.player,
                                                                      "team": data.team,
                                                                      "takeEffect": takeEffect
                                                                      }),
                                                 type: 'PUT',
                                                 contentType: "application/json",
                                                 success: function(data){},
                                                 error: function(xhr, status, err)
                                                 {
                                                 
                                                 }
                                            });
                                          
                                          window.location.href = "mapBlockPage.html";
                                        }
                                   });

                                   
                        });
                    }
                    
                    function onError(error) {
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    }
                    
});



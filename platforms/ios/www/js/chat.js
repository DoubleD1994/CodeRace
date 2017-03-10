$( document ).ready(function(){
                    
                    $("#send-message").on('submit', function(e){
                                          e.preventDefault();
                                          
                                          var sender = localStorage.username;
                                          var team = localStorage.team;
                                          var message = $('#message').val();
                                          
                                          $.ajax({
                                                 url: "https://api.mlab.com/api/1/databases/coderace/collections/messages?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O",
                                                 data: JSON.stringify({
                                                                        "sender": sender,
                                                                        "team": team,
                                                                        "message": message
                                                                     }),
                                                 type: 'POST',
                                                 contentType: "application/json",
                                                 success: function(data){window.location.href="chatPage.html"},
                                                 error: function(xhr, status, err)
                                                 {
                                                    alert(err);
                                                 }
                                          });
                                          
                                          
                                            
                    })
                    
                    
                    
                    getMessages();
                    
                    
                    //get the messages from the db and display them on the page
                    function getMessages(){
                    
                    $.ajax({
                           url: "https://api.mlab.com/api/1/databases/coderace/collections/messages?apiKey=gSDJbLmGR6TY76g_31pBOWAWu-201Y7O"
                           }).done(function(data){
                                   
                                   var output = '<div>';
                                   $.each(data, function(key,data){
                                          
                                          //display only message for the players team
                                          if(data.team==localStorage.team)
                                          {
                                            output += '<p><b>' + data.sender + '</b><br>' + data.message + '</p>';
                                          }
                                          
                                   });
                                   
                                   output += '</div>';
                                   $('#theMessages').html(output);
                                   
                                   });
                    
                    }

});


var app = {};

app.init = function() {
	this.server = "http://127.0.0.1:3000",
	this.contentType = "application/json"
}

app.init();
app.fetch = function(room) {
  var queryData = {
    order: "-createdAt",
    limit: "10",
  }
  if (room) queryData.where = {"roomname": String(room)};

	$.ajax({
		url: app.server,
    // data: queryData,
		type: "GET",
		contentType: app.contentType,
		success: function(data) {
      for (var i = 0; i < data.results.length; i++) {
        if (data.results[i].hasOwnProperty("text")) {data.results[i].text = String(data.results[i].text).replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        if (data.results[i].hasOwnProperty("roomname")) {data.results[i].roomname = String(data.results[i].roomname).replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        if (data.results[i].hasOwnProperty("username")) {data.results[i].username = String(data.results[i].username).replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        app.addToRoom(data.results[i]);
      }
      app.formatFriends();
		},
		error: function() {
			console.log("error")
		}
	});
};

app.send = function(message) {
	$.ajax({
		url: app.server,
		type: "POST",
		data: JSON.stringify(message),
		contentType: app.contentType,
		success: function() {
			console.log("success");
      app.fetch(message.roomname);
		},
		error: function() {
			console.log("error")
		}
	});
}

app.clearMessages = function() {
  $('#chats').html('');
};

var friends = [];

app.addFriend = function (friend) {
  friends.push(friend.text());
  $(friend).addClass('friend');
  app.formatFriends();
};

app.addMessage = function () {
  var message = {};
  message.roomname = $('#roomSelect option:selected').val() || 'lobby';
  message.text = $('#messageEntry').val();
  message.username = $('#messageName').val();
  app.send(message);
};

app.addRoom = function() {
  var roomName = $("#newRoomName").val();
  if($('#roomSelect option[name="'+roomName+'"]').length === 0) {
    $("#roomSelect").append('<option name="'+roomName+'">'+roomName+'</option>');
    $("#roomSelect").val(roomName);
    $("#newRoomName").val('');
    app.clearMessages();
    app.fetch(roomName);
  }
};

app.addToRoom = function (message) {
  var box = $(document.createElement('div'));
  box.addClass('chat');
  var classUsername = message.username !== undefined ? message.username.replace(' ', '_') : 'undefined'
  box.html('<span class="username ' + classUsername + '">' + message.username + '</span>' + message.text);

  if ($("[id='"+message.roomname+"']").length === 0) {
    var newRoom = $(document.createElement('div'));
    newRoom.attr('id',message.roomname);
    newRoom.attr('class','room');
    $('#chats').append(newRoom);
    if($('#roomSelect option[name="'+message.roomname+'"]').length === 0) {
      $("#roomSelect").append('<option name="'+message.roomname+'">'+message.roomname+'</option>');
    }
  } 

  $("[id='"+message.roomname+"']").append(box);
};

app.formatFriends = function() {
  for (var i = 0; i < friends.length; i++) {
    var friendName = friends[i].replace(' ', '_');
    $('.'+friendName).parent().css({'color': 'red', 'font-weight': 'bold'});
  }
}

$(document).on('ready', function() {
  app.fetch();

  $('#roomSelect').on('change', function() {
    var roomName = $('#roomSelect').val();
    app.clearMessages();
    app.fetch(roomName);
    $('.room').hide();
    $("[id='"+roomName+"']").show();
  });

  $("#send").on('click',function() {
    app.addMessage();
    app.clearMessages();
  });

  $("#refresh").on('click', function() {
    var selectedRoom = $('#roomSelect').val();
    app.clearMessages();
    app.fetch(selectedRoom);
  });

  $("#addRoom").on('click', function() {
    app.addRoom();
  });

  $(document).on('click', '.username', function() {
    $(this).removeClass('maybeFriend');
    app.addFriend($(this));
  });

  $(document).on('mouseover', '.username', function() {
    if(!$(this).hasClass('friend')) $(this).addClass('maybeFriend');
  }).on('mouseleave', '.username', function() {
    $(this).removeClass('maybeFriend');
  });
});

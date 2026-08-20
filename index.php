<!DOCTYPE html>
<html>
<head>
    <title>Simple PHP Chat</title>
    <script src="https://jquery.com"></script>
</head>
<body>
    <div id="chat-box" style="height:300px; border:1px solid #ccc; overflow:scroll; padding:10px;"></div>
    <input type="text" id="username" placeholder="Name"><br>
    <textarea id="message" placeholder="Type a message..."></textarea><br>
    <button id="send">Send</button>

    <script>
        function loadMessages() {
            $('#chat-box').load('get.php');
        }
        setInterval(loadMessages, 3000); // Refresh every 3 seconds

        $('#send').click(function() {
            $.post('send.php', {
                username: $('#username').val(),
                message: $('#message').val()
            }, function() {
                $('#message').val('');
                loadMessages();
            });
        });
    </script>
</body>
</html>

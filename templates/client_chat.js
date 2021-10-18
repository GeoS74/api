           // Подключаем блок для вывода текста
           let text = document.getElementById("message")
           // Подключаемся к серверу
           //let socket = io('http://localhost:3000');
           let socket = io();
           // Отслеживаем подключение
           socket.on('connect', function () {
               // Выводим сообщение подключение
               text.innerHTML = "Подключение прошло успешно<br>"
           });
           // Отслеживание сообщения от сервера со заголовком 'hello'
           socket.on('hello', function (data) { // Выводим сообщение от сервера
                   text.innerHTML += "Сервер: " + data + "<br>"
           });

           document.forms.publish.onsubmit = function() {
           let outgoingMessage = this.message.value;

           console.log(outgoingMessage);
           socket.send(outgoingMessage);
           //socket.emit('client_message', outgoingMessage);
           return false;
           };
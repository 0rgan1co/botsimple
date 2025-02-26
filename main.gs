// Configuración global
var TELEGRAM_TOKEN = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
var TELEGRAM_URL = "https://api.telegram.org/bot" + TELEGRAM_TOKEN;
var WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwT95_sHTHxzEfHM8sJ--JSPzaNumvdSFtlH_YjhCrSsxWRxMv6p-934AJMbHLB80w4RQ/exec";
var SPREADSHEET_ID = "1xQo2IM-gjCekNofEdNQ3Sb0RCm31XhyoufUMMJTygv4"; 
var CHAT_ID = parseInt(-4.687334611E9); // ID del grupo de Telegram


const config = {
  webhookUrl: "https://script.google.com/macros/s/AKfycbwT95_sHTHxzEfHM8sJ--JSPzaNumvdSFtlH_YjhCrSsxWRxMv6p-934AJMbHLB80w4RQ/exec",
  parseMode: "HTML"
};

function getMe() {
  var url = TELEGRAM_URL + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function deleteWebhook() {
  var url = TELEGRAM_URL + "/deleteWebhook";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function getUpdates() {
  var url = TELEGRAM_URL + "/getUpdates";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + WEBAPP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendText(id, text) {
  try {
    var url = TELEGRAM_URL + "/sendMessage?chat_id=" + id + "&text=" + encodeURIComponent(text);
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true }); // Evita que el script falle
    Logger.log(response.getContentText());

    // Verifica si la respuesta contiene un error
    var responseData = JSON.parse(response.getContentText());
    if (!responseData.ok) {
      Logger.log("Error al enviar mensaje: " + responseData.description);
    }
  } catch (e) {
    Logger.log("Error en sendText: " + e.toString());
  }
}


function doGet(e) {
  return HtmlService.createHtmlOutput("Hola mundo");
}

function getChatId() {
  var token = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
  var url = "https://api.telegram.org/bot" + token + "/getUpdates";
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  
  // Imprime los datos en los logs
  Logger.log(JSON.stringify(data, null, 2));
  
  // Extrae el ID del chat
  if (data.ok && data.result.length > 0) {
    var chatId = data.result[0].message.chat.id;
    Logger.log("ID del chat: " + chatId);
    return chatId;
  } else {
    Logger.log("No se encontraron updates o el bot no ha recibido mensajes.");
    Logger.log("ID del chat: " + chatId);
    Logger.log("Texto a enviar: " + text);
    Logger.log("URL: " + url);
    Logger.log("Opciones: " + JSON.stringify(options));
    return null;
  }
}


/**
 * Envía un mensaje de texto a un chat de Telegram.
 * @param {number} id - ID del chat de Telegram.
 * @param {string} text - Texto del mensaje.
 */
function sendText(chatId, text) {
  var token = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  
  // Verifica que el texto no esté vacío
  if (!text || text.trim() === "") {
    Logger.log("Error: El texto del mensaje está vacío.");
    return;
  }

  var options = {
    method: "post",
    payload: {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    if (!json.ok) {
      Logger.log("Error al enviar mensaje: " + json.description);
    } else {
      Logger.log("Mensaje enviado correctamente.");
    }
  } catch (e) {
    Logger.log("Error en la solicitud: " + e.toString());
  }
}

function testSendText() {
  var chatId = getChatId(); // Obtén el ID del chat
  if (chatId) {
    sendText(chatId, "Este es un mensaje de prueba.");
  } else {
    Logger.log("No se pudo obtener el ID del chat.");
  }
}

/**
 * Maneja las solicitudes POST de Telegram.
 * @param {object} e - Objeto de evento con los datos de la solicitud.
 */
function doPost(e) {
  Logger.log("doPost función llamada");

  try {
    // Verificar si e existe y tiene la estructura esperada
    if (e && e.postData && e.postData.type == "application/json") {
      var update = JSON.parse(e.postData.contents);
      Logger.log("Update recibido: " + JSON.stringify(update));

      if (update.message && update.message.text) {
        var chatId = update.message.chat.id;
        var text = update.message.text;

        // Redirigir a la función correspondiente según el comando
        switch (text) {
          case "/start":
            handleStartCommand(chatId); // Llama a la función en commands.gs
            break;
          case "/zumbido":
            handleZumbidoCommand(chatId); // Llama a la función en commands.gs
            break;
          case "/sumarme":
            handleSumarmeCommand(chatId); // Llama a la función en commands.gs
            break;
          case "/reporte":
            handleReporteCommand(chatId); // Llama a la función en commands.gs
            break;
          default:
            sendText(chatId, "Comando no reconocido. Usa /start para ver los comandos disponibles.");
            break;
        }
      }
    } else {
      Logger.log("Datos POST inválidos o faltantes: " + JSON.stringify(e));
    }
  } catch (error) {
    Logger.log("Error general en doPost: " + error.toString());
  }

  Logger.log("Finalizando doPost con respuesta de éxito");
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para simular una solicitud POST.
 */
function testDoPost() {
  Logger.log("testDoPost función llamada");

  try {
    // Simular una actualización de Telegram con un chatId real
    var e = {
      postData: {
        type: "application/json",
        contents: JSON.stringify({
          update_id: 123456789,
          message: {
            message_id: 1,
            from: {
              id: 123456789,
              first_name: "Test",
              username: "testuser"
            },
            chat: {
              id: -4687334611, // Reemplaza con un chatId real
              first_name: "Test",
              username: "testuser",
              type: "group" // Cambia a "private" si es un chat privado
            },
            date: 1613750599,
            text: "/start"
          }
        })
      }
    };

    Logger.log("Datos simulados creados");
    doPost(e);
  } catch (error) {
    Logger.log("Error en testDoPost: " + error.toString());
  }
}

function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + WEBAPP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function deleteWebhook() {
  var url = TELEGRAM_URL + "/deleteWebhook";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hola mundo");
}

function testSendText(){
  sendText(CHAT_ID, "Probando SendText", { "remove_keyboard": true })
}

function backupsendText(chatId, text, keyboard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyboard)
    }
  };
  UrlFetchApp.fetch(TELEGRAM_URL + '/', data);
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), data]);
}

// Función para enviar mensajes
function sendText(chatId, text, keyboard) {
  try {
    var payload = {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML"
    };

    if (keyboard) {
      payload.reply_markup = JSON.stringify(keyboard);
    }

    var data = {
      method: "post",
      payload: payload,
      muteHttpExceptions: true // Habilita esta opción para ver errores completos
    };

    var response = UrlFetchApp.fetch(TELEGRAM_URL + '/', data);
    var responseData = JSON.parse(response.getContentText());

    if (!responseData.ok) {
      throw new Error("Error de Telegram: " + responseData.description);
    }

    return true;
  } catch (error) {
    Logger.log("Error enviando mensaje: " + error.toString());
    return false;
  }
}

function backupSimpleDoPost() {
  if (!e || !e.postData) {
    return;
  }
  var contents = JSON.parse(e.postData.contents);
  sendText(CHAT_ID, contents.message.text, { "remove_keyboard": true });
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), contents]);

  if (contents.message.text.slice(0, COMMANDS[1].length) == COMMANDS[1]){
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(),"Entramos a Zumbido"]);
}

}

function doPost(e) {
  if (!e || !e.postData) {
    Logger.log("No recibí ningún evento.");
    return;
  }

  var contents;
  try {
    contents = JSON.parse(e.postData.contents);
  } catch (error) {
    Logger.log("Error parseando el JSON: " + error);
    return;
  }

  // Verificar si tenemos un mensaje con texto
  if (!contents.message || !contents.message.text) {
    Logger.log("No hay mensaje de texto en el evento recibido.");
    return;
  }

  var text = contents.message.text.trim(); // Eliminar espacios en blanco al inicio y final
  var chatId = contents.message.chat.id;

  // Log el chatId y el mensaje en la hoja de cálculo
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LOGS_SHEET).appendRow([new Date(), chatId, text]);
  } catch (error) {
    Logger.log("Error escribiendo en la hoja de cálculo: " + error);
    return;
  }

  Logger.log("Texto recibido: " + text);

  // Verificar el estado del usuario
  if (userStates[chatId]) {
    // Si el usuario está en un estado intermedio, procesar la respuesta según el flujo
    switch (userStates[chatId].step) {
      case "awaitingRecipient":
        processRecipient(chatId, text);
        break;
      case "awaitingCategory":
        processCategory(chatId, text);
        break;
      case "awaitingDescription":
        processDescription(chatId, text);
        break;
      default:
        sendText(chatId, "❌ Estado no reconocido. Usa /ayuda para ver las opciones disponibles.");
        delete userStates[chatId]; // Limpiar el estado
        break;
    }
  } else {
    // Si no hay estado, procesar como un comando normal
    var command = text.split(" ")[0]; // Obtener el primer término (comando)
    if (commandHandlers[command]) {
      // Si el comando existe en el mapeo, ejecutar el handler correspondiente
      commandHandlers[command](chatId);
    } else {
      // Si no coincide con ningún comando, enviar un mensaje de ayuda
      sendText(chatId, "No reconozco ese comando. Usa /ayuda para ver las opciones disponibles.");
    }
  }
}


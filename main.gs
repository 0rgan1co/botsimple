// Función principal para manejar solicitudes POST de Telegram
function doPost(e) {
  try {
    // Control de datos recibidos
    if (!e || !e.postData) {
      return ContentService.createTextOutput("No data received");
    }

    // Parsear contenido JSON
    var contents;
    try {
      contents = JSON.parse(e.postData.contents);
    } catch (parseError) {
      directLogToSheet("Error de parseo JSON", parseError.toString());
      return ContentService.createTextOutput("Invalid JSON");
    }

    // Verificar si es un mensaje válido
    if (!contents.message) {
      return ContentService.createTextOutput("No message");
    }

    // Extraer información del mensaje
    var chatId = contents.message.chat.id;
    var fromUser = contents.message.from;
    var text = contents.message.text || "";
    var messageType = "texto";

    // Identificar tipos de mensaje
    if (!text) {
      if (contents.message.photo) {
        messageType = "foto";
        text = "[Foto]";
      } else if (contents.message.video) {
        messageType = "video";
        text = "[Video]";
      } else if (contents.message.document) {
        messageType = "documento";
        text = "[Documento: " + (contents.message.document.file_name || "sin nombre") + "]";
      } else if (contents.message.voice) {
        messageType = "nota de voz";
        text = "[Nota de voz]";
      } else if (contents.message.sticker) {
        messageType = "sticker";
        text = "[Sticker]";
      } else {
        messageType = "desconocido";
        text = "[Mensaje no reconocido]";
      }
    }

    // Registrar mensaje recibido
    registrarMensaje(chatId, fromUser, text, messageType);

    // Verificar si el update ya fue procesado para evitar duplicados
    if (contents.update_id && isUpdateProcessed(contents.update_id)) {
      directLogToSheet("Actualización duplicada", "Update ID: " + contents.update_id);
      return ContentService.createTextOutput("Already processed");
    }

    // Marcar update como procesado
    if (contents.update_id) {
      markUpdateAsProcessed(contents.update_id);
    }

    // Obtener estado actual del usuario
    var userState = getUserState(chatId);

    // Procesar mensaje según estado o como comando
    if (userState && userState.step) {
      // Procesar según el paso del flujo actual
      switch (userState.step) {
        case "awaitingRecipient":
          processRecipient(chatId, text, fromUser);
          break;
        case "awaitingCategory":
          processCategory(chatId, text, fromUser);
          break;
        case "awaitingDescription":
          processDescription(chatId, text, fromUser);
          break;
        case "awaitingConfirmation":
          processConfirmation(chatId, text, fromUser);
          break;
        case "awaitingSumarmeSelection":
          processSumarmeSelection(chatId, text, fromUser);
          break;
        default:
          sendText(chatId, "❌ Estado no reconocido. Usa /ayuda para ver las opciones disponibles.", true);
          clearUserState(chatId);
          break;
      }
    } else {
      // Procesar como comando si comienza con /
      if (text.startsWith('/')) {
        procesarComando(chatId, fromUser, text);
      } else {
        // No es un comando, enviar mensaje de ayuda
        sendText(chatId, "Para ver los comandos disponibles, escribe /ayuda", true);
      }
    }

    return ContentService.createTextOutput("OK");
  } catch (error) {
    // Manejo de errores
    Logger.log("Error en doPost: " + error);
    directLogToSheet("Error en doPost", error.toString() + "\n" + error.stack);
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}

// Función para procesar comandos
function procesarComando(chatId, fromUser, texto) {
  // Obtener el comando (primera palabra)
  var comando = texto.split(' ')[0].toLowerCase();
  
  // Verificar si el comando existe en los manejadores
  if (commandHandlers[comando]) {
    commandHandlers[comando](chatId, fromUser, texto);
  } else {
    sendText(chatId, "Comando no reconocido. Usa /ayuda para ver los comandos disponibles.", true);
  }
}

// Función para registrar mensajes en la hoja de cálculo
function registrarMensaje(chatId, fromUser, texto, messageType) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(LOGS_SHEET) || spreadsheet.insertSheet(LOGS_SHEET);
    
    // Si es la primera vez, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Chat ID', 'Usuario', 'Username', 'Mensaje', 'Tipo de Mensaje']);
    }
    
    // Agregar el mensaje
    sheet.appendRow([
      new Date(), 
      chatId, 
      fromUser ? (fromUser.first_name + ' ' + (fromUser.last_name || '')) : 'Desconocido', 
      fromUser ? fromUser.username : 'N/A', 
      texto,
      messageType
    ]);
  } catch (error) {
    Logger.log('Error al registrar mensaje: ' + error);
    directLogToSheet('Error al registrar mensaje', error.toString());
  }
}

// Función para configurar el webhook
function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + WEBAPP_URL;
  try {
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
    directLogToSheet("Webhook configurado", url);
    return response.getContentText();
  } catch (error) {
    Logger.log("Error configurando webhook: " + error);
    directLogToSheet("Error configurando webhook", error.toString());
    return "Error: " + error.toString();
  }
}

// Función para manejar solicitudes GET (página de prueba)
function doGet(e) {
  return HtmlService.createHtmlOutput("El bot de Zumbidos está funcionando correctamente 🐝");
}

function sendText(chatId, text, keyboard) {
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

function testSendText(){
  sendText(CHAT_ID, "Probando SendText", { "remove_keyboard": true })
}

// Función para verificar si un update ya fue procesado
function isUpdateProcessed(updateId) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(PROCESSED_UPDATES_SHEET);
    
    // Crear la hoja si no existe
    if (!sheet) {
      sheet = spreadsheet.insertSheet(PROCESSED_UPDATES_SHEET);
      sheet.appendRow(["update_id", "timestamp"]);
      return false;
    }
    
    // Buscar el update_id
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == updateId) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    directLogToSheet("Error al verificar update_id", error.toString());
    return false;
  }
}

// Función para marcar un update como procesado
function markUpdateAsProcessed(updateId) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(PROCESSED_UPDATES_SHEET);
    
    // Crear la hoja si no existe
    if (!sheet) {
      sheet = spreadsheet.insertSheet(PROCESSED_UPDATES_SHEET);
      sheet.appendRow(["update_id", "timestamp"]);
    }
    
    // Agregar el update_id
    sheet.appendRow([updateId, new Date()]);
    
    // Limpiar entradas antiguas (mantener solo las últimas 1000)
    var numRows = sheet.getLastRow();
    if (numRows > 1000) {
      sheet.deleteRows(2, numRows - 1000);
    }
  } catch (error) {
    directLogToSheet("Error al marcar update_id", error.toString());
  }
}
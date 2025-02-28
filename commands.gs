
function handleStart(chatId) {
  sendText(chatId, "🐝 <b>¡Hola!</b> ✨\n\nEste chatBot existe para <b>dar y recibir</b> reconocimientos y auto-reconocimientos generando un <b>✨ zumbido ✨</b> que quedara registrado en \"BeeZum 🐝\"\n\nCada zumbido quedará abierto por 48 horas para que otras personas puedan <b>celebrar</b> y <b>sumarse +1</b> a ese reconocimiento.\n\n🌱 <b>Sabemos que es un gran desafío navegar la tensión entre conexión y eficiencia. Por esta razón quedemos generar condiciones apoyantes para que existe más reconocimiento en los equipos.</b>\n\n¿Qué puedo hacer?\n/start - Iniciar el bot\n/zumbido - Dar un reconocimiento\n/sumarme - Sumarme +1\n/reporte - Ver historial");
}

// Paso 1 => Zumbido
function handleZumbido(chatId) {
  // Mostrar la lista de miembros del equipo
  var message = "🐝 <b>Paso 1: ¿Para quién(es) es este zumbido?</b>\n\n";
  message += "Podés elegir uno o varios nombres de la lista:\n\n";
  TEAM_MEMBERS.forEach(function (member, index) {
    message += (index + 1) + ". " + member + "\n";
  });
  message += "\nResponde con el número correspondiente o los números separados por comas (ej: 1,3).";

  sendText(chatId, message);

  // Guardar el estado del usuario (esperando destinatario)
  userStates[chatId] = { step: "awaitingRecipient" };
}

// Paso 2 => Zumbido
function processRecipient(chatId, text) {
  Logger.log("Procesando destinatario: " + text + " (Chat ID: " + chatId + ")");

  var selectedNumbers = text.split(",").map(function (num) {
    return parseInt(num.trim()) - 1; // Convertir a índice base 0
  });

  // Validar selección
  if (selectedNumbers.some(isNaN) || selectedNumbers.some(function (num) {
    return num < 0 || num >= TEAM_MEMBERS.length;
  })) {
    Logger.log("Selección inválida: " + text + " (Chat ID: " + chatId + ")");
    sendText(chatId, "❌ Selección inválida. Por favor, responde con números válidos.");
    return;
  }

  // Guardar destinatarios seleccionados
  var recipients = selectedNumbers.map(function (num) {
    return TEAM_MEMBERS[num];
  });
  userStates[chatId].recipients = recipients;

  Logger.log("Destinatarios seleccionados: " + recipients.join(", ") + " (Chat ID: " + chatId + ")");

  // Solicitar categoría
  var message = "🐝 <b>Paso 2: ¿Qué categoría de zumbido querés generar?</b>\n\n";
  CATEGORIES.forEach(function (category, index) {
    message += (index + 1) + ". " + category + "\n";
  });
  message += "\nResponde con el número correspondiente.";

  sendText(chatId, message);
  userStates[chatId].step = "awaitingCategory";
}

// Paso 3 => Zumbido
function processCategory(chatId, text) {
  Logger.log("Procesando categoría: " + text + " (Chat ID: " + chatId + ")");

  var selectedNumber = parseInt(text.trim()) - 1; // Convertir a índice base 0

  // Validar selección
  if (isNaN(selectedNumber) || selectedNumber < 0 || selectedNumber >= CATEGORIES.length) {
    Logger.log("Selección inválida: " + text + " (Chat ID: " + chatId + ")");
    sendText(chatId, "❌ Selección inválida. Por favor, responde con un número válido.");
    return;
  }

  // Guardar categoría seleccionada
  userStates[chatId].category = CATEGORIES[selectedNumber];

  Logger.log("Categoría seleccionada: " + CATEGORIES[selectedNumber] + " (Chat ID: " + chatId + ")");

  // Solicitar descripción de la situación
  sendText(chatId, "🐝 <b>Paso 3: ¿Cuál fue la situación concreta?</b>\n\n📌 Describí brevemente la situación que dio origen al zumbido.\n\n📢 <i>Te invitamos a compartir lo que la persona dijo o hizo para que el reconocimiento sea más claro.</i>");
  userStates[chatId].step = "awaitingDescription";
}

// Paso 4 => Zumbido
function processRecipient(chatId, text) {
  var selectedNumbers = text.split(",").map(function (num) {
    return parseInt(num.trim()) - 1; // Convertir a índice base 0
  });

  // Validar selección
  if (selectedNumbers.some(isNaN) || selectedNumbers.some(function (num) {
    return num < 0 || num >= TEAM_MEMBERS.length;
  })) {
    sendText(chatId, "❌ Selección inválida. Por favor, responde con números válidos.");
    return;
  }

  // Guardar destinatarios seleccionados
  var recipients = selectedNumbers.map(function (num) {
    return TEAM_MEMBERS[num];
  });
  userStates[chatId].recipients = recipients;

  // Solicitar categoría
  var message = "🐝 <b>Paso 2: ¿Qué categoría de zumbido querés generar?</b>\n\n";
  CATEGORIES.forEach(function (category, index) {
    message += (index + 1) + ". " + category + "\n";
  });
  message += "\nResponde con el número correspondiente.";

  sendText(chatId, message);
  userStates[chatId].step = "awaitingCategory";
}

// Paso 5 => Zumbido
function processDescription(chatId, text) {
  Logger.log("Procesando descripción: " + text + " (Chat ID: " + chatId + ")");

  // Guardar descripción
  userStates[chatId].description = text;

  // Confirmar zumbido
  var message = "🐝 <b>¡Zumbido creado!</b> ✨\n\n";
  message += "👤 <b>Destinatario(s):</b> " + userStates[chatId].recipients.join(", ") + "\n";
  message += "📂 <b>Categoría:</b> " + userStates[chatId].category + "\n";
  message += "📝 <b>Descripción:</b> " + userStates[chatId].description + "\n\n";
  message += "¡Este zumbido estará abierto para sumarse por 48 horas!";

  sendText(chatId, message);

  // Guardar zumbido en la hoja de cálculo
  saveZumbido(chatId);

  // Limpiar el estado del usuario
  delete userStates[chatId];
  Logger.log("Zumbido creado y estado limpiado. (Chat ID: " + chatId + ")");
}

// Paso 6 => Zumbido
function saveZumbido(chatId) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    var zumbido = userStates[chatId];
    sheet.appendRow([
      new Date(), // Fecha
      chatId, // ID del chat
      zumbido.recipients.join(", "), // Destinatarios
      zumbido.category, // Categoría
      zumbido.description // Descripción
    ]);
    Logger.log("Zumbido guardado en la hoja de cálculo. (Chat ID: " + chatId + ")");
  } catch (error) {
    Logger.log("Error guardando el zumbido: " + error + " (Chat ID: " + chatId + ")");
    sendText(chatId, "❌ Hubo un error al guardar tu zumbido. Por favor, inténtalo de nuevo.");
  }
}

// Paso 7 => Zumbido
function closeZumbido(zumbidoId) {
  var zumbido = getZumbidoById(zumbidoId); // Obtener el zumbido de la hoja de cálculo
  var message = "🐝 <b>¡Este zumbido se ha cerrado!</b>\n\n";
  message += "👤 <b>Destinatario(s):</b> " + zumbido.recipients + "\n";
  message += "📝 <b>Descripción:</b> " + zumbido.description + "\n\n";
  message += "¡Gracias a todos por participar! 🎉";

  sendText(CHAT_ID, message); // Enviar al grupo
}

function handleSumarme(chatId) {
  // Obtener zumbidos de los últimos 48 horas
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    var data = sheet.getDataRange().getValues();
    var activeZumbidos = data.filter(function (row) {
      var fecha = new Date(row[0]);
      var ahora = new Date();
      return (ahora - fecha) <= 48 * 60 * 60 * 1000; // Últimas 48 horas
    });

    if (activeZumbidos.length === 0) {
      sendText(chatId, "No hay zumbidos activos en este momento. ¡Sé el primero en crear uno usando /zumbido!");
      return;
    }

    // Mostrar lista de zumbidos
    var message = "🎉 <b>Zumbidos activos:</b>\n\n";
    activeZumbidos.forEach(function (zumbido, index) {
      message += (index + 1) + ". " + zumbido[2] + " - " + zumbido[3] + "\n";
    });
    message += "\nResponde con el número del zumbido al que deseas sumarte.";

    sendText(chatId, message);
    userStates[chatId] = "awaitingSumarme";
  } catch (error) {
    Logger.log("Error obteniendo zumbidos: " + error);
    sendText(chatId, "❌ Hubo un error al obtener los zumbidos. Por favor, inténtalo de nuevo.");
  }
}

// Función para procesar la suma a un zumbido
function processSumarme(chatId, text) {
  var index = parseInt(text) - 1;
  if (isNaN(index)) {
    sendText(chatId, "❌ Por favor, responde con un número válido.");
    return;
  }

  // Obtener el zumbido seleccionado
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Zumbidos");
    var data = sheet.getDataRange().getValues();
    var activeZumbidos = data.filter(function (row) {
      var fecha = new Date(row[0]);
      var ahora = new Date();
      return (ahora - fecha) <= 48 * 60 * 60 * 1000; // Últimas 48 horas
    });

    if (index < 0 || index >= activeZumbidos.length) {
      sendText(chatId, "❌ Número de zumbido no válido.");
      return;
    }

    var zumbido = activeZumbidos[index];
    var nombre = zumbido[2];
    var motivo = zumbido[3];

    // Incrementar el contador de sumados (aquí puedes agregar lógica adicional)
    sendText(chatId, "🎉 ¡Te has sumado al reconocimiento de <b>" + nombre + "</b> por: <i>" + motivo + "</i>!");

    // Limpiar el estado del usuario
    delete userStates[chatId];
  } catch (error) {
    Logger.log("Error procesando suma: " + error);
    sendText(chatId, "❌ Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
  }
}

function handleSumarme(chatId) {
  sendText(chatId, "¡Te has sumado +1! 🎉");
}

function handleReporte(chatId) {
  sendText(chatId, "Aquí está tu historial de reconocimientos...");
}

function handleAyuda(chatId) {
  var message = "🐝 <b>¿En qué puedo ayudarte?</b> ✨\n\n";
  message += "Estas son las cosas que puedo hacer:\n\n";
  message += "✅ <b>/zumbido</b> - Dar un reconocimiento\n";
  message += "✅ <b>/sumarme</b> - Sumarme a un reconocimiento existente\n";
  message += "✅ <b>/reporte</b> - Ver el historial de reconocimientos\n";
  message += "✅ <b>/ayuda</b> - Mostrar esta ayuda\n\n";
  message += "¡No dudes en probar estos comandos! 😊";

  sendText(chatId, message);
}


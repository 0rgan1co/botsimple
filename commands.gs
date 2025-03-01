// Manejadores de comandos simplificados

// Manejar el comando /start
function handleStart(chatId, fromUser, texto) {
  var mensaje = "🐝 ¡Hola " + (fromUser ? fromUser.first_name : "amigo") + "! \n";
  mensaje += "Bienvenido al Bot de Zumbidos.\n";
  mensaje += "Escribe /ayuda para ver los comandos disponibles.";
  
  sendText(chatId, mensaje);
}

// Manejar el comando /ayuda
function handleAyuda(chatId, fromUser, texto) {
  var mensaje = "🐝 Comandos disponibles:\n";
  mensaje += "/start - Iniciar el bot\n";
  mensaje += "/zumbido - Crear un nuevo zumbido\n";
  mensaje += "/sumarme - Unirse a un zumbido\n";
  mensaje += "/ayuda - Mostrar esta ayuda";
  
  sendText(chatId, mensaje);
}

// Manejar el comando /zumbido
function handleZumbido(chatId, fromUser, texto) {
  // Estado inicial del zumbido
  var userState = {
    step: "awaitingRecipient",
    userId: fromUser ? fromUser.id : "",
    name: fromUser ? fromUser.first_name : "Usuario"
  };
  
  // Guardar estado
  saveUserState(chatId, userState);
  
  // Mensaje de inicio
  var message = "🐝 Iniciando nuevo zumbido. \n";
  message += "Menciona a los destinatarios usando @usernames.";
  
  sendText(chatId, message);
}

// Manejar el comando /sumarme
function handleSumarme(chatId, fromUser, texto) {
  sendText(chatId, "🐝 Función de sumarse a zumbidos próximamente.");
}

// Mapeo de comandos a manejadores
var commandHandlers = {
  "/start": handleStart,
  "/zumbido": handleZumbido,
  "/sumarme": handleSumarme,
  "/ayuda": handleAyuda
};
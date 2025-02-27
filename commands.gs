function handleZumbido(chatId) {
  sendText(chatId, "🐝 <b>¡Hola!</b> ✨\n\nEn este chat podés <b>dar y recibir</b> reconocimientos y auto-reconocimientos generando un <b>✨ zumbido ✨</b> que quedara registrado en \"BeeZum 🐝\"\n\nCada zumbido quedará abierto por 48 horas para que otras personas puedan <b>celebrar</b> y <b>sumarse +1</b> a ese reconocimiento.\n\n🌱 <b>Sabemos que es un gran desafío navegar la tensión entre conexión y eficiencia. Por esta razón quedemos generar condiciones apoyantes para que existe más reconocimiento en los equipos.</b>\n\n¿Qué puedo hacer?\n/start - Iniciar el bot\n/zumbido - Dar un reconocimiento\n/sumarme - Sumarme +1\n/reporte - Ver historial");
}

function handleSumarme(chatId) {
  sendText(chatId, "¡Te has sumado +1! 🎉");
}

function handleReporte(chatId) {
  sendText(chatId, "Aquí está tu historial de reconocimientos...");
}

function handleAyuda(chatId) {
  sendText(chatId, "Estas son las cosas que puedo hacer...\n- /zumbido: Dar un reconocimiento\n- /sumarme: Sumarme +1\n- /reporte: Ver historial");
}

function handleStart(chatId) {
  sendText(chatId, "¡Bienvenido! Usa /ayuda para ver los comandos disponibles.");
}
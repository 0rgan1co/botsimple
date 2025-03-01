// Configuración global
const TELEGRAM_TOKEN = "7719314719:AAHgdp9YdKkPKN9bziUVPDop8csZfoRjqPM";
const TELEGRAM_URL = "https://api.telegram.org/bot" + TELEGRAM_TOKEN;
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzaen3m3DCU0OfIRaVLZ2pKWPKrTSbnFscF4wTclJw8oqGv6NuFSk7vRM3mQbg6OSZm/exec";
const SPREADSHEET_ID = "1CNmLAaAqeRrfvaPC-gQv6P_VVnFeKonzQ9bCBwbc9po";  // 1xQo2IM-gjCekNofEdNQ3Sb0RCm31XhyoufUMMJTygv4
const LOGS_SHEET = "Logs";
const PROCESSED_UPDATES_SHEET = "UpdatesProcesados";
const CHAT_ID = -1002436154381; // ID del grupo de Telegram -2436154381 o -1002436154381
const COMMANDS = ['/zumbido', '/sumarme','/reporte', '/ayuda'];
// Mapeo de comandos a handlers
var commandHandlers = {
  "/start": handleStart,
  "/zumbido": handleZumbido,
  // "/sumarme": handleSumarme,
  // "/reporte": handleReporte,
  "/ayuda": handleAyuda
};
const CATEGORIES = [
  'Espacio de conexión',
  'Crear contenidos',
  'Networking',
  'Actividades comerciales',
  'Cuidar vinculo con cliente',
  'Organizacion del equipo',
  'Difusion',
  'Otros(explicar)',
];
// Lista predefinida de usuarios del grupo
const CHAT_MEMBERS = [
  {id: 1, username: "dvirgolini", name: "Diego Virgolini"},
  {id: 2, username: "twallet", name: "Thomas Wallet"},
  {id: 3, username: "usuario3", name: "Usuario Tres"}
  // Puedes agregar más usuarios según sea necesario
];
// Nombre de la hoja donde se guardarán los estados de usuarios
const ESTADOS_SHEET = 'Estados';
// Nombre de la hoja donde se guardarán los zumbidos
const ZUMBIDOS_SHEET = 'Zumbidos';

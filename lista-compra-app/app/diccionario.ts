// --- DICCIONARIO Y FUNCIÓN DE EMOJIS ---
export const DICCIONARIO_EMOJIS: Record<string, string> = {
  //🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🥑🥦🥒🫑🥕🫒🧄🧅🥔🫚🥐🍞🥖🧀🥚🧈🥓🥩🍗🍖🌭🍔🍟🍕🧆🌯🥘🍝🍤🍦🥧🧁🍰🎂🍮🍫🍿🍩🍪🌰🥜🍯🥛☕️🧃🍻🐱🔋🧻🧴
  "manzanas": "🍏",
  "manzanas rojas": "🍎",
  "peras": "🍐",
  "naranjas": "🍊",
  "limones": "🍋",
  "platanos": "🍌",
  "sandias": "🍉",
  "uvas": "🍇",
  "fresas": "🍓",
  "arandanos": "🫐",
  "melones": "🍈",
  "cerezas": "🍒",
  "melocotones": "🍑",
  "mangos": "🥭",
  "piñas": "🍍",
  "cocos": "🥥",
  "kiwis": "🥝",
  "tomates": "🍅",
  "aguacates": "🥑",
  "coliflores": "🥦",
  "pepinos": "🥒",
  "pimientos": "🫑",
  "zanahorias": "🥕",
  "aceitunas": "🫒",
  "ajos": "🧄",
  "cebollas": "🧅",
  "patatas": "🥔",
  "jengibre": "🫚",
  "croissants": "🥐",
  "pan de molde": "🍞",
  "barra de pan": "🥖",
  "queso": "🧀",
  "huevos": "🥚",
  "mantequilla": "🧈",
  "bacon": "🥓",
  "filetes de ternera": "🥩",
  "pollo": "🍗",
  "filetes depollo": "🍗",
  "jamon serrano": "🐖",
  "perrito caliente": "🌭",
  "hamburguesa": "🍔",
  "patatas fritas": "🍟",
  "pizza": "🍕",
  "croquetas": "🧆",
  "albondigas": "🧆",
  "kebab": "🌯",
  "paella": "🥘",
  "espagueti": "🍝",
  "macarrones": "🍝",
  "gambas": "🍤",
  "helado": "🍦",
  "tarta": "🥧",
  "magdalenas": "🧁",
  "pasteles": "🍰",
  "flanes": "🍮",
  "chocolate": "🍫",
  "palomitas": "🍿",
  "donuts": "🍩",
  "galletas": "🍪",
  "nueces": "🌰",
  "cacahuetes": "🥜",
  "miel": "🍯",
  "leche": "🥛",
  "cafe": "☕️",
  "zumo": "🧃",
  "cerveza": "🍻",
  "comida para gatos": "🐱",
  "pilas": "🔋",
  "papel higienico": "🧻",
  "gel de ducha": "🧴",
  "jabon": "🧼",
  "pasta de dientes": "🪥",
  "cepillo de dientes": "🪥",
  "bombillas": "💡",
};

export function obtenerIcono(texto: string): string {
  // texto a minúsculas y quitar espacios extra
  const t = (texto || "").toLowerCase().trim();
  
  // 1 Buscar si existe la palabra exacta en el diccionario
  if (DICCIONARIO_EMOJIS[t]) return DICCIONARIO_EMOJIS[t];

  // 2 Busqueda parcial (por si escriben "peras" en plural o "leche desnatada")
  for (const [palabra, emoji] of Object.entries(DICCIONARIO_EMOJIS)) {
    if (t.includes(palabra)) return emoji;
  }

  // 3 icono por defecto
  return "🛒"; 
}
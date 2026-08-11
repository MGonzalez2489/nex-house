export interface CountrySeedData {
  name: string;
  displayName: string;
  code: string; // ISO 3166-1 alpha-2
}

export interface StateSeedData {
  name: string;
  displayName: string;
  code: string; // ISO 3166-2:MX code
}

export interface CitySeedData {
  name: string;
  displayName: string;
}

export const CountrySeed: CountrySeedData[] = [
  {
    name: 'mexico',
    displayName: 'México',
    code: 'MX',
  },
];

export const StateSeed: StateSeedData[] = [
  { name: 'aguascalientes', displayName: 'Aguascalientes', code: 'AGU' },
  { name: 'baja_california', displayName: 'Baja California', code: 'BCN' },
  {
    name: 'baja_california_sur',
    displayName: 'Baja California Sur',
    code: 'BCS',
  },
  { name: 'campeche', displayName: 'Campeche', code: 'CAM' },
  { name: 'chiapas', displayName: 'Chiapas', code: 'CHP' },
  { name: 'chihuahua', displayName: 'Chihuahua', code: 'CHH' },
  { name: 'coahuila', displayName: 'Coahuila', code: 'COA' },
  { name: 'colima', displayName: 'Colima', code: 'COL' },
  { name: 'ciudad_de_mexico', displayName: 'Ciudad de México', code: 'CMX' },
  { name: 'durango', displayName: 'Durango', code: 'DUR' },
  { name: 'guanajuato', displayName: 'Guanajuato', code: 'GUA' },
  { name: 'guerrero', displayName: 'Guerrero', code: 'GRO' },
  { name: 'hidalgo', displayName: 'Hidalgo', code: 'HID' },
  { name: 'jalisco', displayName: 'Jalisco', code: 'JAL' },
  { name: 'estado_de_mexico', displayName: 'Estado de México', code: 'MEX' },
  { name: 'michoacan', displayName: 'Michoacán', code: 'MIC' },
  { name: 'morelos', displayName: 'Morelos', code: 'MOR' },
  { name: 'nayarit', displayName: 'Nayarit', code: 'NAY' },
  { name: 'nuevo_leon', displayName: 'Nuevo León', code: 'NLE' },
  { name: 'oaxaca', displayName: 'Oaxaca', code: 'OAX' },
  { name: 'puebla', displayName: 'Puebla', code: 'PUE' },
  { name: 'queretaro', displayName: 'Querétaro', code: 'QUE' },
  { name: 'quintana_roo', displayName: 'Quintana Roo', code: 'ROO' },
  { name: 'san_luis_potosi', displayName: 'San Luis Potosí', code: 'SLP' },
  { name: 'sinaloa', displayName: 'Sinaloa', code: 'SIN' },
  { name: 'sonora', displayName: 'Sonora', code: 'SON' },
  { name: 'tabasco', displayName: 'Tabasco', code: 'TAB' },
  { name: 'tamaulipas', displayName: 'Tamaulipas', code: 'TAM' },
  { name: 'tlaxcala', displayName: 'Tlaxcala', code: 'TLA' },
  { name: 'veracruz', displayName: 'Veracruz', code: 'VER' },
  { name: 'yucatan', displayName: 'Yucatán', code: 'YUC' },
  { name: 'zacatecas', displayName: 'Zacatecas', code: 'ZAC' },
];

export const ChihuahuaCitiesSeed: CitySeedData[] = [
  { name: 'ahumada', displayName: 'Ahumada' },
  { name: 'aldama', displayName: 'Aldama' },
  { name: 'allende', displayName: 'Allende' },
  { name: 'aquiles_serdan', displayName: 'Aquiles Serdán' },
  { name: 'ascension', displayName: 'Ascensión' },
  { name: 'bachiniva', displayName: 'Bachíniva' },
  { name: 'balleza', displayName: 'Balleza' },
  {
    name: 'batopilas_de_manuel_gomez_morin',
    displayName: 'Batopilas de Manuel Gómez Morín',
  },
  { name: 'bocoyna', displayName: 'Bocoyna' },
  { name: 'buenaventura', displayName: 'Buenaventura' },
  { name: 'camargo', displayName: 'Camargo' },
  { name: 'carichi', displayName: 'Carichí' },
  { name: 'casas_grandes', displayName: 'Casas Grandes' },
  { name: 'chihuahua', displayName: 'Chihuahua' },
  { name: 'chinipas', displayName: 'Chínipas' },
  { name: 'coronado', displayName: 'Coronado' },
  { name: 'coyame_del_sotol', displayName: 'Coyame del Sotol' },
  { name: 'la_cruz', displayName: 'La Cruz' },
  { name: 'cuauhtemoc', displayName: 'Cuauhtémoc' },
  { name: 'cusihuiriachi', displayName: 'Cusihuiriachi' },
  { name: 'delicias', displayName: 'Delicias' },
  { name: 'dr_belisario_dominguez', displayName: 'Dr. Belisario Domínguez' },
  { name: 'galeana', displayName: 'Galeana' },
  { name: 'santa_isabel', displayName: 'Santa Isabel' },
  { name: 'gomez_farias', displayName: 'Gómez Farías' },
  { name: 'gran_morelos', displayName: 'Gran Morelos' },
  { name: 'guachochi', displayName: 'Guachochi' },
  { name: 'guadalupe', displayName: 'Guadalupe' },
  { name: 'guadalupe_y_calvo', displayName: 'Guadalupe y Calvo' },
  { name: 'guazapares', displayName: 'Guazapares' },
  { name: 'guerrero', displayName: 'Guerrero' },
  { name: 'hidalgo_del_parral', displayName: 'Hidalgo del Parral' },
  { name: 'huejotitan', displayName: 'Huejotitán' },
  { name: 'ignacio_zaragoza', displayName: 'Ignacio Zaragoza' },
  { name: 'janos', displayName: 'Janos' },
  { name: 'jimenez', displayName: 'Jiménez' },
  { name: 'juarez', displayName: 'Juárez' },
  { name: 'julimes', displayName: 'Julimes' },
  { name: 'lopez', displayName: 'López' },
  { name: 'madera', displayName: 'Madera' },
  { name: 'maguarichi', displayName: 'Maguarichi' },
  { name: 'manuel_benavides', displayName: 'Manuel Benavides' },
  { name: 'matachi', displayName: 'Matachí' },
  { name: 'matamoros', displayName: 'Matamoros' },
  { name: 'meoqui', displayName: 'Meoqui' },
  { name: 'morelos', displayName: 'Morelos' },
  { name: 'moris', displayName: 'Moris' },
  { name: 'namiquipa', displayName: 'Namiquipa' },
  { name: 'nonoava', displayName: 'Nonoava' },
  { name: 'nuevo_casas_grandes', displayName: 'Nuevo Casas Grandes' },
  { name: 'ocampo', displayName: 'Ocampo' },
  { name: 'ojinaga', displayName: 'Ojinaga' },
  { name: 'praxedis_g_guerrero', displayName: 'Praxedis G. Guerrero' },
  { name: 'riva_palacio', displayName: 'Riva Palacio' },
  { name: 'rosales', displayName: 'Rosales' },
  { name: 'rosario', displayName: 'Rosario' },
  { name: 'san_francisco_de_borja', displayName: 'San Francisco de Borja' },
  { name: 'san_francisco_de_conchos', displayName: 'San Francisco de Conchos' },
  { name: 'san_francisco_del_oro', displayName: 'San Francisco del Oro' },
  { name: 'santa_barbara', displayName: 'Santa Bárbara' },
  { name: 'satevo', displayName: 'Satevó' },
  { name: 'saucillo', displayName: 'Saucillo' },
  { name: 'temosachic', displayName: 'Temósachic' },
  { name: 'el_tule', displayName: 'El Tule' },
  { name: 'urique', displayName: 'Urique' },
  { name: 'uruachi', displayName: 'Uruachi' },
  { name: 'valle_de_zaragoza', displayName: 'Valle de Zaragoza' },
];

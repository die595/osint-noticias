/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Municipality {
  id: string;
  name: string;
  department: 'Antioquia' | 'Córdoba';
  lat: number;
  lng: number;
}

export type Typology =
  | 'orden_publico'
  | 'eventos_culturales'
  | 'sistema_politico'
  | 'movilidad_tt'
  | 'desarrollo_economico'
  | 'sistema_judicial'
  | 'educacion_salud'
  | 'medio_ambiente'
  | 'emergencias'
  | 'general';

export interface News {
  id: string;
  title: string;
  content: string;
  url: string;
  source: 'telegram' | 'facebook' | 'international';
  sourceName: string;
  department: 'Antioquia' | 'Córdoba' | 'Internacional';
  municipalityId?: string; // Reference to Municipality
  typology: Typology;
  timestamp: string; // ISO 8601
  keywords: string[];
}

export const TYPOLOGY_LABELS: Record<Typology, string> = {
  orden_publico: 'Orden Público',
  eventos_culturales: 'Eventos Culturales',
  sistema_politico: 'Sistema Político',
  movilidad_tt: 'Movilidad TT',
  desarrollo_economico: 'Desarrollo Económico y Social',
  sistema_judicial: 'Sistema Judicial',
  educacion_salud: 'Educación y Salud',
  medio_ambiente: 'Medio Ambiente',
  emergencias: 'Emergencias',
  general: 'General',
};

export const TYPOLOGY_COLORS: Record<Typology, string> = {
  orden_publico: '#8b0000', // Vinotinto
  sistema_judicial: '#ff0000', // Rojo
  emergencias: '#ff8c00', // Naranja
  movilidad_tt: '#ffd700', // Amarillo
  desarrollo_economico: '#228b22', // Verde
  medio_ambiente: '#00fa9a', // Primavera
  educacion_salud: '#00ced1', // Turquesa
  sistema_politico: '#4169e1', // Royal Blue
  eventos_culturales: '#ba55d3', // Orquidea
  general: '#808080', // Gris
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Typology } from './types';

export const KEYWORDS_MAP: Record<Typology, string[]> = {
  orden_publico: [
    'secuestro', 'extorsión', 'clan del golfo', 'bandas delincuenciales', 'farc', 'eln', 'paramilitares',
    'tren de aragua', 'bloqueo de vías', 'protesta social', 'marchas', 'sindicatos', 'grupos armados organizados',
    'GAO', 'enfrentamientos ejército', 'AGC', 'Autodefensas Gaitanistas', 'Estructura Roberto Vargas',
    'Frente Juan de Dios Úsuga', 'Bloque Central Antioquia', 'Caparros', 'Caparrapos', 'Los del Bajo', 'GDO',
    'Disidencias', 'Columna Móvil', 'Células urbanas', 'Cabecilla', 'Alias', 'Comandante', 'Segunda Marquetalia',
    'Hostigamiento', 'Emboscada', 'Campo minado', 'MAP', 'Mina Antipersonal', 'Artefacto explosivo', 'AEI',
    'Granada', 'Ráfagas', 'Fuego cruzado', 'Incursión armada', 'Confinamiento', 'Desplazamiento forzado',
    'Amenaza de paro armado', 'Fronteras invisibles', 'Vacunas', 'Cobro de cuotas', 'Control de rentas',
    'Microtráfico', 'Expendio', 'Olla', 'Ajuste de cuentas', 'sicariato', 'asesinatos'
  ],
  sistema_judicial: [
    'capturas', 'legalización de captura', 'medida de aseguramiento', 'allanamiento', 'CTI', 'Gaula', 'Sijín',
    'Sipol', 'extradición', 'noticia criminal', 'imputación de cargos', 'allanamiento a cargos', 'SPOA',
    'interdicción', 'incautación de estupefacientes', 'inmovilización', 'golpe a la estructura', 'neutralización',
    'noticias judiciales'
  ],
  movilidad_tt: [
    'cierre de vía', 'plan tortuga', 'escombros en la vía', 'quema de llantas', 'vía alterna', 'paso restringido',
    'corredor humanitario'
  ],
  medio_ambiente: [
    'mineria ilegal', 'explotación ilicita de yacimiento minero', 'EIYM', 'dragas', 'retroexcavadoras', 'mercurio',
    'cianuro', 'barequeo', 'socavón', 'entable minero', 'maquinaria amarilla', 'título minero', 'formalización',
    'deforestación', 'quema indiscriminada', 'acaparamiento de tierras', 'tierras despojadas'
  ],
  emergencias: [
    'incendio vehiculos', 'creciente súbita', 'desbordamiento', 'deslizamiento', 'derrumbe', 'vendaval',
    'gestión del riesgo', 'UNGRD'
  ],
  educacion_salud: [
    'intoxicación masiva', 'desnutrición', 'epidemia', 'alerta hospitalaria', 'misión médica', 'atentado contra misión médica',
    'ambulancia'
  ],
  desarrollo_economico: [
    'regalias', 'contrabando', 'lavado de activos', 'testaferrato'
  ],
  sistema_politico: [
    'sistema político', 'gobierno', 'alcaldía', 'gobernación'
  ],
  eventos_culturales: [
    'cultura', 'concierto', 'feria', 'festival'
  ],
  general: [
    'hurto', 'bandalismo', 'abuso sexual', 'violencia intrafamiliar', 'explotación laboral', 'mitin', 'plantón',
    'asambleas permanentes', 'desórdenes', 'asonada', 'enfrentamiento con el ESMAD', 'UNDEMO', 'disturbios',
    'atentado contra la infraestructura', 'fleteo', 'taquillazo', 'cosquilleo', 'raponeo', 'paquete chileno',
    'escopolamina', 'rompevidrios', 'motoladrones'
  ]
};

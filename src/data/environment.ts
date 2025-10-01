// Environment management system
export interface EnvironmentState {
  ph: number; // 5.5-7.0 optimal 6.0-6.5
  ec: number; // 0.8-2.5 optimal depends on phase
  humidity: number; // 40-70% optimal depends on phase
  temperature: number; // 18-28°C optimal ~24°C
  lightCycle: 'veg' | 'flower'; // 18/6 or 12/12
  co2Level: number; // 400-1500 ppm
}

export interface EnvironmentOptimal {
  phMin: number;
  phMax: number;
  ecMin: number;
  ecMax: number;
  humidityMin: number;
  humidityMax: number;
  tempMin: number;
  tempMax: number;
}

export const PHASE_OPTIMAL_ENV: Record<string, EnvironmentOptimal> = {
  germination: {
    phMin: 6.0,
    phMax: 6.5,
    ecMin: 0.4,
    ecMax: 0.8,
    humidityMin: 70,
    humidityMax: 90,
    tempMin: 22,
    tempMax: 26
  },
  seedling: {
    phMin: 5.8,
    phMax: 6.3,
    ecMin: 0.6,
    ecMax: 1.0,
    humidityMin: 65,
    humidityMax: 80,
    tempMin: 20,
    tempMax: 25
  },
  veg: {
    phMin: 5.8,
    phMax: 6.5,
    ecMin: 1.2,
    ecMax: 2.0,
    humidityMin: 50,
    humidityMax: 70,
    tempMin: 22,
    tempMax: 28
  },
  preflower: {
    phMin: 6.0,
    phMax: 6.5,
    ecMin: 1.4,
    ecMax: 2.2,
    humidityMin: 45,
    humidityMax: 60,
    tempMin: 20,
    tempMax: 26
  },
  flower: {
    phMin: 6.0,
    phMax: 6.5,
    ecMin: 1.6,
    ecMax: 2.4,
    humidityMin: 40,
    humidityMax: 50,
    tempMin: 20,
    tempMax: 26
  },
  harvest: {
    phMin: 6.0,
    phMax: 6.5,
    ecMin: 0.4,
    ecMax: 0.8,
    humidityMin: 45,
    humidityMax: 55,
    tempMin: 18,
    tempMax: 24
  }
};

export interface EnvironmentUpgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  effect: keyof EnvironmentState;
  stabilization: number; // how much it reduces drift
}

export const ENV_UPGRADES: EnvironmentUpgrade[] = [
  {
    id: 'ph-controller',
    name: 'pH Auto-Controller',
    description: 'Stabilisiert automatisch den pH-Wert',
    basePrice: 400,
    effect: 'ph',
    stabilization: 0.8
  },
  {
    id: 'ec-meter-pro',
    name: 'EC Meter Pro',
    description: 'Hält EC-Wert im optimalen Bereich',
    basePrice: 350,
    effect: 'ec',
    stabilization: 0.7
  },
  {
    id: 'dehumidifier',
    name: 'Luftentfeuchter Pro',
    description: 'Kontrolliert Luftfeuchtigkeit präzise',
    basePrice: 450,
    effect: 'humidity',
    stabilization: 0.85
  },
  {
    id: 'climate-master',
    name: 'Climate Master System',
    description: 'Perfekte Temperaturkontrolle',
    basePrice: 500,
    effect: 'temperature',
    stabilization: 0.9
  },
  {
    id: 'co2-generator',
    name: 'CO2 Generator',
    description: 'Erhöht CO2 für schnelleres Wachstum',
    basePrice: 600,
    effect: 'co2Level',
    stabilization: 0.75
  }
];

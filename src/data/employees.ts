export interface Employee {
  id: string;
  name: string;
  description: string;
  specialization: 'watering' | 'fertilizing' | 'harvesting' | 'all';
  price: number;
  efficiency: number; // 0.5 - 1.5, affects automation speed/quality
  avatar: string;
}

export const EMPLOYEES: Employee[] = [
  {
    id: 'gardener-tom',
    name: 'Gärtner Tom',
    description: 'Spezialist für Bewässerung. Gießt deine Pflanzen automatisch zum perfekten Zeitpunkt.',
    specialization: 'watering',
    price: 500,
    efficiency: 0.8,
    avatar: '👨‍🌾'
  },
  {
    id: 'botanist-lisa',
    name: 'Botanikerin Lisa',
    description: 'Expertin für Düngung. Optimiert den Nährstoffhaushalt automatisch.',
    specialization: 'fertilizing',
    price: 750,
    efficiency: 0.9,
    avatar: '👩‍🔬'
  },
  {
    id: 'harvester-mike',
    name: 'Erntehelfer Mike',
    description: 'Profi-Ernter. Erntet automatisch bei optimaler Reife und pflanzt neu.',
    specialization: 'harvesting',
    price: 1000,
    efficiency: 1.0,
    avatar: '👨‍🌾'
  },
  {
    id: 'master-sarah',
    name: 'Meisterin Sarah',
    description: 'Allrounder. Übernimmt Bewässerung, Düngung und Ernte automatisch.',
    specialization: 'all',
    price: 2000,
    efficiency: 1.2,
    avatar: '👩‍🎓'
  },
  {
    id: 'expert-carlos',
    name: 'Experte Carlos',
    description: 'Elite-Gärtner mit höchster Effizienz. Perfekte Automation für anspruchsvolle Strains.',
    specialization: 'all',
    price: 3500,
    efficiency: 1.5,
    avatar: '🧑‍🌾'
  }
];

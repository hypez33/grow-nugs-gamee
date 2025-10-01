import { useCallback } from 'react';
import { Plant, PlantModifiers } from './useGameState';
import { PHASES } from '@/data/phases';
import { Employee } from '@/data/employees';

export interface AutomationState {
  isAutomated: boolean;
  assignedEmployeeId?: string;
  autoReplantStrainId?: string;
}

export const useAutomation = (
  employees: Employee[],
  onWater: (slotIndex: number, skillBonus: number) => void,
  onFertilize: (slotIndex: number) => void,
  onHarvest: (slotIndex: number) => void,
  onPlantSeed: (slotIndex: number, strainId: string, soilType: PlantModifiers['soilType']) => void
) => {
  
  const getEmployee = useCallback((employeeId: string): Employee | undefined => {
    return employees.find(e => e.id === employeeId);
  }, [employees]);

  const checkAutoWatering = useCallback((
    plant: Plant,
    slotIndex: number,
    automation: AutomationState
  ): boolean => {
    console.log(`[Automation] Checking auto-water for slot ${slotIndex}:`, {
      isAutomated: automation.isAutomated,
      assignedEmployeeId: automation.assignedEmployeeId
    });

    if (!automation.isAutomated || !automation.assignedEmployeeId) {
      console.log(`[Automation] Auto-water skipped: not automated or no employee`);
      return false;
    }
    
    const employee = getEmployee(automation.assignedEmployeeId);
    console.log(`[Automation] Employee found:`, employee);
    
    if (!employee || (employee.specialization !== 'watering' && employee.specialization !== 'all')) {
      console.log(`[Automation] Auto-water skipped: employee not found or wrong specialization`);
      return false;
    }

    const now = Date.now();
    const timeSinceLastWater = now - plant.modifiers.lastWaterTime;
    const waterCooldown = 15000; // 15 seconds

    console.log(`[Automation] Water cooldown check:`, {
      timeSinceLastWater,
      waterCooldown,
      ready: timeSinceLastWater >= waterCooldown
    });

    // Auto-water when cooldown is up
    if (timeSinceLastWater >= waterCooldown) {
      console.log(`[Automation] ✅ Auto-watering slot ${slotIndex}`);
      const skillBonus = (employee.efficiency - 1.0) * 0.1; // Efficiency bonus
      onWater(slotIndex, skillBonus);
      return true;
    }

    return false;
  }, [getEmployee, onWater]);

  const checkAutoFertilizing = useCallback((
    plant: Plant,
    slotIndex: number,
    automation: AutomationState
  ): boolean => {
    if (!automation.isAutomated || !automation.assignedEmployeeId) return false;
    
    const employee = getEmployee(automation.assignedEmployeeId);
    if (!employee || (employee.specialization !== 'fertilizing' && employee.specialization !== 'all')) {
      return false;
    }

    // Auto-fertilize in veg or flower phase if not already applied
    if (!plant.modifiers.fertilizerApplied && (plant.phaseIndex === 2 || plant.phaseIndex === 4)) {
      const now = Date.now();
      const timeSinceLastFert = now - plant.modifiers.lastFertilizerTime;
      if (timeSinceLastFert >= 20000) { // 20 second cooldown
        onFertilize(slotIndex);
        return true;
      }
    }

    return false;
  }, [getEmployee, onFertilize]);

  const checkAutoHarvest = useCallback((
    plant: Plant,
    slotIndex: number,
    automation: AutomationState,
    currentProgress: number
  ): boolean => {
    if (!automation.isAutomated || !automation.assignedEmployeeId) return false;
    
    const employee = getEmployee(automation.assignedEmployeeId);
    if (!employee || (employee.specialization !== 'harvesting' && employee.specialization !== 'all')) {
      return false;
    }

    // Auto-harvest when ready (last phase, 100% progress)
    const isHarvestReady = plant.phaseIndex === PHASES.length - 1 && currentProgress >= 100;
    
    if (isHarvestReady) {
      onHarvest(slotIndex);
      return true;
    }

    return false;
  }, [getEmployee, onHarvest]);

  const checkAutoReplant = useCallback((
    slotIndex: number,
    automation: AutomationState,
    plantExists: boolean
  ): boolean => {
    if (!automation.isAutomated || !automation.autoReplantStrainId || plantExists) return false;
    
    // Auto-replant with light-mix soil (better ROI than basic)
    onPlantSeed(slotIndex, automation.autoReplantStrainId, 'light-mix');
    return true;
  }, [onPlantSeed]);

  return {
    checkAutoWatering,
    checkAutoFertilizing,
    checkAutoHarvest,
    checkAutoReplant,
    getEmployee
  };
};

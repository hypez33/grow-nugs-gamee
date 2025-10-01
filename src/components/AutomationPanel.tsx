import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EMPLOYEES, Employee } from '@/data/employees';
import { Bot, BotOff, User } from 'lucide-react';
import { AutomationState } from '@/hooks/useAutomation';

interface AutomationPanelProps {
  automation: AutomationState;
  employees: string[]; // IDs of hired employees
  strainId?: string; // For auto-replant
  onToggleAutomation: (enabled: boolean) => void;
  onAssignEmployee: (employeeId: string | undefined) => void;
  onSetAutoReplant: (strainId: string | undefined) => void;
}

export const AutomationPanel = ({
  automation,
  employees,
  strainId,
  onToggleAutomation,
  onAssignEmployee,
  onSetAutoReplant,
}: AutomationPanelProps) => {
  const assignedEmployee = automation.assignedEmployeeId 
    ? EMPLOYEES.find(e => e.id === automation.assignedEmployeeId)
    : undefined;

  const hiredEmployees = EMPLOYEES.filter(e => employees.includes(e.id));

  return (
    <Card className="p-3 bg-muted/20 border-primary/20">
      <div className="space-y-3">
        {/* Automation Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {automation.isAutomated ? (
              <Bot className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <BotOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">
              {automation.isAutomated ? 'Automatisiert' : 'Manuell'}
            </span>
          </div>
          <Button
            size="sm"
            variant={automation.isAutomated ? "default" : "outline"}
            onClick={() => onToggleAutomation(!automation.isAutomated)}
            disabled={!automation.assignedEmployeeId}
          >
            {automation.isAutomated ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
        </div>

        {/* Employee Assignment */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Zugewiesener Mitarbeiter</label>
          {hiredEmployees.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
              Keine Mitarbeiter angestellt. Besuche den Shop!
            </div>
          ) : (
            <Select
              value={automation.assignedEmployeeId || "none"}
              onValueChange={(value) => onAssignEmployee(value === "none" ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mitarbeiter wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Mitarbeiter</SelectItem>
                {hiredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <span>{emp.avatar}</span>
                      <span>{emp.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {emp.efficiency * 100}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Show assigned employee details */}
        {assignedEmployee && (
          <div className="p-2 bg-primary/10 rounded text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{assignedEmployee.avatar}</span>
              <div>
                <div className="font-semibold">{assignedEmployee.name}</div>
                <div className="text-muted-foreground text-xs">
                  {assignedEmployee.specialization === 'all' ? 'Allrounder' :
                   assignedEmployee.specialization === 'watering' ? 'Bewässerung' :
                   assignedEmployee.specialization === 'fertilizing' ? 'Düngung' :
                   'Ernte'}
                </div>
              </div>
            </div>
            <div className="text-muted-foreground">
              Effizienz: {(assignedEmployee.efficiency * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* Auto-replant setting */}
        {automation.isAutomated && assignedEmployee?.specialization === 'harvesting' || assignedEmployee?.specialization === 'all' ? (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <label className="text-xs text-muted-foreground">Nach Ernte automatisch neu pflanzen</label>
            <Select
              value={automation.autoReplantStrainId || "none"}
              onValueChange={(value) => onSetAutoReplant(value === "none" ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sorte wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nicht neu pflanzen</SelectItem>
                {strainId && (
                  <SelectItem value={strainId}>Gleiche Sorte</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {!automation.assignedEmployeeId && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
            💡 Weise einen Mitarbeiter zu, um Automation zu aktivieren
          </div>
        )}
      </div>
    </Card>
  );
};

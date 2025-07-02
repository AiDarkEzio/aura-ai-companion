// components/settings/tabs/AIPersonalizationTab.tsx

import { EditableField } from "../fields"; 
import { AIPersonaProps } from "@/lib/types";

export function AIPersonalizationTab({ persona, onSave }: AIPersonaProps) {
  return (
    <div>
      <EditableField label="AI Interaction Tone" value={persona.aiTone} onSave={(v) => onSave("aiTone", v)} placeholder="e.g., Friendly, Formal, Witty" />
      <EditableField label="Interests / Topics" value={persona.interests} type="textarea" onSave={(v) => onSave("interests", v)} placeholder="Comma-separated: AI, cooking, travel..." />
      <EditableField label="User Goals" value={persona.userGoals} type="textarea" onSave={(v) => onSave("userGoals", v)} placeholder="What do you want to achieve?" />
      <EditableField label="Communication Style" value={persona.communicationStyle} onSave={(v) => onSave("communicationStyle", v)} placeholder="e.g., Concise, Detailed" />
      <EditableField label="Excluded Topics" value={persona.excludedTopics} type="textarea" onSave={(v) => onSave("excludedTopics", v)} placeholder="Topics the AI should avoid" />
    </div>
  );
}
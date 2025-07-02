// components/settings/tabs/CoreIdentityTab.tsx

import { EditableField, CopyableField } from "../fields";
import { ProfileProps } from "@/lib/types";

export function CoreIdentityTab({ profile, onSave }: ProfileProps) {

  return (
    <div>
      {/* <ActionField label="Profile Picture" buttonLabel="Upload Avatar" description="PNG, JPG, GIF up to 5MB." onAction={() => alert("Avatar upload logic goes here!")} /> */}
      <EditableField label="Full Name" value={profile.fullName} onSave={(v) => onSave("fullName", v)} />
      <EditableField label="Preferred Name" value={profile.preferredName} onSave={(v) => onSave("preferredName", v)} placeholder="How the AI should address you" />
      {/* <EditableField label="Username" value={profile.username} onSave={(v) => onSave("username", v)} /> */}
      <CopyableField label="Username" value={profile.username} />
      <EditableField label="Bio" value={profile.bio} type="textarea" onSave={(v) => onSave("bio", v)} />
      <EditableField
        label="Pronouns"
        value={profile.pronouns}
        onSave={(v) => onSave("pronouns", v)}
        placeholder="e.g., he/him"
      />
    </div>
  );
}

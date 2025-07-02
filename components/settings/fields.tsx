// components/settings/fields.tsx
"use client";

import { useState, ReactNode } from "react";
import { Pencil, Check, X, Copy, ChevronDown } from "lucide-react"; // Added ChevronDown

// --- Base Wrapper for consistent layout ---
function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-light-border/60 dark:border-dark-border/40 last:border-b-0">
      <div className="w-full sm:w-1/3">
        <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </p>
      </div>
      <div className="flex items-center justify-end w-full sm:w-2/3 gap-4">
        {children}
      </div>
    </div>
  );
}

// --- 1. Field for Editing Text/Textarea ---
type EditableFieldProps = {
  label: string;
  value: string;
  type?: "text" | "textarea";
  onSave: (newValue: string) => void;
  placeholder?: string;
};

export function EditableField({
  label,
  value,
  type = "text",
  onSave,
  placeholder = "",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <FieldWrapper label={label}>
        <p className="flex-1 text-light-text-default dark:text-dark-text-default text-right sm:text-left truncate">
          {value || (
            <span className="text-light-text-secondary/70">Not set</span>
          )}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${label}`}
          className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover hover:text-primary-default dark:hover:text-primary-default transition-colors duration-200"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={label}>
      <div className="flex-1">
        {type === "textarea" ? (
          <textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover border border-light-border dark:border-dark-border px-3 py-2 text-sm text-light-text-default dark:text-dark-text-default focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default transition-all duration-200 resize-none"
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover border border-light-border dark:border-dark-border px-3 py-2 text-sm text-light-text-default dark:text-dark-text-default focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default transition-all duration-200"
            autoFocus
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          aria-label="Save"
          className="p-2 rounded-md text-green-600 dark:text-green-500 hover:bg-green-500/10 transition-colors duration-200"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={handleCancel}
          aria-label="Cancel"
          className="p-2 rounded-md text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </FieldWrapper>
  );
}

// --- 2. Field for Copying Data ---
type CopyableFieldProps = { label: string; value: string };
export function CopyableField({ label, value }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <FieldWrapper label={label}>
      <p className="flex-1 font-mono text-sm text-light-text-secondary dark:text-dark-text-secondary text-right sm:text-left truncate">
        {value}
      </p>
      <button
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover hover:text-primary-default dark:hover:text-primary-default transition-colors duration-200"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </FieldWrapper>
  );
}

// --- 3. Field for Displaying Static Info ---
type StaticFieldProps = { label: string; value: string | ReactNode };
export function StaticField({ label, value }: StaticFieldProps) {
  return (
    <FieldWrapper label={label}>
      <div className="flex-1 text-light-text-default dark:text-dark-text-default text-right sm:text-left">
        {value}
      </div>
    </FieldWrapper>
  );
}

// --- 4. Field for triggering an action (e.g., Change Password) ---
type ActionFieldProps = {
  label: string;
  buttonLabel: string;
  onAction: () => void;
  description?: string;
};
export function ActionField({
  label,
  buttonLabel,
  onAction,
  description,
}: ActionFieldProps) {
  return (
    <FieldWrapper label={label}>
      <div className="flex-1 text-right sm:text-left">
        {description && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onAction}
        className="rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover border border-light-border dark:border-dark-border px-4 py-1.5 text-sm font-semibold text-light-text-default dark:text-dark-text-default hover:border-primary-default/50 hover:text-primary-default dark:hover:text-primary-default transition-all duration-200"
      >
        {buttonLabel}
      </button>
    </FieldWrapper>
  );
}

// --- 5. Field for Selecting from a list ---
type SelectFieldProps = {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  value,
  onSave,
  options,
}: SelectFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const displayLabel =
    options.find((opt) => opt.value === value)?.label || "Not set";

  if (!isEditing) {
    return (
      <FieldWrapper label={label}>
        <p className="flex-1 text-light-text-default dark:text-dark-text-default text-right sm:text-left truncate">
          {displayLabel}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${label}`}
          className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover hover:text-primary-default dark:hover:text-primary-default transition-colors duration-200"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={label}>
      <div className="flex-1 relative">
        <select
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="w-full appearance-none rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover border border-light-border dark:border-dark-border px-3 py-2 text-sm text-light-text-default dark:text-dark-text-default focus:outline-none focus:ring-2 focus:ring-primary-default focus:border-primary-default transition-all duration-200"
          autoFocus
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-light-text-secondary dark:text-dark-text-secondary" />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          aria-label="Save"
          className="p-2 rounded-md text-green-600 dark:text-green-500 hover:bg-green-500/10 transition-colors duration-200"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={handleCancel}
          aria-label="Cancel"
          className="p-2 rounded-md text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </FieldWrapper>
  );
}

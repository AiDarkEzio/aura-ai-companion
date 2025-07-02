// components/Dropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { FC, ReactNode, ReactElement } from "react";

interface DropdownProps {
  buttonContent: ReactNode;
  children: ReactNode;
  buttonClassName?: string;
  dropdownIcon?: boolean;
}

export const Dropdown: FC<DropdownProps> = ({
  buttonContent,
  children,
  buttonClassName = "inline-flex items-center justify-center w-full rounded-md px-4 py-2 text-sm font-medium",
  dropdownIcon = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const baseButtonClasses =
    "shadow-sm bg-light-surface hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover border border-light-border dark:border-dark-border transition-all duration-300 dark:hover:border-primary-light/50 hover:border-primary-dark/50 hover:shadow-2xl hover:shadow-primary-dark/10 dark:hover:shadow-primary-light/10";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`${baseButtonClasses} ${buttonClassName}`}
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
        >
          {buttonContent}
          {dropdownIcon && (
            <svg
              className="ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-light-surface dark:bg-dark-surface transition-all duration-300 hover:shadow-2xl border border-light-border dark:border-dark-border z-99"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(
                    child as ReactElement<{ onItemClick?: () => void }>,
                    { onItemClick: closeDropdown }
                  )
                : child
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  onItemClick?: () => void;
}

export const DropdownItem: FC<DropdownItemProps> = ({
  children,
  onClick,
  onItemClick,
}) => {
  return (
    <a
      href="#"
      className="block px-4 py-2 text-sm hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover"
      role="menuitem"
      onClick={(e) => {
        e.preventDefault();

        if (onClick) {
          onClick();
        }

        if (onItemClick) {
          onItemClick();
        }
      }}
    >
      {children}
    </a>
  );
};

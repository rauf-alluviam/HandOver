import React, { useState, useEffect, useRef, useMemo } from "react";
import "../../styles/CustomAutocomplete.scss";

const CustomAutocomplete = ({
  options = [],
  value = "",
  onChange,
  onInputChange,
  placeholder = "Search...",
  disabled = false,
  freeSolo = false,
  error = false,
  noOptionsText = "No options found",
  label = "",
  required = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Helper to normalize option format { value, label }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return {
        value: opt.value ?? opt.code ?? opt.label ?? "",
        label: opt.label ?? opt.name ?? opt.value ?? "",
        raw: opt,
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === null || value === undefined || value === "") return null;
    const strVal = String(value).toUpperCase();
    return (
      normalizedOptions.find(
        (opt) =>
          String(opt.value).toUpperCase() === strVal ||
          String(opt.label).toUpperCase() === strVal
      ) || (freeSolo ? { value: value, label: value } : null)
    );
  }, [value, normalizedOptions, freeSolo]);

  // Sync display text when value or selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (typeof value === "string") {
      setInputValue(value);
    } else {
      setInputValue("");
    }
  }, [selectedOption, value]);

  // Single-pass O(N) linear filter for high performance
  const filteredOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return normalizedOptions.slice(0, 100);

    const startsWith = [];
    const containsOnly = [];

    for (let i = 0; i < normalizedOptions.length; i++) {
      const opt = normalizedOptions[i];
      const lbl = String(opt.label).toLowerCase();
      const val = String(opt.value).toLowerCase();

      if (lbl.startsWith(query) || val.startsWith(query)) {
        startsWith.push(opt);
      } else if (lbl.includes(query) || val.includes(query)) {
        containsOnly.push(opt);
      }
    }

    return [...startsWith, ...containsOnly].slice(0, 100);
  }, [inputValue, normalizedOptions, selectedOption]);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // Reset text to selected label if not freeSolo
        if (!freeSolo) {
          setInputValue(selectedOption ? selectedOption.label : "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption, freeSolo]);

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputValue(newText);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (onInputChange) {
      onInputChange(newText);
    }

    if (freeSolo && onChange) {
      onChange(newText);
    }
  };

  const handleSelectOption = (opt) => {
    const selectedVal = opt ? opt.value : "";
    setInputValue(opt ? opt.label : "");
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onChange) {
      onChange(selectedVal, opt?.raw || opt);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue("");
    setIsOpen(false);
    if (onChange) onChange("");
    if (onInputChange) onInputChange("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`custom-autocomplete ${disabled ? "disabled" : ""}`} ref={containerRef}>
      <div className={`input-wrapper ${error ? "has-error" : ""} ${isOpen ? "focused" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />

        {inputValue && !disabled && (
          <button type="button" className="clear-btn" onClick={handleClear} title="Clear">
            &times;
          </button>
        )}

        <div className={`arrow-icon ${isOpen ? "open" : ""}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
          ▼
        </div>
      </div>

      {isOpen && !disabled && (
        <ul className="dropdown-menu">
          {loading ? (
            <li className="dropdown-info">Loading...</li>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedOption && selectedOption.value === opt.value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  className={`dropdown-item ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    handleSelectOption(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <span className="item-label">{opt.label}</span>
                  {opt.value && opt.value !== opt.label && (
                    <span className="item-code">({opt.value})</span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="dropdown-info">{noOptionsText}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomAutocomplete;

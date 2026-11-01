import styled from "@emotion/styled"
import type { UIMode } from "@/ui/Layout"

export const SettingsToggleButton = styled.button<{ $active?: boolean; $mode?: UIMode }>`
  width: 3rem;
  height: 3rem;
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(35, 30, 25, 0.8)" : props.$mode === "flat" ? "#3d2f24" : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border-radius: 1rem;
  border: ${(props) =>
    props.$mode === "glass"
      ? "1.5px solid rgba(255, 140, 100, 0.25)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #5a4132"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 4px 16px rgba(0, 0, 0, 0.3),
    inset 0px 1px 2px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 4px 16px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 180, 130, 0.12);
  `};
  outline: none;
  cursor: pointer;
  color: #ffb896;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.2s ease,
    color 0.25s;

  ${(props) =>
    props.$active &&
    `
      background: ${props.$mode === "glass" ? "rgba(255, 140, 80, 0.45)" : "#d17a4a"};
      border-color: ${
        props.$mode === "glass" ? "rgba(255, 150, 100, 0.65)" : props.$mode === "flat" ? "transparent" : "#e89563"
      };
      color: ${props.$mode === "glass" ? "#fff5e6" : "#fffaf5"};
      box-shadow: ${
        props.$mode === "glass"
          ? `
        0px 6px 20px rgba(255, 127, 80, 0.4),
        inset 0px 2px 4px rgba(255, 200, 150, 0.15);
      `
          : props.$mode === "flat"
            ? "none"
            : `
        0px 6px 20px rgba(209, 122, 74, 0.5),
        inset 0px 2px 6px rgba(255, 220, 180, 0.2);
      `
      };
    `}

  &:hover {
    background: ${(props) =>
      props.$active
        ? props.$mode === "glass"
          ? "rgba(255, 140, 80, 0.55)"
          : "#db8855"
        : props.$mode === "glass"
          ? "rgba(45, 35, 30, 0.85)"
          : "#4a3a2e"};
    border-color: ${(props) =>
      props.$active
        ? props.$mode === "glass"
          ? "rgba(255, 150, 100, 0.75)"
          : "#e89563"
        : props.$mode === "glass"
          ? "rgba(255, 140, 100, 0.35)"
          : "#6a4f3d"};
    transform: ${(props) => (props.$mode === "flat" ? "none" : "translateY(-2px)")};
  }

  &:active {
    transform: ${(props) => (props.$mode === "flat" ? "none" : "translateY(0)")};
  }

  svg {
    pointer-events: none;
  }
`

export const SettingsDropdown = styled.div<{ $mode?: UIMode }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(35, 30, 25, 0.95)" : props.$mode === "flat" ? "#3d2f24" : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border-radius: 1rem;
  border: ${(props) =>
    props.$mode === "glass"
      ? "1.5px solid rgba(255, 140, 100, 0.25)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #5a4132"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 4px 16px rgba(0, 0, 0, 0.3),
    inset 0px 1px 2px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 4px 16px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 180, 130, 0.12);
  `};
  padding: 0.75rem;
  min-width: 200px;
  z-index: 10000000001;
`

export const SettingsItem = styled.div`
  padding: 0.5rem 0;
`

export const SettingsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffb896;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
`

export const Checkbox = styled.input<{ $mode?: UIMode }>`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #d17a4a;
`

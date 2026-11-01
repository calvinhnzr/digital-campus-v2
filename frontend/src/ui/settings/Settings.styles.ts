import styled from "@emotion/styled"
import type { UIMode } from "@/ui/Layout"

export const SettingsContainer = styled.div`
  position: absolute;
  top: 3rem;
  right: 3rem;
  z-index: 10000000000;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-direction: row-reverse;
`

export const SettingsButton = styled.button<{ $active?: boolean; $mode?: UIMode }>`
  width: 4rem;
  height: 4rem;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
  border: none;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  color: #5a4132;
  font-size: 2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.25s,
    transform 0.2s ease;

  &:hover {
    color: #8b6849;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1);
  }

  svg {
    pointer-events: none;
    width: 18px;
    height: 18px;
  }
`

export const SettingsCard = styled.div<{ $mode?: UIMode }>`
  min-width: 18rem;
  padding: 1.5rem 1.75rem;
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(35, 30, 25, 0.95)" : props.$mode === "flat" ? "#3d2f24" : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  border-radius: 1.2rem;
  border: ${(props) =>
    props.$mode === "glass"
      ? "1.5px solid rgba(255, 140, 100, 0.25)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #5a4132"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 8px 32px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 8px 32px rgba(0, 0, 0, 0.5),
    inset 0px 2px 8px rgba(255, 140, 100, 0.08);
  `};
  animation: slideIn 0.08s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
`

export const SettingsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem 0;
`

export const SettingsLabel = styled.label`
  color: #ffb896;
  font-size: 0.95rem;
  font-weight: 500;
  user-select: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`

export const Checkbox = styled.input<{ $mode?: UIMode }>`
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #d17a4a;
  border: 1.5px solid #5a4132;
  border-radius: 0.15rem;

  &:checked {
    accent-color: #d17a4a;
  }

  &:hover {
    accent-color: #db8855;
  }
`

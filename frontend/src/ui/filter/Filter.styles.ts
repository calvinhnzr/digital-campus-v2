import styled from "@emotion/styled"
import type { UIMode } from "@/ui/Layout"

export const sizeItem = "3.7rem"
export const sizeSubItem = "2.4rem"

export const Parent = styled.div`
  position: absolute;
  display: grid;
  grid-template-rows: 100vh;
  grid-template-columns: 100vw;
`

export const StyledFilter = styled.div<{ $scale?: number; $visible?: boolean }>`
  justify-self: center;
  align-self: flex-end;
  z-index: 10;
  margin-bottom: 3rem;
  transform-origin: bottom;
  transform: scale(${(props) => props.$scale || 1});
  position: absolute;
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  z-index: 100000000;
`

export const List = styled.ul<{ $mode?: UIMode }>`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  will-change: transform;
  transition: gap 0.2s ease;
  padding: 0.8rem 1.2rem;
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(30, 25, 20, 0.6)" : props.$mode === "flat" ? "#2a1f1a" : "#2a1f1a"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  border-radius: 2rem;
  border: ${(props) =>
    props.$mode === "glass"
      ? "1px solid rgba(255, 140, 100, 0.15)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #4a3428"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 8px 32px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 140, 100, 0.05);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 8px 32px rgba(0, 0, 0, 0.5),
    inset 0px 2px 8px rgba(255, 140, 100, 0.08);
  `};
`

export const Toggle = styled.button<{ $active?: boolean; $mode?: UIMode; $hasBadge?: boolean }>`
  width: ${sizeItem};
  height: ${sizeItem};
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(35, 30, 25, 0.8)" : props.$mode === "flat" ? "#3d2f24" : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
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
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    margin 0.3s ease,
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
  will-change: transform;
  transform-origin: bottom;
  position: relative;

  ${(props) =>
    props.$active &&
    `
      transform: scale(1.35);
      margin: 0 0.6rem;
      z-index: 20;
      background: ${props.$mode === "glass" ? "rgba(255, 140, 80, 0.45)" : "#d17a4a"};
      border-color: ${
        props.$mode === "glass" ? "rgba(255, 150, 100, 0.65)" : props.$mode === "flat" ? "transparent" : "#e89563"
      };
      color: ${props.$mode === "glass" ? "#fff5e6" : "#fffaf5"};
      box-shadow: ${
        props.$mode === "glass"
          ? `
        0px 8px 28px rgba(255, 127, 80, 0.5),
        inset 0px 2px 4px rgba(255, 200, 150, 0.15);
      `
          : props.$mode === "flat"
            ? "none"
            : `
        0px 8px 28px rgba(209, 122, 74, 0.6),
        inset 0px 2px 6px rgba(255, 220, 180, 0.2);
      `
      };

      &::after {
        box-shadow: ${
          props.$mode === "glass" ? `0px 4px 12px rgba(255, 127, 80, 0.6)` : `0px 4px 12px rgba(209, 122, 74, 0.7)`
        };
      }
    `}

  &:hover {
    background: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 127, 80, 0.25)" : props.$mode === "flat" ? "#c9723f" : "#c9723f"};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 127, 80, 0.5)" : props.$mode === "flat" ? "transparent" : "#db8855"};
    color: ${(props) => (props.$mode === "glass" ? "#ff8c42" : "#fffaf5")};

    ${(props) =>
      props.$hasBadge &&
      `
        &::after {
          box-shadow: ${
            props.$mode === "glass" ? `0px 2px 8px rgba(255, 127, 80, 0.4)` : `0px 2px 8px rgba(209, 122, 74, 0.5)`
          };
        }
      `}
  }

  ${(props) =>
    props.$hasBadge &&
    `
      &::after {
        content: '';
        position: absolute;
        top: -4px;
        right: -4px;
        width: .7rem;
        height: .7rem;
        background: orange;
        background: #c96c3d;
      
        border: 2px solid #e89563;
        box-shadow: 0px 6px 20px rgba(201, 108, 61, 0.5), inset 0px 2px 6px rgba(255, 220, 180, 0.18);
        border-radius: 50%;
        
      }
    `}
`

export const ClearButton = styled.button<{ $active?: boolean; $disabled?: boolean; $mode?: UIMode }>`
  width: ${sizeItem};
  height: ${sizeItem};
  background: ${(props) =>
    props.$disabled
      ? props.$mode === "glass"
        ? "rgba(25, 22, 20, 0.6)"
        : "#2b2420"
      : props.$mode === "glass"
        ? "rgba(35, 30, 25, 0.8)"
        : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border-radius: 1.2rem;
  border: ${(props) =>
    props.$disabled
      ? props.$mode === "glass"
        ? "1.5px solid rgba(100, 90, 80, 0.15)"
        : props.$mode === "flat"
          ? "none"
          : "2px solid #3a3028"
      : props.$mode === "glass"
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
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    margin 0.3s ease,
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s,
    opacity 0.25s;
  will-change: transform;
  transform-origin: bottom;
  position: relative;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => (props.$disabled ? (props.$mode === "glass" ? "#887766" : "#7a6a5a") : "#ffb896")};

  ${(props) =>
    props.$active &&
    !props.$disabled &&
    `
      transform: scale(1.35);
      margin: 0 0.6rem;
      z-index: 20;
      background: ${props.$mode === "glass" ? "rgba(255, 140, 80, 0.45)" : "#d17a4a"};
      border-color: ${
        props.$mode === "glass" ? "rgba(255, 150, 100, 0.65)" : props.$mode === "flat" ? "transparent" : "#e89563"
      };
      color: ${props.$mode === "glass" ? "#fff5e6" : "#fffaf5"};
      box-shadow: ${
        props.$mode === "glass"
          ? `
        0px 8px 28px rgba(255, 127, 80, 0.5),
        inset 0px 2px 4px rgba(255, 200, 150, 0.15);
      `
          : props.$mode === "flat"
            ? "none"
            : `
        0px 8px 28px rgba(209, 122, 74, 0.6),
        inset 0px 2px 6px rgba(255, 220, 180, 0.2);
      `
      }
    `}

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$disabled
        ? props.$mode === "glass"
          ? "rgba(25, 22, 20, 0.6)"
          : "#2b2420"
        : props.$mode === "glass"
          ? "rgba(255, 127, 80, 0.25)"
          : "#c9723f"};
    border-color: ${(props) =>
      props.$disabled
        ? props.$mode === "glass"
          ? "rgba(100, 90, 80, 0.15)"
          : props.$mode === "flat"
            ? "transparent"
            : "#3a3028"
        : props.$mode === "glass"
          ? "rgba(255, 127, 80, 0.5)"
          : props.$mode === "flat"
            ? "transparent"
            : "#db8855"};
    color: ${(props) =>
      props.$disabled
        ? props.$mode === "glass"
          ? "#887766"
          : "#7a6a5a"
        : props.$mode === "glass"
          ? "#ff8c42"
          : "#fffaf5"};
  }
`

export const Item = styled.li<{ $active?: boolean; $mode?: UIMode }>`
  width: ${sizeItem};
  height: ${sizeItem};
  background: ${(props) => (props.$mode === "glass" ? "rgba(35, 30, 25, 0.8)" : "#3d2f24")};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
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
    0px 4px 16px rgba(0, 0, 0, 0.3),
    inset 0px 1px 2px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 4px 16px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 180, 130, 0.12);
  `};
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    margin 0.3s ease,
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
  will-change: transform;
  transform-origin: bottom;
  position: relative;

  ${(props) =>
    props.$active &&
    `
      transform: scale(1.35);
      margin: 0 0.6rem;
      z-index: 20;
      transform-box: border-box;
      background: ${props.$mode === "glass" ? "rgba(255, 140, 80, 0.45)" : "#d17a4a"};
      border-color: ${
        props.$mode === "glass" ? "rgba(255, 150, 100, 0.65)" : props.$mode === "flat" ? "transparent" : "#e89563"
      };
      box-shadow: ${
        props.$mode === "glass"
          ? `
        0px 8px 28px rgba(255, 127, 80, 0.5),
        inset 0px 2px 4px rgba(255, 200, 150, 0.15);
      `
          : props.$mode === "flat"
            ? "none"
            : `
        0px 8px 28px rgba(209, 122, 74, 0.6),
        inset 0px 2px 6px rgba(255, 220, 180, 0.2);
      `
      }
      cursor: pointer;
    `}

  > label {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    input {
      position: absolute;
      /* opacity: 0; */
      display: none;
      cursor: pointer;
    }

    input:checked + * {
      background: ${(props) => (props.$mode === "glass" ? "rgba(230, 115, 70, 0.6)" : "#c96c3d")};
    }
  }

  /* When radio is checked, make the item background darker */
  &:has(input:checked) {
    background: ${(props) => (props.$mode === "glass" ? "rgba(230, 115, 70, 0.6)" : "#c96c3d")};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.75)" : props.$mode === "flat" ? "transparent" : "#e89563"};
    box-shadow: ${(props) =>
      props.$mode === "glass"
        ? `
      0px 6px 20px rgba(255, 140, 80, 0.4),
      inset 0px 2px 4px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 6px 20px rgba(201, 108, 61, 0.5),
      inset 0px 2px 6px rgba(255, 220, 180, 0.18);
    `};
  }
`

export const ItemLabel = styled.div<{ $mode?: UIMode }>`
  font-size: 1.25rem;
  text-align: center;
  pointer-events: none;
  color: #ffb896;
  font-weight: 500;
  text-shadow: ${(props) => (props.$mode === "flat" ? "none" : "0px 1px 4px rgba(0, 0, 0, 0.4)")};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const SubList = styled.ul<{ $centered?: boolean; $mode?: UIMode; $visible?: boolean; $transition?: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%) translateY(-1rem);
  display: flex;
  flex-direction: row;
  gap: 0.7rem;
  border-radius: 1.5rem;
  min-width: 6rem;
  z-index: 30;
  justify-content: ${(props) => (props.$centered ? "center" : "flex-start")};
  padding: 0.6rem 0.8rem 2rem 0.8rem;
  background: ${(props) => (props.$mode === "glass" ? "rgba(30, 25, 20, 0.7)" : "#2a1f1a")};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  border: ${(props) =>
    props.$mode === "glass"
      ? "1px solid rgba(255, 140, 100, 0.2)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #4a3428"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 8px 24px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 140, 100, 0.08);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 8px 24px rgba(0, 0, 0, 0.5),
    inset 0px 2px 6px rgba(255, 180, 130, 0.1);
  `};

  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  transition: ${(props) => (props.$transition !== false ? `opacity 0.2s ease, visibility 0.2s ease` : `none`)};
`

export const SubItemLabel = styled.div<{ $mode?: UIMode; $position?: number; $visible?: boolean }>`
  position: absolute;
  top: -2.2rem;
  left: ${(props) => props.$position || 0}px;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 400;
  text-transform: capitalize;
  font-family:
    "Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", "HelveticaNeue-CondensedBold", sans-serif-condensed,
    sans-serif;
  letter-spacing: 0.1em;
  color: ${(props) => (props.$mode === "glass" ? "#c9a892" : props.$mode === "flat" ? "#b89880" : "#c9a892")};
  text-shadow: ${(props) => (props.$mode === "flat" ? "none" : "0px 1px 2px rgba(0, 0, 0, 0.3)")};
  white-space: nowrap;
  pointer-events: none;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition:
    left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
  z-index: 40;
  padding: 0.25rem 0.5rem;
  background: ${(props) => (props.$mode === "glass" ? "#2d2620" : props.$mode === "flat" ? "#322a23" : "#2d2620")};
  border-radius: 0.5rem;
  border: ${(props) =>
    props.$mode === "glass"
      ? "1px solid rgba(100, 85, 70, 0.3)"
      : props.$mode === "flat"
        ? "none"
        : "1px solid rgba(90, 75, 60, 0.4)"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `0px 2px 8px rgba(0, 0, 0, 0.2)`
      : props.$mode === "flat"
        ? "0px 1px 4px rgba(0, 0, 0, 0.15)"
        : `0px 2px 8px rgba(0, 0, 0, 0.25)`};

  /* Tail pointing down to the subitem */
  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: ${(props) => (props.$mode === "glass" ? "#2d2620" : props.$mode === "flat" ? "#322a23" : "#2d2620")};
    border-radius: 0 0 2px 0;
  }
`

export const SubItem = styled.li<{ $mode?: UIMode }>`
  width: ${sizeSubItem};
  height: ${sizeSubItem};
  border-radius: 0.9rem;
  background: ${(props) => (props.$mode === "glass" ? "rgba(40, 35, 30, 0.85)" : "#453528")};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border: ${(props) =>
    props.$mode === "glass"
      ? "1.5px solid rgba(255, 140, 100, 0.3)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #6a4f3d"};
  color: #ffb896;
  font-size: 0.95rem;
  font-weight: 500;
  transition:
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 3px 12px rgba(0, 0, 0, 0.4),
    inset 0px 1px 2px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 3px 12px rgba(0, 0, 0, 0.4),
    inset 0px 1px 3px rgba(255, 180, 130, 0.12);
  `};

  /* Expanded hover area to fill gaps between subitems */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -0.5rem;
    right: -0.5rem;
    bottom: 0;
    z-index: -1;
  }

  &:first-of-type::before {
    left: 0;
  }

  &:last-of-type::before {
    right: 0;
  }

  &:hover {
    background: ${(props) => (props.$mode === "glass" ? "rgba(255, 140, 80, 0.5)" : "#d17a4a")};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.6)" : props.$mode === "flat" ? "transparent" : "#e89563"};
    color: ${(props) => (props.$mode === "glass" ? "#fff5e6" : "#fffaf5")};
    transform: ${(props) => (props.$mode === "flat" ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.$mode === "glass"
        ? `
      0px 5px 16px rgba(255, 127, 80, 0.3),
      inset 0px 1px 3px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 5px 16px rgba(209, 122, 74, 0.5),
      inset 0px 2px 4px rgba(255, 220, 180, 0.18);
    `};
  }

  /* When radio is checked, make the sub-item background darker */
  &:has(input:checked) {
    background: ${(props) => (props.$mode === "glass" ? "rgba(230, 115, 70, 0.6)" : "#c96c3d")};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.75)" : props.$mode === "flat" ? "transparent" : "#e89563"};
    color: ${(props) => (props.$mode === "glass" ? "#fff5e6" : "#fffaf5")};
    box-shadow: ${(props) =>
      props.$mode === "glass"
        ? `
      0px 4px 18px rgba(255, 140, 80, 0.4),
      inset 0px 2px 4px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 4px 18px rgba(201, 108, 61, 0.5),
      inset 0px 2px 6px rgba(255, 220, 180, 0.18);
    `};
  }

  label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    input {
      position: absolute;
      /* opacity: 0; */
      display: none;
      cursor: pointer;
    }
  }
`

/* Accessibility Filter Styles - Grid Layout */
export const AccessibilitySubGrid = styled.div<{ $mode?: UIMode; $visible?: boolean; $transition?: boolean }>`
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%) translateY(-1rem);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  border-radius: 1.5rem;
  z-index: 30;
  padding: 2rem 1rem 0.8rem 1rem;
  background: ${(props) => (props.$mode === "glass" ? "rgba(30, 25, 20, 0.7)" : "#2a1f1a")};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(12px)" : "none")};
  border: ${(props) =>
    props.$mode === "glass"
      ? "1px solid rgba(255, 140, 100, 0.2)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #4a3428"};
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 8px 24px rgba(0, 0, 0, 0.4),
    inset 0px 2px 4px rgba(255, 140, 100, 0.08);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 8px 24px rgba(0, 0, 0, 0.5),
    inset 0px 2px 6px rgba(255, 180, 130, 0.1);
  `};

  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  transition: ${(props) => (props.$transition !== false ? `opacity 0.2s ease, visibility 0.2s ease` : `none`)};
`

export const AccessibilitySubItem = styled.div<{ $mode?: UIMode; $selected?: boolean; $hovered?: boolean }>`
  width: ${sizeSubItem};
  height: ${sizeSubItem};
  border-radius: 0.9rem;
  background: ${(props) => (props.$mode === "glass" ? "rgba(40, 35, 30, 0.85)" : "#453528")};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border: ${(props) =>
    props.$mode === "glass"
      ? "1.5px solid rgba(255, 140, 100, 0.3)"
      : props.$mode === "flat"
        ? "none"
        : "2px solid #6a4f3d"};
  color: #ffb896;
  font-size: 0.95rem;
  font-weight: 500;
  transition:
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  box-shadow: ${(props) =>
    props.$mode === "glass"
      ? `
    0px 3px 12px rgba(0, 0, 0, 0.4),
    inset 0px 1px 2px rgba(255, 140, 100, 0.1);
  `
      : props.$mode === "flat"
        ? "none"
        : `
    0px 3px 12px rgba(0, 0, 0, 0.4),
    inset 0px 1px 3px rgba(255, 180, 130, 0.12);
  `};

  /* Apply hover styles */
  ${(props) =>
    props.$hovered &&
    `
    background: ${props.$mode === "glass" ? "rgba(255, 140, 80, 0.5)" : "#d17a4a"};
    border-color: ${
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.6)" : props.$mode === "flat" ? "transparent" : "#e89563"
    };
    color: ${props.$mode === "glass" ? "#fff5e6" : "#fffaf5"};
    transform: ${props.$mode === "flat" ? "none" : "translateY(-2px)"};
    box-shadow: ${
      props.$mode === "glass"
        ? `
      0px 5px 16px rgba(255, 127, 80, 0.3),
      inset 0px 1px 3px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 5px 16px rgba(209, 122, 74, 0.5),
      inset 0px 2px 4px rgba(255, 220, 180, 0.18);
    `
    };
  `}

  /* When radio is checked */
  ${(props) =>
    props.$selected &&
    `
    background: ${props.$mode === "glass" ? "rgba(230, 115, 70, 0.6)" : "#c96c3d"};
    border-color: ${
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.75)" : props.$mode === "flat" ? "transparent" : "#e89563"
    };
    color: ${props.$mode === "glass" ? "#fff5e6" : "#fffaf5"};
    box-shadow: ${
      props.$mode === "glass"
        ? `
      0px 4px 18px rgba(255, 140, 80, 0.4),
      inset 0px 2px 4px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 4px 18px rgba(201, 108, 61, 0.5),
      inset 0px 2px 6px rgba(255, 220, 180, 0.18);
    `
    };
  `}

  label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    input {
      position: absolute;
      display: none;
      cursor: pointer;
    }
  }
`

export const AccessibilitySubItemLabel = styled.div<{ $mode?: UIMode; $visible?: boolean }>`
  font-size: 0.65rem;
  font-weight: 400;
  text-transform: capitalize;
  font-family:
    "Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", "HelveticaNeue-CondensedBold", sans-serif-condensed,
    sans-serif;
  letter-spacing: 0.08em;
  color: ${(props) => (props.$mode === "glass" ? "#c9a892" : props.$mode === "flat" ? "#b89880" : "#c9a892")};
  text-shadow: ${(props) => (props.$mode === "flat" ? "none" : "0px 1px 2px rgba(0, 0, 0, 0.3)")};
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${(props) => (props.$visible ? 1 : 0.6)};
  transition: opacity 0.2s ease;
  min-height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 0.75rem;
    flex-shrink: 0;
  }
`

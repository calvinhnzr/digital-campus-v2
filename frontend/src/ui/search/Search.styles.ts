import styled from "@emotion/styled"
import type { UIMode } from "@/ui/Layout"

export const SearchContainer = styled.div`
  position: absolute;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const Input = styled.input<{ $mode?: UIMode; $greyedOut?: boolean }>`
  width: 18rem;
  padding: 0.75rem 1.25rem;
  background: ${(props) =>
    props.$mode === "glass" ? "rgba(35, 30, 25, 0.8)" : props.$mode === "flat" ? "#3d2f24" : "#3d2f24"};
  backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  -webkit-backdrop-filter: ${(props) => (props.$mode === "glass" ? "blur(10px)" : "none")};
  border-radius: 1.2rem;
  font-size: 1rem;
  color: #ffb896;
  font-weight: 500;
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
  opacity: ${(props) => (props.$greyedOut ? 0.5 : 1)};
  cursor: pointer;
  transition:
    background 0.25s,
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.2s ease,
    opacity 0.25s;

  &::placeholder {
    color: #9a7a66;
    font-weight: 400;
  }

  &:focus {
    background: ${(props) =>
      props.$mode === "glass" ? "rgba(50, 40, 35, 0.9)" : props.$mode === "flat" ? "#453528" : "#453528"};
    border-color: ${(props) => (props.$mode === "flat" ? "transparent" : "#e89563")};
    color: #fffaf5;
    box-shadow: ${(props) =>
      props.$mode === "glass"
        ? `
      0px 6px 20px rgba(209, 122, 74, 0.3),
      inset 0px 2px 5px rgba(255, 200, 150, 0.15);
    `
        : props.$mode === "flat"
          ? "none"
          : `
      0px 6px 20px rgba(209, 122, 74, 0.4),
      inset 0px 2px 6px rgba(255, 220, 180, 0.18);
    `};
    transform: ${(props) => (props.$mode === "flat" ? "none" : "translateY(-2px)")};
  }

  &:hover:not(:focus) {
    background: ${(props) =>
      props.$mode === "glass" ? "rgba(45, 35, 30, 0.85)" : props.$mode === "flat" ? "#4a3a2e" : "#4a3a2e"};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 140, 100, 0.35)" : props.$mode === "flat" ? "transparent" : "#6a4f3d"};
  }
`

export const ModeLabel = styled.div<{ $mode?: UIMode; $visible?: boolean }>`
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
  transition: opacity 0.2s ease;
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
`

export const DebugInfo = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 10000000001;
  font-size: 0.9rem;
  color: white;
`

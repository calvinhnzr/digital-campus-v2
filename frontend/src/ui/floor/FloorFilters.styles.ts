import styled from "@emotion/styled"
import { Item } from "@/ui/filter/Filter.styles"
import type { UIMode } from "@/ui/Layout"

export const FloorContainer = styled.div`
  position: absolute;
  left: 3rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100000000;
`

export const FloorItemStyled = styled(Item)`
  width: 3.7rem;
  height: 3.7rem;
  border-radius: 50% !important;
  list-style: none;
  cursor: pointer;

  /* Ensure label is circular */
  > label {
    border-radius: 50%;
  }

  /* Override the checked input background from parent Item */
  input:checked + * {
    background: transparent !important;
    border-radius: 50%;
  }

  &:hover:not([style*="opacity: 0.5"]) {
    background: ${(props) => (props.$mode === "glass" ? "rgba(255, 140, 80, 0.5)" : "#d17a4a")};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.6)" : props.$mode === "flat" ? "transparent" : "#e89563"};
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
`

export const FloorCycleItemStyled = styled(Item)`
  width: 3.7rem;
  height: 3.7rem;
  border-radius: 50%;
  cursor: pointer;
  list-style: none;

  &:hover:not([style*="opacity: 0.5"]) {
    background: ${(props) => (props.$mode === "glass" ? "rgba(255, 140, 80, 0.5)" : "#d17a4a")};
    border-color: ${(props) =>
      props.$mode === "glass" ? "rgba(255, 150, 100, 0.6)" : props.$mode === "flat" ? "transparent" : "#e89563"};
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
`

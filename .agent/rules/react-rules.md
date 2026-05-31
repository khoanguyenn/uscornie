# React & Frontend Coding Standards

## Component Size Limits
- **File Length:** Every React component file must not exceed 200 lines.
- **Single Responsibility:** Each file should contain exactly one main React component.
- **Refactoring:** If a component starts growing larger than 200 lines, you must refactor it by:
  - Extracting sub-components into their own files.
  - Moving complex state and API fetch logic into dedicated custom hooks in `lib/hooks/`.

## General React Guidelines
- Never copy props into local state to run synchronizations in a `useEffect` (avoid derived state).
- Use React `key` props on component instances to reset state declaratively when dependencies change.
- Write all inline code comments strictly in English.

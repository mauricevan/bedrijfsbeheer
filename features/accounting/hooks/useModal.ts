import { useState, useCallback } from "react";

/**
 * Generic modal hook for managing modal open/close state
 * 
 * @param initialState - Initial state of the modal (default: false)
 * @returns Object with modal state and control functions
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 * 
 * // Open modal
 * <button onClick={open}>Open Modal</button>
 * 
 * // Close modal
 * <button onClick={close}>Close Modal</button>
 * 
 * // Toggle modal
 * <button onClick={toggle}>Toggle Modal</button>
 * 
 * // Use in component
 * {isOpen && <Modal onClose={close} />}
 * ```
 */
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};


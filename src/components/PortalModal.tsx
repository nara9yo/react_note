import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  children: ReactNode;
  isOpen: boolean;
}

const PortalModal: React.FC<PortalModalProps> = ({ children, isOpen }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="portal-modal-root">
      {children}
    </div>,
    document.body
  );
};

export default PortalModal;

import React, { ReactElement } from 'react';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { useSquadTour } from '../../hooks/useSquadTour';
import { ModalClose } from './common/ModalClose';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const onModalClose: typeof onRequestClose = (param) => {
    onCloseTour();
    onRequestClose(param);
  };

  return (
    <Modal
      {...props}
      onRequestClose={onModalClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
    >
      <SquadTour onClose={onModalClose} />
      <ModalClose
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        top="3"
        right="3"
        onClick={onModalClose}
      />
    </Modal>
  );
}

export default SquadTourModal;

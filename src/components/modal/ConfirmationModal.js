// @flow
import React, {Component} from 'react';

import Button from '../button/Button';
import Modal from './Modal';

type Props = {
  confirmButtonLabel?: string,
  isOpen: boolean,
  label: string,
  onCancel: Function,
  onClose: Function,
  onSave: Function,
  title: string,
}

class ConfirmationModal extends Component<Props> {
  cancelButton: any

  setCancelButtonRef = (element: any) => {
    this.cancelButton = element;
  }

  componentDidUpdate(prevProps: Props) {
    if(!prevProps.isOpen && this.props.isOpen) {
      if(this.cancelButton) {
        this.cancelButton.focus();
      }
    }
  }

  render() {
    const {
      confirmButtonLabel = 'Tallenna',
      isOpen,
      label,
      onCancel,
      onClose,
      onSave,
      title,
    } = this.props;

    return (
      <div className='confirmation-modal'>
        <Modal
          className='modal-small modal-autoheight modal-center'
          title={title}
          isOpen={isOpen}
          onClose={onClose}
        >
          <p>{label}</p>
          <div className='confirmation-modal__footer'>
            <button
              ref={this.setCancelButtonRef}
              className='mvj-button button-red'
              onClick={onCancel}
              title='Peruuta'
            >Peruuta</button>
            <Button
              className='button-green'
              label={confirmButtonLabel}
              onClick={onSave}
              title={confirmButtonLabel}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default ConfirmationModal;

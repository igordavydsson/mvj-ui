// @flow
import React from 'react';

import {createClassName, generalClassNames, GeneralPropTypes} from '../../foundation/utils';
import TrashIcon from '$components/icons/TrashIcon';

type Props = {
  ...GeneralPropTypes,
  className?: string,
  disabled?: boolean,
  onClick: Function,
  style?: Object,
  title?: string,
  type?: string,
}

const RemoveButton = (props: Props) => {
  const {className, disabled, onClick, style, title, type = 'button'} = props;

  const createdClassName = createClassName(
    'form__remove-button',
    className,
    generalClassNames(props),
  );

  return(
    <button
      className={createdClassName}
      disabled={disabled}
      style={style}
      type={type}
      title={title}
      onClick={onClick}
    >
      <TrashIcon className='icon-medium'/>
    </button>
  );
};


export default RemoveButton;

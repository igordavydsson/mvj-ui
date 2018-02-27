// @flow
import React from 'react';

type Props = {
  children?: any,
}

const GreenBox = ({children}: Props) =>
  <div className="green-box-edit">
    {children}
  </div>;

export default GreenBox;

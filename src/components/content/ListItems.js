// @flow
import React from 'react';
import classNames from 'classnames';

type Props = {
  children?: any,
  className?: string,
}

const ListItems = ({children, className}: Props) =>
  <div className={classNames('list-items', className)}>{children}</div>;

export default ListItems;

// @flow
import React from 'react';
import get from 'lodash/get';
import {Row, Column} from 'react-foundation';

import {formatDate} from '../../../../util/helpers';
import {getFullAddress} from '../../../helpers';

type Props = {
  customer: Object,
};

const OtherPersonItem = ({customer}: Props) => {
  const formatedDate = formatDate(customer.start_date);
  const fullAddress = getFullAddress(customer);

  return (
    <div className='section-item'>
      <Row>
        <Column medium={4}>
          <p className='subtitle'>{get(customer, 'lastname')} {get(customer, 'firstname')}</p>
          <div className='contact'>
            <p>{fullAddress}</p>
            <p>{get(customer, 'phone')}</p>
            <p>{get(customer, 'email')}</p>
          </div>
          {get(customer, 'protection_order') && <p className='alert'><i/><span>Turvakielto</span></p>}
          <p className='comment'>{get(customer, 'comment')}</p>
        </Column>
        <Column medium={4}>
          <label>Kieli</label>
          <p>{get(customer, 'language', '')}</p>
          <label>Alkupäivämäärä</label>
          <p>{formatedDate}</p>
        </Column>
        <Column medium={4}>
          <label>Asiakasnumero</label>
          <p>{get(customer, 'customer_id', '')}</p>
          <label>SAP asiakasnumero</label>
          <p>{get(customer, 'SAP_customer_id', '')}</p>
        </Column>
      </Row>
    </div>
  );
};

export default OtherPersonItem;
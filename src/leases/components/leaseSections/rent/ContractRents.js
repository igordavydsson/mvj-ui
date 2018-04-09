// @flow
import React from 'react';

import {
  formatDateRange,
  formatDecimalNumber,
  formatNumberWithThousandSeparator,
  getAttributeFieldOptions,
  getLabelOfOption,
} from '$util/helpers';
import {RentTypes} from '$src/leases/enums';

import type {Attributes} from '$src/leases/types';

type Props = {
  attributes: Attributes,
  contractRents: Array<Object>,
  rentType: string
}

const ContractRents = ({attributes, contractRents, rentType}: Props) => {
  const amountPeriodOptions = getAttributeFieldOptions(attributes,
    'rents.child.children.contract_rents.child.children.amount_period');
  const baseAmountPeriodOptions = getAttributeFieldOptions(attributes,
    'rents.child.children.contract_rents.child.children.base_amount_period');
  const intendedUseOptions = getAttributeFieldOptions(attributes,
    'rents.child.children.contract_rents.child.children.intended_use');

  const getAmount = (rent: Object) => {
    if(!rent.amount) {
      return null;
    }

    return `${formatNumberWithThousandSeparator(formatDecimalNumber(rent.amount), '.')} ${getLabelOfOption(amountPeriodOptions, rent.amount_period)}`;
  };

  const getBaseAmount = (rent: Object) => {
    if(!rent.base_amount) {
      return null;
    }

    return `${formatNumberWithThousandSeparator(formatDecimalNumber(rent.base_amount), '.')} ${getLabelOfOption(baseAmountPeriodOptions, rent.base_amount_period)}`;
  };

  return (
    <table className="secondary-table table">
      <thead>
        <tr>
          <th>Sopimusvuokra</th>
          <th>Käyttötarkoitus</th>
          {(rentType === RentTypes.INDEX || rentType === RentTypes.MANUAL) &&
            <th>Vuokranlaskennan perusteena oleva vuokra</th>
          }
          {(rentType === RentTypes.INDEX || rentType === RentTypes.MANUAL) &&
            <th>Uusi perusvuosi vuokra</th>
          }
          <th>Voimassaoloaika</th>
        </tr>
      </thead>
      <tbody>
        {(!contractRents || !contractRents.length) &&
          <tr className='no-data'><td colSpan={(rentType === RentTypes.INDEX || rentType === rentType === RentTypes.MANUAL) ? 5 : 3}>Ei sopimusvuokria</td></tr>
        }
        {contractRents && !!contractRents.length && contractRents.map((rent, index) => {
          return (
            <tr key={index}>
              <td>{getAmount(rent) || '-'}</td>
              <td>{getLabelOfOption(intendedUseOptions, rent.intended_use) || '-'}</td>
              {(rentType === RentTypes.INDEX || rentType === RentTypes.MANUAL) &&
                <td>{getBaseAmount(rent) || '-'}</td>
              }
              {(rentType === RentTypes.INDEX || rentType === RentTypes.MANUAL) &&
                <td>{formatNumberWithThousandSeparator(formatDecimalNumber(rent.base_year_rent), '.') || '-'}</td>
              }
              <td>{formatDateRange(rent.start_date, rent.end_date) || '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ContractRents;

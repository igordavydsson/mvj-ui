// @flow
import React from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import {Row, Column} from 'react-foundation';
import isEmpty from 'lodash/isEmpty';

import FormText from '$components/form/FormText';
import {FormNames} from '$src/leases/enums';
import {convertStrToDecimalNumber, formatNumber} from '$util/helpers';
import {getPenaltyInterestByInvoice} from '$src/penaltyInterest/selectors';

type Props = {
  collectionCharge: number,
  fields: any,
  penaltyInterestArray: Array<Object>,
}

const CollectionLetterTotalRow = ({
  collectionCharge,
  penaltyInterestArray,
}: Props) => {
  const getTotalOutstandingAmount = () => {
    let total = 0;
    penaltyInterestArray.forEach((penaltyInterest) => {
      total += penaltyInterest.outstanding_amount;
    });
    return total;
  };

  const getTotalInterestAmount = () => {
    let total = 0;
    penaltyInterestArray.forEach((penaltyInterest) => {
      total += penaltyInterest.total_interest_amount;
    });
    return total;
  };

  const getTotalCollectionCharge = () => {
    let total = 0;
    const formatedCollectionCharge = convertStrToDecimalNumber(collectionCharge);

    if(collectionCharge && !isNaN(formatedCollectionCharge)) {
      penaltyInterestArray.forEach(() => {
        total += formatedCollectionCharge;
      });
    }
    return total;
  };

  const totalOutstandingAmount = getTotalOutstandingAmount(),
    totalInterestAmount = getTotalInterestAmount(),
    totalCollectionCharge = getTotalCollectionCharge(),
    total = totalOutstandingAmount + totalInterestAmount + totalCollectionCharge;

  return(
    <Row>
      <Column small={4}>
        <FormText>Yhteensä</FormText>
      </Column>
      <Column small={2}>
        <FormText>{`${formatNumber(totalOutstandingAmount)} €`}</FormText>
      </Column>
      <Column small={2}>
        <FormText>{`${formatNumber(totalInterestAmount)} €`}</FormText>
      </Column>
      <Column small={2}>
        <FormText>{`${formatNumber(totalCollectionCharge)} €`}</FormText>
      </Column>
      <Column small={2}>
        <FormText><strong>{`${formatNumber(total)} €`}</strong></FormText>
      </Column>
    </Row>
  );
};

const formName = FormNames.CREATE_COLLECTION_LETTER;
const selector = formValueSelector(formName);

export default connect(
  (state, props) => {
    const penaltyInterestArray = [];
    props.fields.forEach((field) => {
      const invoice = selector(state, field),
        penaltyInterest = getPenaltyInterestByInvoice(state, invoice);
      if(!isEmpty(penaltyInterest)) {
        penaltyInterestArray.push(penaltyInterest);
      }
    });

    return {
      penaltyInterestArray: penaltyInterestArray,
    };
  },
)(CollectionLetterTotalRow);

// @flow
import React from 'react';
import {connect} from 'react-redux';
import {Row, Column} from 'react-foundation';

import Collapse from '$components/collapse/Collapse';
import Divider from '$components/content/Divider';
import FormFieldLabel from '$components/form/FormFieldLabel';
import ListItems from '$components/content/ListItems';
import SubTitle from '$components/content/SubTitle';
import {getContentLandUseContractBasicInformation} from '$src/landUseContract/helpers';
import {formatDate, getAttributeFieldOptions, getLabelOfOption} from '$util/helpers';
import {getAttributes, getCurrentLandUseContract} from '$src/landUseContract/selectors';

import type {Attributes, LandUseContract} from '$src/landUseContract/types';

type Props = {
  attributes: Attributes,
  currentLandUseContract: LandUseContract,
}

const BasicInformation = ({attributes, currentLandUseContract}: Props) => {
  const basicInformation = getContentLandUseContractBasicInformation(currentLandUseContract);
  const stateOptions = getAttributeFieldOptions(attributes, 'state');
  return (
    <div>
      <h2>Perustiedot</h2>
      <Divider />
      <Collapse
        defaultOpen={true}
        headerTitle={
          <h3 className='collapse__header-title'>Perustiedot</h3>
        }
      >
        <Row>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Kohde</FormFieldLabel>
            {!!basicInformation.areas && !!basicInformation.areas.length
              ? <ListItems>
                {basicInformation.areas.map((area, index) => <p key={index} className='no-margin'>{area}</p>)}
              </ListItems>
              : <p>-</p>
            }
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Osapuoli</FormFieldLabel>
            {!!basicInformation.litigants && !!basicInformation.litigants.length
              ? <ListItems>
                {basicInformation.litigants.map((litigant, index) => <p key={index} className='no-margin'>{litigant}</p>)}
              </ListItems>
              : <p>-</p>
            }
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Valmistelija</FormFieldLabel>
            <p>{basicInformation.preparer || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Maankäyttösopimus</FormFieldLabel>
            <p>{basicInformation.land_use_contract_number || '-'}</p>
          </Column>
        </Row>
        <Row>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Arvioitu toteutumisvuosi</FormFieldLabel>
            <p>{basicInformation.estimate_completion_year || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Arvioitu esittelyvuosi</FormFieldLabel>
            <p>{basicInformation.estimate_introduction_year || '-'}</p>
          </Column>
        </Row>
        <SubTitle>Liitetiedostot</SubTitle>
        <p>Ei liitetiedostoja</p>
      </Collapse>

      <Collapse
        defaultOpen={true}
        headerTitle={
          <h3 className='collapse__header-title'>Asemakaavatiedot</h3>
        }
      >
        <Row>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Hankealue</FormFieldLabel>
            <p>{basicInformation.project_area || '-'}</p>
          </Column>
        </Row>
        <Row>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Asemakaavan diaarinumero</FormFieldLabel>
            <p>{basicInformation.plan_reference_number || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Asemakaavan numero</FormFieldLabel>
            <p>{basicInformation.plan_number || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Asemakaavan käsittelyvaihe</FormFieldLabel>
            <p>{getLabelOfOption(stateOptions, basicInformation.state) || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Asemakaavan hyväksyjä</FormFieldLabel>
            <p>{basicInformation.plan_acceptor || '-'}</p>
          </Column>
          <Column small={6} medium={4} large={2}>
            <FormFieldLabel>Asemakaavan lainvoimaisuuspvm</FormFieldLabel>
            <p>{formatDate(basicInformation.plan_lawfulness_date) || '-'}</p>
          </Column>
        </Row>
      </Collapse>
    </div>
  );
};

export default connect(
  (state) => {
    return {
      attributes: getAttributes(state),
      currentLandUseContract: getCurrentLandUseContract(state),
    };
  }
)(BasicInformation);
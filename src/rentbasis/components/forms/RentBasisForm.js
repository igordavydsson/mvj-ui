// @flow
import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {FieldArray, reduxForm} from 'redux-form';
import {Row, Column} from 'react-foundation';
import flowRight from 'lodash/flowRight';
import type {Element} from 'react';

import {ActionTypes, AppConsumer} from '$src/app/AppContext';
import AddButtonThird from '$components/form/AddButtonThird';
import Authorization from '$components/authorization/Authorization';
import FieldAndRemoveButtonWrapper from '$components/form/FieldAndRemoveButtonWrapper';
import FormField from '$components/form/FormField';
import FormTextTitle from '$components/form/FormTextTitle';
import RemoveButton from '$components/form/RemoveButton';
import SubTitle from '$components/content/SubTitle';
import {receiveFormValid} from '$src/rentbasis/actions';
import {ButtonColors, FieldTypes} from '$components/enums';
import {
  DeleteModalLabels,
  DeleteModalTitles,
  FormNames,
  RentBasisFieldPaths,
  RentBasisFieldTitles,
  RentBasisDecisionsFieldPaths,
  RentBasisDecisionsFieldTitles,
  RentBasisPropertyIdentifiersFieldPaths,
  RentBasisPropertyIdentifiersFieldTitles,
  RentBasisRentRatesFieldPaths,
  RentBasisRentRatesFieldTitles,
} from '$src/rentbasis/enums';
import {
  getFieldAttributes,
  getFieldOptions,
  isEmptyValue,
  isFieldAllowedToEdit,
  isFieldAllowedToRead,
  isFieldRequired,
  sortByLabelDesc,
} from '$util/helpers';
import {validateRentBasisForm} from '$src/rentbasis/formValidators';
import {
  getAttributes as getRentBasisAttributes,
  getIsFormValid,
  getIsSaveClicked,
  getRentBasisInitialValues,
} from '$src/rentbasis/selectors';
import {referenceNumber} from '$components/form/validations';

import type {Attributes} from '$src/types';
import type {RootState} from '$src/root/types';

type PropertyIdentifiersProps = {
  fields: any,
  isSaveClicked: boolean,
  rentBasisAttributes: Attributes,
}

const renderPropertyIdentifiers = ({fields, isSaveClicked, rentBasisAttributes}: PropertyIdentifiersProps): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <AppConsumer>
      {({dispatch}) => {
        return(
          <Fragment>
            <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.IDENTIFIER)}>
              {RentBasisPropertyIdentifiersFieldTitles.PROPERTY_IDENTIFIERS}
            </FormTextTitle>

            {fields && !!fields.length && fields.map((field, index) => {
              const handleRemove = () => {
                dispatch({
                  type: ActionTypes.SHOW_CONFIRMATION_MODAL,
                  confirmationFunction: () => {
                    fields.remove(index);
                  },
                  confirmationModalButtonClassName: ButtonColors.ALERT,
                  confirmationModalButtonText: 'Poista',
                  confirmationModalLabel: DeleteModalLabels.IDENTIFIER,
                  confirmationModalTitle: DeleteModalTitles.IDENTIFIER,
                });
              };

              return (
                <Row key={index}>
                  <Column>
                    <FieldAndRemoveButtonWrapper
                      field={
                        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.IDENTIFIER)}>
                          <FormField
                            disableTouched={isSaveClicked}
                            fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.IDENTIFIER)}
                            invisibleLabel
                            name={`${field}.identifier`}
                            overrideValues={{label: RentBasisPropertyIdentifiersFieldTitles.IDENTIFIER}}
                          />
                        </Authorization>
                      }
                      removeButton={
                        <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.PROPERTY_IDENTIFIERS)}>
                          <RemoveButton
                            className='third-level'
                            onClick={handleRemove}
                            title="Poista kiinteistötunnus"
                          />
                        </Authorization>
                      }
                    />
                  </Column>
                </Row>
              );
            })}

            <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.PROPERTY_IDENTIFIERS)}>
              <Row>
                <Column>
                  <AddButtonThird
                    label='Lisää kiinteistötunnus'
                    onClick={handleAdd}
                  />
                </Column>
              </Row>
            </Authorization>
          </Fragment>
        );
      }}
    </AppConsumer>
  );
};

type DecisionsProps = {
  fields: any,
  isSaveClicked: boolean,
  rentBasisAttributes: Attributes,
}

const renderDecisions = ({fields, isSaveClicked, rentBasisAttributes}: DecisionsProps): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <AppConsumer>
      {({dispatch}) => {
        return(
          <Fragment>
            <SubTitle>{RentBasisDecisionsFieldTitles.DECISIONS}</SubTitle>
            {fields && !!fields.length &&
              <Row>
                <Column small={3} large={2}>
                  <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_MAKER)}>
                    <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_MAKER)}>
                      {RentBasisDecisionsFieldTitles.DECISION_MAKER}
                    </FormTextTitle>
                  </Authorization>
                </Column>
                <Column small={3} large={2}>
                  <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_DATE)}>
                    <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_DATE)}>
                      {RentBasisDecisionsFieldTitles.DECISION_DATE}
                    </FormTextTitle>
                  </Authorization>
                </Column>
                <Column small={3} large={2}>
                  <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.SECTION)}>
                    <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisDecisionsFieldPaths.SECTION)}>
                      {RentBasisDecisionsFieldTitles.SECTION}
                    </FormTextTitle>
                  </Authorization>
                </Column>
                <Column small={3} large={2}>
                  <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.REFERENCE_NUMBER)}>
                    <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisDecisionsFieldPaths.REFERENCE_NUMBER)}>
                      {RentBasisDecisionsFieldTitles.REFERENCE_NUMBER}
                    </FormTextTitle>
                  </Authorization>
                </Column>
              </Row>
            }

            {fields && !!fields.length && fields.map((field, index) => {
              const handleRemove = () => {
                dispatch({
                  type: ActionTypes.SHOW_CONFIRMATION_MODAL,
                  confirmationFunction: () => {
                    fields.remove(index);
                  },
                  confirmationModalButtonClassName: ButtonColors.ALERT,
                  confirmationModalButtonText: 'Poista',
                  confirmationModalLabel: DeleteModalLabels.DECISION,
                  confirmationModalTitle: DeleteModalTitles.DECISION,
                });
              };

              return(
                <Row key={index}>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_MAKER)}>
                      <FormField
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_MAKER)}
                        invisibleLabel
                        name={`${field}.decision_maker`}
                        overrideValues={{label: RentBasisDecisionsFieldTitles.DECISION_MAKER}}
                      />
                    </Authorization>
                  </Column>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_DATE)}>
                      <FormField
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISION_DATE)}
                        invisibleLabel
                        name={`${field}.decision_date`}
                        overrideValues={{label: RentBasisDecisionsFieldTitles.DECISION_DATE}}
                      />
                    </Authorization>
                  </Column>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.SECTION)}>
                      <FormField
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisDecisionsFieldPaths.SECTION)}
                        invisibleLabel
                        name={`${field}.section`}
                        unit='§'
                        overrideValues={{label: RentBasisDecisionsFieldTitles.SECTION}}
                      />
                    </Authorization>
                  </Column>
                  <Column small={3} large={2}>
                    <FieldAndRemoveButtonWrapper
                      field={
                        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.REFERENCE_NUMBER)}>
                          <FormField
                            disableTouched={isSaveClicked}
                            fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisDecisionsFieldPaths.REFERENCE_NUMBER)}
                            invisibleLabel
                            name={`${field}.reference_number`}
                            validate={referenceNumber}
                            overrideValues={{
                              label: RentBasisDecisionsFieldTitles.REFERENCE_NUMBER,
                              fieldType: FieldTypes.REFERENCE_NUMBER,
                            }}
                          />
                        </Authorization>
                      }
                      removeButton={
                        <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISIONS)}>
                          <RemoveButton
                            className='third-level'
                            onClick={handleRemove}
                            title="Poista päätös"
                          />
                        </Authorization>
                      }
                    />
                  </Column>
                </Row>
              );
            })}

            <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISIONS)}>
              <Row>
                <Column>
                  <AddButtonThird
                    label='Lisää päätös'
                    onClick={handleAdd}
                  />
                </Column>
              </Row>
            </Authorization>
          </Fragment>
        );
      }}
    </AppConsumer>
  );
};

type RentRatesProps = {
  areaUnitOptions: Array<Object>,
  fields: any,
  isSaveClicked: boolean,
  rentBasisAttributes: Attributes,
}

const renderRentRates = ({areaUnitOptions, fields, isSaveClicked, rentBasisAttributes}: RentRatesProps): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <AppConsumer>
      {({dispatch}) => {
        return(
          <Fragment>
            <SubTitle>{RentBasisRentRatesFieldTitles.RENT_RATES}</SubTitle>

            {fields && !!fields.length &&
              <Fragment>
                <Row>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.BUILD_PERMISSION_TYPE)}>
                      <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisRentRatesFieldPaths.BUILD_PERMISSION_TYPE)}>
                        {RentBasisRentRatesFieldTitles.BUILD_PERMISSION_TYPE}
                      </FormTextTitle>
                    </Authorization>
                  </Column>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.AMOUNT)}>
                      <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisRentRatesFieldPaths.AMOUNT)}>
                        {RentBasisRentRatesFieldTitles.AMOUNT}
                      </FormTextTitle>
                    </Authorization>
                  </Column>
                  <Column small={3} large={2}>
                    <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.AREA_UNIT)}>
                      <FormTextTitle required={isFieldRequired(rentBasisAttributes, RentBasisRentRatesFieldPaths.AREA_UNIT)}>
                        {RentBasisRentRatesFieldTitles.AREA_UNIT}
                      </FormTextTitle>
                    </Authorization>
                  </Column>
                </Row>

                {fields.map((field, index) => {
                  const handleRemove = () => {
                    dispatch({
                      type: ActionTypes.SHOW_CONFIRMATION_MODAL,
                      confirmationFunction: () => {
                        fields.remove(index);
                      },
                      confirmationModalButtonClassName: ButtonColors.ALERT,
                      confirmationModalButtonText: 'Poista',
                      confirmationModalLabel: DeleteModalLabels.RENT_RATE,
                      confirmationModalTitle: DeleteModalTitles.RENT_RATE,
                    });
                  };

                  return(
                    <Row key={index}>
                      <Column small={3} large={2}>
                        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.BUILD_PERMISSION_TYPE)}>
                          <FormField
                            disableTouched={isSaveClicked}
                            fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisRentRatesFieldPaths.BUILD_PERMISSION_TYPE)}
                            invisibleLabel
                            name={`${field}.build_permission_type`}
                            overrideValues={{label: RentBasisRentRatesFieldTitles.BUILD_PERMISSION_TYPE}}
                          />
                        </Authorization>
                      </Column>
                      <Column small={3} large={2}>
                        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.AMOUNT)}>
                          <FormField
                            disableTouched={isSaveClicked}
                            fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisRentRatesFieldPaths.AMOUNT)}
                            invisibleLabel
                            name={`${field}.amount`}
                            overrideValues={{label: RentBasisRentRatesFieldTitles.AMOUNT}}
                          />
                        </Authorization>
                      </Column>
                      <Column small={3} large={2}>
                        <FieldAndRemoveButtonWrapper
                          field={
                            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.AREA_UNIT)}>
                              <FormField
                                disableTouched={isSaveClicked}
                                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisRentRatesFieldPaths.AREA_UNIT)}
                                invisibleLabel
                                name={`${field}.area_unit`}
                                overrideValues={{
                                  label: RentBasisRentRatesFieldTitles.AREA_UNIT,
                                  options: areaUnitOptions,
                                }}
                              />
                            </Authorization>
                          }
                          removeButton={
                            <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisRentRatesFieldPaths.RENT_RATES)}>
                              <RemoveButton
                                className='third-level'
                                onClick={handleRemove}
                                title="Poista hinta"
                              />
                            </Authorization>
                          }
                        />
                      </Column>
                    </Row>
                  );
                })}
              </Fragment>
            }

            <Authorization allow={isFieldAllowedToEdit(rentBasisAttributes, RentBasisRentRatesFieldPaths.RENT_RATES)}>
              <Row>
                <Column>
                  <AddButtonThird
                    label='Lisää hinta'
                    onClick={handleAdd}
                  />
                </Column>
              </Row>
            </Authorization>
          </Fragment>
        );
      }}
    </AppConsumer>
  );
};

type Props = {
  handleSubmit: Function,
  initialValues: Object,
  isFocusedOnMount?: boolean,
  isFormValid: boolean,
  isSaveClicked: boolean,
  receiveFormValid: Function,
  rentBasisAttributes: Attributes,
  valid: boolean,
}

type State = {
  areaUnitOptions: Array<Object>,
  indexOptions: Array<Object>,
  rentBasisAttributes: Attributes,
}

class RentBasisForm extends PureComponent<Props, State> {
  firstField: any

  state = {
    areaUnitOptions: [],
    indexOptions: [],
    rentBasisAttributes: {},
  }

  componentDidMount() {
    const {isFocusedOnMount} = this.props;

    if(isFocusedOnMount) {
      this.setFocusOnFirstField();
    }
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const newState = {};

    if(props.rentBasisAttributes !== state.rentBasisAttributes) {
      newState.rentBasisAttributes = props.rentBasisAttributes;
      newState.areaUnitOptions = getFieldOptions(props.rentBasisAttributes, RentBasisRentRatesFieldPaths.AREA_UNIT, true, (option) =>
        !isEmptyValue(option.display_name) ? option.display_name.replace(/\^2/g, '²') : option.display_name
      );
      newState.indexOptions = getFieldOptions(props.rentBasisAttributes, RentBasisFieldPaths.INDEX, true, null, sortByLabelDesc);
    }

    return newState;
  }

  componentDidUpdate() {
    const {isFormValid, receiveFormValid, valid} = this.props;
    if(isFormValid !== valid) {
      receiveFormValid(valid);
    }
  }

  setRefForFirstField = (element: any) => {
    this.firstField = element;
  }

  setFocusOnFirstField = () => {
    this.firstField.focus();
  }

  render() {
    const {handleSubmit, isSaveClicked, rentBasisAttributes} = this.props;
    const {areaUnitOptions, indexOptions} = this.state;

    return (
      <form onSubmit={handleSubmit}>
        <Row>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.PLOT_TYPE)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.PLOT_TYPE)}
                name='plot_type'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.PLOT_TYPE}}
              />
            </Authorization>
          </Column>
          <Column  small={3} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.START_DATE)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.START_DATE)}
                name='start_date'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.START_DATE}}
              />
            </Authorization>
          </Column>
          <Column  small={3} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.END_DATE)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.END_DATE)}
                name='end_date'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.END_DATE}}
              />
            </Authorization>
          </Column>
        </Row>
        <Row>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisPropertyIdentifiersFieldPaths.PROPERTY_IDENTIFIERS)}>
              <FieldArray
                component={renderPropertyIdentifiers}
                name='property_identifiers'
                isSaveClicked={isSaveClicked}
                rentBasisAttributes={rentBasisAttributes}
              />
            </Authorization>
          </Column>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.DETAILED_PLAN_IDENTIFIER)}>
              <FormField
                className='align-top'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.DETAILED_PLAN_IDENTIFIER)}
                name='detailed_plan_identifier'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.DETAILED_PLAN_IDENTIFIER}}
              />
            </Authorization>
          </Column>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.MANAGEMENT)}>
              <FormField
                className='align-top'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.MANAGEMENT)}
                name='management'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.MANAGEMENT}}
              />
            </Authorization>
          </Column>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.FINANCING)}>
              <FormField
                className='align-top'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.FINANCING)}
                name='financing'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.FINANCING}}
              />
            </Authorization>
          </Column>
        </Row>
        <Row>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.LEASE_RIGHTS_END_DATE)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.LEASE_RIGHTS_END_DATE)}
                name='lease_rights_end_date'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.LEASE_RIGHTS_END_DATE}}
              />
            </Authorization>
          </Column>
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.INDEX)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.INDEX)}
                name='index'
                setRefForField={this.setRefForFirstField}
                overrideValues={{
                  label: RentBasisFieldTitles.INDEX,
                  options: indexOptions,
                }}
              />
            </Authorization>
          </Column>
        </Row>

        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisDecisionsFieldPaths.DECISIONS)}>
          <Row>
            <Column>
              <FieldArray
                component={renderDecisions}
                name="decisions"
                isSaveClicked={isSaveClicked}
                rentBasisAttributes={rentBasisAttributes}
              />
            </Column>
          </Row>
        </Authorization>

        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisRentRatesFieldPaths.RENT_RATES)}>
          <Row>
            <Column>
              <FieldArray
                component={renderRentRates}
                name="rent_rates"
                areaUnitOptions={areaUnitOptions}
                isSaveClicked={isSaveClicked}
                rentBasisAttributes={rentBasisAttributes}
              />
            </Column>
          </Row>
        </Authorization>

        <Authorization allow={isFieldAllowedToRead(rentBasisAttributes, RentBasisFieldPaths.NOTE)}>
          <Row>
            <Column>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(rentBasisAttributes, RentBasisFieldPaths.NOTE)}
                name='note'
                setRefForField={this.setRefForFirstField}
                overrideValues={{label: RentBasisFieldTitles.NOTE}}
              />
            </Column>
          </Row>
        </Authorization>
      </form>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    initialValues: getRentBasisInitialValues(state),
    isFormValid: getIsFormValid(state),
    isSaveClicked: getIsSaveClicked(state),
    rentBasisAttributes: getRentBasisAttributes(state),
  };
};

const formName = FormNames.RENT_BASIS;

export default flowRight(
  connect(
    mapStateToProps,
    {
      receiveFormValid,
    }
  ),
  reduxForm({
    destroyOnUnmount: false,
    form: formName,
    enableReinitialize: true,
    validate: validateRentBasisForm,
  }),
)(RentBasisForm);

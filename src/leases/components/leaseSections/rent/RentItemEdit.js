// @flow
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {change, FieldArray, formValueSelector, FormSection} from 'redux-form';
import {Column} from 'react-foundation';
import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import BasicInfoEdit from './BasicInfoEdit';
import BoxContentWrapper from '$components/content/BoxContentWrapper';
import ContractRentsEdit from './ContractRentsEdit';
import Collapse from '$components/collapse/Collapse';
import FixedInitialYearRentsEdit from './FixedInitialYearRentsEdit';
import IndexAdjustedRents from './IndexAdjustedRents';
import PayableRents from './PayableRents';
import RentAdjustmentsEdit from './RentAdjustmentsEdit';
import {receiveCollapseStates} from '$src/leases/actions';
import {ViewModes} from '$src/enums';
import {FormNames, RentTypes} from '$src/leases/enums';
import {isRentActive, isRentArchived} from '$src/leases/helpers';
import {formatDateRange, getAttributeFieldOptions, getLabelOfOption} from '$util/helpers';
import {getAttributes, getCollapseStateByKey, getErrorsByFormName, getIsSaveClicked} from '$src/leases/selectors';

import type {Attributes} from '$src/leases/types';

type Props = {
  attributes: Attributes,
  change: Function,
  contractRentsCollapseState: boolean,
  contractRents: Array<Object>,
  errors: ?Object,
  field: string,
  fixedInitialYearRentsCollapseState: boolean,
  index: number,
  indexAdjustedRentsCollapseState: boolean,
  isSaveClicked: boolean,
  onRemove: Function,
  payableRentsCollapseState: boolean,
  receiveCollapseStates: Function,
  rentAdjustmentsCollapseState: boolean,
  rentCollapseState: boolean,
  rentId: number,
  rents: Array<Object>,
  rentType: ?string,
}

type State = {
  active: boolean,
  archived: boolean,
  attributes: Attributes,
  contractRentErrors: ?Object,
  errors: ?Object,
  fixedInitialYearRentErrors: ?Object,
  rentAdjustmentsErrors: ?Object,
  rentErrors: ?Object,
  rentId: number,
  savedRent: Object,
  typeOptions: Array<Object>,
}

const getRentById = (rents: Array<Object>, id: number) => {
  if(!id) return {};

  return rents.find((rent) => rent.id === id);
};

class RentItemEdit extends PureComponent<Props, State> {
  state = {
    active: false,
    archived: false,
    attributes: {},
    contractRentErrors: null,
    errors: null,
    fixedInitialYearRentErrors: null,
    rentAdjustmentsErrors: null,
    rentErrors: null,
    rentId: -1,
    savedRent: {},
    typeOptions: [],
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const newState = {};

    if(props.attributes !== state.attributes) {
      newState.attributes = props.attributes;
      newState.typeOptions = getAttributeFieldOptions(props.attributes, 'rents.child.children.type');
    }

    if(props.errors !== state.errors) {
      newState.errors = props.errors;
      newState.rentErrors = get(props.errors, props.field);
      newState.fixedInitialYearRentErrors = get(props.errors, `${props.field}.fixed_initial_year_rents`);
      newState.contractRentErrors = get(props.errors, `${props.field}.contract_rents`);
      newState.rentAdjustmentsErrors = get(props.errors, `${props.field}.rent_adjustments`);
    }

    if(props.rentId !== state.rentId) {
      const savedRent = getRentById(props.rents, props.rentId);

      newState.rentId = props.rentId;
      newState.savedRent = savedRent;
      newState.active = isRentActive(savedRent),
      newState.archived = isRentArchived(savedRent);
    }

    return newState;
  }

  componentDidUpdate(prevProps: Props) {
    if(prevProps.rentType !== this.props.rentType) {
      this.addEmptyContractRentIfNeeded();
    }
  }

  addEmptyContractRentIfNeeded = () => {
    const {change, contractRents, field} = this.props;

    if(!contractRents.length) {
      change(formName, `${field}.contract_rents`, [{}]);
    }
  }

  handleRentCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            rent: val,
          },
        },
      },
    });
  };

  handleFixedInitialYearRentsCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            fixed_initial_year_rents: val,
          },
        },
      },
    });
  };

  handleContractRentsCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            contract_rents: val,
          },
        },
      },
    });
  };

  handleIndexAdjustedRentsCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            index_adjusted_rents: val,
          },
        },
      },
    });
  };

  handleRentAdjustmentsCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            rent_adjustments: val,
          },
        },
      },
    });
  };

  handlePayableRentsCollapseToggle = (val: boolean) => {
    const {receiveCollapseStates, rentId} = this.props;

    if(!rentId) {return;}

    receiveCollapseStates({
      [ViewModes.EDIT]: {
        [FormNames.RENTS]: {
          [rentId]: {
            payable_rents: val,
          },
        },
      },
    });
  };

  handleRemove = () => {
    const {index, onRemove} = this.props;

    onRemove(index);
  };

  render() {
    const {
      contractRentsCollapseState,
      field,
      fixedInitialYearRentsCollapseState,
      indexAdjustedRentsCollapseState,
      isSaveClicked,
      payableRentsCollapseState,
      rentAdjustmentsCollapseState,
      rentCollapseState,
      rentType,
    } = this.props;
    const {
      active,
      archived,
      contractRentErrors,
      fixedInitialYearRentErrors,
      rentAdjustmentsErrors,
      rentErrors,
      savedRent,
      typeOptions,
    } = this.state;

    return (
      <Collapse
        className={classNames({'archived': archived})}
        defaultOpen={rentCollapseState !== undefined ? rentCollapseState : active}
        hasErrors={isSaveClicked && !isEmpty(rentErrors)}
        headerTitle={<h3 className='collapse__header-title'>{getLabelOfOption(typeOptions, get(savedRent, 'type')) || '-'}</h3>}
        header={
          <div>
            <Column small={10}>
              <span className='collapse__header-subtitle'>
                {formatDateRange(get(savedRent, 'start_date'), get(savedRent, 'end_date')) || '-'}
              </span>
            </Column>
          </div>
        }
        onRemove={this.handleRemove}
        onToggle={this.handleRentCollapseToggle}
      >
        <FormSection name={field}>
          <BoxContentWrapper>
            <BasicInfoEdit
              field={field}
              isSaveClicked={isSaveClicked}
              rentType={rentType}
            />
          </BoxContentWrapper>
        </FormSection>

        {(rentType === RentTypes.INDEX ||
          rentType === RentTypes.MANUAL) &&
          <Collapse
            className='collapse__secondary'
            defaultOpen={fixedInitialYearRentsCollapseState !== undefined ? fixedInitialYearRentsCollapseState : true}
            hasErrors={isSaveClicked && !isEmpty(fixedInitialYearRentErrors)}
            headerTitle={<h3 className='collapse__header-title'>Kiinteä alkuvuosivuokra</h3>}
            onToggle={this.handleFixedInitialYearRentsCollapseToggle}
          >
            <FieldArray
              component={FixedInitialYearRentsEdit}
              isSaveClicked={isSaveClicked}
              name={`${field}.fixed_initial_year_rents`}
            />
          </Collapse>
        }

        {(rentType === RentTypes.INDEX ||
          rentType === RentTypes.FIXED ||
          rentType === RentTypes.MANUAL) &&
          <Collapse
            className='collapse__secondary'
            defaultOpen={contractRentsCollapseState !== undefined ? contractRentsCollapseState : true}
            hasErrors={isSaveClicked && !isEmpty(contractRentErrors)}
            headerTitle={<h3 className='collapse__header-title'>Sopimusvuokra</h3>}
            onToggle={this.handleContractRentsCollapseToggle}
          >
            <FieldArray
              component={ContractRentsEdit}
              isSaveClicked={isSaveClicked}
              name={`${field}.contract_rents`}
              rentField={field}
              rentType={rentType}
            />
          </Collapse>
        }

        {(rentType === RentTypes.INDEX ||
          rentType === RentTypes.MANUAL) &&
          <Collapse
            className='collapse__secondary'
            defaultOpen={indexAdjustedRentsCollapseState !== undefined ? indexAdjustedRentsCollapseState : false}
            headerTitle={<h3 className='collapse__header-title'>Indeksitarkistettu vuokra</h3>}
            onToggle={this.handleIndexAdjustedRentsCollapseToggle}
          >
            <IndexAdjustedRents indexAdjustedRents={get(savedRent, 'index_adjusted_rents', [])} />
          </Collapse>
        }

        {(rentType === RentTypes.INDEX ||
          rentType === RentTypes.FIXED ||
          rentType === RentTypes.MANUAL) &&
          <Collapse
            className='collapse__secondary'
            defaultOpen={rentAdjustmentsCollapseState !== undefined ? rentAdjustmentsCollapseState : false}
            hasErrors={isSaveClicked && !isEmpty(rentAdjustmentsErrors)}
            headerTitle={<h3 className='collapse__header-title'>Alennukset ja korotukset</h3>}
            onToggle={this.handleRentAdjustmentsCollapseToggle}
          >
            <FieldArray
              component={RentAdjustmentsEdit}
              isSaveClicked={isSaveClicked}
              name={`${field}.rent_adjustments`}
            />
          </Collapse>
        }

        {(rentType === RentTypes.INDEX ||
          rentType === RentTypes.FIXED ||
          rentType === RentTypes.MANUAL) &&
          <Collapse
            className='collapse__secondary'
            defaultOpen={payableRentsCollapseState !== undefined ? payableRentsCollapseState : false}
            headerTitle={<h3 className='collapse__header-title'>Perittävä vuokra</h3>}
            onToggle={this.handlePayableRentsCollapseToggle}
          >
            <PayableRents payableRents={get(savedRent, 'payable_rents', [])} />
          </Collapse>
        }
      </Collapse>
    );
  }
}

const formName = FormNames.RENTS;
const selector = formValueSelector(formName);

export default connect(
  (state, props) => {
    const id = selector(state, `${props.field}.id`);

    const newProps: any = {
      attributes: getAttributes(state),
      contractRents: selector(state, `${props.field}.contract_rents`),
      dueDatesType: selector(state, `${props.field}.due_dates_type`),
      errors: getErrorsByFormName(state, formName),
      isSaveClicked: getIsSaveClicked(state),
      rentId: id,
      rentType: selector(state, `${props.field}.type`),
    };
    if(id) {
      newProps.fixedInitialYearRentsCollapseState = getCollapseStateByKey(state, `${ViewModes.EDIT}.${FormNames.RENTS}.${id}.fixed_initial_year_rents`);
      newProps.indexAdjustedRentsCollapseState = getCollapseStateByKey(state, `${ViewModes.EDIT}.${FormNames.RENTS}.${id}.index_adjusted_rents`);
      newProps.payableRentsCollapseState = getCollapseStateByKey(state, `${ViewModes.EDIT}.${FormNames.RENTS}.${id}.payable_rents`);
      newProps.rentAdjustmentsCollapseState = getCollapseStateByKey(state, `${ViewModes.EDIT}.${FormNames.RENTS}.${id}.rent_adjustments`);
      newProps.rentCollapseState = getCollapseStateByKey(state, `${ViewModes.EDIT}.${FormNames.RENTS}.${id}.rent`);
    }
    return newProps;
  },
  {
    change,
    receiveCollapseStates,
  }
)(RentItemEdit);

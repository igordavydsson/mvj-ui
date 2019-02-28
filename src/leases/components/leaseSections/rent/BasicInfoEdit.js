// @flow
import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {change, Field, FieldArray, formValueSelector} from 'redux-form';
import {Row, Column} from 'react-foundation';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import type {Element} from 'react';

import AddButtonThird from '$components/form/AddButtonThird';
import Authorization from '$components/authorization/Authorization';
import ErrorField from '$components/form/ErrorField';
import FieldAndRemoveButtonWrapper from '$components/form/FieldAndRemoveButtonWrapper';
import FormField from '$components/form/FormField';
import FormText from '$components/form/FormText';
import FormTextTitle from '$components/form/FormTextTitle';
import RemoveButton from '$components/form/RemoveButton';
import {rentCustomDateOptions, oneTimeRentDueDateTypeOptions} from '$src/leases/constants';
import {FieldTypes} from '$components/enums';
import {
  FixedDueDates,
  FormNames,
  LeaseRentDueDatesFieldPaths,
  LeaseRentDueDatesFieldTitles,
  LeaseRentsFieldPaths,
  LeaseRentsFieldTitles,
  RentCycles,
  RentTypes,
  RentDueDateTypes,
} from '$src/leases/enums';
import {UsersPermissions} from '$src/usersPermissions/enums';
import {formatDueDates, formatSeasonalDate} from '$src/leases/helpers';
import {getUiDataLeaseKey} from '$src/uiData/helpers';
import {
  getFieldAttributes,
  hasPermissions,
  isFieldAllowedToEdit,
  isFieldAllowedToRead,
  isFieldRequired,
} from '$util/helpers';
import {getAttributes as getLeaseAttributes, getCurrentLease} from '$src/leases/selectors';
import {getLeaseTypeList} from '$src/leaseType/selectors';
import {getUsersPermissions} from '$src/usersPermissions/selectors';

import type {Attributes} from '$src/types';
import type {Lease} from '$src/leases/types';
import type {LeaseTypeList} from '$src/leaseType/types';
import type {UsersPermissions as UsersPermissionsType} from '$src/usersPermissions/types';

const formName = FormNames.RENTS;
const selector = formValueSelector(formName);

type SeasonalDatesProps = {
  field: string,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  seasonalEndDay: ?string,
  seasonalEndMonth: ?string,
  seasonalStartDay: ?string,
  seasonalStartMonth: ?string,
}

const SeasonalDates = connect(
  (state, props) => {
    return {
      seasonalEndDay: selector(state, `${props.field}.seasonal_end_day`),
      seasonalEndMonth: selector(state, `${props.field}.seasonal_end_month`),
      seasonalStartDay: selector(state, `${props.field}.seasonal_start_day`),
      seasonalStartMonth: selector(state, `${props.field}.seasonal_start_month`),
    };
  }
)(({
  isSaveClicked,
  leaseAttributes,
  seasonalEndDay,
  seasonalEndMonth,
  seasonalStartDay,
  seasonalStartMonth,
}: SeasonalDatesProps ) => {
  const startText = formatSeasonalDate(seasonalStartDay, seasonalStartMonth);
  const endText = formatSeasonalDate(seasonalEndDay, seasonalEndMonth);

  return(
    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_DAY)||
      isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_MONTH) ||
      isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_DAY) ||
      isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_MONTH)}
    >
      <Row>
        <Column small={12}>
          <FormTextTitle enableUiDataEdit uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.SEASONAL_DATES)}>
            {LeaseRentsFieldTitles.SEASONAL_DATES}
          </FormTextTitle>
        </Column>
      </Row>
      <Authorization
        allow={isFieldAllowedToEdit(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_DAY)||
          isFieldAllowedToEdit(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_MONTH) ||
          isFieldAllowedToEdit(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_DAY) ||
          isFieldAllowedToEdit(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_MONTH)
        }
        errorComponent={<FormText>{`${startText || ''} - ${endText || ''}`}</FormText>}
      >
        <Row>
          <Column small={3}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_DAY)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_DAY)}
                name='seasonal_start_day'
                invisibleLabel
                overrideValues={{label: LeaseRentsFieldTitles.SEASONAL_START_DAY}}
              />
            </Authorization>
          </Column>
          <Column small={3}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_MONTH)}>
              <FormField
                className='with-dot'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_START_MONTH)}
                name='seasonal_start_month'
                invisibleLabel
                overrideValues={{label: LeaseRentsFieldTitles.SEASONAL_START_MONTH}}
              />
            </Authorization>
          </Column>
          <Column small={3}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_DAY)}>
              <FormField
                className='with-dash'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_DAY)}
                name='seasonal_end_day'
                invisibleLabel
                overrideValues={{label: LeaseRentsFieldTitles.SEASONAL_END_DAY}}
              />
            </Authorization>
          </Column>
          <Column small={3}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_MONTH)}>
              <FormField
                className='with-dot'
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.SEASONAL_END_MONTH)}
                name='seasonal_end_month'
                invisibleLabel
                overrideValues={{label: LeaseRentsFieldTitles.SEASONAL_END_MONTH}}
              />
            </Authorization>
          </Column>
        </Row>
      </Authorization>

      <Row>
        <Column>
          <Field
            name="seasonalDates"
            component={ErrorField}
            showError={isSaveClicked}
          />
        </Column>
      </Row>
    </Authorization>
  );
});

type DueDatesProps = {
  dueDates: Array<Object>,
  fields: any,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  usersPermissions: UsersPermissionsType,
}

const renderDueDates = ({
  dueDates,
  fields,
  isSaveClicked,
  leaseAttributes,
  usersPermissions,
}: DueDatesProps): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}>
      <Row>
        <Column>
          <FormTextTitle
            required={isFieldRequired(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}
            enableUiDataEdit
            uiDataKey={getUiDataLeaseKey(LeaseRentDueDatesFieldPaths.DUE_DATES)}
          >
            {LeaseRentDueDatesFieldTitles.DUE_DATES}
          </FormTextTitle>
        </Column>
      </Row>
      <Authorization
        allow={isFieldAllowedToEdit(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY) ||
          isFieldAllowedToEdit(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}
        errorComponent={<FormText>{formatDueDates(dueDates) || '-'}</FormText>}
      >
        {fields && !!fields.length && fields.map((due_date, index) => {
          const handleRemove = () => {
            fields.remove(index);
          };

          return (
            <Row key={index}>
              <Column small={12}>
                <Row>
                  <Column small={6}>
                    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY)}>
                      <FormField
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY)}
                        invisibleLabel
                        name={`${due_date}.day`}
                        overrideValues={{label: LeaseRentDueDatesFieldTitles.DAY}}
                      />
                    </Authorization>
                  </Column>
                  <Column small={6}>
                    <FieldAndRemoveButtonWrapper
                      className='absolute-remove-button-position'
                      field={
                        <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}>
                          <FormField
                            className='with-dot'
                            disableTouched={isSaveClicked}
                            fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}
                            invisibleLabel
                            name={`${due_date}.month`}
                            overrideValues={{label: LeaseRentDueDatesFieldTitles.MONTH}}
                          />
                        </Authorization>
                      }
                      removeButton={
                        <Authorization allow={hasPermissions(usersPermissions, UsersPermissions.CHANGE_RENT_DUE_DATES)}>
                          <RemoveButton
                            className='third-level'
                            onClick={handleRemove}
                            title="Poista eräpäivä"
                          />
                        </Authorization>
                      }
                    />
                  </Column>
                </Row>
              </Column>
            </Row>
          );
        })}
      </Authorization>

      <Authorization allow={hasPermissions(usersPermissions, UsersPermissions.CHANGE_RENT_DUE_DATES)}>
        <Row>
          <Column>
            <AddButtonThird
              label='Lisää eräpäivä'
              onClick={handleAdd}
            />
          </Column>
        </Row>
      </Authorization>
    </Authorization>
  );
};

const renderDueDatesOneTime = ({dueDates, fields, isSaveClicked, leaseAttributes, usersPermissions}: DueDatesProps): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}>
      <Row>
        <Column>
          <FormTextTitle
            required={isFieldRequired(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}
            enableUiDataEdit
            uiDataKey={getUiDataLeaseKey(LeaseRentDueDatesFieldPaths.DUE_DATES)}
          >
            {LeaseRentDueDatesFieldTitles.DUE_DATES}
          </FormTextTitle>
        </Column>
      </Row>
      <Authorization
        allow={isFieldAllowedToEdit(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY) ||
          isFieldAllowedToEdit(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}
        errorComponent={<FormText>{formatDueDates(dueDates) || '-'}</FormText>}
      >
        {fields && !!fields.length && fields.map((due_date, index) => {
          if(index) return null;

          return (
            <Row key={index}>
              <Column small={12}>
                <Row>
                  <Column small={6}>
                    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY)}>
                      <FormField
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentDueDatesFieldPaths.DAY)}
                        invisibleLabel
                        name={`${due_date}.day`}
                        overrideValues={{label: LeaseRentDueDatesFieldTitles.DAY}}
                      />
                    </Authorization>
                  </Column>
                  <Column small={6}>
                    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}>
                      <FormField
                        className='with-dot'
                        disableTouched={isSaveClicked}
                        fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentDueDatesFieldPaths.MONTH)}
                        invisibleLabel
                        name={`${due_date}.month`}
                        overrideValues={{label: LeaseRentDueDatesFieldTitles.MONTH}}
                      />
                    </Authorization>
                  </Column>
                </Row>
              </Column>
            </Row>
          );
        })}
      </Authorization>
      {(!fields || !fields.length) &&
        <Authorization allow={hasPermissions(usersPermissions, UsersPermissions.CHANGE_RENT_DUE_DATES)}>
          <Row>
            <Column>
              <AddButtonThird
                label='Lisää eräpäivä'
                onClick={handleAdd}
              />
            </Column>
          </Row>
        </Authorization>
      }
    </Authorization>
  );
};

type BasicInfoEmptyProps = {
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
}

const BasicInfoEmpty = ({isSaveClicked, leaseAttributes}: BasicInfoEmptyProps) => {
  return (
    <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.TYPE)}>
      <Row>
        <Column small={6} medium={4} large={2}>
          <FormField
            disableTouched={isSaveClicked}
            fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.TYPE)}
            name='type'
            overrideValues={{label: LeaseRentsFieldTitles.TYPE}}
            enableUiDataEdit
            uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.TYPE)}
          />
        </Column>
      </Row>
    </Authorization>
  );
};

type BasicInfoIndexProps = {
  cycle: ?string,
  dueDates: Array<Object>,
  dueDatesType: ?string,
  field: string,
  isIndex: boolean,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  usersPermissions: UsersPermissionsType,
  yearlyDueDates: Array<Object>,
}

const BasicInfoIndex = ({
  cycle,
  dueDates,
  dueDatesType,
  field,
  isIndex,
  isSaveClicked,
  leaseAttributes,
  usersPermissions,
  yearlyDueDates,
}: BasicInfoIndexProps) => {
  return (
    <Fragment>
      <Row>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.TYPE)}
              name='type'
              overrideValues={{label: LeaseRentsFieldTitles.TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.TYPE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}
              name='start_date'
              overrideValues={{label: LeaseRentsFieldTitles.START_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.START_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}
              name='end_date'
              overrideValues={{label: LeaseRentsFieldTitles.END_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.END_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={6} medium={4} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.CYCLE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.CYCLE)}
              name='cycle'
              overrideValues={{label: LeaseRentsFieldTitles.CYCLE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.CYCLE)}
            />
          </Authorization>
        </Column>

        {isIndex &&
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.INDEX_TYPE)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.INDEX_TYPE)}
                name='index_type'
                overrideValues={{label: LeaseRentsFieldTitles.INDEX_TYPE}}
                enableUiDataEdit
                uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.INDEX_TYPE)}
              />
            </Authorization>
          </Column>
        }

        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}
              name='due_dates_type'
              overrideValues={{label: LeaseRentsFieldTitles.DUE_DATES_TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.DUE_DATES_TYPE)}
            />
          </Authorization>
        </Column>
        {dueDatesType === RentDueDateTypes.CUSTOM &&
          <Column small={6} medium={4} large={1}>
            {/* Authorization is done on renderDueDates component */}
            <FieldArray
              component={renderDueDates}
              dueDates={dueDates}
              isSaveClicked={isSaveClicked}
              leaseAttributes={leaseAttributes}
              name="due_dates"
              usersPermissions={usersPermissions}
            />
          </Column>
        }
        {dueDatesType === RentDueDateTypes.FIXED &&
          <Column small={6} medium={4} large={1}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}
                name='due_dates_per_year'
                overrideValues={{
                  fieldType: FieldTypes.CHOICE,
                  label: LeaseRentsFieldTitles.DUE_DATES_PER_YEAR,
                  options: rentCustomDateOptions,
                }}
                enableUiDataEdit
                uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}
              />
            </Authorization>
          </Column>
        }
        {dueDatesType === RentDueDateTypes.FIXED &&
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}>
              <FormTextTitle enableUiDataEdit uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.YEARLY_DUE_DATES)}>
                {LeaseRentsFieldTitles.YEARLY_DUE_DATES}
              </FormTextTitle>
              <FormText>{yearlyDueDates && !!yearlyDueDates
                ? formatDueDates(yearlyDueDates)
                : '-'}</FormText>
            </Authorization>
          </Column>
        }
      </Row>

      {!isIndex &&
        <Row>
          {(cycle === RentCycles.JANUARY_TO_DECEMBER || cycle === RentCycles.APRIL_TO_MARCH) &&
            <Column small={6} medium={4} large={2}>
              <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.MANUAL_RATIO)}>
                <FormField
                  disableTouched={isSaveClicked}
                  fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.MANUAL_RATIO)}
                  name='manual_ratio'
                  overrideValues={{label: LeaseRentsFieldTitles.MANUAL_RATIO}}
                  enableUiDataEdit
                  uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.MANUAL_RATIO)}
                />
              </Authorization>
            </Column>
          }
          {cycle === RentCycles.APRIL_TO_MARCH &&
            <Column small={6} medium={4} large={2}>
              <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.MANUAL_RATIO_PREVIOUS)}>
                <FormField
                  disableTouched={isSaveClicked}
                  fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.MANUAL_RATIO_PREVIOUS)}
                  name='manual_ratio_previous'
                  overrideValues={{label: LeaseRentsFieldTitles.MANUAL_RATIO_PREVIOUS}}
                  enableUiDataEdit
                  uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.MANUAL_RATIO_PREVIOUS)}
                />
              </Authorization>
            </Column>
          }
        </Row>
      }

      <Row>
        <Column small={12} medium={4} large={2}>
          {/* Authorization is done on SeasonalDates component */}
          <SeasonalDates
            field={field}
            isSaveClicked={isSaveClicked}
            leaseAttributes={leaseAttributes}
          />
        </Column>
        <Column small={12} medium={8} large={10}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.NOTE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.NOTE)}
              name='note'
              overrideValues={{label: LeaseRentsFieldTitles.NOTE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.NOTE)}
            />
          </Authorization>
        </Column>
      </Row>
    </Fragment>
  );
};

type BasicInfoOneTimeProps = {
  dueDates: Array<Object>,
  dueDatesType: ?string,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  usersPermissions: UsersPermissionsType,
}

const BasicInfoOneTime = ({
  dueDates,
  dueDatesType,
  isSaveClicked,
  leaseAttributes,
  usersPermissions,
}: BasicInfoOneTimeProps) => {
  return (
    <Fragment>
      <Row>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.TYPE)}
              name='type'
              overrideValues={{label: LeaseRentsFieldTitles.TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.TYPE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}
              name='start_date'
              overrideValues={{label: LeaseRentsFieldTitles.START_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.START_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}
              name='end_date'
              overrideValues={{label: LeaseRentsFieldTitles.END_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.END_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.AMOUNT)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.AMOUNT)}
              name='amount'
              unit='€'
              overrideValues={{label: LeaseRentsFieldTitles.AMOUNT}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.AMOUNT)}
            />
          </Authorization>
        </Column>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}
              name='due_dates_type'
              overrideValues={{
                label: LeaseRentsFieldTitles.DUE_DATES_TYPE,
                options: oneTimeRentDueDateTypeOptions,
              }}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.DUE_DATES_TYPE)}
            />
          </Authorization>
        </Column>

        {dueDatesType === RentDueDateTypes.CUSTOM &&
          <Column small={6} medium={4} large={1}>
            {/* Authorization is done on renderDueDatesOneTime component */}
            <FieldArray
              component={renderDueDatesOneTime}
              dueDates={dueDates}
              isSaveClicked={isSaveClicked}
              leaseAttributes={leaseAttributes}
              name="due_dates"
              usersPermissions={usersPermissions}
            />
          </Column>
        }
      </Row>

      <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.NOTE)}>
        <Row>
          <Column>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.NOTE)}
              name='note'
              overrideValues={{label: LeaseRentsFieldTitles.NOTE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.NOTE)}
            />
          </Column>
        </Row>
      </Authorization>
    </Fragment>
  );
};

type BasicInfoFixedProps = {
  dueDates: Array<Object>,
  dueDatesType: ?string,
  field: string,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  usersPermissions: UsersPermissionsType,
  yearlyDueDates: Array<Object>,
}

const BasicInfoFixed = ({
  dueDates,
  dueDatesType,
  field,
  isSaveClicked,
  leaseAttributes,
  usersPermissions,
  yearlyDueDates,
}: BasicInfoFixedProps) => {
  return (
    <Fragment>
      <Row>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.TYPE)}
              name='type'
              overrideValues={{label: LeaseRentsFieldTitles.TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.TYPE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}
              name='start_date'
              overrideValues={{label: LeaseRentsFieldTitles.START_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.START_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}
              name='end_date'
              overrideValues={{label: LeaseRentsFieldTitles.END_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.END_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_TYPE)}
              name='due_dates_type'
              overrideValues={{label: LeaseRentsFieldTitles.DUE_DATES_TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.DUE_DATES_TYPE)}
            />
          </Authorization>
        </Column>
        {dueDatesType === RentDueDateTypes.CUSTOM &&
          <Column small={6} medium={4} large={2}>
            {/* Authorization is done on renderDueDates component */}
            <FieldArray
              component={renderDueDates}
              dueDates={dueDates}
              isSaveClicked={isSaveClicked}
              leaseAttributes={leaseAttributes}
              name="due_dates"
              usersPermissions={usersPermissions}
            />
          </Column>
        }
        {dueDatesType === RentDueDateTypes.FIXED &&
          <Column small={6} medium={4} large={1}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}>
              <FormField
                disableTouched={isSaveClicked}
                fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}
                name='due_dates_per_year'
                overrideValues={{
                  fieldType: FieldTypes.CHOICE,
                  label: LeaseRentsFieldTitles.DUE_DATES_PER_YEAR,
                  options: rentCustomDateOptions,
                }}
                enableUiDataEdit
                uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.DUE_DATES_PER_YEAR)}
              />
            </Authorization>
          </Column>
        }
        {dueDatesType === RentDueDateTypes.FIXED &&
          <Column small={6} medium={4} large={2}>
            <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentDueDatesFieldPaths.DUE_DATES)}>
              <FormTextTitle enableUiDataEdit uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.YEARLY_DUE_DATES)}>
                {LeaseRentsFieldTitles.YEARLY_DUE_DATES}
              </FormTextTitle>
              <FormText>{yearlyDueDates && !!yearlyDueDates
                ? formatDueDates(yearlyDueDates)
                : '-'}</FormText>
            </Authorization>
          </Column>
        }
      </Row>

      <Row>
        <Column small={12} medium={4} large={2}>
          {/* Authorization is done on SeasonalDates component */}
          <SeasonalDates
            field={field}
            isSaveClicked={isSaveClicked}
            leaseAttributes={leaseAttributes}
          />
        </Column>
        <Column small={12} medium={8} large={10}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.NOTE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.NOTE)}
              name='note'
              overrideValues={{label: LeaseRentsFieldTitles.NOTE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.NOTE)}
            />
          </Authorization>
        </Column>
      </Row>
    </Fragment>
  );
};

type BasicInfoFreeProps = {
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
}

const BasicInfoFree = ({isSaveClicked, leaseAttributes}: BasicInfoFreeProps) => {
  return (
    <Fragment>
      <Row>
        <Column small={6} medium={4} large={2}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.TYPE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.TYPE)}
              name='type'
              overrideValues={{label: LeaseRentsFieldTitles.TYPE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.TYPE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.START_DATE)}
              name='start_date'
              overrideValues={{label: LeaseRentsFieldTitles.START_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.START_DATE)}
            />
          </Authorization>
        </Column>
        <Column small={3} medium={2} large={1}>
          <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.END_DATE)}
              name='end_date'
              overrideValues={{label: LeaseRentsFieldTitles.END_DATE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.END_DATE)}
            />
          </Authorization>
        </Column>
      </Row>

      <Authorization allow={isFieldAllowedToRead(leaseAttributes, LeaseRentsFieldPaths.NOTE)}>
        <Row>
          <Column>
            <FormField
              disableTouched={isSaveClicked}
              fieldAttributes={getFieldAttributes(leaseAttributes, LeaseRentsFieldPaths.NOTE)}
              name='note'
              overrideValues={{label: LeaseRentsFieldTitles.NOTE}}
              enableUiDataEdit
              uiDataKey={getUiDataLeaseKey(LeaseRentsFieldPaths.NOTE)}
            />
          </Column>
        </Row>
      </Authorization>
    </Fragment>
  );
};

type Props = {
  change: Function,
  currentLease: Lease,
  cycle: string,
  dueDates: Array<Object>,
  dueDatesPerYear: ?number,
  dueDatesType: ?string,
  field: string,
  isSaveClicked: boolean,
  leaseAttributes: Attributes,
  leaseTypes: LeaseTypeList,
  rentType: ?string,
  usersPermissions: UsersPermissionsType,
}

const BasicInfoEdit = ({
  currentLease,
  cycle,
  dueDates,
  dueDatesPerYear,
  dueDatesType,
  field,
  isSaveClicked,
  leaseAttributes,
  leaseTypes,
  rentType,
  usersPermissions,
}: Props) => {
  const getYearlyDueDates = () => {
    const leaseTypeId = get(currentLease, 'type.id');
    const leaseType = leaseTypes.find((item) => item.id === leaseTypeId);

    if(!dueDatesPerYear ||isEmpty(leaseType) || dueDatesType !== RentDueDateTypes.FIXED) return [];

    return FixedDueDates[get(leaseType, 'due_dates_position')][dueDatesPerYear];
  };

  const yearlyDueDates = getYearlyDueDates();

  return (
    <Fragment>
      {!rentType &&
        <BasicInfoEmpty
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
        />
      }
      {rentType === RentTypes.INDEX &&
        <BasicInfoIndex
          cycle={cycle}
          dueDates={dueDates}
          dueDatesType={dueDatesType}
          field={field}
          isIndex={true}
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
          usersPermissions={usersPermissions}
          yearlyDueDates={yearlyDueDates}
        />
      }
      {rentType === RentTypes.ONE_TIME &&
        <BasicInfoOneTime
          dueDates={dueDates}
          dueDatesType={dueDatesType}
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
          usersPermissions={usersPermissions}
        />
      }
      {rentType === RentTypes.FIXED &&
        <BasicInfoFixed
          dueDates={dueDates}
          dueDatesType={dueDatesType}
          field={field}
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
          usersPermissions={usersPermissions}
          yearlyDueDates={yearlyDueDates}
        />
      }
      {rentType === RentTypes.FREE &&
        <BasicInfoFree
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
        />
      }
      {rentType === RentTypes.MANUAL &&
        <BasicInfoIndex
          cycle={cycle}
          dueDates={dueDates}
          dueDatesType={dueDatesType}
          field={field}
          isIndex={false}
          isSaveClicked={isSaveClicked}
          leaseAttributes={leaseAttributes}
          usersPermissions={usersPermissions}
          yearlyDueDates={yearlyDueDates}
        />
      }
    </Fragment>
  );
};

export default connect(
  (state, props) => {
    return {
      currentLease: getCurrentLease(state),
      cycle: selector(state, `${props.field}.cycle`),
      dueDatesPerYear: selector(state, `${props.field}.due_dates_per_year`),
      dueDatesType: selector(state, `${props.field}.due_dates_type`),
      dueDates: selector(state, `${props.field}.due_dates`),
      leaseAttributes: getLeaseAttributes(state),
      leaseTypes: getLeaseTypeList(state),
      usersPermissions: getUsersPermissions(state),
    };
  },
  {
    change,
  }
)(BasicInfoEdit);

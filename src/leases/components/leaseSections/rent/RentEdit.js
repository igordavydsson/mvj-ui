// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {formValueSelector, reduxForm, Field, FieldArray} from 'redux-form';
import {Row, Column} from 'react-foundation';
import flowRight from 'lodash/flowRight';

import trashIcon from '../../../../../assets/icons/trash.svg';
import FieldTypeDatePicker from '../../../../components/form/FieldTypeDatePicker';
import FieldTypeSelect from '../../../../components/form/FieldTypeSelect';
import FieldTypeSwitch from '../../../../components/form/FieldTypeSwitch';
import FieldTypeText from '../../../../components/form/FieldTypeText';
import {rentBasicInfoIndexTypeOptions,
  rentBasicInfoRentalPeriodOptions,
  rentBasicInfoTypeOptions,
  rentContractRentPurposeOptions,
  rentContractRentTypeOptions,
  rentDiscountAmountTypeOptions,
  rentDiscountDecisionOptions,
  rentDiscountPurposeOptions,
  rentDiscountTypeOptions,
} from '../constants';

type DueDatesProps = {
  fields: any,
}

const renderDueDates = ({fields}: DueDatesProps) => {
  return (
    <div>
      <Row>
        <Column>
          <label className="mvj-form-field-label">Eräpäivät</label>
        </Column>
      </Row>
      {fields && fields.length > 0 && fields.map((due_date, index) => {
        return (
          <Row key={index}>
            <Column medium={9}>
              <Field
                component={FieldTypeText}
                name={`${due_date}`}
              />
            </Column>
            <Column medium={3}>
              <button
                className='remove-button'
                type="button"
                title="Poista eräpäivä"
                onClick={() => fields.remove(index)}>
                <img src={trashIcon} alt='Poista' />
              </button>
            </Column>
          </Row>
        );
      })}
      <Row style={{paddingBottom: '0.5rem'}}>
        <Column>
          <a onClick={() => fields.push('')} className='add-button-secondary'><i /><span>Lisää eräpäivä</span></a>
        </Column>
      </Row>
    </div>
  );
};

type FixedInitialYearRentsProps = {
  fields: any,
}

const renderFixedInitialYearRents = ({fields}: FixedInitialYearRentsProps) => {
  return (
    <div>
      {fields && fields.length > 0 &&
        <Row>
          <Column medium={2}><label className="mvj-form-field-label">Kiinteä alkuvuosivuokra</label></Column>
          <Column medium={4}>
            <Row>
              <Column small={6}><label className="mvj-form-field-label">Alkupvm</label></Column>
              <Column small={6}><label className="mvj-form-field-label">Loppupvm</label></Column>
            </Row>
          </Column>

        </Row>
      }
      {fields && fields.length > 0 && fields.map((rent, index) => {
        return (
          <div key={index}>
            <Row>
              <Column medium={2}>
                <Field
                  component={FieldTypeText}
                  name={`${rent}.rent`}
                />
              </Column>
              <Column medium={4}>
                <Row>
                  <Column small={6}>
                    <Field
                      component={FieldTypeDatePicker}
                      name={`${rent}.start_date`}
                    />
                  </Column>
                  <Column small={6}>
                    <Field
                      component={FieldTypeDatePicker}
                      name={`${rent}.end_date`}
                    />
                  </Column>
                </Row>

              </Column>
              <Column>
                <button
                  className='remove-button'
                  type="button"
                  title="Poista alennus/korotus"
                  onClick={() => fields.remove(index)}>
                  <img src={trashIcon} alt='Poista' />
                </button>
              </Column>
            </Row>
          </div>
        );
      })}
      <Row style={{paddingBottom: '0.5rem'}}>
        <Column>
          <a onClick={() => fields.push({})} className='add-button-secondary'><i /><span>Lisää kiinteä alkuvuosivuokra</span></a>
        </Column>
      </Row>
    </div>
  );
};

type ContractRentProps = {
  fields: any,
}

const renderContractRents = ({fields}: ContractRentProps) => {
  return (
    <div className="bordered-box">
      {fields && fields.length > 0 && fields.map((rent, index) => {
        return(
          <div key={index} className='item'>
            <button
              className='remove-button'
              type="button"
              title="Poista alennus/korotus"
              onClick={() => fields.remove(index)}>
              <img src={trashIcon} alt='Poista' />
            </button>
            <Row>
              <Column medium={3}>
                <Row>
                  <Column><label className="mvj-form-field-label">Sopimusvuokra</label></Column>
                </Row>
                <Row>
                  <Column small={7} style={{paddingRight: '0'}}>
                    <Field
                      component={FieldTypeText}
                      name={`${rent}.contract_rent`}
                    />
                  </Column>
                  <Column small={5}>
                    <Field
                      component={FieldTypeSelect}
                      name={`${rent}.type`}
                      options={rentContractRentTypeOptions}
                    />
                  </Column>
                </Row>
              </Column>
              <Column medium={3}>
                <Field
                  component={FieldTypeSelect}
                  label="Käyttötarkoitus"
                  name={`${rent}.purpose`}
                  options={rentContractRentPurposeOptions}
                />
              </Column>
              <Column medium={3}>
                <Row>
                  <Column><label className="mvj-form-field-label">Vuokranlaskennan perusteena oleva vuokra</label></Column>
                </Row>
                <Row>
                  <Column small={7} style={{paddingRight: '0'}}>
                    <Field
                      component={FieldTypeText}
                      name={`${rent}.basic_rent`}
                    />
                  </Column>
                  <Column small={5}>
                    <Field
                      component={FieldTypeSelect}
                      name={`${rent}.basic_rent_type`}
                      options={rentContractRentTypeOptions}
                    />
                  </Column>
                </Row>
              </Column>
              <Column medium={3}>
                <Row>
                  <Column><label className="mvj-form-field-label">Voimassaoloaika</label></Column>
                </Row>
                <Row>
                  <Column small={6}>
                    <Field
                      component={FieldTypeDatePicker}
                      name={`${rent}.start_date`}
                    />
                  </Column>
                  <Column small={6}>
                    <Field
                      component={FieldTypeDatePicker}
                      name={`${rent}.end_date`}
                    />
                  </Column>
                </Row>
              </Column>
            </Row>
          </div>
        );
      })}
      <Row>
        <Column>
          <a onClick={() => fields.push({})} className='add-button-secondary'><i /><span>Lisää sopimusvuokra</span></a>
        </Column>
      </Row>
    </div>
  );
};

type DiscountProps = {
  fields: any,
}

const renderDiscounts = ({fields}: DiscountProps) => {
  return (
    <div className='green-box'>
      {fields && fields.length > 0 && fields.map((discount, index) => {
        return(
          <div key={index} className='item'>
            <button
              className='remove-button'
              type="button"
              title="Poista alennus/korotus"
              onClick={() => fields.remove(index)}>
              <img src={trashIcon} alt='Poista' />
            </button>
            <Row>
              <Column medium={6}>
                <Row>
                  <Column small={3}>
                    <Field
                      component={FieldTypeSelect}
                      label='Tyyppi'
                      name={`${discount}.type`}
                      options={rentDiscountTypeOptions}
                    />
                  </Column>
                  <Column small={4}>
                    <Field
                      component={FieldTypeSelect}
                      label='Käyttötarkoitus'
                      name={`${discount}.purpose`}
                      options={rentDiscountPurposeOptions}
                    />
                  </Column>
                  <Column small={5}>
                    <Row>
                      <Column small={6} style={{paddingRight: '0'}}>
                        <Field
                          component={FieldTypeDatePicker}
                          label='Alkupvm'
                          name={`${discount}.start_date`}
                        />
                      </Column>
                      <Column small={6} style={{paddingRight: '0'}}>
                        <Field
                          component={FieldTypeDatePicker}
                          label='Loppupvm'
                          name={`${discount}.end_date`}
                        />
                      </Column>
                    </Row>
                  </Column>
                </Row>
              </Column>
              <Column medium={6}>
                <Row>
                  <Column small={6}>
                    <Row>
                      <Column><label className="mvj-form-field-label">Kokonaismäärä</label></Column>
                    </Row>
                    <Row>
                      <Column small={6} style={{paddingRight: '0'}}>
                        <Field
                          component={FieldTypeText}
                          name={`${discount}.amount`}
                        />
                      </Column>
                      <Column small={6} style={{paddingRight: '0'}}>
                        <Field
                          component={FieldTypeSelect}
                          name={`${discount}.amount_type`}
                          options={rentDiscountAmountTypeOptions}
                        />
                      </Column>
                    </Row>
                  </Column>
                  <Column small={3}>
                    <Field
                      component={FieldTypeText}
                      disabled={true}
                      label="Jäljellä (€)"
                      name={`${discount}.amount_left`}
                    />
                  </Column>
                  <Column small={3}>
                    <Field
                      clearable={true}
                      component={FieldTypeSelect}
                      label="Päätös"
                      name={`${discount}.rule`}
                      options={rentDiscountDecisionOptions}
                    />
                  </Column>
                </Row>
              </Column>
            </Row>
            <Row>
              <Column medium={12}>
                <Field
                  name={`${discount}.comment`}
                  component={FieldTypeText}
                  label='Kommentti'
                />
              </Column>
            </Row>
          </div>
        );
      })}
      <Row>
        <Column>
          <a onClick={() => fields.push({})} className='add-button-secondary'><i /><span>Lisää sopimuksen muutos</span></a>
        </Column>
      </Row>
    </div>
  );
};

type Props = {
  dispatch: Function,
  handleSubmit: Function,
}

class RentEdit extends Component {
  props: Props

  render() {
    const {handleSubmit} = this.props;

    return (
      <form onSubmit={handleSubmit} className='lease-section-edit'>
        <Row>
          <Column medium={9}><h1>Vuokra</h1></Column>
          <Column medium={3}>
            <Field
              component={FieldTypeSwitch}
              name="rents.rent_info_ok"
              optionLabel="Vuokratiedot kunnossa"
            />
          </Column>
        </Row>
        <Row><Column><div className="separator-line no-margin"></div></Column></Row>
        <Row><Column><h2>Vuokranperusteet</h2></Column></Row>
        <Row><Column><h2>Alennukset ja korotukset</h2></Column></Row>
        <Row>
          <Column>
            <FieldArray name="rents.discounts" component={renderDiscounts}/>
          </Column>
        </Row>
        <Row><Column><h2>Vuokran perustiedot</h2></Column></Row>
        <div className="green-box">
          <Row>
            <Column medium={10}>
              <Row>
                <Column medium={3}>
                  <Field
                    component={FieldTypeSelect}
                    label="Vuokralaji"
                    name="rents.basic_info.type"
                    options={rentBasicInfoTypeOptions}
                  />
                </Column>
                <Column medium={3}>
                  <Field
                    component={FieldTypeSelect}
                    label="Vuokrakausi"
                    name="rents.basic_info.rental_period"
                    options={rentBasicInfoRentalPeriodOptions}
                  />
                </Column>
                <Column medium={3}>
                  <Field
                    component={FieldTypeSelect}
                    label="Indeksin tunnusnumero (laskentalaji)"
                    name="rents.basic_info.index_type"
                    options={rentBasicInfoIndexTypeOptions}
                  />
                </Column>
              </Row>
              <Row>
                <Column medium={3}>
                  <Row>
                    <Column small={6} style={{paddingRight: '0'}}>
                      <Field
                        component={FieldTypeText}
                        label="Perusindeksi"
                        name="rents.basic_info.basic_index"
                      />
                    </Column>
                    <Column small={6}>
                      <Field
                        component={FieldTypeText}
                        label="Pyöristys"
                        name="rents.basic_info.basic_index_rounding"
                      />
                    </Column>
                  </Row>
                </Column>
                <Column medium={3}>
                  <Row>
                    <Column small={4}>
                      <Field
                        component={FieldTypeText}
                        label="X-luku"
                        name="rents.basic_info.x_value"
                      />
                    </Column>
                    <Column small={4}>
                      <Field
                        component={FieldTypeText}
                        label="Y-luku"
                        name="rents.basic_info.y_value"
                      />
                    </Column>
                    <Column small={4}>
                      <Field
                        component={FieldTypeText}
                        label="Y-alkaen"
                        name="rents.basic_info.y_value_start"
                      />
                    </Column>
                  </Row>
                </Column>
                <Column medium={4}>
                  <Row>
                    <Column small={6}>
                      <Field
                        component={FieldTypeDatePicker}
                        label="Tasaus alkupvm"
                        name="rents.basic_info.adjustment_start_date"
                      />
                    </Column>
                    <Column small={6}>
                      <Field
                        component={FieldTypeDatePicker}
                        label="Tasaus loppupvm"
                        name="rents.basic_info.adjustment_end_date"
                      />
                    </Column>
                  </Row>
                </Column>
              </Row>
              <Row>
                <Column>
                  <FieldArray
                    name="rents.basic_info.fidex_initial_year_rents"
                    component={renderFixedInitialYearRents}
                  />
                </Column>
              </Row>
              <Row>
                <Column>
                  <Field
                    component={FieldTypeText}
                    label="Kommentti"
                    name="rents.basic_info.comment"
                  />
                </Column>
              </Row>
            </Column>
            <Column medium={2}>
              <FieldArray
                component={renderDueDates}
                name="rents.basic_info.due_dates"
              />
            </Column>
          </Row>

        </div>
        <Row><Column><h2>Sopimusvuokra</h2></Column></Row>
        <Row>
          <Column>
            <FieldArray name="rents.contract_rents" component={renderContractRents}/>
          </Column>
        </Row>
        <Row>
          <Column medium={6}><h2>Indeksitarkistettu vuokra</h2></Column>
          <Column medium={6}><h2>Perittävä vuokra</h2></Column>
        </Row>
      </form>
    );
  }
}

const formName = 'rent-edit-form';
const selector = formValueSelector(formName);

export default flowRight(
  connect(
    (state) => {
      return {
        rents: selector(state, 'rents'),
      };
    }
  ),
  reduxForm({
    form: formName,
    destroyOnUnmount: false,
  }),
)(RentEdit);

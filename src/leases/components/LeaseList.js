// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import flowRight from 'lodash/flowRight';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {Row} from 'react-foundation';

import {fetchAttributes} from '../../attributes/actions';
import {fetchLeases} from '../actions';
import ActionDropdown from '../../components/ActionDropdown';
import {getIsFetching, getLeasesList} from '../selectors';
import Search from './Search';
import TableControllers from './TableControllers';
import Table from '../../components/Table';
import * as contentHelpers from '../helpers';
import {getActiveLanguage} from '../../util/helpers';

type Props = {
  fetchAttributes: Function,
  fetchLeases: Function,
  isFetching: boolean,
  router: Object,
  t: Function,
  leases: Array<any>,
}

type State = {
  documentType: string,
  visualizationType: string,

}

class LeaseList extends Component {
  props: Props

  state: State = {
    documentType: 'all',
    visualizationType: 'table',
  }

  static contextTypes = {
    router: PropTypes.object,
  };

  componentWillMount() {
    const {fetchAttributes, fetchLeases} = this.props;

    fetchAttributes();
    fetchLeases();
  }

  handleEditClick = (id) => {
    const {router} = this.context;
    // const {router: {location: {query}}} = this.props;
    const lang = getActiveLanguage().id;
    return router.push({
      pathname: `/beta/${lang}/leases/${id}`,
      // query,
    });
  };

  render() {
    const {documentType, visualizationType} = this.state;
    const {leases: content, t} = this.props;
    const leases = contentHelpers.getContentLeases(content);

    return (
      <div className='lease-list'>
        <Row>
          <div className='lease-list__search-wrapper'>
            <Search />
          </div>
          <div className='lease-list__dropdown-wrapper'>
            <ActionDropdown
              title={'Luo uusi'}
              options={[
                {value: 'application', label: 'Hakemus'},
                {value: 'lease', label: 'Vuokraus'},
                {value: 'area', label: 'Rasitealue'},
              ]}
            />
          </div>
        </Row>
        <Row>
          <TableControllers
            amount={leases.length}
            documentType={documentType}
            onDocumentTypeChange={(value) => {this.setState({documentType: value});}}
            visualizationType={visualizationType}
            onVisualizationTypeChange={(value) => {this.setState({visualizationType: value});}}
          />
        </Row>
        <Row>
          {visualizationType === 'table' && (
            <Table
              amount={leases.length}
              data={leases}
              dataKeys={[
                {key: 'identifier', label: t('leases:identifier')},
                {key: 'real_property_unit', label: t('leases:real_property_unit')},
                {key: 'tenant', label: t('leases:tenants.single')},
                {key: 'address', label: t('leases:address')},
                {key: 'lease_type', label: t('leases:type')},
                {key: 'start_date', label: t('leases:startDate')},
                {key: 'end_date', label: t('leases:endDate')},
              ]}
              onRowClick={this.handleEditClick}
            />
          )}
          {visualizationType === 'map' && (
            <h1>Kartta</h1>
          )}
        </Row>
      </div>
    );
  }
}

export default flowRight(
  connect(
    (state) => {
      return {
        leases: getLeasesList(state),
        isFetching: getIsFetching(state),
      };
    },
    {
      fetchLeases,
      fetchAttributes,
    },
  ),
  translate(['leases', 'applications']),
)(LeaseList);

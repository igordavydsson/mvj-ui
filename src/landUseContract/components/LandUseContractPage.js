// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import flowRight from 'lodash/flowRight';
import isEmpty from 'lodash/isEmpty';

import BasicInformation from './sections/BasicInformation';
import Compensations from './sections/Compensations';
import ContentContainer from '$components/content/ContentContainer';
import Contracts from './sections/Contracts';
import ControlButtonBar from '$components/controlButtons/ControlButtonBar';
import ControlButtons from '$components/controlButtons/ControlButtons';
import Decisions from './sections/Decisions';
import Divider from '$components/content/Divider';
import EditableMap from '$src/areaNote/components/EditableMap';
import Invoices from './sections/Invoices';
import PageContainer from '$components/content/PageContainer';
import Tabs from '$components/tabs/Tabs';
import TabContent from '$components/tabs/TabContent';
import TabPane from '$components/tabs/TabPane';
import {receiveTopNavigationSettings} from '$components/topNavigation/actions';
import {fetchLandUseContractAttributes, fetchSingleLandUseContract} from '$src/landUseContract/actions';
import {getContentLandUseContractIdentifier} from '$src/landUseContract/helpers';
import {getRouteById} from '$src/root/routes';
import {getAttributes, getCurrentLandUseContract} from '$src/landUseContract/selectors';

import type {Attributes, LandUseContract} from '$src/landUseContract/types';

type Props = {
  attributes: Attributes,
  currentLandUseContract: LandUseContract,
  fetchLandUseContractAttributes: Function,
  fetchSingleLandUseContract: Function,
  location: Object,
  params: Object,
  receiveTopNavigationSettings: Function,
  router: Object,
}

type State = {
  activeTab: number,
}

class LandUseContractPage extends Component<Props, State> {
  state = {
    activeTab: 0,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {
    const {
      attributes,
      fetchLandUseContractAttributes,
      fetchSingleLandUseContract,
      location,
      params: {landUseContractId},
      receiveTopNavigationSettings,
    } = this.props;

    receiveTopNavigationSettings({
      linkUrl: getRouteById('landUseContract'),
      pageTitle: 'Maankäyttösopimukset',
      showSearch: false,
    });

    fetchSingleLandUseContract(landUseContractId);

    if (location.query.tab) {
      this.setState({activeTab: location.query.tab});
    }

    if(isEmpty(attributes)) {
      fetchLandUseContractAttributes();
    }
  }

  handleTabClick = (tabId: number) => {
    const {router} = this.context;
    const {location} = this.props;
    const {router: {location: {query}}} = this.props;


    this.setState({activeTab: tabId}, () => {
      query.tab = tabId;
      return router.push({
        ...location,
        query,
      });
    });
  }

  handleControlButtonBarBack = () => {
    const {router} = this.context;
    const {router: {location: {query}}} = this.props;

    return router.push({
      pathname: getRouteById('landUseContract'),
      query,
    });
  }

  handleControlButtonCancel = () => {
    alert('TODO: Close edit mode');
  }

  handleControlButtonEdit = () => {
    alert('TODO: Open edit mode');
  }
  handleControlButtonSave = () => {
    alert('TODO: Save changes');
  }

  render() {
    const {activeTab} = this.state;
    const {currentLandUseContract} = this.props;
    const isEditMode = false;
    const identifier = getContentLandUseContractIdentifier(currentLandUseContract);
    return (
      <PageContainer>
        <ControlButtonBar
          buttonComponent={
            <ControlButtons
              isCancelDisabled={true}
              isCopyDisabled={true}
              isEditDisabled={true}
              isEditMode={isEditMode}
              isSaveDisabled={true}
              onCancelClick={this.handleControlButtonCancel}
              onEditClick={this.handleControlButtonEdit}
              onSaveClick={this.handleControlButtonSave}
              showCommentButton={false}
              showCopyButton={false}
            />
          }
          infoComponent={<h1>{identifier}</h1>}
          onBack={this.handleControlButtonBarBack}
        />

        <Tabs
          active={activeTab}
          isEditMode={isEditMode}
          tabs={[
            {label: 'Perustiedot'},
            {label: 'Päätökset ja sopimukset'},
            {label: 'Korvaukset ja laskutus'},
            {label: 'Kartta'},
          ]}
          onTabClick={(id) => this.handleTabClick(id)}
        />
        <TabContent active={activeTab}>
          <TabPane>
            <ContentContainer>
              {!isEditMode
                ? <BasicInformation />
                : null
              }
            </ContentContainer>
          </TabPane>

          <TabPane>
            <ContentContainer>
              <h2>Päätökset</h2>
              <Divider />
              {!isEditMode
                ? <Decisions />
                : null
              }

              <h2>Sopimukset</h2>
              <Divider />
              {!isEditMode
                ? <Contracts />
                : null
              }
            </ContentContainer>
          </TabPane>

          <TabPane>
            <ContentContainer>
              <h2>Korvaukset</h2>
              <Divider />
              {!isEditMode
                ? <Compensations />
                : null
              }

              <h2>Laskutus</h2>
              <Divider />
              {!isEditMode
                ? <Invoices />
                : null
              }
            </ContentContainer>
          </TabPane>

          <TabPane>
            <ContentContainer>
              <EditableMap
                showEditTools={false}
              />
            </ContentContainer>
          </TabPane>
        </TabContent>
      </PageContainer>
    );
  }
}

export default flowRight(
  withRouter,
  connect(
    (state) => {
      return {
        attributes: getAttributes(state),
        currentLandUseContract: getCurrentLandUseContract(state),
      };
    },
    {
      fetchLandUseContractAttributes,
      fetchSingleLandUseContract,
      receiveTopNavigationSettings,
    }
  ),
)(LandUseContractPage);
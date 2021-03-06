// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {change, destroy, getFormValues, initialize, isDirty} from 'redux-form';
import flowRight from 'lodash/flowRight';
import isEmpty from 'lodash/isEmpty';

import AreaNotesEditMap from '$src/areaNote/components/AreaNotesEditMap';
import AreaNotesLayer from '$src/areaNote/components/AreaNotesLayer';
import BasicInformation from './sections/BasicInformation';
import BasicInformationEdit from './sections/BasicInformationEdit';
import Compensations from './sections/Compensations';
import CompensationsEdit from './sections/CompensationsEdit';
import ConfirmationModal from '$components/modal/ConfirmationModal';
import ContentContainer from '$components/content/ContentContainer';
import Contracts from './sections/Contracts';
import ContractsEdit from './sections/ContractsEdit';
import ControlButtonBar from '$components/controlButtons/ControlButtonBar';
import ControlButtons from '$components/controlButtons/ControlButtons';
import Decisions from './sections/Decisions';
import DecisionsEdit from './sections/DecisionsEdit';
import Divider from '$components/content/Divider';
import FullWidthContainer from '$components/content/FullWidthContainer';
import Invoices from './sections/Invoices';
import InvoicesEdit from './sections/InvoicesEdit';
import Litigants from './sections/Litigants';
import LitigantsEdit from './sections/LitigantsEdit';
import PageContainer from '$components/content/PageContainer';
import Tabs from '$components/tabs/Tabs';
import TabContent from '$components/tabs/TabContent';
import TabPane from '$components/tabs/TabPane';
import {receiveTopNavigationSettings} from '$components/topNavigation/actions';
import {fetchAreaNoteList} from '$src/areaNote/actions';
import {fetchAttributes as fetchContactAttributes} from '$src/contacts/actions';
import {
  clearFormValidFlags,
  editLandUseContract,
  fetchLandUseContractAttributes,
  fetchSingleLandUseContract,
  hideEditMode,
  receiveFormValidFlags,
  receiveIsSaveClicked,
  showEditMode,
} from '$src/landUseContract/actions';
import {FormNames} from '$src/landUseContract/enums';
import {Methods} from '$src/enums';
import {
  addLitigantsDataToPayload,
  clearUnsavedChanges,
  getContentLandUseContractIdentifier,
  getContentBasicInformation,
  getContentCompensations,
  getContentContracts,
  getContentDecisions,
  getContentInvoices,
  getContentLitigants,
  isLitigantArchived,
} from '$src/landUseContract/helpers';
import {getSearchQuery, getUrlParams, isMethodAllowed} from '$util/helpers';
import {getRouteById, Routes} from '$src/root/routes';
import {getAreaNoteList, getMethods as getAreaNoteMethods} from '$src/areaNote/selectors';
import {getAttributes as getContactAttributes} from '$src/contacts/selectors';
import {
  getAttributes,
  getCurrentLandUseContract,
  getIsEditMode,
  getIsFormValidById,
  getIsFormValidFlags,
  getIsSaveClicked,
} from '$src/landUseContract/selectors';
import {getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem} from '$util/storage';

import type {Attributes, Methods as MethodsType} from '$src/types';
import type {LandUseContract} from '$src/landUseContract/types';
import type {AreaNoteList} from '$src/areaNote/types';

type Props = {
  areaNoteMethods: MethodsType,
  areaNotes: AreaNoteList,
  attributes: Attributes,
  basicInformationFormValues: Object,
  change: Function,
  clearFormValidFlags: Function,
  compensationsFormValues: Object,
  contactAttributes: Attributes,
  contractsFormValues: Object,
  currentLandUseContract: LandUseContract,
  decisionsFormValues: Object,
  destroy: Function,
  editLandUseContract: Function,
  fetchAreaNoteList: Function,
  fetchContactAttributes: Function,
  fetchLandUseContractAttributes: Function,
  fetchSingleLandUseContract: Function,
  hideEditMode: Function,
  history: Object,
  initialize: Function,
  invoicesFormValues: Object,
  isBasicInformationFormDirty: boolean,
  isBasicInformationFormValid: boolean,
  isCompensationsFormDirty: boolean,
  isCompensationsFormValid: boolean,
  isContractsFormDirty: boolean,
  isContractsFormValid: boolean,
  isDecisionsFormDirty: boolean,
  isDecisionsFormValid: boolean,
  isInvoicesFormDirty: boolean,
  isInvoicesFormValid: boolean,
  isEditMode: boolean,
  isFormValidFlags: boolean,
  isLitigantsFormDirty: boolean,
  isLitigantsFormValid: boolean,
  isSaveClicked: boolean,
  litigantsFormValues: Object,
  location: Object,
  match: {
    params: Object,
  },
  receiveFormValidFlags: Function,
  receiveIsSaveClicked: Function,
  receiveTopNavigationSettings: Function,
  router: Object,
  showEditMode: Function,
}

type State = {
  activeTab: number,
  isRestoreModalOpen: boolean,
}

class LandUseContractPage extends Component<Props, State> {
  state = {
    activeTab: 0,
    isRestoreModalOpen: false,
  }

  timerAutoSave: any

  componentDidMount() {
    const {
      attributes,
      clearFormValidFlags,
      contactAttributes,
      fetchAreaNoteList,
      fetchContactAttributes,
      fetchLandUseContractAttributes,
      fetchSingleLandUseContract,
      hideEditMode,
      location: {search},
      match: {params: {landUseContractId}},
      receiveIsSaveClicked,
      receiveTopNavigationSettings,
    } = this.props;
    const query = getUrlParams(search);

    receiveTopNavigationSettings({
      linkUrl: getRouteById(Routes.LAND_USE_CONTRACTS),
      pageTitle: 'Maankäyttösopimukset',
      showSearch: false,
    });

    fetchAreaNoteList({});

    fetchSingleLandUseContract(landUseContractId);

    if (query.tab) {
      this.setState({activeTab: query.tab});
    }

    if(isEmpty(attributes)) {
      fetchLandUseContractAttributes();
    }

    if(isEmpty(contactAttributes)) {
      fetchContactAttributes();
    }

    clearFormValidFlags();
    receiveIsSaveClicked(false);
    hideEditMode();
    window.addEventListener('beforeunload', this.handleLeavePage);
  }

  componentDidUpdate(prevProps) {
    const {
      currentLandUseContract,
      isEditMode,
      match: {params: {landUseContractId}},
    } = this.props;

    if(isEmpty(prevProps.currentLandUseContract) && !isEmpty(currentLandUseContract)) {
      const storedLandUseContractId = getSessionStorageItem('landUseContractId');

      if(Number(landUseContractId) === storedLandUseContractId) {
        this.setState({isRestoreModalOpen: true});
      }
    }

    // Stop autosave timer and clear form data from session storage after saving/cancelling changes
    if(prevProps.isEditMode && !isEditMode) {
      this.stopAutoSaveTimer();
      clearUnsavedChanges();
    }
  }

  componentWillUnmount() {
    const {
      hideEditMode,
      location: {pathname},
      match: {params: {landUseContractId}},
    } = this.props;

    if(pathname !== `${getRouteById(Routes.LAND_USE_CONTRACTS)}/${landUseContractId}`) {
      clearUnsavedChanges();
    }

    hideEditMode();
    window.removeEventListener('beforeunload', this.handleLeavePage);
  }

  startAutoSaveTimer = () => {
    this.timerAutoSave = setInterval(
      () => this.saveUnsavedChanges(),
      5000
    );
  }

  stopAutoSaveTimer = () => {
    clearInterval(this.timerAutoSave);
  }

  handleLeavePage = (e) => {
    const {isEditMode} = this.props;

    if(this.isAnyFormDirty() && isEditMode) {
      const confirmationMessage = '';

      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    }
  }

  saveUnsavedChanges = () => {
    const {
      basicInformationFormValues,
      compensationsFormValues,
      contractsFormValues,
      decisionsFormValues,
      invoicesFormValues,
      isBasicInformationFormDirty,
      isCompensationsFormDirty,
      isContractsFormDirty,
      isDecisionsFormDirty,
      isInvoicesFormDirty,
      isFormValidFlags,
      isLitigantsFormDirty,
      litigantsFormValues,
      match: {params: {landUseContractId}},
    } = this.props;

    let isDirty = false;

    if(isBasicInformationFormDirty) {
      setSessionStorageItem(FormNames.BASIC_INFORMATION, basicInformationFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.BASIC_INFORMATION);
    }

    if(isDecisionsFormDirty) {
      setSessionStorageItem(FormNames.DECISIONS, decisionsFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.DECISIONS);
    }

    if(isContractsFormDirty) {
      setSessionStorageItem(FormNames.CONTRACTS, contractsFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.CONTRACTS);
    }

    if(isCompensationsFormDirty) {
      setSessionStorageItem(FormNames.COMPENSATIONS, compensationsFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.COMPENSATIONS);
    }

    if(isInvoicesFormDirty) {
      setSessionStorageItem(FormNames.INVOICES, invoicesFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.INVOICES);
    }

    if(isLitigantsFormDirty) {
      setSessionStorageItem(FormNames.LITIGANTS, litigantsFormValues);
      isDirty = true;
    } else {
      removeSessionStorageItem(FormNames.LITIGANTS);
    }

    if(isDirty) {
      setSessionStorageItem('landUseContractId', landUseContractId);
      setSessionStorageItem('landUseContractValidity', isFormValidFlags);
    } else {
      removeSessionStorageItem('landUseContractId');
      removeSessionStorageItem('landUseContractValidity');
    }
  };

  cancelRestoreUnsavedChanges = () => {
    clearUnsavedChanges();
    this.hideModal('Restore');
  }

  restoreUnsavedChanges = () => {
    const {
      clearFormValidFlags,
      currentLandUseContract,
      receiveFormValidFlags,
      showEditMode,
    } = this.props;

    showEditMode();
    clearFormValidFlags();

    this.destroyAllForms();
    this.initializeForms(currentLandUseContract);

    const storedBasicInformationFormValues = getSessionStorageItem(FormNames.BASIC_INFORMATION);
    if(storedBasicInformationFormValues) {
      this.bulkChange(FormNames.BASIC_INFORMATION, storedBasicInformationFormValues);
    }

    const storedDecisionsFormValues = getSessionStorageItem(FormNames.DECISIONS);
    if(storedDecisionsFormValues) {
      this.bulkChange(FormNames.DECISIONS, storedDecisionsFormValues);
    }

    const storedContractsFormValues = getSessionStorageItem(FormNames.CONTRACTS);
    if(storedContractsFormValues) {
      this.bulkChange(FormNames.CONTRACTS, storedContractsFormValues);
    }

    const storedCompensationsFormValues = getSessionStorageItem(FormNames.COMPENSATIONS);
    if(storedCompensationsFormValues) {
      this.bulkChange(FormNames.COMPENSATIONS, storedCompensationsFormValues);
    }

    const storedInvoicesFormValues = getSessionStorageItem(FormNames.INVOICES);
    if(storedInvoicesFormValues) {
      this.bulkChange(FormNames.INVOICES, storedInvoicesFormValues);
    }

    const storedLitigantsFormValues = getSessionStorageItem(FormNames.LITIGANTS);
    if(storedLitigantsFormValues) {
      this.bulkChange(FormNames.LITIGANTS, storedLitigantsFormValues);
    }

    const storedFormValidity = getSessionStorageItem('leaseValidity');
    if(storedFormValidity) {
      receiveFormValidFlags(storedFormValidity);
    }

    this.startAutoSaveTimer();
    this.hideModal('Restore');
  }

  bulkChange = (formName: string, obj: Object) => {
    const {change} = this.props;
    const fields = Object.keys(obj);

    fields.forEach(field => {
      change(formName, field, obj[field]);
    });
  }

  handleTabClick = (tabId: number) => {
    const {history, location, location: {search}} = this.props;
    const query = getUrlParams(search);

    this.setState({activeTab: tabId}, () => {
      query.tab = tabId;

      return history.push({
        ...location,
        search: getSearchQuery(query),
      });
    });
  }

  handleBack = () => {
    const {history, location: {search}} = this.props;

    return history.push({
      pathname: getRouteById(Routes.LAND_USE_CONTRACTS),
      search: search,
    });
  }

  handleShowEditMode = () => {
    const {clearFormValidFlags, currentLandUseContract, receiveIsSaveClicked, showEditMode} = this.props;

    receiveIsSaveClicked(false);
    clearFormValidFlags();

    showEditMode();
    this.destroyAllForms();
    this.initializeForms(currentLandUseContract);
    this.startAutoSaveTimer();
  }

  initializeForms = (landUseContract: LandUseContract) => {
    const {initialize} = this.props;
    const litigants = getContentLitigants(landUseContract);

    initialize(FormNames.BASIC_INFORMATION, getContentBasicInformation(landUseContract));
    initialize(FormNames.LITIGANTS, {
      activeLitigants: litigants.filter((litigant) => !isLitigantArchived(litigant.litigant)),
      archivedLitigants: litigants.filter((litigant) => isLitigantArchived(litigant.litigant)),
    });
    initialize(FormNames.DECISIONS, {decisions: getContentDecisions(landUseContract)});
    initialize(FormNames.CONTRACTS, {contracts: getContentContracts(landUseContract)});
    initialize(FormNames.COMPENSATIONS, {compensations: getContentCompensations(landUseContract)});
    initialize(FormNames.INVOICES, {invoices: getContentInvoices(landUseContract)});
  }

  cancelChanges = () => {
    const {hideEditMode} = this.props;

    this.hideModal('CancelLease');
    hideEditMode();
  }

  saveChanges = () => {
    const {receiveIsSaveClicked} = this.props;
    const areFormsValid = this.getAreFormsValid();

    receiveIsSaveClicked(true);

    if(areFormsValid) {
      const {
        basicInformationFormValues,
        compensationsFormValues,
        contractsFormValues,
        currentLandUseContract,
        decisionsFormValues,
        editLandUseContract,
        invoicesFormValues,
        isBasicInformationFormDirty,
        isCompensationsFormDirty,
        isContractsFormDirty,
        isDecisionsFormDirty,
        isInvoicesFormDirty,
        isLitigantsFormDirty,
        litigantsFormValues,
      } = this.props;

      //TODO: Add helper functions to save land use contract to DB when API is ready
      let payload: Object = {...currentLandUseContract};

      if(isBasicInformationFormDirty) {
        payload = {...payload, ...basicInformationFormValues};
      }

      if(isDecisionsFormDirty) {
        payload = {...payload, ...decisionsFormValues};
      }

      if(isContractsFormDirty) {
        payload = {...payload, ...contractsFormValues};
      }

      if(isCompensationsFormDirty) {
        payload = {...payload, ...compensationsFormValues};
      }

      if(isInvoicesFormDirty) {
        payload = {...payload, ...invoicesFormValues};
      }

      if(isLitigantsFormDirty) {
        payload = addLitigantsDataToPayload(payload, litigantsFormValues);
      }

      payload.identifier = currentLandUseContract.identifier;
      editLandUseContract(payload);
    }
  }

  getAreFormsValid = () => {
    const {
      isBasicInformationFormValid,
      isCompensationsFormValid,
      isContractsFormValid,
      isDecisionsFormValid,
      isInvoicesFormValid,
      isLitigantsFormValid,
    } = this.props;

    return (
      isBasicInformationFormValid &&
      isCompensationsFormValid &&
      isContractsFormValid &&
      isDecisionsFormValid &&
      isInvoicesFormValid &&
      isLitigantsFormValid
    );
  }

  isAnyFormDirty = () => {
    const {
      isBasicInformationFormDirty,
      isCompensationsFormDirty,
      isContractsFormDirty,
      isDecisionsFormDirty,
      isInvoicesFormDirty,
      isLitigantsFormDirty,
    } = this.props;

    return (
      isBasicInformationFormDirty ||
      isCompensationsFormDirty ||
      isContractsFormDirty ||
      isDecisionsFormDirty ||
      isInvoicesFormDirty ||
      isLitigantsFormDirty
    );
  }

  hideModal = (modalName: string) => {
    const modalVisibilityKey = `is${modalName}ModalOpen`;

    this.setState({
      [modalVisibilityKey]: false,
    });
  }

  showModal = (modalName: string) => {
    const modalVisibilityKey = `is${modalName}ModalOpen`;

    this.setState({
      [modalVisibilityKey]: true,
    });
  }

  destroyAllForms = () => {
    const {destroy} = this.props;

    destroy(FormNames.BASIC_INFORMATION);
    destroy(FormNames.DECISIONS);
    destroy(FormNames.CONTRACTS);
    destroy(FormNames.COMPENSATIONS);
    destroy(FormNames.INVOICES);
    destroy(FormNames.LITIGANTS);
  }

  getOverlayLayers = () => {
    const layers = [];
    const {
      areaNoteMethods,
      areaNotes,
    } = this.props;

    {isMethodAllowed(areaNoteMethods, Methods.GET) && !isEmpty(areaNotes) &&
      layers.push({
        checked: false,
        component: <AreaNotesLayer
          key='area_notes'
          allowToEdit={false}
          areaNotes={areaNotes}
        />,
        name: 'Muistettavat ehdot',
      });
    }

    return layers;
  }

  render() {
    const {activeTab} = this.state;
    const {
      currentLandUseContract,
      isBasicInformationFormDirty,
      isBasicInformationFormValid,
      isCompensationsFormDirty,
      isCompensationsFormValid,
      isContractsFormDirty,
      isContractsFormValid,
      isDecisionsFormDirty,
      isDecisionsFormValid,
      isInvoicesFormDirty,
      isInvoicesFormValid,
      isEditMode,
      isLitigantsFormDirty,
      isLitigantsFormValid,
      isSaveClicked,
    } = this.props;
    const {isRestoreModalOpen} = this.state;
    const identifier = getContentLandUseContractIdentifier(currentLandUseContract);
    const areFormsValid = this.getAreFormsValid();
    const overlayLayers = this.getOverlayLayers();

    return (
      <FullWidthContainer>
        <ControlButtonBar
          buttonComponent={
            <ControlButtons
              allowEdit={true}
              isCancelDisabled={false}
              isCopyDisabled={true}
              isEditDisabled={false}
              isEditMode={isEditMode}
              isSaveDisabled={isSaveClicked && !areFormsValid}
              onCancel={this.cancelChanges}
              onEdit={this.handleShowEditMode}
              onSave={this.saveChanges}
              showCommentButton={false}
              showCopyButton={false}
            />
          }
          infoComponent={<h1>{identifier}</h1>}
          onBack={this.handleBack}
        />

        <PageContainer className='with-small-control-bar'>
          <ConfirmationModal
            confirmButtonLabel='Palauta muutokset'
            isOpen={isRestoreModalOpen}
            label='Lomakkeella on tallentamattomia muutoksia. Haluatko palauttaa muutokset?'
            onCancel={this.cancelRestoreUnsavedChanges}
            onClose={this.cancelRestoreUnsavedChanges}
            onSave={this.restoreUnsavedChanges}
            title='Palauta tallentamattomat muutokset'
          />

          <Tabs
            active={activeTab}
            isEditMode={isEditMode}
            tabs={[
              {label: 'Perustiedot', allow: true, isDirty: isBasicInformationFormDirty, hasError: isSaveClicked && !isBasicInformationFormValid},
              {label: 'Osapuolet', allow: true, isDirty: isLitigantsFormDirty, hasError: isSaveClicked && !isLitigantsFormValid},
              {label: 'Päätökset ja sopimukset', allow: true, isDirty: (isContractsFormDirty || isDecisionsFormDirty), hasError: isSaveClicked && (!isDecisionsFormValid || !isContractsFormValid)},
              {label: 'Korvaukset ja laskutus', allow: true, isDirty: isCompensationsFormDirty || isInvoicesFormDirty, hasError: isSaveClicked && (!isCompensationsFormValid || !isInvoicesFormValid)},
              {label: 'Kartta', allow: true},
            ]}
            onTabClick={(id) => this.handleTabClick(id)}
          />
          <TabContent active={activeTab}>
            <TabPane>
              <ContentContainer>
                {!isEditMode
                  ? <BasicInformation />
                  : <BasicInformationEdit />
                }
              </ContentContainer>
            </TabPane>

            <TabPane>
              <ContentContainer>
                <h2>Osapuolet</h2>
                <Divider />
                {!isEditMode
                  ? <Litigants />
                  : <LitigantsEdit />
                }
              </ContentContainer>
            </TabPane>

            <TabPane>
              <ContentContainer>
                <h2>Päätökset</h2>
                <Divider />
                {!isEditMode
                  ? <Decisions />
                  : <DecisionsEdit />
                }

                <h2>Sopimukset</h2>
                <Divider />
                {!isEditMode
                  ? <Contracts />
                  : <ContractsEdit />
                }
              </ContentContainer>
            </TabPane>

            <TabPane>
              <ContentContainer>
                <h2>Korvaukset</h2>
                <Divider />
                {!isEditMode
                  ? <Compensations />
                  : <CompensationsEdit />
                }

                <h2>Laskutus</h2>
                <Divider />
                {!isEditMode
                  ? <Invoices />
                  : <InvoicesEdit />
                }
              </ContentContainer>
            </TabPane>

            <TabPane>
              <ContentContainer>
                <AreaNotesEditMap
                  allowToEdit={false}
                  overlayLayers={overlayLayers}
                />
              </ContentContainer>
            </TabPane>
          </TabContent>
        </PageContainer>
      </FullWidthContainer>
    );
  }
}

export default flowRight(
  // $FlowFixMe
  withRouter,
  connect(
    (state) => {
      return {
        areaNoteMethods: getAreaNoteMethods(state),
        areaNotes: getAreaNoteList(state),
        attributes: getAttributes(state),
        basicInformationFormValues: getFormValues(FormNames.BASIC_INFORMATION)(state),
        compensationsFormValues: getFormValues(FormNames.COMPENSATIONS)(state),
        contactAttributes: getContactAttributes(state),
        contractsFormValues: getFormValues(FormNames.CONTRACTS)(state),
        currentLandUseContract: getCurrentLandUseContract(state),
        decisionsFormValues: getFormValues(FormNames.DECISIONS)(state),
        invoicesFormValues: getFormValues(FormNames.INVOICES)(state),
        isBasicInformationFormDirty: isDirty(FormNames.BASIC_INFORMATION)(state),
        isBasicInformationFormValid: getIsFormValidById(state, FormNames.BASIC_INFORMATION),
        isCompensationsFormDirty: isDirty(FormNames.COMPENSATIONS)(state),
        isCompensationsFormValid: getIsFormValidById(state, FormNames.COMPENSATIONS),
        isContractsFormDirty: isDirty(FormNames.CONTRACTS)(state),
        isContractsFormValid: getIsFormValidById(state, FormNames.CONTRACTS),
        isDecisionsFormDirty: isDirty(FormNames.DECISIONS)(state),
        isDecisionsFormValid: getIsFormValidById(state, FormNames.DECISIONS),
        isInvoicesFormDirty: isDirty(FormNames.INVOICES)(state),
        isInvoicesFormValid: getIsFormValidById(state, FormNames.INVOICES),
        isLitigantsFormDirty: isDirty(FormNames.LITIGANTS)(state),
        isLitigantsFormValid: getIsFormValidById(state, FormNames.LITIGANTS),
        isEditMode: getIsEditMode(state),
        isFormValidFlags: getIsFormValidFlags(state),
        isSaveClicked: getIsSaveClicked(state),
        litigantsFormValues: getFormValues(FormNames.LITIGANTS)(state),
      };
    },
    {
      change,
      clearFormValidFlags,
      destroy,
      editLandUseContract,
      fetchAreaNoteList,
      fetchContactAttributes,
      fetchLandUseContractAttributes,
      fetchSingleLandUseContract,
      hideEditMode,
      initialize,
      receiveFormValidFlags,
      receiveIsSaveClicked,
      receiveTopNavigationSettings,
      showEditMode,
    }
  ),
)(LandUseContractPage);

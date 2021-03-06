// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {change, getFormValues, isDirty} from 'redux-form';
import {withRouter} from 'react-router';
import flowRight from 'lodash/flowRight';
import isEmpty from 'lodash/isEmpty';

import Authorization from '$components/authorization/Authorization';
import AuthorizationError from '$components/authorization/AuthorizationError';
import ConfirmationModal from '$components/modal/ConfirmationModal';
import ContactEdit from './ContactEdit';
import ContactReadonly from './ContactReadonly';
import ControlButtonBar from '$components/controlButtons/ControlButtonBar';
import ControlButtons from '$components/controlButtons/ControlButtons';
import FullWidthContainer from '$components/content/FullWidthContainer';
import Loader from '$components/loader/Loader';
import PageContainer from '$components/content/PageContainer';
import {
  editContact,
  fetchSingleContact,
  hideEditMode,
  initializeContactForm,
  receiveIsSaveClicked,
  showEditMode,
} from '$src/contacts/actions';
import {receiveTopNavigationSettings} from '$components/topNavigation/actions';
import {Methods, PermissionMissingTexts} from '$src/enums';
import {FormNames} from '$src/contacts/enums';
import {clearUnsavedChanges, getContactFullName} from '$src/contacts/helpers';
import {isMethodAllowed} from '$util/helpers';
import {getRouteById, Routes} from '$src/root/routes';
import {
  getCurrentContact,
  getIsContactFormValid,
  getIsEditMode,
  getIsFetching,
  getIsSaveClicked,
} from '$src/contacts/selectors';
import {getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem} from '$util/storage';
import {withCommonAttributes} from '$components/attributes/CommonAttributes';
import {withUiDataList} from '$components/uiData/UiDataListHOC';

import type {Methods as MethodsType} from '$src/types';
import type {RootState} from '$src/root/types';
import type {Contact} from '../types';

type Props = {
  change: Function,
  contact: Contact,
  contactFormValues: Contact,
  contactMethods: MethodsType, // get via withCommonAttributes HOC
  editContact: Function,
  fetchSingleContact: Function,
  hideEditMode: Function,
  history: Object,
  initializeContactForm: Function,
  isContactFormDirty: boolean,
  isContactFormValid: boolean,
  isEditMode: boolean,
  isFetching: boolean,
  isFetchingCommonAttributes: boolean, // get via withCommonAttributes HOC
  isSaveClicked: boolean,
  location: Object,
  match: {
    params: Object,
  },
  receiveIsSaveClicked: Function,
  receiveTopNavigationSettings: Function,
  showEditMode: Function,
}

type State = {
  isRestoreModalOpen: boolean,
}

class ContactPage extends Component<Props, State> {
  state = {
    isRestoreModalOpen: false,
  }

  timerAutoSave: any

  componentDidMount() {
    const {
      fetchSingleContact,
      hideEditMode,
      match: {params: {contactId}},
      receiveIsSaveClicked,
      receiveTopNavigationSettings,
    } = this.props;

    receiveIsSaveClicked(false);

    receiveTopNavigationSettings({
      linkUrl: getRouteById(Routes.CONTACTS),
      pageTitle: 'Asiakkaat',
      showSearch: false,
    });

    fetchSingleContact(contactId);

    hideEditMode();
    window.addEventListener('beforeunload', this.handleLeavePage);
  }

  componentDidUpdate(prevProps) {
    const {match: {params: {contactId}}} = this.props;

    if(isEmpty(prevProps.contact) && !isEmpty(this.props.contact)) {
      const storedContactId = getSessionStorageItem('contactId');

      if(Number(contactId) === storedContactId) {
        this.setState({isRestoreModalOpen: true});
      }
    }
    // Stop autosave timer and clear form data from session storage after saving/cancelling changes
    if(prevProps.isEditMode && !this.props.isEditMode) {
      this.stopAutoSaveTimer();
      clearUnsavedChanges();
    }
  }

  componentWillUnmount() {
    const {
      hideEditMode,
      match: {params: {contactId}},
      location: {pathname},
    } = this.props;

    if(pathname !== `${getRouteById(Routes.CONTACTS)}/${contactId}`) {
      clearUnsavedChanges();
    }
    this.stopAutoSaveTimer();

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
    const {isEditMode, isContactFormDirty} = this.props;

    if(isContactFormDirty && isEditMode) {
      const confirmationMessage = '';
      e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    }
  }

  saveUnsavedChanges = () => {
    const {
      contactFormValues,
      isContactFormDirty,
      match: {params: {contactId}},
    } = this.props;

    if(isContactFormDirty) {
      setSessionStorageItem(FormNames.CONTACT, contactFormValues);
      setSessionStorageItem('contactId', contactId);
    } else {
      removeSessionStorageItem(FormNames.CONTACT);
      removeSessionStorageItem('contactId');
    }
  };

  cancelRestoreUnsavedChanges = () => {
    clearUnsavedChanges();
    this.setState({isRestoreModalOpen: false});
  }

  restoreUnsavedChanges = () => {
    const {contact, initializeContactForm, showEditMode} = this.props;

    showEditMode();
    initializeContactForm(contact);

    setTimeout(() => {
      const storedContactFormValues = getSessionStorageItem(FormNames.CONTACT);
      if(storedContactFormValues) {
        this.bulkChange(FormNames.CONTACT, storedContactFormValues);
      }

      this.startAutoSaveTimer();
    }, 20);

    this.setState({isRestoreModalOpen: false});
  }

  bulkChange = (formName: string, obj: Object) => {
    const {change} = this.props;
    const fields = Object.keys(obj);
    fields.forEach(field => {
      change(formName, field, obj[field]);
    });
  }

  copyContact = () => {
    const {contact, hideEditMode, initializeContactForm} = this.props;
    const {history, location: {search}} = this.props;

    contact.id = undefined;
    initializeContactForm(contact);
    hideEditMode();
    clearUnsavedChanges();

    return history.push({
      pathname: getRouteById(Routes.CONTACT_NEW),
      search: search,
    });
  }

  hideEditMode = () => {
    const {hideEditMode} = this.props;
    hideEditMode();
  }

  handleBack = () => {
    const {history, location: {search}} = this.props;

    return history.push({
      pathname: `${getRouteById(Routes.CONTACTS)}`,
      search: search,
    });
  }

  cancelChanges = () => {
    const {hideEditMode} = this.props;

    hideEditMode();
  }

  saveChanges = () => {
    const {contactFormValues, editContact, isContactFormValid, receiveIsSaveClicked} = this.props;

    receiveIsSaveClicked(true);

    if(isContactFormValid) {
      editContact(contactFormValues);
    }
  }

  showEditMode = () => {
    const {
      contact,
      initializeContactForm,
      receiveIsSaveClicked,
      showEditMode,
    } = this.props;

    receiveIsSaveClicked(false);
    initializeContactForm(contact);
    showEditMode();
    this.startAutoSaveTimer();
  }

  render() {
    const {
      contact,
      contactMethods,
      isContactFormValid,
      isEditMode,
      isFetching,
      isFetchingCommonAttributes,
      isSaveClicked,
    } = this.props;
    const {isRestoreModalOpen} = this.state;

    const nameInfo = getContactFullName(contact);

    if(isFetching || isFetchingCommonAttributes) {
      return (
        <PageContainer><Loader isLoading={true} /></PageContainer>
      );
    }

    if(!contactMethods) return null;

    if(!isMethodAllowed(contactMethods, Methods.GET)) return <PageContainer><AuthorizationError text={PermissionMissingTexts.CONTACT} /></PageContainer>;

    return (
      <FullWidthContainer>
        <ControlButtonBar
          buttonComponent={
            <ControlButtons
              allowCopy={isMethodAllowed(contactMethods, Methods.POST)}
              allowEdit={isMethodAllowed(contactMethods, Methods.PATCH)}
              isCopyDisabled={false}
              isEditMode={isEditMode}
              isSaveDisabled={isSaveClicked && !isContactFormValid}
              onCancel={this.cancelChanges}
              onCopy={this.copyContact}
              onEdit={this.showEditMode}
              onSave={this.saveChanges}
              showCommentButton={false}
              showCopyButton={true}
            />
          }
          infoComponent={<h1>{nameInfo}</h1>}
          onBack={this.handleBack}
        />
        <PageContainer className='with-small-control-bar'>
          <Authorization allow={isMethodAllowed(contactMethods, Methods.PATCH)}>
            <ConfirmationModal
              confirmButtonLabel='Palauta muutokset'
              isOpen={isRestoreModalOpen}
              label='Lomakkeella on tallentamattomia muutoksia. Haluatko palauttaa muutokset?'
              onCancel={this.cancelRestoreUnsavedChanges}
              onClose={this.cancelRestoreUnsavedChanges}
              onSave={this.restoreUnsavedChanges}
              title='Palauta tallentamattomat muutokset'
            />
          </Authorization>

          {isEditMode
            ? <Authorization
              allow={isMethodAllowed(contactMethods, Methods.PATCH)}
              errorComponent={<AuthorizationError text={PermissionMissingTexts.GENERAL}/>}
            > <ContactEdit /></Authorization>
            : <ContactReadonly contact={contact} />
          }
        </PageContainer>
      </FullWidthContainer>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    contact: getCurrentContact(state),
    contactFormValues: getFormValues(FormNames.CONTACT)(state),
    isContactFormDirty: isDirty(FormNames.CONTACT)(state),
    isContactFormValid: getIsContactFormValid(state),
    isEditMode: getIsEditMode(state),
    isFetching: getIsFetching(state),
    isSaveClicked: getIsSaveClicked(state),
  };
};

export default flowRight(
  withCommonAttributes,
  withUiDataList,
  withRouter,
  connect(
    mapStateToProps,
    {
      change,
      editContact,
      fetchSingleContact,
      hideEditMode,
      initializeContactForm,
      receiveIsSaveClicked,
      receiveTopNavigationSettings,
      showEditMode,
    }
  ),
)(ContactPage);

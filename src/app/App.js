// @flow

import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReduxToastr from 'react-redux-toastr';
import {withRouter} from 'react-router';
import flowRight from 'lodash/flowRight';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import {Sizes} from '../foundation/enums';
import {revealContext} from '../foundation/reveal';
import classnames from 'classnames';

import {getRouteById} from '../root/routes';
import {clearError} from '../api/actions';
import {getError} from '../api/selectors';
import ApiErrorModal from '../api/ApiErrorModal';
import {clearApiToken, fetchApiToken} from '../auth/actions';
import {getApiToken, getApiTokenLoading, getLoggedInUser} from '../auth/selectors';
import LoginPage from '../auth/components/LoginPage';
import userManager from '../auth/util/user-manager';
import Loader from '../components/loader/Loader';
import SideMenu from '../components/sideMenu/SideMenu';
import TopNavigation from '../components/topNavigation/TopNavigation';

import type {ApiError} from '../api/types';
import type {ApiToken} from '../auth/types';
import type {RootState} from '../root/types';

type Props = {
  apiError: ApiError,
  apiToken: ApiToken,
  apiTokenLoading: boolean,
  children: any,
  clearApiToken: Function,
  clearError: typeof clearError,
  closeReveal: Function,
  fetchApiToken: Function,
  location: Object,
  params: Object,
  apiToken: string,
  user: Object,
};

type State = {
  displaySideMenu: boolean,
};

class App extends Component {
  props: Props

  state: State = {
    displaySideMenu: false,
  }

  componentWillReceiveProps(nextProps) {
    const {apiError, clearApiToken, fetchApiToken} = this.props;
    if(apiError) {
      return;
    }
    // Fetch api token if user info is received but Api token is empty
    if(nextProps.user !== null && nextProps.user.access_token !== null && isEmpty(nextProps.apiToken)) {
      fetchApiToken(nextProps.user.access_token);
      return;
    }
    // Clear API token when user has logged out
    if(!nextProps.user && !isEmpty(nextProps.apiToken)) {
      clearApiToken();
    }
  }

  logOut = () => {
    userManager.removeUser();
  }

  toggleSideMenu = () => {
    return this.setState({
      displaySideMenu: !this.state.displaySideMenu,
    });
  };

  handleDismissErrorModal = () => {
    this.props.closeReveal('apiError');
    this.props.clearError();
  };

  showTopHeaderSearch = () => {
    const {location} = this.props;
    return location.pathname === getRouteById('leases') ? false : true;
  }

  render() {
    const {apiError, apiToken, apiTokenLoading, children, location, user} = this.props;
    const {displaySideMenu} = this.state;
    const showSearch = this.showTopHeaderSearch();

    if (isEmpty(user) || isEmpty(apiToken)) {
      return (
        <div className={'app'}>
          <ApiErrorModal size={Sizes.MEDIUM}
            data={apiError}
            isOpen={Boolean(apiError)}
            handleDismiss={this.handleDismissErrorModal}/>
          <LoginPage buttonDisabled={Boolean(apiTokenLoading)}/>
          <Loader isLoading={Boolean(apiTokenLoading)} />

          {location.pathname === getRouteById('callback') &&
            children
          }
        </div>
      );
    }

    return (
      <div className={'app'}>
        <ApiErrorModal size={Sizes.LARGE}
          data={apiError}
          isOpen={Boolean(apiError)}
          handleDismiss={this.handleDismissErrorModal}/>
        <ReduxToastr
          newestOnTop={true}
          position='top-right'
          preventDuplicates={true}
          progressBar={true}
          timeOut={4000}
          transitionIn='fadeIn'
          transitionOut='bounceOutUp'
        />

        <TopNavigation
          onLogout={this.logOut}
          showSearch={showSearch}
          toggleSideMenu={this.toggleSideMenu}
          userProfile={get(user, 'profile')}
        />
        <section className="app__content">
          <SideMenu
            isOpen={displaySideMenu}
            onLinkClick={this.toggleSideMenu}
          />
          <div className={classnames('wrapper', {'is-sidemenu-closed': !displaySideMenu}, {'is-sidemenu-open': displaySideMenu})}>
            {children}
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const user = getLoggedInUser(state);

  if (!user || user.expired) {
    return {
      user: null,
      apiToken: getApiToken(state),
    };
  }

  return {
    apiError: getError(state),
    apiToken: getApiToken(state),
    apiTokenLoading: getApiTokenLoading(state),
    user,
  };
};

export default flowRight(
  withRouter,
  connect(
    mapStateToProps,
    {
      clearError,
      clearApiToken,
      fetchApiToken,
    },
  ),
  revealContext(),
)(App);

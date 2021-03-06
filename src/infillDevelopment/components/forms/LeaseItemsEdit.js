// @flow
import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {Row, Column} from 'react-foundation';
import type {Element} from 'react';

import {ActionTypes, AppConsumer} from '$src/app/AppContext';
import AddButtonSecondary from '$components/form/AddButtonSecondary';
import Authorization from '$components/authorization/Authorization';
import FormText from '$src/components/form/FormText';
import LeaseItemEdit from './LeaseItemEdit';
import {ButtonColors} from '$components/enums';
import {
  DeleteModalLabels,
  DeleteModalTitles,
} from '$src/infillDevelopment/enums';
import {UsersPermissions} from '$src/usersPermissions/enums';
import {hasPermissions} from '$util/helpers';
import {getUsersPermissions} from '$src/usersPermissions/selectors';
import type {UsersPermissions as UsersPermissionsType} from '$src/usersPermissions/types';

import type {InfillDevelopment} from '$src/infillDevelopment/types';

type Props = {
  fields: any,
  infillDevelopment: InfillDevelopment,
  isSaveClicked: boolean,
  usersPermissions: UsersPermissionsType,
}

const LeaseItemsEdit = ({
  fields,
  infillDevelopment,
  isSaveClicked,
  usersPermissions,
}: Props): Element<*> => {
  const handleAdd = () => {
    fields.push({});
  };

  return (
    <AppConsumer>
      {({dispatch}) => {
        return(
          <Fragment>
            {!hasPermissions(usersPermissions, UsersPermissions.ADD_INFILLDEVELOPMENTCOMPENSATIONLEASE) &&
              (!fields || !fields.length) &&
              <FormText>Ei vuokrauksia</FormText>
            }
            {!!fields && !!fields.length && fields.map((lease, index) => {
              const handleRemove = () => {
                dispatch({
                  type: ActionTypes.SHOW_CONFIRMATION_MODAL,
                  confirmationFunction: () => {
                    fields.remove(index);
                  },
                  confirmationModalButtonClassName: ButtonColors.ALERT,
                  confirmationModalButtonText: 'Poista',
                  confirmationModalLabel: DeleteModalLabels.LEASE,
                  confirmationModalTitle: DeleteModalTitles.LEASE,
                });
              };

              return <LeaseItemEdit
                key={index}
                field={lease}
                fields={fields}
                infillDevelopment={infillDevelopment}
                index={index}
                isSaveClicked={isSaveClicked}
                onRemove={handleRemove}
              />;
            })}

            <Authorization allow={hasPermissions(usersPermissions, UsersPermissions.ADD_INFILLDEVELOPMENTCOMPENSATIONLEASE)}>
              <Row>
                <Column>
                  <AddButtonSecondary
                    label='Lisää vuokraus'
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

export default connect(
  (state) => {
    return {
      usersPermissions: getUsersPermissions(state),
    };
  }
)(LeaseItemsEdit);

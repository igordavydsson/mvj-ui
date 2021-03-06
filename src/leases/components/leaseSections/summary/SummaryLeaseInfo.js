// @flow
import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {Row, Column} from 'react-foundation';
import classNames from 'classnames';
import get from 'lodash/get';

import Authorization from '$components/authorization/Authorization';
import Comments from '../constructability/Comments';
import ExternalLink from '$components/links/ExternalLink';
import FormText from '$components/form/FormText';
import FormTextTitle from '$components/form/FormTextTitle';
import ListItem from '$components/content/ListItem';
import ListItems from '$components/content/ListItems';
import SubTitle from '$components/content/SubTitle';
import {AreaNoteFieldTitles} from '$src/areaNote/enums';
import {
  ConstructabilityStatus,
  LeaseAreaAddressesFieldPaths,
  LeaseAreasFieldPaths,
} from '$src/leases/enums';
import {UsersPermissions} from '$src/usersPermissions/enums';
import {getContactFullName} from '$src/contacts/helpers';
import {getContentSummary, getFullAddress} from '$src/leases/helpers';
import {getUserFullName} from '$src/users/helpers';
import {
  formatDate,
  getFieldOptions,
  getLabelOfOption,
  hasPermissions,
  isFieldAllowedToRead,
} from '$util/helpers';
import {getRouteById, Routes} from '$src/root/routes';
import {getAttributes, getCurrentLease} from '$src/leases/selectors';
import {getUsersPermissions} from '$src/usersPermissions/selectors';

import type {Attributes} from '$src/types';
import type {Lease} from '$src/leases/types';
import type {UsersPermissions as UsersPermissionsType} from '$src/usersPermissions/types';

type StatusIndicatorProps = {
  researchState: string,
  stateOptions: Array<Object>,
}

const StatusIndicator = ({researchState, stateOptions}: StatusIndicatorProps) =>
  <p
    className={classNames(
      {'summary__status-indicator summary__status-indicator--neutral': !researchState || researchState === ConstructabilityStatus.UNVERIFIED},
      {'summary__status-indicator summary__status-indicator--alert': researchState === ConstructabilityStatus.REQUIRES_MEASURES},
      {'summary__status-indicator summary__status-indicator--success': researchState === ConstructabilityStatus.COMPLETE},
      {'summary__status-indicator summary__status-indicator--enquiry-sent': researchState === ConstructabilityStatus.ENQUIRY_SENT},
    )}
  >
    {getLabelOfOption(stateOptions, researchState || ConstructabilityStatus.UNVERIFIED)}
  </p>;

type Props = {
  attributes: Attributes,
  currentLease: Lease,
  usersPermissions: UsersPermissionsType,
}

const SummaryLeaseInfo = ({attributes, currentLease, usersPermissions}: Props) => {
  const constructabilityStateOptions = getFieldOptions(attributes, LeaseAreasFieldPaths.PRECONSTRUCTION_STATE),
    summary = getContentSummary(currentLease),
    tenants = summary.tenants,
    leaseAreas = summary.lease_areas,
    constructabilityAreas = get(summary, 'constructability_areas', []);

  return (
    <Fragment>
      <SubTitle>Vuokralaiset</SubTitle>
      {!tenants.length && <FormText>Ei vuokralaisia</FormText>}
      {!!tenants.length &&
        <Fragment>
          <Row>
            <Column small={6} large={4}>
              <FormTextTitle title='Vuokralainen' />
            </Column>
            <Column small={6} large={4}>
              <FormTextTitle title='Osuus' />
            </Column>
          </Row>
          <ListItems>
            {tenants.map((contact, index) => {
              return (
                <Row key={index}>
                  <Column small={6} large={4}>
                    <ListItem>
                      <ExternalLink
                        className='no-margin'
                        href={`${getRouteById(Routes.CONTACTS)}/${get(contact, 'tenant.contact.id')}`}
                        text={getContactFullName(get(contact, 'tenant.contact')) || '-'}
                      />
                    </ListItem>
                  </Column>
                  <Column small={6} large={4}><ListItem>{contact.share_numerator} / {contact.share_denominator}</ListItem></Column>
                </Row>
              );
            })}
          </ListItems>
        </Fragment>
      }

      <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.LEASE_AREAS)}>
        <SubTitle>Vuokrakohteet</SubTitle>
        {!leaseAreas.length && <FormText>Ei vuokrakohteita</FormText>}
        {!!leaseAreas.length &&
          <Fragment>
            <Row>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.IDENTIFIER)}>
                <Column small={6} large={4}>
                  <FormTextTitle title='Kohteen tunnus' />
                </Column>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreaAddressesFieldPaths.ADDRESSES)}>
                <Column small={6} large={4}>
                  <FormTextTitle title='Kohteen osoite' />
                </Column>
              </Authorization>
            </Row>
            {leaseAreas.map((area, index) => {
              return (
                <ListItems key={index}>
                  <Row>
                    <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.IDENTIFIER)}>
                      <Column small={6} large={4}>
                        <ListItem>{area.identifier || '-'}</ListItem>
                      </Column>
                    </Authorization>
                    <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreaAddressesFieldPaths.ADDRESSES)}>
                      <Column small={6} large={4}>
                        {!area.addresses || !area.addresses.length && <ListItem>-</ListItem>}

                        {!!area.addresses && !!area.addresses.length &&
                          area.addresses.map((address, index) => {
                            return <ListItem key={index}>{getFullAddress(address)}</ListItem>;
                          })
                        }
                      </Column>
                    </Authorization>
                  </Row>
                </ListItems>
              );
            })}
          </Fragment>
        }
      </Authorization>

      <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.LEASE_AREAS)}>
        <SubTitle>Rakentamiskelpoisuus</SubTitle>
        {!constructabilityAreas.length && <FormText>Ei vuokrakohteita</FormText>}
        {!!constructabilityAreas.length && constructabilityAreas.map((area, index) => {
          const descriptionsDemolition = area.descriptionsDemolition.filter((item) => item.is_static);
          const descriptionsOther = area.descriptionsOther.filter((item) => item.is_static);
          const descriptionsPollutedLand = area.descriptionsPollutedLand.filter((item) => item.is_static);
          const descriptionsPreconstruction = area.descriptionsPreconstruction.filter((item) => item.is_static);
          const descriptionsReport = area.descriptionsReport.filter((item) => item.is_static);

          return (
            <ListItems key={index}>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.IDENTIFIER)}>
                <Row>
                  <Column><ListItem><strong>{area.identifier || '-'}</strong></ListItem></Column>
                </Row>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.PRECONSTRUCTION_STATE)}>
                <Row>
                  <Column small={6} large={4}>
                    <ListItem>Esirakentaminen, johtosiirrot, kunnallistekniikka</ListItem>
                  </Column>
                  <Column small={6} large={4}>
                    <StatusIndicator
                      researchState={area.preconstruction_state}
                      stateOptions={constructabilityStateOptions}
                    />
                  </Column>
                  <Column small={12} large={4}>
                    <Comments
                      commentClassName='no-border-on-first-child'
                      comments={descriptionsPreconstruction}
                      showNoDataText={false}
                      showTitle={false}
                    />
                  </Column>
                </Row>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.DEMOLITION_STATE)}>
                <Row>
                  <Column small={6} large={4}>
                    <ListItem>Purku</ListItem>
                  </Column>
                  <Column small={6} large={4}>
                    <StatusIndicator
                      researchState={area.demolition_state}
                      stateOptions={constructabilityStateOptions}
                    />
                  </Column>
                  <Column small={12} large={4}>
                    <Comments
                      commentClassName='no-border-on-first-child'
                      comments={descriptionsDemolition}
                      showNoDataText={false}
                      showTitle={false}
                    />
                  </Column>
                </Row>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.POLLUTED_LAND_STATE)}>
                <Row>
                  <Column small={6} large={4}>
                    <ListItem>Pima ja jäte</ListItem>
                  </Column>
                  <Column small={6} large={4}>
                    <StatusIndicator
                      researchState={area.polluted_land_state}
                      stateOptions={constructabilityStateOptions}
                    />
                  </Column>
                  <Column small={12} large={4}>
                    <Comments
                      commentClassName='no-border-on-first-child'
                      comments={descriptionsPollutedLand}
                      showNoDataText={false}
                      showTitle={false}
                    />
                  </Column>
                </Row>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.CONSTRUCTABILITY_REPORT_STATE)}>
                <Row>
                  <Column small={6} large={4}>
                    <ListItem>Rakennettavuusselvitys</ListItem>
                  </Column>
                  <Column small={6} large={4}>
                    <StatusIndicator
                      researchState={area.constructability_report_state}
                      stateOptions={constructabilityStateOptions}
                    />
                  </Column>
                  <Column small={12} large={4}>
                    <Comments
                      commentClassName='no-border-on-first-child'
                      comments={descriptionsReport}
                      showNoDataText={false}
                      showTitle={false}
                    />
                  </Column>
                </Row>
              </Authorization>
              <Authorization allow={isFieldAllowedToRead(attributes, LeaseAreasFieldPaths.OTHER_STATE)}>
                <Row>
                  <Column small={6} large={4}>
                    <ListItem>Muut</ListItem>
                  </Column>
                  <Column small={6} large={4}>
                    <StatusIndicator
                      researchState={area.other_state}
                      stateOptions={constructabilityStateOptions}
                    />
                  </Column>
                  <Column small={12} large={4}>
                    <Comments
                      commentClassName='no-border-on-first-child'
                      comments={descriptionsOther}
                      showNoDataText={false}
                      showTitle={false}
                    />
                  </Column>
                </Row>
              </Authorization>
            </ListItems>
          );
        })}
      </Authorization>

      <Authorization allow={hasPermissions(usersPermissions, UsersPermissions.VIEW_LEASE_LEASE_AREAS) ||
        hasPermissions(usersPermissions, UsersPermissions.CHANGE_LEASE_LEASE_AREAS)}>
        {!!summary.area_notes.length &&
          <Fragment>
            <SubTitle>{AreaNoteFieldTitles.AREA_NOTES}</SubTitle>
            <Row>
              <Column small={4}>
                <FormTextTitle>{AreaNoteFieldTitles.MODIFIED_AT}</FormTextTitle>
              </Column>
              <Column small={4}>
                <FormTextTitle>{AreaNoteFieldTitles.USER}</FormTextTitle>
              </Column>
              <Column small={4}>
                <FormTextTitle>{AreaNoteFieldTitles.NOTE}</FormTextTitle>
              </Column>
            </Row>
            <ListItems>
              {summary.area_notes.map((areaNote, index) => {
                return(
                  <Row key={index}>
                    <Column small={4}>
                      <ListItem>{formatDate(areaNote.modified_at) || '-'}</ListItem>
                    </Column>
                    <Column small={4}>
                      <ListItem>{getUserFullName(areaNote.user) || '-'}</ListItem>
                    </Column>
                    <Column small={4} style={{lineHeight: 1}}>
                      <ExternalLink
                        className='no-margin'
                        href={`${getRouteById(Routes.AREA_NOTES)}/?area_note=${areaNote.id}`}
                        text={areaNote.note || '-'}
                      />
                    </Column>
                  </Row>
                );
              })}
            </ListItems>
          </Fragment>
        }
      </Authorization>
    </Fragment>
  );
};

export default connect(
  (state) => {
    return {
      attributes: getAttributes(state),
      currentLease: getCurrentLease(state),
      usersPermissions: getUsersPermissions(state),
    };
  },
)(SummaryLeaseInfo);

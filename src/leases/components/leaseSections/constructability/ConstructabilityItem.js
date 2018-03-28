// @flow
import React from 'react';
import get from 'lodash/get';
import {Row, Column} from 'react-foundation';
import classNames from 'classnames';

import Collapse from '$components/collapse/Collapse';
import {formatDate, getAttributeFieldOptions, getLabelOfOption} from '$util/helpers';
import {ConstructabilityStatus, ConstructabilityType} from '$src/leases/enums';

import type {Attributes} from '$src/leases/types';

type CommentsProps = {
  comments: ?Array<Object>,
}

const Comments = ({comments}: CommentsProps) => {
  return (
    <div>
      {comments && !!comments.length
        ? (
          <div>
            {comments.map((comment) =>
              <div className='construction-eligibility__comment-item'
                key={comment.id}>
                <Row>
                  <Column small={12} className='explanation'>
                    <p>{get(comment, 'text', '')}</p>
                    <p className='info'>
                      <strong>{get(comment, 'user', '')}</strong>
                      {comment.modified_at && `, ${formatDate(comment.modified_at)}`}
                      {comment.AHJO_number && `, diaarinumero ${comment.AHJO_number}`}
                    </p>
                  </Column>
                </Row>
              </div>
            )}
          </div>
        ) : (
          <div className='construction-eligibility__comment-item no-comments'>
            <p><em>Ei selityksiä.</em></p>
          </div>
        )
      }
    </div>
  );
};

type StatusIndicatorProps = {
  researchState: string,
  stateOptions: string,
}

const StatusIndicator = ({researchState, stateOptions}: StatusIndicatorProps) =>
  <div>
    <div className={
      classNames(
        {'collapse__header-neutral': !researchState || researchState === ConstructabilityStatus.UNVERIFIED},
        {'collapse__header-alert': researchState === ConstructabilityStatus.REQUIRES_MEASURES},
        {'collapse__header-success': researchState === ConstructabilityStatus.COMPLETE}
      )
    }>
      <i/>
      <span>
        {getLabelOfOption(stateOptions, researchState || ConstructabilityStatus.UNVERIFIED)}
      </span>
    </div>
  </div>;


type Props = {
  area: Object,
  attributes: Attributes,
}

const ConstructabilityItem = ({area, attributes}: Props) => {
  const getDescriptions = (type: string) => {
    const descriptions = get(area, 'constructability_descriptions', []);
    if(!descriptions.length) {
      return [];
    }
    return descriptions.filter((description) => {
      return description.type === type;
    });
  };

  const stateOptions = getAttributeFieldOptions(attributes, 'lease_areas.child.children.preconstruction_state');
  const pollutedLandConditionStateOptions = getAttributeFieldOptions(attributes, 'lease_areas.child.children.polluted_land_rent_condition_state');
  const constructabilityReportStateOptions = getAttributeFieldOptions(attributes, 'lease_areas.child.children.constructability_report_investigation_state');

  return (
    <div>
      <Collapse
        className='collapse__secondary'
        defaultOpen={false}
        header={
          <Row>
            <Column small={6} medium={9} large={8}>
              <span className='collapse__header-title'>Esirakentaminen, johtosiirrot ja kunnallistekniikka</span>
            </Column>
            <Column small={6} medium={3} large={4}>
              <StatusIndicator
                researchState={get(area, 'preconstruction_state')}
                stateOptions={stateOptions}
              />
            </Column>
          </Row>
        }>
        <Comments comments={getDescriptions(ConstructabilityType.PRECONSTRUCTION)} />
      </Collapse>

      <Collapse
        className='collapse__secondary'
        defaultOpen={false}
        header={
          <Row>
            <Column small={6} medium={9} large={8}>
              <span className='collapse__header-title'>Purku</span>
            </Column>
            <Column small={6} medium={3} large={4}>
              <StatusIndicator
                researchState={get(area, 'demolition_state')}
                stateOptions={stateOptions}
              />
            </Column>
          </Row>
        }>
        <Comments comments={getDescriptions(ConstructabilityType.DEMOLITION)} />
      </Collapse>

      <Collapse
        className='collapse__secondary'
        defaultOpen={false}
        header={
          <Row>
            <Column small={6} medium={9} large={8}>
              <span className='collapse__header-title'>PIMA</span>
            </Column>
            <Column small={6} medium={3} large={4}>
              <StatusIndicator
                researchState={get(area, 'polluted_land_state')}
                stateOptions={stateOptions}
              />
            </Column>
          </Row>
        }>
        <div>
          <Row>
            <Column small={6} medium={3} large={2}>
              <label>Vuokraehdot</label>
              <p>{getLabelOfOption(pollutedLandConditionStateOptions, get(area, 'polluted_land_rent_condition_state')) || '-'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>Päivämäärä</label>
              <p>{formatDate(get(area, 'polluted_land_rent_condition_date')) || '–'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>PIMA valmistelija</label>
              <p>{get(area, 'polluted_land_planner,id') || '–'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>ProjectWise numero</label>
              <p>{get(area, 'polluted_land_projectwise_number') || '-'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>Matti raportti</label>
              <p>{get(area, 'polluted_land_matti_report_number') || '-'}</p>
            </Column>
          </Row>
        </div>
        <Comments comments={getDescriptions(ConstructabilityType.POLLLUTED_LAND)} />
      </Collapse>

      <Collapse
        className='collapse__secondary'
        defaultOpen={false}
        header={
          <Row>
            <Column small={6} medium={9} large={8}>
              <span className='collapse__header-title'>Rakennettavuusselvitys</span>
            </Column>
            <Column small={6} medium={3} large={4}>
              <StatusIndicator
                researchState={get(area, 'constructability_report_state')}
                stateOptions={stateOptions}
              />
            </Column>
          </Row>
        }>
        <div>
          <Row>
            <Column small={6} medium={3} large={2}>
              <label>Selvitys</label>
              <p>{getLabelOfOption(constructabilityReportStateOptions, get(area, 'constructability_report_investigation_state')) || '-'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>Allekirjoituspäivämäärä</label>
              <p>{formatDate(get(area, 'constructability_report_signing_date')) || '–'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>Allekirjoittaja</label>
              <p>{get(area, 'constructability_report_signer') || '-'}</p>
            </Column>
            <Column small={6} medium={3} large={2}>
              <label>Geotekninenpalvelun tiedosto</label>
              <p>{get(area, 'constructability_report_geotechnical_number') || '-'}</p>
            </Column>
          </Row>
        </div>
        <Comments comments={getDescriptions(ConstructabilityType.REPORT)} />
      </Collapse>

      <Collapse
        className='collapse__secondary'
        defaultOpen={false}
        header={
          <Row>
            <Column small={6} medium={9} large={8}>
              <span className='collapse__header-title'>Muut</span>
            </Column>
            <Column small={6} medium={3} large={4}>
              <StatusIndicator
                researchState={get(area, 'other_state')}
                stateOptions={stateOptions}
              />
            </Column>
          </Row>
        }>
        <Comments comments={getDescriptions(ConstructabilityType.OTHER)} />
      </Collapse>
    </div>
  );
};

export default ConstructabilityItem;

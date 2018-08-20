// @flow
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import {
  ConstructabilityType,
  FormNames,
  LeaseStatus,
  RecipientOptions,
  TenantContactType,
} from './enums';
import {getContactFullName} from '$src/contacts/helpers';
import {getUserFullName} from '$src/users/helpers';
import {
  fixedLengthNumber,
  formatDecimalNumberForDb,
  sortByStartDateDesc,
  sortStringByKeyAsc,
  sortStringByKeyDesc,
} from '$util/helpers';
import {removeSessionStorageItem} from '$util/storage';

import type {Lease} from './types';

export const getContentLeaseIdentifier = (item:Object) => {
  if(isEmpty(item)) {
    return null;
  }

  return `${get(item, 'identifier.type.identifier')}${get(item, 'identifier.municipality.identifier')}${fixedLengthNumber(get(item, 'identifier.district.identifier'), 2)}-${get(item, 'identifier.sequence')}`;
};

export const getContentLeaseTenant = (lease: Object) => {
  const tenants = get(lease, 'tenants[0].tenantcontact_set', []);
  if(!tenants.length) {return null;}

  const tenant = tenants.find((x) => x.type === TenantContactType.TENANT);
  if(!tenant) {return null;}

  return getContactFullName(tenant.contact);
};

export const getContentLeaseOption = (lease: Lease) => {
  return {
    value: lease.id,
    label: getContentLeaseIdentifier(lease),
  };
};

export const getContentLeaseAddress = (lease: Object) => {
  const address = get(lease, 'lease_areas[0].addresses[0]');
  if(!address) {
    return null;
  }
  return getFullAddress(address);
};

export const getContentLeaseItem = (lease: Object) => {
  return {
    id: get(lease, 'id'),
    identifier: getContentLeaseIdentifier(lease),
    real_property_unit: get(lease, 'lease_areas[0].identifier'),
    tenant: getContentLeaseTenant(lease),
    lessor: getContactFullName(lease.lessor),
    address: getContentLeaseAddress(lease),
    state: get(lease, 'state'),
    start_date: get(lease, 'start_date'),
    end_date: get(lease, 'end_date'),
  };
};

export const getContentLeases = (content: Object) => {
  const results = get(content, 'results', []);

  return results.map((item) => {
    return getContentLeaseItem(item);
  });
};

export const getContentLeaseInfo = (lease: Object) => {
  return {
    identifier: getContentLeaseIdentifier(lease),
    end_date: get(lease, 'end_date'),
    start_date: get(lease, 'start_date'),
    state: get(lease, 'state'),
  };
};

export const getContentLeaseStatus = (lease: Object) => {
  const now = moment();
  const startDate = get(lease, 'start_date');
  const endDate = get(lease, 'end_date');
  if(endDate && now.isAfter(endDate, 'day')) {
    return LeaseStatus.FINISHED;
  }
  if((!endDate && !startDate) || moment(startDate).isAfter(now, 'day')) {
    return LeaseStatus.PREPARATION;
  }

  return LeaseStatus.IN_EFFECT;
};

export const getContentHistory = (lease: Object) => {
  const historyItems = get(lease, 'history', []);
  if(!historyItems || historyItems.length === 0) {
    return [];
  }

  return historyItems.map((item) => {
    return {
      active: get(item, 'active'),
      end_date: get(item, 'end_date'),
      identifier: get(item, 'identifier'),
      start_date: get(item, 'start_date'),
      type: get(item, 'type'),
    };
  });
};

export const getContentContact = (contact: Object) => {
  return {
    id: get(contact, 'id'),
    value: get(contact, 'id'),
    label: getContactFullName(contact),
    type: get(contact, 'type'),
    first_name: get(contact, 'first_name'),
    last_name: get(contact, 'last_name'),
    name: get(contact, 'name'),
    business_id: get(contact, 'business_id'),
    address: get(contact, 'address'),
    postal_code: get(contact, 'postal_code'),
    city: get(contact, 'city'),
    email: get(contact, 'email'),
    phone: get(contact, 'phone'),
    language: get(contact, 'language'),
    national_identification_number: get(contact, 'national_identification_number'),
    address_protection: get(contact, 'address_protection'),
    customer_number: get(contact, 'customer_number'),
    sap_customer_number: get(contact, 'sap_customer_number'),
    electronic_billing_address: get(contact, 'electronic_billing_address'),
    partner_code: get(contact, 'partner_code'),
    is_lessor: get(contact, 'is_lessor'),
  };
};

export const getContentLessor = (lessor: Object) => {
  return {
    id: get(lessor, 'id'),
    value: get(lessor, 'id'),
    label: getContactFullName(lessor),
    type: get(lessor, 'type'),
    first_name: get(lessor, 'first_name'),
    last_name: get(lessor, 'last_name'),
    name: get(lessor, 'name'),
  };
};

export const getContentUser = (user: Object) => {
  return {
    id: get(user, 'id'),
    value: get(user, 'id'),
    label: getUserFullName(user),
    first_name: get(user, 'first_name'),
    last_name: get(user, 'last_name'),
  };
};

const getContentInfillDevelopmentCompensations = (lease: Lease) => {
  return get(lease, 'infill_development_compensations', []).map((item) => {
    return {
      id: item.id,
      name: item.name,
    };
  });
};

export const getContentSummary = (lease: Object) => {
  return {
    lessor: getContentLessor(get(lease, 'lessor')),
    preparer: getContentUser(get(lease, 'preparer')),
    classification: get(lease, 'classification'),
    intended_use: get(lease, 'intended_use'),
    supportive_housing: get(lease, 'supportive_housing'),
    statistical_use: get(lease, 'statistical_use'),
    intended_use_note: get(lease, 'intended_use_note'),
    financing: get(lease, 'financing'),
    management: get(lease, 'management'),
    transferable: get(lease, 'transferable'),
    regulated: get(lease, 'regulated'),
    regulation: get(lease, 'regulation'),
    hitas: get(lease, 'hitas'),
    notice_period: get(lease, 'notice_period'),
    notice_note: get(lease, 'notice_note'),
    reference_number: get(lease, 'reference_number'),
    note: get(lease, 'note'),
    tenants: getContentTenants(lease).filter((tenant) => isTenantActive(get(tenant, 'tenant'))),
    lease_areas: getContentLeaseAreas(lease),
    constructability_areas: getContentConstructability(lease),
    infill_development_compensations: getContentInfillDevelopmentCompensations(lease),
  };
};

export const getContentRelatedLease = (content: Object, path: string = 'from_lease') => {
  return get(content, path, {});
};

const compareRelatedLeases = (a, b) => {
  const endDateA = get(a, 'lease.end_date');
  const endDateB = get(b, 'lease.end_date');
  const startDateA = get(a, 'lease.start_date');
  const startDateB = get(b, 'lease.start_date');

  if(endDateA !== endDateB) {
    if(!endDateA) {
      return -1;
    }
    if(!endDateB) {
      return 1;
    }
    if(endDateA > endDateB) {
      return -1;
    }
    if(endDateA < endDateB) {
      return 1;
    }
  }
  if(startDateA !== startDateB) {
    if(!startDateA) {
      return -1;
    }
    if(!startDateB) {
      return 1;
    }
    if(startDateA > startDateB) {
      return -1;
    }
    if(startDateA < startDateB) {
      return 1;
    }
  }
  return 0;
};

export const getContentRelatedLeasesFrom = (lease: Object) => {
  const relatedLeases = get(lease, 'related_leases.related_from', []);
  return relatedLeases.map((relatedLease) => {
    return {
      id: relatedLease.id,
      lease: getContentRelatedLease(relatedLease, 'from_lease'),
    };
  }).sort(compareRelatedLeases);
};

export const getContentRelatedLeasesTo = (lease: Object) => {
  const relatedLeases = get(lease, 'related_leases.related_to', []);
  return relatedLeases.map((relatedLease) => {
    return {
      id: relatedLease.id,
      lease: getContentRelatedLease(relatedLease, 'to_lease'),
    };
  }).sort(compareRelatedLeases);
};

export const getContentAddresses = (addresses: Array<Object>) => {
  if(isEmpty(addresses)) {
    return [];
  }
  return addresses.map((address) => {
    return {
      id: get(address, 'id'),
      address: get(address, 'address'),
      postal_code: get(address, 'postal_code'),
      city: get(address, 'city'),
    };
  });
};

export const getContentPlots = (plots: Array<Object>, inContract: boolean): Array<Object> => {
  if(!plots || !plots.length) {
    return [];
  }

  return plots.filter((plot) => plot.in_contract === inContract).map((plot) => {
    return {
      id: get(plot, 'id'),
      identifier: get(plot, 'identifier'),
      area: get(plot, 'area'),
      section_area: get(plot, 'section_area'),
      addresses: getContentAddresses(get(plot, 'addresses')),
      postal_code: get(plot, 'postal_code'),
      city: get(plot, 'city'),
      type: get(plot, 'type'),
      registration_date: get(plot, 'registration_date'),
      repeal_date: get(plot, 'repeal_date'),
      in_contract: get(plot, 'in_contract'),
    };
  });
};

export const getContentPlanUnits = (planunits: Array<Object>, inContract: boolean): Array<Object> => {
  if(!planunits || !planunits.length) {
    return [];
  }

  return planunits.filter((planunit) => planunit.in_contract === inContract).map((planunit) => {
    return {
      id: get(planunit, 'id'),
      identifier: get(planunit, 'identifier'),
      area: get(planunit, 'area'),
      section_area: get(planunit, 'section_area'),
      addresses: getContentAddresses(get(planunit, 'addresses')),
      postal_code: get(planunit, 'postal_code'),
      city: get(planunit, 'city'),
      type: get(planunit, 'type'),
      in_contract: get(planunit, 'in_contract'),
      plot_division_identifier: get(planunit, 'plot_division_identifier'),
      plot_division_date_of_approval: get(planunit, 'plot_division_date_of_approval'),
      plot_division_state: get(planunit, 'plot_division_state.id') || get(planunit, 'plot_division_state'),
      detailed_plan_identifier: get(planunit, 'detailed_plan_identifier'),
      detailed_plan_latest_processing_date: get(planunit, 'detailed_plan_latest_processing_date'),
      detailed_plan_latest_processing_date_note: get(planunit, 'detailed_plan_latest_processing_date_note'),
      plan_unit_type: get(planunit, 'plan_unit_type.id') || get(planunit, 'plan_unit_type'),
      plan_unit_state: get(planunit, 'plan_unit_state.id') || get(planunit, 'plan_unit_state'),
      plan_unit_intended_use: get(planunit, 'plan_unit_intended_use.id') || get(planunit, 'plan_unit_intended_use'),
    };
  });
};

export const getContentLeaseAreaItem = (area: Object) => {
  return {
    id: get(area, 'id'),
    identifier: get(area, 'identifier'),
    area: get(area, 'area'),
    section_area: get(area, 'section_area'),
    addresses: getContentAddresses(get(area, 'addresses')),
    postal_code: get(area, 'postal_code'),
    city: get(area, 'city'),
    type: get(area, 'type'),
    location: get(area, 'location'),
    plots_current: getContentPlots(get(area, 'plots'), false),
    plots_contract: getContentPlots(get(area, 'plots'), true),
    plan_units_current: getContentPlanUnits(get(area, 'plan_units'), false),
    plan_units_contract: getContentPlanUnits(get(area, 'plan_units'), true),
  };
};

export const getContentLeaseAreas = (lease: Object) => {
  const leaseAreas = get(lease, 'lease_areas', []);
  if(!leaseAreas || !leaseAreas.length) {
    return [];
  }

  return leaseAreas.map((area) => {
    return getContentLeaseAreaItem(area);
  });
};

export const getContentComments = (content: Array<Object>): Array<Object> => {
  if(!content || !content.length) {
    return [];
  }

  return content.map((comment) => {
    return {
      id: get(comment, 'id'),
      created_at: get(comment, 'created_at'),
      modified_at: get(comment, 'modified_at'),
      is_archived: get(comment, 'is_archived'),
      text: get(comment, 'text'),
      topic: get(comment, 'topic.id'),
      user: getContentUser(get(comment, 'user')),
      lease: get(comment, 'lease'),
    };
  });
};

export const getContentDecisionConditions = (decision: Object) => {
  const conditions = get(decision, 'conditions', []);
  if(!conditions.length) {
    return [];
  }

  return conditions.map((condition) => {
    return {
      id: get(condition, 'id'),
      type: get(condition, 'type.id') || get(condition, 'type'),
      supervision_date: get(condition, 'supervision_date'),
      supervised_date: get(condition, 'supervised_date'),
      description: get(condition, 'description'),
    };
  });
};

export const getContentDecisionItem = (decision: Object) => {
  return {
    id: get(decision, 'id'),
    reference_number: get(decision, 'reference_number'),
    decision_maker: get(decision, 'decision_maker.id') || get(decision, 'decision_maker'),
    decision_date: get(decision, 'decision_date'),
    section: get(decision, 'section'),
    type: get(decision, 'type.id') || get(decision, 'type'),
    description: get(decision, 'description'),
    conditions: getContentDecisionConditions(decision),
  };
};

export const getContentDecisions = (lease: Object) => {
  const decisions = get(lease, 'decisions', []);
  if(!decisions.length) {
    return [];
  }

  return decisions.map((decision) =>
    getContentDecisionItem(decision)
  );
};

export const getContentContractChanges = (contract: Object) => {
  const changes = get(contract, 'contract_changes', []);
  if(!changes.length) {
    return [];
  }

  return changes.map((change) => {
    return ({
      id: get(change, 'id'),
      signing_date: get(change, 'signing_date'),
      sign_by_date: get(change, 'sign_by_date'),
      first_call_sent: get(change, 'first_call_sent'),
      second_call_sent: get(change, 'second_call_sent'),
      third_call_sent: get(change, 'third_call_sent'),
      description: get(change, 'description'),
      decision: get(change, 'decision.id') || get(change, 'decision'),
    });
  });
};

export const getContentContractMortageDocuments = (contract: Object) => {
  const documents = get(contract, 'mortgage_documents', []);
  if(!documents.length) {
    return [];
  }

  return documents.map((document) => {
    return ({
      id: get(document, 'id'),
      number: get(document, 'number'),
      date: get(document, 'date'),
      note: get(document, 'note'),
    });
  });
};

export const getContentContractItem = (contract: Object) => {
  return {
    id: get(contract, 'id'),
    type: get(contract, 'type.id') || get(contract, 'type'),
    contract_number: get(contract, 'contract_number'),
    signing_date: get(contract, 'signing_date'),
    signing_note: get(contract, 'signing_note'),
    is_readjustment_decision: get(contract, 'is_readjustment_decision'),
    decision: get(contract, 'decision.id') || get(contract, 'decision'),
    ktj_link: get(contract, 'ktj_link'),
    collateral_number: get(contract, 'collateral_number'),
    collateral_start_date: get(contract, 'collateral_start_date'),
    collateral_end_date: get(contract, 'collateral_end_date'),
    collateral_note: get(contract, 'collateral_note'),
    institution_identifier: get(contract, 'institution_identifier'),
    contract_changes: getContentContractChanges(contract),
    mortgage_documents: getContentContractMortageDocuments(contract),
  };
};

export const getContentContracts = (lease: Object) => {
  const contracts = get(lease, 'contracts', []);
  if(!contracts || contracts.length === 0) {
    return [];
  }

  return contracts.map((contract) =>
    getContentContractItem(contract)
  );
};

export const getContentInspectionItem = (inspection: Object) => {
  return {
    id: get(inspection, 'id'),
    inspector: get(inspection, 'inspector'),
    supervision_date: get(inspection, 'supervision_date'),
    supervised_date: get(inspection, 'supervised_date'),
    description: get(inspection, 'description'),
  };
};

export const getContentInspections = (lease: Object) => {
  const inspections = get(lease, 'inspections', []);
  if(!inspections.length) {
    return [];
  }

  return inspections.map((inspection) =>
    getContentInspectionItem(inspection)
  );
};

export const getContentConstructabilityDescriptions = (area: Object, type: string) => {
  const descriptions = get(area, 'constructability_descriptions', []);
  if(!descriptions.length) {
    return [];
  }

  return descriptions.filter((description) => description.type === type).map((description) => {
    return {
      id: get(description, 'id'),
      type: get(description, 'type'),
      user: getContentUser(get(description, 'user')),
      text: get(description, 'text'),
      ahjo_reference_number: get(description, 'ahjo_reference_number'),
      modified_at: get(description, 'modified_at'),
    };
  });
};

export const getContentConstructability = (lease: Object) => {
  const lease_areas = get(lease, 'lease_areas', []);
  if(!lease_areas.length) {
    return [];
  }

  return lease_areas.map((area) => {
    return {
      id: get(area, 'id'),
      identifier: get(area, 'identifier'),
      type: get(area, 'type'),
      location: get(area, 'location'),
      area: get(area, 'area'),
      section_area: get(area, 'section_area'),
      address: get(area, 'address'),
      postal_code: get(area, 'postal_code'),
      city: get(area, 'city'),
      preconstruction_state: get(area, 'preconstruction_state'),
      demolition_state: get(area, 'demolition_state'),
      polluted_land_state: get(area, 'polluted_land_state'),
      polluted_land_rent_condition_state: get(area, 'polluted_land_rent_condition_state'),
      polluted_land_rent_condition_date: get(area, 'polluted_land_rent_condition_date'),
      polluted_land_planner: getContentUser(get(area, 'polluted_land_planner')),
      polluted_land_projectwise_number: get(area, 'polluted_land_projectwise_number'),
      polluted_land_matti_report_number: get(area, 'polluted_land_matti_report_number'),
      constructability_report_state: get(area, 'constructability_report_state'),
      constructability_report_investigation_state: get(area, 'constructability_report_investigation_state'),
      constructability_report_signing_date: get(area, 'constructability_report_signing_date'),
      constructability_report_signer: get(area, 'constructability_report_signer'),
      constructability_report_geotechnical_number: get(area, 'constructability_report_geotechnical_number'),
      other_state: get(area, 'other_state'),
      descriptionsPreconstruction: getContentConstructabilityDescriptions(area, ConstructabilityType.PRECONSTRUCTION),
      descriptionsDemolition: getContentConstructabilityDescriptions(area, ConstructabilityType.DEMOLITION),
      descriptionsPollutedLand: getContentConstructabilityDescriptions(area, ConstructabilityType.POLLUTED_LAND),
      descriptionsReport: getContentConstructabilityDescriptions(area, ConstructabilityType.REPORT),
      descriptionsOther: getContentConstructabilityDescriptions(area, ConstructabilityType.OTHER),
    };
  });
};

export const getContentTenantItem = (tenant: Object) => {
  const contacts = get(tenant, 'tenantcontact_set', []);
  const contact = contacts.find(x => x.type === TenantContactType.TENANT);
  if(!contact) {
    return {};
  }
  return {
    id: get(contact, 'id'),
    type: get(contact, 'type'),
    contact: getContentContact(get(contact, 'contact')),
    start_date: get(contact, 'start_date'),
    end_date: get(contact, 'end_date'),
  };
};

export const getContentTenantContactSet = (tenant: Object) => {
  const contacts = get(tenant, 'tenantcontact_set', []).filter((x) => x.type !== TenantContactType.TENANT);

  return contacts.map((contact) => {
    return {
      id: get(contact, 'id'),
      type: get(contact, 'type'),
      contact: getContentContact(get(contact, 'contact')),
      start_date: get(contact, 'start_date'),
      end_date: get(contact, 'end_date'),
    };
  }).sort((a, b) => sortStringByKeyDesc(a, b, 'start_date'));
};

export const getContentTenants = (lease: Object) => {
  return get(lease, 'tenants', []).map((tenant) => {
    return {
      id: get(tenant, 'id'),
      share_numerator: get(tenant, 'share_numerator'),
      share_denominator: get(tenant, 'share_denominator'),
      reference: get(tenant, 'reference'),
      tenant: getContentTenantItem(tenant),
      tenantcontact_set: getContentTenantContactSet(tenant),
    };
  }).sort((a, b) => sortStringByKeyDesc(a, b, 'tenant.start_date'));
};

export const getContentTenantsFormData = (lease: Object) => {
  const tenants = getContentTenants(lease);
  return {
    tenants: tenants.filter((tenant) => !isTenantArchived(tenant.tenant)),
    tenantsArchived: tenants.filter((tenant) => isTenantArchived(tenant.tenant)),
  };
};

export const getContentPayableRents = (rent: Object) => {
  const items = get(rent, 'payable_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      amount: get(item, 'amount'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
      difference_percent: get(item, 'difference_percent'),
      calendar_year_rent: get(item, 'calendar_year_rent'),
    };
  });
};

export const getContentRentAdjustments = (rent: Object) => {
  const items = get(rent, 'rent_adjustments', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      type: get(item, 'type'),
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
      full_amount: get(item, 'full_amount'),
      amount_type: get(item, 'amount_type.id') || get(item, 'amount_type'),
      amount_left: get(item, 'amount_left'),
      decision: get(item, 'decision.id') || get(item, 'decision'),
      note: get(item, 'note'),
    };
  });
};

export const getContentIndexAdjustedRents = (rent: Object) => {
  const items = get(rent, 'index_adjusted_rents', []);

  return items.map((item) => {
    return {
      item: item.id || undefined,
      amount: get(item, 'amount'),
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
      factor: get(item, 'factor'),
    };
  });
};

export const getContentContractRents = (rent: Object) => {
  const items = get(rent, 'contract_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      amount: get(item, 'amount'),
      period: get(item, 'period'),
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      base_amount: get(item, 'base_amount'),
      base_amount_period: get(item, 'base_amount_period'),
      base_year_rent: get(item, 'base_year_rent'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
    };
  });
};

export const getContentFixedInitialYearRents = (rent: Object) => {
  const items = get(rent, 'fixed_initial_year_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      amount: get(item, 'amount'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
    };
  });
};

export const getContentRentDueDate = (rent: Object, path?: string = 'due_dates') => {
  const dueDates = get(rent, path, []);
  return dueDates.map((date) => {
    return {
      id: date.id || undefined,
      day: get(date, 'day'),
      month: get(date, 'month'),
    };
  });
};

export const getContentRents = (lease: Object) => {
  return get(lease, 'rents', []).map((rent) => {
    return {
      id: rent.id || undefined,
      type: get(rent, 'type'),
      start_date: get(rent, 'start_date'),
      end_date: get(rent, 'end_date'),
      cycle: get(rent, 'cycle'),
      index_type: get(rent, 'index_type'),
      due_dates_type: get(rent, 'due_dates_type'),
      due_dates_per_year: get(rent, 'due_dates_per_year'),
      elementary_index: get(rent, 'elementary_index'),
      index_rounding: get(rent, 'index_rounding'),
      x_value: get(rent, 'x_value'),
      y_value: get(rent, 'y_value'),
      y_value_start: get(rent, 'y_value_start'),
      equalization_start_date: get(rent, 'equalization_start_date'),
      equalization_end_date: get(rent, 'equalization_end_date'),
      amount: get(rent, 'amount'),
      note: get(rent, 'note'),
      is_active: get(rent, 'is_active'),
      due_dates: getContentRentDueDate(rent),
      fixed_initial_year_rents: getContentFixedInitialYearRents(rent),
      contract_rents: getContentContractRents(rent),
      index_adjusted_rents: getContentIndexAdjustedRents(rent),
      rent_adjustments: getContentRentAdjustments(rent),
      payable_rents: getContentPayableRents(rent).sort(sortByStartDateDesc),
      yearly_due_dates: getContentRentDueDate(rent, 'yearly_due_dates'),
    };
  }).sort((a, b) => sortStringByKeyDesc(a, b, 'start_date'));
};

export const getContentRentsFormData = (lease: Object) => {
  const rents = getContentRents(lease);

  return {
    rents: rents.filter((rent) => !isRentArchived(rent)),
    rentsArchived: rents.filter((rent) => isRentArchived(rent)),
  };
};

export const getContentBasisOfRents = (lease: Object) => {
  const items = get(lease, 'basis_of_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      floor_m2: get(item, 'floor_m2'),
      index: get(item, 'index'),
      amount_per_floor_m2_index_100: get(item, 'amount_per_floor_m2_index_100'),
      amount_per_floor_m2_index: get(item, 'amount_per_floor_m2_index'),
      percent: get(item, 'percent'),
      year_rent_index_100: get(item, 'year_rent_index_100'),
      year_rent_index: get(item, 'year_rent_index'),
    };
  });
};


// OLD HELPER FUNCTIONS
//TODO: Remove mock data helper function when contruction eligibility tab is added to API
export const getFullAddress = (item: Object) => {
  if(isEmpty(item)) {
    return null;
  }
  return `${item.address || ''}${(item.postal_code || item.city) ? ', ' : ''}
    ${item.postal_code || ''} ${item.city || ''}`;
};

export const getLeasesFilteredByDocumentType = (items: Array<Object>, documentTypes: Array<string>): Array<Object> => {
  if(!documentTypes || !documentTypes.length) {
    return items;
  }
  return items.filter((item) => {
    return documentTypes.indexOf(item.state) !== -1;
  });

};

export const getInvoiceRecipientOptions = (lease: Object) =>{
  const items = getContentTenants(lease);

  return [
    {value: RecipientOptions.ALL, label: 'Kaikki'}, ...items
      .filter((item) => isTenantActive(item.tenant))
      .map((item) => {
        return {
          value: get(item, 'tenant.contact.id'),
          label: getContactFullName(get(item, 'tenant.contact')),
        };
      })
      .sort((a, b) => sortStringByKeyAsc(a, b, 'label')),
  ];
};

export const getInvoiceTenantOptions = (lease: Object) =>{
  const items = getContentTenants(lease);
  return items.map((item) => {
    return {
      value: item.id,
      label: getContactFullName(get(item, 'tenant.contact')),
    };
  });
};

export const addLeaseInfoFormValues = (payload: Object, leaseInfo: Object) => {
  payload.state = get(leaseInfo, 'state');
  payload.start_date = get(leaseInfo, 'start_date');
  payload.end_date = get(leaseInfo, 'end_date');
  return payload;
};

export const addSummaryFormValues = (payload: Object, summary: Object) => {
  payload.lessor = get(summary, 'lessor.value');
  payload.preparer = get(summary, 'preparer.value');
  payload.classification = get(summary, 'classification');
  payload.intended_use = get(summary, 'intended_use');
  payload.supportive_housing = get(summary, 'supportive_housing');
  payload.statistical_use = get(summary, 'statistical_use');
  payload.intended_use_note = get(summary, 'intended_use_note');
  payload.financing = get(summary, 'financing');
  payload.management = get(summary, 'management');
  payload.transferable = get(summary, 'transferable');
  payload.regulated = get(summary, 'regulated');
  payload.regulation = get(summary, 'regulation');
  payload.hitas = get(summary, 'hitas');
  payload.notice_period = get(summary, 'notice_period');
  payload.notice_note = get(summary, 'notice_note');
  payload.reference_number = get(summary, 'reference_number');
  payload.note = get(summary, 'note');
  return payload;
};

const getAddressesForDb = (addresses: Array<Object>) => {
  return addresses.map((address) => {
    return {
      id: address.id || undefined,
      address: get(address, 'address'),
      postal_code: get(address, 'postal_code'),
      city: get(address, 'city'),
    };
  });
};

const getPlotsForDb = (area: Object) => {
  const currentPlots = get(area, 'plots_current', []).map((plot) => {
    plot.in_contract = false;
    return plot;
  });
  const contractPlots = get(area, 'plots_contract', []).map((plot) => {
    plot.in_contract = true;
    return plot;
  });
  const plots = currentPlots.concat(contractPlots);
  if(!plots.length) {
    return [];
  }
  return plots.map((plot) => {
    return {
      id: plot.id || undefined,
      identifier: get(plot, 'identifier'),
      area: formatDecimalNumberForDb(get(plot, 'area')),
      section_area: formatDecimalNumberForDb(get(plot, 'section_area')),
      addresses: getAddressesForDb(get(plot, 'addresses')),
      postal_code: get(plot, 'postal_code'),
      city: get(plot, 'city'),
      type: get(plot, 'type'),
      location: get(plot, 'location'),
      registration_date: get(plot, 'registration_date'),
      repeal_date: get(plot, 'repeal_date'),
      in_contract: get(plot, 'in_contract'),
    };
  });
};

const getPlanUnitsForDb = (area: Object) => {
  const currentPlanUnits = get(area, 'plan_units_current', []).map((planunit) => {
    planunit.in_contract = false;
    return planunit;
  });
  const contractPlanUnits = get(area, 'plan_units_contract', []).map((planunit) => {
    planunit.in_contract = true;
    return planunit;
  });
  const planUnits = currentPlanUnits.concat(contractPlanUnits);
  if(!planUnits.length) {
    return [];
  }
  return planUnits.map((planunit) => {
    return {
      id: planunit.id || undefined,
      identifier: get(planunit, 'identifier'),
      area: formatDecimalNumberForDb(get(planunit, 'area')),
      section_area: formatDecimalNumberForDb(get(planunit, 'section_area')),
      addresses: getAddressesForDb(get(planunit, 'addresses')),
      postal_code: get(planunit, 'postal_code'),
      city: get(planunit, 'city'),
      type: get(planunit, 'type'),
      in_contract: get(planunit, 'in_contract'),
      plot_division_identifier: get(planunit, 'plot_division_identifier'),
      plot_division_date_of_approval: get(planunit, 'plot_division_date_of_approval'),
      plot_division_state: get(planunit, 'plot_division_state'),
      detailed_plan_identifier: get(planunit, 'detailed_plan_identifier'),
      detailed_plan_latest_processing_date: get(planunit, 'detailed_plan_latest_processing_date'),
      detailed_plan_latest_processing_date_note: get(planunit, 'detailed_plan_latest_processing_date_note'),
      plan_unit_type: get(planunit, 'plan_unit_type'),
      plan_unit_state: get(planunit, 'plan_unit_state'),
      plan_unit_intended_use: get(planunit, 'plan_unit_intended_use'),
    };
  });
};

export const addAreasFormValues = (payload: Object, values: Object) => {
  const areas = get(values, 'lease_areas', []);
  if(!areas.length) {
    payload.lease_areas = [];
  } else {
    payload.lease_areas = areas.map((area) => {
      return {
        id: area.id || undefined,
        identifier: get(area, 'identifier'),
        area: formatDecimalNumberForDb(get(area, 'area')),
        section_area: formatDecimalNumberForDb(get(area, 'area')),
        addresses: getAddressesForDb(get(area, 'addresses')),
        postal_code: get(area, 'postal_code'),
        city: get(area, 'city'),
        type: get(area, 'type'),
        location: get(area, 'location'),
        plots: getPlotsForDb(area),
        plan_units: getPlanUnitsForDb(area),
      };
    });
  }

  return payload;
};

const getDecisionConditionsForDb = (decision: Object) => {
  const conditions = get(decision, 'conditions', []);
  if(!conditions.length) {
    return [];
  }
  return conditions.map((condition) => {
    return {
      id: condition.id || undefined,
      type: get(condition, 'type'),
      supervision_date: get(condition, 'supervision_date'),
      supervised_date: get(condition, 'supervised_date'),
      description: get(condition, 'description'),
    };
  });
};

export const addDecisionsFormValues = (payload: Object, values: Object) => {
  const decisions = get(values, 'decisions', []);
  if(!decisions.length) {
    payload.decisions = [];
  } else {
    payload.decisions = decisions.map((decision) => {
      return {
        id: decision.id || undefined,
        reference_number: get(decision, 'reference_number'),
        decision_maker: get(decision, 'decision_maker'),
        decision_date: get(decision, 'decision_date'),
        section: get(decision, 'section'),
        type: get(decision, 'type'),
        description: get(decision, 'description'),
        conditions: getDecisionConditionsForDb(decision),
      };
    });
  }

  return payload;
};

const getContractMortgageDocumentsForDb = (contract: Object) => {
  const documents = get(contract, 'mortgage_documents', []);
  if(!documents.length) {
    return [];
  }
  return documents.map((doc) => {
    return {
      id: doc.id || undefined,
      number: get(doc, 'number'),
      date: get(doc, 'date'),
      note: get(doc, 'note'),
    };
  });
};

const getContractChangesForDb = (contract: Object) => {
  const changes = get(contract, 'contract_changes', []);
  if(!changes.length) {
    return [];
  }
  return changes.map((change) => {
    return {
      id: change.id || undefined,
      signing_date: get(change, 'signing_date'),
      sign_by_date: get(change, 'sign_by_date'),
      first_call_sent: get(change, 'first_call_sent'),
      second_call_sent: get(change, 'second_call_sent'),
      third_call_sent: get(change, 'third_call_sent'),
      description: get(change, 'description'),
      decision: get(change, 'decision'),
    };
  });
};

export const addContractsFormValues = (payload: Object, values: Object) => {
  const contracts = get(values, 'contracts', []);
  if(!contracts.length) {
    payload.contracts = [];
  } else {
    payload.contracts = contracts.map((contract) => {
      return {
        id: contract.id || undefined,
        type: get(contract, 'type'),
        contract_number: get(contract, 'contract_number'),
        signing_date: get(contract, 'signing_date'),
        signing_note: get(contract, 'signing_note'),
        is_readjustment_decision: get(contract, 'is_readjustment_decision'),
        decision: get(contract, 'decision'),
        ktj_link: get(contract, 'ktj_link'),
        collateral_number: get(contract, 'collateral_number'),
        collateral_start_date: get(contract, 'collateral_start_date'),
        collateral_end_date: get(contract, 'collateral_end_date'),
        collateral_note: get(contract, 'collateral_note'),
        institution_identifier: get(contract, 'institution_identifier'),
        contract_changes: getContractChangesForDb(contract),
        mortgage_documents: getContractMortgageDocumentsForDb(contract),
      };
    });
  }

  return payload;
};

export const addInspectionsFormValues = (payload: Object, values: Object) => {
  const inspections = get(values, 'inspections', []);
  if(!inspections.length) {
    payload.inspections = [];
  } else {
    payload.inspections = inspections.map((inspection) => {
      return {
        id: inspection.id || undefined,
        inspector: get(inspection, 'inspector'),
        supervision_date: get(inspection, 'supervision_date'),
        supervised_date: get(inspection, 'supervised_date'),
        description: get(inspection, 'description'),
      };
    });
  }

  return payload;
};

export const getConstructabilityDescriptionsForDb = (area: Object) => {
  const descriptionsPreconstruction = get(area, 'descriptionsPreconstruction', []).map((description) => {
    description.type = ConstructabilityType.PRECONSTRUCTION;
    return description;
  });
  const descriptionsDemolition = get(area, 'descriptionsDemolition', []).map((description) => {
    description.type = ConstructabilityType.DEMOLITION;
    return description;
  });
  const descriptionsPollutedLand = get(area, 'descriptionsPollutedLand', []).map((description) => {
    description.type = ConstructabilityType.POLLUTED_LAND;
    return description;
  });
  const descriptionsReport = get(area, 'descriptionsReport', []).map((description) => {
    description.type = ConstructabilityType.REPORT;
    return description;
  });
  const descriptionsOther = get(area, 'descriptionsOther', []).map((description) => {
    description.type = ConstructabilityType.OTHER;
    return description;
  });
  const descriptions = [
    ...descriptionsPreconstruction,
    ...descriptionsDemolition,
    ...descriptionsPollutedLand,
    ...descriptionsReport,
    ...descriptionsOther,
  ];

  if(!descriptions.length) {
    return [];
  }
  return descriptions.map((description) => {
    return {
      id: description.id || undefined,
      type: get(description, 'type'),
      text: get(description, 'text'),
      ahjo_reference_number: get(description, 'ahjo_reference_number'),
    };
  });
};

export const getConstructabilityItemForDb = (area: Object, values: Object) => {
  area.preconstruction_state = get(values, 'preconstruction_state');
  area.demolition_state = get(values, 'demolition_state');
  area.polluted_land_state = get(values, 'polluted_land_state');
  area.polluted_land_rent_condition_state = get(values, 'polluted_land_rent_condition_state');
  area.polluted_land_rent_condition_date = get(values, 'polluted_land_rent_condition_date');
  area.polluted_land_planner = get(values, 'polluted_land_planner.value');
  area.polluted_land_projectwise_number = get(values, 'polluted_land_projectwise_number');
  area.polluted_land_matti_report_number = get(values, 'polluted_land_matti_report_number');
  area.constructability_report_state = get(values, 'constructability_report_state');
  area.constructability_report_investigation_state = get(values, 'constructability_report_investigation_state');
  area.constructability_report_signing_date = get(values, 'constructability_report_signing_date');
  area.constructability_report_signer = get(values, 'constructability_report_signer');
  area.constructability_report_geotechnical_number = get(values, 'constructability_report_geotechnical_number');
  area.other_state = get(values, 'other_state');
  area.constructability_descriptions = getConstructabilityDescriptionsForDb(values);
  return area;
};

export const addConstructabilityFormValues = (payload: Object, values: Object) => {
  const areas = payload.lease_areas;
  const constAreas = get(values, 'lease_areas', []);
  if(areas && !!areas.length) {
    payload.lease_areas = areas.map((area) => {
      const constArea = constAreas.find(x => x.id === area.id);
      if(constArea) {
        return getConstructabilityItemForDb(area, constArea);
      }
      return area;
    });
  } else if(constAreas && !!constAreas.length) {
    payload.lease_areas = constAreas.map((area) => {
      return getConstructabilityItemForDb({
        id: area.id,
        city: area.city,
        location: area.location,
        area: area.area,
        identifier: area.identifier,
        type: area.type,
        address: area.address,
        postal_code: area.postal_code,
        section_area: area.section_area,
      }, area);
    });
  } else {
    payload.lease_areas = [];
  }
  return payload;
};

export const getTenantContactSetForDb = (tenant: Object) => {
  let contacts = [];
  const tenantData = get(tenant, 'tenant');
  contacts.push({
    id: tenantData.id || undefined,
    type: TenantContactType.TENANT,
    contact: get(tenantData, 'contact'),
    start_date: get(tenantData, 'start_date'),
    end_date: get(tenantData, 'end_date'),
  });

  const otherPersons = get(tenant, 'tenantcontact_set', []);
  forEach(otherPersons, (person) => {
    contacts.push({
      id: person.id || undefined,
      type: get(person, 'type'),
      contact: get(person, 'contact'),
      start_date: get(person, 'start_date'),
      end_date: get(person, 'end_date'),
    });
  });
  return contacts;
};

export const addTenantsFormValues = (payload: Object, values: Object) => {
  const tenantsCurrent = get(values, 'tenants.tenants', []);
  const tenantsArchived = get(values, 'tenants.tenantsArchived', []);
  const tenants = [...tenantsCurrent, ...tenantsArchived];

  if(!tenants.length) {
    payload.tenants = [];
  } else {
    payload.tenants = tenants.map((tenant) => {
      return {
        id: tenant.id || undefined,
        share_numerator: get(tenant, 'share_numerator'),
        share_denominator: get(tenant, 'share_denominator'),
        reference: get(tenant, 'reference'),
        tenantcontact_set: getTenantContactSetForDb(tenant),
      };
    });
  }

  return payload;
};

export const getContentRentAdjustmentsForDb = (rent: Object) => {
  const items = get(rent, 'rent_adjustments', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      type: get(item, 'type'),
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
      full_amount: formatDecimalNumberForDb(get(item, 'full_amount')),
      amount_type: get(item, 'amount_type.id') || get(item, 'amount_type'),
      amount_left: formatDecimalNumberForDb(get(item, 'amount_left')),
      decision: get(item, 'decision.id') || get(item, 'decision'),
      note: get(item, 'note'),
    };
  });
};

export const getContentContractRentsForDb = (rent: Object) => {
  const items = get(rent, 'contract_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      amount: formatDecimalNumberForDb(get(item, 'amount')),
      period: get(item, 'period'),
      intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
      base_amount: formatDecimalNumberForDb(get(item, 'base_amount')),
      base_amount_period: get(item, 'base_amount_period'),
      base_year_rent: formatDecimalNumberForDb(get(item, 'base_year_rent')),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
    };
  });
};

export const getContentFixedInitialYearRentsForDb = (rent: Object) => {
  const items = get(rent, 'fixed_initial_year_rents', []);

  return items.map((item) => {
    return {
      id: item.id || undefined,
      intended_use: get(item, 'intended_use'),
      amount: formatDecimalNumberForDb(get(item, 'amount')),
      start_date: get(item, 'start_date'),
      end_date: get(item, 'end_date'),
    };
  });
};

export const getContentRentDueDatesForDb = (rent: Object) => {
  const dueDates = get(rent, 'due_dates', []);

  return dueDates.map((date) => {
    return {
      id: date.id || undefined,
      day: get(date, 'day'),
      month: get(date, 'month'),
    };
  });
};

export const addRentsFormValues = (payload: Object, values: Object) => {
  payload.is_rent_info_complete = values.is_rent_info_complete ? true : false;

  const basisOfRents = get(values, 'basis_of_rents', {});
  if(!basisOfRents.length) {
    payload.basis_of_rents = [];
  } else {
    payload.basis_of_rents = basisOfRents.map((item) => {
      return {
        id: item.id || undefined,
        intended_use: get(item, 'intended_use.id') || get(item, 'intended_use'),
        floor_m2: formatDecimalNumberForDb(get(item, 'floor_m2')),
        index: get(item, 'index'),
        amount_per_floor_m2_index_100: formatDecimalNumberForDb(get(item, 'amount_per_floor_m2_index_100')),
        amount_per_floor_m2_index: get(item, 'amount_per_floor_m2_index'),
        percent: formatDecimalNumberForDb(get(item, 'percent')),
        year_rent_index_100: get(item, 'year_rent_index_100'),
        year_rent_index: get(item, 'year_rent_index'),
      };
    });
  }
  const rentsCurrent = get(values, 'rents.rents', []);
  const rentsArchived = get(values, 'rents.rentsArchived', []);
  const rents = [...rentsCurrent, ...rentsArchived];

  payload.rents = rents.map((rent) => {
    return {
      id: rent.id || undefined,
      type: get(rent, 'type'),
      start_date: get(rent, 'start_date'),
      end_date: get(rent, 'end_date'),
      cycle: get(rent, 'cycle'),
      index_type: get(rent, 'index_type'),
      due_dates_type: get(rent, 'due_dates_type'),
      due_dates_per_year: get(rent, 'due_dates_per_year'),
      elementary_index: get(rent, 'elementary_index'),
      index_rounding: get(rent, 'index_rounding'),
      x_value: get(rent, 'x_value'),
      y_value: get(rent, 'y_value'),
      y_value_start: get(rent, 'y_value_start'),
      equalization_start_date: get(rent, 'equalization_start_date'),
      equalization_end_date: get(rent, 'equalization_end_date'),
      amount: formatDecimalNumberForDb(get(rent, 'amount')),
      note: get(rent, 'note'),
      is_active: get(rent, 'is_active'),
      due_dates: getContentRentDueDatesForDb(rent),
      fixed_initial_year_rents: getContentFixedInitialYearRentsForDb(rent),
      contract_rents: getContentContractRentsForDb(rent),
      rent_adjustments: getContentRentAdjustmentsForDb(rent),
    };
  });

  return payload;
};

// GERERIC LEASE HELPER FUNCTIONS
export const getAreasSum = (areas: Array<Object>) => {
  let areasSum = 0;

  if(areas && !!areas.length) {
    forEach(areas, (area) => {
      areasSum += area.area;
    });
  }
  return areasSum;
};

export const isContractActive = (contract: Object) => {
  const now = moment();
  const startDate = get(contract, 'collateral_start_date');
  const endDate = get(contract, 'collateral_end_date');

  if(startDate && moment(startDate).isAfter(now, 'day') || endDate && now.isAfter(endDate, 'day')) {
    return false;
  }

  return true;
};

export const isRentActive = (rent: ?Object) => {
  const now = moment();
  const startDate = get(rent, 'start_date');
  const endDate = get(rent, 'end_date');

  if(startDate && moment(startDate).isAfter(now, 'day') || endDate && now.isAfter(endDate, 'day')) {
    return false;
  }

  return true;
};

export const isRentArchived = (rent: Object) => {
  const now = moment();
  const endDate = get(rent, 'end_date');

  if(endDate && now.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

export const isTenantActive = (tenant: ?Object) => {
  const now = moment();
  const startDate = get(tenant, 'start_date');
  const endDate = get(tenant, 'end_date');

  if(startDate && moment(startDate).isAfter(now, 'day') || endDate && now.isAfter(endDate, 'day')) {
    return false;
  }

  return true;
};

export const isTenantArchived = (tenant: ?Object) => {
  const now = moment();
  const endDate = get(tenant, 'end_date');

  if(endDate && now.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

export const clearUnsavedChanges = () => {
  removeSessionStorageItem(FormNames.CONSTRUCTABILITY);
  removeSessionStorageItem(FormNames.CONTRACTS);
  removeSessionStorageItem(FormNames.DECISIONS);
  removeSessionStorageItem(FormNames.INSPECTIONS);
  removeSessionStorageItem(FormNames.LEASE_AREAS);
  removeSessionStorageItem(FormNames.LEASE_INFO);
  removeSessionStorageItem(FormNames.RENTS);
  removeSessionStorageItem(FormNames.SUMMARY);
  removeSessionStorageItem(FormNames.TENANTS);
  removeSessionStorageItem('leaseId');
};

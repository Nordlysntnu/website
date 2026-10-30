export const ALL_MEMBERS = 'All members';

const membershipMarkers = new Set(['All active members']);
const groupAliases = new Map([['aero- and composites', 'aero & composites']]);

function normalizeGroupName(name) {
  const normalized = name.trim().toLowerCase();
  return groupAliases.get(normalized) ?? normalized;
}

export function buildProjects(profiles, definitions) {
  const profilesById = new Map();
  for (const profile of profiles) {
    if (!Number.isSafeInteger(profile.id) || profile.id <= 0 || profilesById.has(profile.id)) {
      throw new Error(`Member IDs must be unique positive integers: ${profile.id}`);
    }
    profilesById.set(profile.id, profile);
  }

  if (definitions.length === 0) {
    throw new Error('At least one team project is required');
  }

  const years = new Set();
  return definitions.map(definition => {
    if (!Number.isSafeInteger(definition.year) || years.has(definition.year)) {
      throw new Error(`Project years must be unique integers: ${definition.year}`);
    }
    years.add(definition.year);

    const groups = new Set(definition.groups);
    if (groups.size !== definition.groups.length || definition.groups.some(group =>
      typeof group !== 'string' || !group.trim() || group === ALL_MEMBERS || membershipMarkers.has(group)
    )) {
      throw new Error(`Invalid group list for Project ${definition.year}`);
    }

    const memberIds = new Set();
    const members = definition.members.map(membership => {
      const profile = profilesById.get(membership.id);
      if (!profile) {
        throw new Error(`Unknown member ${membership.id} in Project ${definition.year}`);
      }
      if (memberIds.has(membership.id)) {
        throw new Error(`Duplicate member ${membership.id} in Project ${definition.year}`);
      }
      memberIds.add(membership.id);

      if (!Array.isArray(membership.group) || membership.group.some(group =>
        !groups.has(group) && !membershipMarkers.has(group)
      )) {
        throw new Error(`Unknown group for member ${membership.id} in Project ${definition.year}`);
      }

      return { ...profile, ...membership };
    });

    return { ...definition, members };
  }).sort((a, b) => b.year - a.year);
}

export function getProjectGroups(project) {
  return [ALL_MEMBERS, ...project.groups];
}

export function selectProject(projects, yearQuery, groupQuery) {
  const year = typeof yearQuery === 'string' || typeof yearQuery === 'number'
    ? Number(yearQuery)
    : NaN;
  const requestedProject = projects.find(project => project.year === year);
  if (requestedProject) return requestedProject;

  // Existing links without a year still open a project that contains the group.
  if (yearQuery === undefined && typeof groupQuery === 'string') {
    const group = normalizeGroupName(groupQuery);
    const matchingProject = projects.find(project =>
      project.groups.some(name => normalizeGroupName(name) === group)
    );
    if (matchingProject) return matchingProject;
  }

  return projects[0];
}

export function selectGroup(project, groupQuery) {
  if (typeof groupQuery !== 'string') return ALL_MEMBERS;
  const group = normalizeGroupName(groupQuery);
  return getProjectGroups(project).find(name => normalizeGroupName(name) === group) ?? ALL_MEMBERS;
}

export function getGroupMembers(project, group) {
  return project.members.filter(member => member.group.includes(group));
}

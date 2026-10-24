# Team data

Member profiles live in `members.json`. Each project has a separate file in `projects/`, containing its groups, roles and member IDs. The team page uses the selected project's data.

`projects/2027.json` contains the new team's groups and memberships. Add the remaining roster there as it becomes available. Projects without members display "Team overview coming soon."

## Updating a member

Edit the person's name, photos and contact details in `members.json`. IDs must be unique positive integers and stay the same when a member returns for another year. Several existing records have the same name but different roles; match records by ID.

The existing `project` field is historical metadata carried over from the old file. It does not choose which year a person appears under. Displayed membership comes from the files in `projects/`.

Edit the title and groups for a specific year in that project's file. A member can belong to several groups, but their ID must appear only once in each project's member list.

Keep previous project memberships when adding a returning member to a new project.

## Adding a project

1. Add any new profiles to `members.json`, using unused IDs.
2. Add a JSON file in `projects/` with the project's year, name, ordered group list and memberships.
3. Import the file in `projects.js` and include it in the call to `buildProjects`.

For example, a future project file could contain:

```json
{
  "year": 2028,
  "name": "Project 2028",
  "groups": ["Electrical"],
  "members": [
    {
      "id": 200,
      "title": "Electrical Engineer",
      "group": ["Electrical"]
    }
  ]
}
```

This is an example, not a confirmed roster. ID 200 would first need a corresponding profile.

The newest project is selected by default. Its group list controls the menu order. `All members` is added automatically. The legacy `All active members` tag is kept in memberships but is not a menu entry. Include `Alumni` or `Technical advisor` in a project's groups when that year has those memberships.

The year selector applies to individual groups as well as the full team. If a group does not exist in the next selected year, the page switches to `All members`.

Links can select a project and group, for example `/team?year=2025&group=software`. Existing group links without a year open the newest project containing that group.

## Checking changes

From the repository root:

```bash
npm run test:team
npm run build
```

The data loader rejects duplicate IDs, missing profiles, duplicate years and memberships pointing to undeclared groups. Also check the team page on desktop and mobile, including year changes, group changes, photos and contact links.

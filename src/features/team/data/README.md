# Team data

Member profiles live in `members.json`. Each project has a separate file in `projects/`, containing its groups, roles and member IDs. The team page uses the selected project's data.

Members awaiting photos use `/members/2027/photo-coming-soon.svg`, a shared neutral silhouette in Nordlys colours with the text "Photo coming soon". Natalie, Yazan, Oskar, Elias Hatleskog, Steve Völler and Rafael Bölsterli currently use it; their names, roles and contacts display normally. Replace their `image` and `fullImage` paths when portraits arrive.

`projects/2027.json` contains the new team's groups and memberships. Add the remaining roster there as it becomes available. Projects without members display "Team overview coming soon."

The current 2027 roster contains 40 team members and three technical advisors from the supplied team list. All supplied photos have been added: ten returning members reuse their 2026 photos, Can keeps his approved 2027 portrait, 25 members have matching new 2027 portraits, and Shivaraj reuses his existing advisor portrait. This gives 37 profiles with photos and six with the existing placeholder. The supplied file named `nicholas .cr2` is confirmed to show Nicolas Storbekkrønning and is used only for Nicolas's profile.

Supplied titles and contacts come from the completed contact table; blank contact fields preserve existing information. Ordinary 2027 members use their group name followed by `Member`, such as `Electrical Member` and `Software Member`, rather than Engineer or Developer titles. Keep confirmed leadership, Board and named Business roles, such as Key Account Manager and Event Manager. Tobias is Project Leader. Jonas, Andrei, Fredrik, Can and Ole Jakob are Group Leaders for Aero & Composites, Electrical, Mechanical, Software and Marketing respectively. Nicolas is Head of Competition & Group Leader Logistics, with one membership covering both Board and Logistics. Oskar is a Logistics Member. Filip is Head of Finance & Group Leader Business, with one membership covering both Board and Business. Use `Group Leader` consistently for group leadership roles. Keep the Project Leader and Group Leaders before other members in each project file.

Board roles use Head of titles: Sander is Head of Technical, Oliver is Head of HR, Lukas is Head of Production and Rebekka is Head of Testing. Tobias keeps Project Leader; Filip and Nicolas keep their combined Head of and Group Leader titles.

Use `Aero & Composites` consistently for the 2027 group. Existing links using `Aero- and composites` still resolve to the renamed group. Elias Hatleskog is an Aero & Composites Member. Jonas's email and phone and Tahir's email and LinkedIn come from the updated contact table.

The Technical advisor tab includes Steve Völler as Electrical Advisor, Shivaraj Chandrakant Patil as Mechanical Advisor and Rafael Bölsterli as Previous Member of ACE Solar Racing. Reuse Shivaraj's existing profile ID 48. Advisors are displayed in their own tab, following the existing convention for historical projects.

The "Alt mulig rart" group and its member were removed from 2027; historical memberships are preserved.

The supplied names Arif Oraz, Maria Olafsdottir, Rebekka Bakkemo and Ole Jakob Kleive-Anderesn map to the existing profiles Can Arif Oraz, María Kristín Ólafsdóttir, Rebekka Bergundhaugen Bakkemo and Ole Jakob Kleive-Andersen. William Fosser uses the existing Electrical profile (ID 127), with one membership in 2027.

## Updating a member

Edit the person's name, photos and contact details in `members.json`. IDs must be unique positive integers and stay the same when a member returns for another year. Several existing records have the same name but different roles; match records by ID.

The existing `project` field is historical metadata carried over from the old file. It does not choose which year a person appears under. Displayed membership comes from the files in `projects/`.

Edit the title and groups for a specific year in that project's file. A member can belong to several groups, but their ID must appear only once in each project's member list.

Only Board members and confirmed group leaders display phone numbers in Project 2027. Other 2027 memberships explicitly set `phone` to `null`, overriding any phone number on their shared historical profile. Keep this override when updating their membership. The submitted email `Andrei.taluca@nordlysntnu.no` was explicitly confirmed by the user; do not change it to match the spelling of the surname.

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

// Shared helpers for choosing groups on the Join page.
export const MAX_CHOICES = 3;

const ORDINALS = ['1st', '2nd', '3rd'];

export function ordinal(index) {
    return ORDINALS[index] ?? `${index + 1}th`;
}

// The group's Member role from join.md (the only "##" entry under each group).
export function roleOf(group) {
    const key = Object.keys(group).find(field => !['name', 'image', 'description'].includes(field));
    return key ? group[key] : null;
}

// Adds a group at the end of the list, or removes it if it is already chosen.
export function toggleChoice(choices, key) {
    if (choices.includes(key)) return choices.filter(choice => choice !== key);
    if (choices.length >= MAX_CHOICES) return choices;
    return [...choices, key];
}

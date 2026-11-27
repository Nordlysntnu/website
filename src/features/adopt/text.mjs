// Texts for the adopt page in English and Norwegian (bokmål).
// Visitors whose browser lists Norwegian (nb, nn or no) among its languages get Norwegian;
// everyone else gets English. A switch on the page lets them change it.

export const LANGUAGES = ['en', 'nb'];

export function pickLanguage(languages) {
    const list = Array.isArray(languages) ? languages : [languages];
    return list.some(tag => /^(nb|nn|no)(-|_|$)/i.test(String(tag ?? ''))) ? 'nb' : 'en';
}

const kr = value => `${value.toLocaleString('nb-NO')} kr`;
const list = ids => (ids ?? []).join(', ');

export const TEXT = {
    en: {
        page: {
            title: 'Adopt a solar panel · Nordlys',
            header: 'Adopt',
            switchTo: 'På norsk',
            switchLabel: 'Vis siden på norsk',
            previewLabel: 'Preview',
            previewText: 'This page is still being built. You can try choosing panels, but payment is not open yet.',
            eyebrow: 'Support Nordlys',
            heading: 'Adopt a solar panel on our car',
            lead: 'Every solar panel on the car can be adopted. Choose your panels, add your name if you like, and give with Vipps. Your gift helps us build Norway’s next solar race car.',
            steps: [
                ['Choose your panels', 'Click the panels you like on the car, or let us pick them for you.'],
                ['Give with Vipps', 'One panel is a gift of 100 kr, and bundles let you adopt more panels for less.'],
                ['See your name on the car', 'As a thank-you, your name appears on your panels on this page if you add one. We check each name first.'],
            ],
        },
        car: {
            groupLabel: 'Solar panels on the car. Use the arrow keys to move and Enter to choose.',
            held: id => `Panel ${id} · someone is paying for it right now`,
            adoptedBy: (id, name) => `Panel ${id} · adopted by ${name}`,
            adopted: id => `Panel ${id} · adopted`,
            chosen: id => `Panel ${id} · your choice`,
            free: id => `Panel ${id} · available`,
            legend: ['Available', 'Your choice', 'Adopted'],
            pointAt: 'Point at a panel to see who adopted it.',
        },
        picker: {
            kr,
            panels: count => `${count} panel${count === 1 ? '' : 's'}`,
            maxPanels: max => `You can adopt up to ${max} panels at a time.`,
            badEmail: 'Check the email address, or leave it empty.',
            previewNotice: 'This is only a preview, so Vipps does not open and nothing is charged. When adoption opens, this button takes you to Vipps.',
            status: {
                loading: 'Loading the car …',
                closed: 'Adoption opens soon. You can already look around and choose panels.',
                offline: 'The adoption service is not available right now. Please try again later.',
                preview: 'Preview: you can choose panels and see the amount, but payment is not open yet.',
            },
            errors: {
                400: 'Check your panels and details, then try again.',
                409: 'Some of these panels were just taken. Please choose others.',
                429: 'You already have panels waiting for payment. Finish or cancel that payment first.',
                502: 'Vipps could not start the payment. Please try again in a moment.',
            },
            checking: 'Checking your payment with Vipps …',
            thanks: 'Thank you!',
            paid: ids => ids?.length === 1
                ? `Panel ${list(ids)} is now adopted by you. You can find it on the car below. If you added a name, it appears once we have checked it.`
                : `Panels ${list(ids)} are now adopted by you. You can find them on the car below. If you added a name, it appears once we have checked it.`,
            cancelled: 'The payment was cancelled, so the panels are free again. Nothing was charged.',
            failed: 'Something went wrong with the payment. Nothing was charged. Please try again.',
            unknown: 'We could not confirm the payment yet. If Vipps shows it as paid, your panels will appear on the car shortly.',
            close: 'Close',
            prices: 'Amounts',
            save: amount => `Save ${kr(amount)}`,
            pick: count => (count === 1 ? 'Pick one for me' : `Pick ${count} for me`),
            note: 'Or click the panels on the car you want. Larger gifts automatically get the lowest combination.',
            yourPanels: 'Your panels',
            none: 'No panels chosen yet.',
            remove: id => `Remove panel ${id}`,
            total: 'Total',
            saved: amount => `You save ${kr(amount)}.`,
            tip: (more, total) => `Tip: choose ${more} more for ${kr(total)} in total.`,
            addThem: 'Add them',
            clearAll: 'Clear all',
            nameLabel: 'Name on your panels (optional)',
            namePlaceholder: 'Ola Nordmann, or leave empty',
            nameHint: 'Shown as a thank-you when someone points at your panels, after we have checked it. No company names or ads. Leave it empty to adopt anonymously.',
            emailLabel: 'Your email (optional)',
            emailPlaceholder: 'ola@example.com, or leave empty',
            emailHint: 'If you want a thank-you from us and news about the car. It is never shown on the page.',
            opening: 'Opening Vipps …',
            payAmount: total => `Give ${kr(total)} with Vipps`,
            pay: 'Give with Vipps',
            held: 'Your panels are held for you while you pay in Vipps.',
            terms: ['By giving you accept our ', 'terms', ', which also explain what we do with your name and email.'],
        },
    },
    nb: {
        page: {
            title: 'Adopter et solcellepanel · Nordlys',
            header: 'Adopter',
            switchTo: 'In English',
            switchLabel: 'Show this page in English',
            previewLabel: 'Forhåndsvisning',
            previewText: 'Denne siden er under arbeid. Du kan prøve å velge paneler, men betaling er ikke åpnet ennå.',
            eyebrow: 'Støtt Nordlys',
            heading: 'Adopter et solcellepanel på bilen vår',
            lead: 'Alle solcellepanelene på bilen kan adopteres. Velg panelene dine, legg til navnet ditt hvis du vil, og gi med Vipps. Gaven din hjelper oss å bygge Norges neste solcellebil.',
            steps: [
                ['Velg panelene dine', 'Klikk på panelene du liker på bilen, eller la oss velge for deg.'],
                ['Gi med Vipps', 'Ett panel er en gave på 100 kr, og med pakkene adopterer du flere paneler for mindre.'],
                ['Se navnet ditt på bilen', 'Som takk vises navnet ditt på panelene dine på denne siden hvis du legger det til. Vi ser over hvert navn først.'],
            ],
        },
        car: {
            groupLabel: 'Solcellepanelene på bilen. Bruk piltastene for å flytte deg og Enter for å velge.',
            held: id => `Panel ${id} · noen betaler for det akkurat nå`,
            adoptedBy: (id, name) => `Panel ${id} · adoptert av ${name}`,
            adopted: id => `Panel ${id} · adoptert`,
            chosen: id => `Panel ${id} · ditt valg`,
            free: id => `Panel ${id} · ledig`,
            legend: ['Ledig', 'Ditt valg', 'Adoptert'],
            pointAt: 'Pek på et panel for å se hvem som har adoptert det.',
        },
        picker: {
            kr,
            panels: count => `${count} panel${count === 1 ? '' : 'er'}`,
            maxPanels: max => `Du kan adoptere opptil ${max} paneler om gangen.`,
            badEmail: 'Sjekk e-postadressen, eller la feltet stå tomt.',
            previewNotice: 'Dette er bare en forhåndsvisning, så Vipps åpnes ikke og ingenting blir trukket. Når adopsjonen åpner, tar denne knappen deg til Vipps.',
            status: {
                loading: 'Laster bilen …',
                closed: 'Adopsjonen åpner snart. Du kan allerede se deg rundt og velge paneler.',
                offline: 'Adopsjonen er ikke tilgjengelig akkurat nå. Prøv igjen senere.',
                preview: 'Forhåndsvisning: du kan velge paneler og se beløpet, men betaling er ikke åpnet ennå.',
            },
            errors: {
                400: 'Sjekk panelene og opplysningene dine, og prøv igjen.',
                409: 'Noen av disse panelene ble akkurat tatt. Velg andre.',
                429: 'Du har allerede paneler som venter på betaling. Fullfør eller avbryt den betalingen først.',
                502: 'Vipps kunne ikke starte betalingen. Prøv igjen om litt.',
            },
            checking: 'Sjekker betalingen med Vipps …',
            thanks: 'Tusen takk!',
            paid: ids => ids?.length === 1
                ? `Panel ${list(ids)} er nå adoptert av deg. Du finner det på bilen under. Hvis du la til et navn, vises det når vi har sett over det.`
                : `Panelene ${list(ids)} er nå adoptert av deg. Du finner dem på bilen under. Hvis du la til et navn, vises det når vi har sett over det.`,
            cancelled: 'Betalingen ble avbrutt, så panelene er ledige igjen. Ingenting ble trukket.',
            failed: 'Noe gikk galt med betalingen. Ingenting ble trukket. Prøv igjen.',
            unknown: 'Vi kunne ikke bekrefte betalingen ennå. Hvis Vipps viser den som betalt, dukker panelene dine opp på bilen om litt.',
            close: 'Lukk',
            prices: 'Beløp',
            save: amount => `Spar ${kr(amount)}`,
            pick: count => (count === 1 ? 'Velg ett for meg' : `Velg ${count} for meg`),
            note: 'Eller klikk på panelene du vil ha på bilen. Større gaver får automatisk den laveste kombinasjonen.',
            yourPanels: 'Dine paneler',
            none: 'Ingen paneler valgt ennå.',
            remove: id => `Fjern panel ${id}`,
            total: 'Totalt',
            saved: amount => `Du sparer ${kr(amount)}.`,
            tip: (more, total) => `Tips: velg ${more} til for ${kr(total)} totalt.`,
            addThem: 'Legg dem til',
            clearAll: 'Fjern alle',
            nameLabel: 'Navn på panelene dine (valgfritt)',
            namePlaceholder: 'Ola Nordmann, eller la stå tomt',
            nameHint: 'Vises som takk når noen peker på panelene dine, etter at vi har sett over det. Ikke firmanavn eller reklame. La feltet stå tomt for å adoptere anonymt.',
            emailLabel: 'E-postadressen din (valgfritt)',
            emailPlaceholder: 'ola@eksempel.no, eller la stå tomt',
            emailHint: 'Hvis du vil ha en takk fra oss og nyheter om bilen. Den vises aldri på siden.',
            opening: 'Åpner Vipps …',
            payAmount: total => `Gi ${kr(total)} med Vipps`,
            pay: 'Gi med Vipps',
            held: 'Panelene holdes av for deg mens du betaler i Vipps.',
            terms: ['Ved å gi godtar du ', 'vilkårene våre', ' (på engelsk), som også forklarer hva vi gjør med navnet og e-posten din.'],
        },
    },
};

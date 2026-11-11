# Join applications sheet

Applications from [nordlysntnu.no/join](https://nordlysntnu.no/join) go to a Google Sheet that only the Board can open. [Code.gs](Code.gs) is the Apps Script that receives them.

## Set up

1. Create a Google Sheet in a Nordlys or Board account, not a personal one, so it survives board changes. Share it with Board members only.
2. In the sheet, open **Extensions → Apps Script**. Replace the editor contents with [Code.gs](Code.gs) and save.
3. Choose `setup` in the function list and press **Run**. Accept the permission prompt; Google warns that the app is unverified because it is your own script. This creates the **Søknader** tab and its headers.
4. **Deploy → New deployment → Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**. Deploy and copy the URL ending in `/exec`.
5. Put the URL in `APPLICATION_ENDPOINT` in [JoinForm.js](../../src/features/join/JoinForm.js) and open a pull request.

"Anyone" only lets the website send rows. Nobody can read the sheet through the web app.

## Optional

- **Delete old applications:** the Join page says applications are kept no longer than six months. In Apps Script, open **Triggers**, add a time-driven trigger for `removeOldApplications` and run it daily.
- **Email on new applications:** in the sheet, **Tools → Notification settings → Edit notifications**.

## Columns

Mottatt, Fornavn, Etternavn, E-post, Telefon, Studieprogram, Årstrinn, 1. valg, 2. valg, 3. valg, Om søkeren, Bachelor/master-oppgave, Hørte om oss via, Status, Notater.

New rows get the status `Ny`. **Status** and **Notater** are for the Board. Add new columns to the right of them so the script keeps writing to the right places.

## Changing the script

After editing the script, use **Deploy → Manage deployments → Edit → New version**. This keeps the same URL. A new deployment gets a new URL, and then the website must be updated.

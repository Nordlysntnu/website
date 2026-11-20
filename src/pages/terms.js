import Head from 'next/head';
import Link from 'next/link';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import { ORGANIZATION } from '@features/ui/organization';
import { BUNDLES } from '@features/adopt/adopt.mjs';
import styles from '@features/legal/styles/Terms.module.css';

// Terms for "Adopt a solar panel". Adopting is a gift to Nordlys, and the name on the panel is a thank-you.
// The sections cover the points Vipps MobilePay asks for (parties, payment, delivery, withdrawal,
// returns, complaints, disputes) and end with a short privacy note. The Board approves changes to this text.
const UPDATED = '20 November 2026';
const { contact } = ORGANIZATION;
const email = <a href={`mailto:${ORGANIZATION.adoptEmail}`}>{ORGANIZATION.adoptEmail}</a>;
const kr = value => `${value.toLocaleString('nb-NO')} kr`;

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms and privacy · Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout current="Terms">
                <></>
                <PageHeader title="Terms" />
                <Content dark={false}>
                    <article className={styles.terms}>
                        <p className={styles.eyebrow}>Adopt a solar panel</p>
                        <h2 className={styles.title}>Terms and privacy</h2>
                        <p className={styles.lead}>
                            When you adopt solar panels on our car at <Link href="/adopt">nordlysntnu.no/adopt</Link>, you give
                            a gift to {ORGANIZATION.name}. These terms explain how it works. Updated {UPDATED}.
                        </p>

                        <section>
                            <h3>1. Who we are</h3>
                            <p>The gift goes to {ORGANIZATION.name}, a student organisation at NTNU.</p>
                            <dl className={styles.facts}>
                                <div><dt>Organisation number</dt><dd>{ORGANIZATION.orgNumber}</dd></div>
                                <div><dt>Address</dt><dd>{ORGANIZATION.address.join(', ')}</dd></div>
                                <div><dt>Email</dt><dd>{email}</dd></div>
                                <div><dt>Phone</dt><dd><a href={`tel:${contact.tel}`}>{contact.phone}</a></dd></div>
                            </dl>
                            <p>The giver is the person who pays with Vipps.</p>
                        </section>

                        <section>
                            <h3>2. Your gift</h3>
                            <p>
                                Adopting a panel is a gift to Nordlys. The money goes to building and racing our solar car.
                                Each panel is one solar cell on the car, as the car is shown on the adopt page.
                            </p>
                            <p>
                                As a thank-you, the panels you choose are marked as adopted on the page, with your name if you
                                add one. You do not buy the solar cell or any part of the car, and you get nothing else in return.
                                The panels stay marked for as long as the car is shown on the page.
                            </p>
                            <p>
                                We can refuse or remove a name that is offensive, advertises something or belongs to someone else.
                                If we do, we give you your money back. Companies that want to be seen as sponsors can contact us
                                about a sponsorship agreement instead.
                            </p>
                        </section>

                        <section>
                            <h3>3. Amounts and payment</h3>
                            <p>
                                The amounts are {BUNDLES.map(bundle => `${kr(bundle.price)} for ${bundle.panels} panel${bundle.panels === 1 ? '' : 's'}`).join(', ')}.
                                Larger gifts get the lowest combination. The amount shown before you pay is the total, with no fees.
                            </p>
                            <p>
                                You pay with Vipps. The amount is charged when you approve the payment in the Vipps app. The panels
                                you choose are held for you while you pay, and are free again if you cancel or do not finish in time.
                                If the payment is cancelled, nothing is charged. Vipps shows a receipt in the app.
                            </p>
                        </section>

                        <section>
                            <h3>4. After you give</h3>
                            <p>
                                Your panels are marked as adopted on the page as soon as Vipps confirms the payment, usually within
                                a minute. Nothing is sent by post.
                            </p>
                        </section>

                        <section>
                            <h3>5. Changing your mind</h3>
                            <p>
                                The right of withdrawal in the Norwegian Cancellation Act (angrerettloven) applies to purchases, not
                                to gifts. You can still change your mind within 14 days after you paid. Send us an email at {email} with
                                the panel numbers or the Vipps receipt.
                            </p>
                            <p>We refund the full amount to you through Vipps within 14 days after we hear from you, and remove your name from the panels.</p>
                        </section>

                        <section>
                            <h3>6. Returns and refunds</h3>
                            <p>There is nothing physical to return. Refunds are made as described in section 5.</p>
                        </section>

                        <section>
                            <h3>7. Mistakes</h3>
                            <p>
                                If something is wrong, for example your name is missing or misspelt, the wrong panels are marked, or
                                you were charged twice, tell us at {email}. We fix the mistake or refund you.
                            </p>
                        </section>

                        <section>
                            <h3>8. Disagreements</h3>
                            <p>
                                Contact us first, and we will try to find a good solution. If we do not agree, you can ask
                                Forbrukerrådet for advice (<a href="https://www.forbrukerradet.no" target="_blank" rel="noopener noreferrer">forbrukerradet.no</a>).
                                Norwegian law applies.
                            </p>
                        </section>

                        <section>
                            <h3>9. Privacy</h3>
                            <p>{ORGANIZATION.name} is responsible for the personal data in an adoption. We store:</p>
                            <ul>
                                <li>the panels you adopted, the amount and when you paid;</li>
                                <li>the name you chose to show, if any. It is public on the adopt page;</li>
                                <li>your email, if you gave it. It is never shown on the page;</li>
                                <li>the payment reference and payment status from Vipps;</li>
                                <li>a scrambled form of your IP address, only used to stop one person from holding too many panels at once.</li>
                            </ul>
                            <p>
                                Vipps does not give us your phone number, address, card or bank details. We use the data to show your
                                panels, keep our accounts, answer you, and, if you gave your email, to thank you and send you news about
                                the car. We do not sell or share the data. Vipps MobilePay handles the payment under its own terms.
                            </p>
                            <p>
                                Payment records are kept as long as the accounting rules require. You can ask us at {email} at any time
                                to see, correct or delete your name and email. If you think we handle your data wrongly, you can
                                complain to Datatilsynet.
                            </p>
                        </section>
                    </article>
                </Content>
            </Layout>
        </>
    );
}

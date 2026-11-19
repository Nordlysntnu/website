import Head from 'next/head';
import Link from 'next/link';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import { ORGANIZATION } from '@features/ui/organization';
import { BUNDLES } from '@features/adopt/adopt.mjs';
import styles from '@features/legal/styles/Terms.module.css';

// Terms of sale for "Adopt a solar panel", with the points Vipps MobilePay asks for
// (parties, payment, delivery, right of withdrawal, returns, complaints, disputes) and a short privacy note.
// The Board approves changes to this text.
const UPDATED = '19 November 2026';
const { contact } = ORGANIZATION;
const email = <a href={`mailto:${contact.email}`}>{contact.email}</a>;
const kr = value => `${value.toLocaleString('nb-NO')} kr`;

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms of sale and privacy · Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout current="Terms">
                <></>
                <PageHeader title="Terms" />
                <Content dark={false}>
                    <article className={styles.terms}>
                        <p className={styles.eyebrow}>Adopt a solar panel</p>
                        <h2 className={styles.title}>Terms of sale and privacy</h2>
                        <p className={styles.lead}>
                            These terms apply when you adopt solar panels on our car at <Link href="/adopt">nordlysntnu.no/adopt</Link>.
                            Updated {UPDATED}.
                        </p>

                        <section>
                            <h3>1. Who we are</h3>
                            <p>The seller is {ORGANIZATION.name}, a student organisation at NTNU.</p>
                            <dl className={styles.facts}>
                                <div><dt>Organisation number</dt><dd>{ORGANIZATION.orgNumber}</dd></div>
                                <div><dt>Address</dt><dd>{ORGANIZATION.address.join(', ')}</dd></div>
                                <div><dt>Email</dt><dd>{email}</dd></div>
                                <div><dt>Phone</dt><dd><a href={`tel:${contact.tel}`}>{contact.phone}</a></dd></div>
                            </dl>
                            <p>The buyer is the person who pays with Vipps.</p>
                        </section>

                        <section>
                            <h3>2. What you get</h3>
                            <p>
                                Each panel is one solar cell on our car, as the car is shown on the adopt page. When you adopt a panel,
                                it is marked as adopted on the page, with your name if you add one. Your support goes to building
                                and racing the car.
                            </p>
                            <p>
                                The adoption is a symbol of your support. You do not own the solar cell or any part of the car, and
                                you get no other rights. Your panels stay marked on the page for as long as the car is shown there.
                            </p>
                            <p>
                                We can refuse or remove a name that is offensive, advertises something or belongs to someone else.
                                If we do, we refund you in full.
                            </p>
                        </section>

                        <section>
                            <h3>3. Prices and payment</h3>
                            <p>
                                The prices are {BUNDLES.map(bundle => `${kr(bundle.price)} for ${bundle.panels} panel${bundle.panels === 1 ? '' : 's'}`).join(', ')}.
                                Larger orders get the cheapest combination. The price shown before you pay is the total price, with no other fees.
                            </p>
                            <p>
                                You pay with Vipps. The amount is charged when you approve the payment in the Vipps app. The panels
                                you choose are held for you while you pay, and are free again if you cancel or do not finish in time.
                                If the payment is cancelled, nothing is charged. Vipps shows a receipt in the app.
                            </p>
                        </section>

                        <section>
                            <h3>4. Delivery</h3>
                            <p>
                                Your panels are marked as adopted on the page as soon as Vipps confirms the payment, usually within
                                a minute. Nothing is sent by post.
                            </p>
                        </section>

                        <section>
                            <h3>5. Right of withdrawal</h3>
                            <p>
                                You can cancel the adoption within 14 days after you paid, without giving a reason. Send us an email
                                at {email} with the panel numbers or the Vipps receipt. You can use the standard cancellation form
                                (angreskjema), but an email is enough.
                            </p>
                            <p>We refund the full amount to you through Vipps within 14 days after we hear from you, and remove your name from the panels.</p>
                        </section>

                        <section>
                            <h3>6. Returns and refunds</h3>
                            <p>There is nothing physical to return. If you cancel, you get your money back as described in section 5.</p>
                        </section>

                        <section>
                            <h3>7. Complaints</h3>
                            <p>
                                If something is wrong, for example your name is missing or misspelt, the wrong panels are marked, or
                                you were charged twice, tell us at {email} within a reasonable time after you noticed it. We fix the
                                mistake or refund you.
                            </p>
                        </section>

                        <section>
                            <h3>8. Disputes</h3>
                            <p>
                                Contact us first, and we will try to find a good solution. If we do not agree, you can ask
                                Forbrukerrådet for help (<a href="https://www.forbrukerradet.no" target="_blank" rel="noopener noreferrer">forbrukerradet.no</a>).
                                Cases that are not solved there can go to Forbrukerklageutvalget. Norwegian law applies.
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
                                Payment records are kept as long as the accounting rules require. You can ask us at any time to see,
                                correct or delete your name and email. If you think we handle your data wrongly, you can complain
                                to Datatilsynet.
                            </p>
                        </section>
                    </article>
                </Content>
            </Layout>
        </>
    );
}

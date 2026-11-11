import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { observeReveal } from '../src/shared/lib/observeReveal.mjs';

const originalWindow = globalThis.window;
afterEach(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
});

function browser({ reducedMotion = false } = {}) {
    const observers = [];
    globalThis.window = {
        matchMedia: () => ({ matches: reducedMotion }),
        IntersectionObserver: class {
            constructor(callback, options) {
                Object.assign(this, { callback, options, disconnects: 0 });
                observers.push(this);
            }
            observe(element) { this.element = element; }
            disconnect() { this.disconnects += 1; }
            notify(isIntersecting) { this.callback([{ isIntersecting }]); }
        },
    };
    return observers;
}

test('reveals only when the element enters the inset viewport, then stops observing', () => {
    const observers = browser();
    const element = {};
    let reveals = 0;
    const cleanup = observeReveal(element, () => reveals++, 50);
    const observer = observers[0];

    assert.equal(observer.element, element);
    assert.deepEqual(observer.options, { rootMargin: '-50px 0px', threshold: 0 });
    observer.notify(false);
    assert.equal(reveals, 0);
    observer.notify(true);
    observer.notify(true);
    assert.equal(reveals, 1);
    assert.equal(observer.disconnects, 1);
    cleanup();
});

test('navigation disconnects the observer and ignores an already queued notification', () => {
    const observers = browser();
    let reveals = 0;
    const cleanup = observeReveal({}, () => reveals++);

    cleanup();
    assert.equal(observers[0].disconnects, 1);
    observers[0].notify(true);
    assert.equal(reveals, 0);
});

test('a remount is unaffected by a notification queued before the previous cleanup', () => {
    const observers = browser();
    let reveals = 0;
    observeReveal({}, () => reveals++)();
    const cleanup = observeReveal({}, () => reveals++);
    observers[0].notify(true);
    assert.equal(reveals, 0);
    observers[1].notify(true);
    assert.equal(reveals, 1);
    cleanup();
});

test('reduced motion shows content immediately without an observer', () => {
    const observers = browser({ reducedMotion: true });
    let reveals = 0;
    observeReveal({}, () => reveals++)();
    assert.equal(reveals, 1);
    assert.equal(observers.length, 0);
});

test('browsers without IntersectionObserver still show the content', () => {
    globalThis.window = {};
    let reveals = 0;
    observeReveal({}, () => reveals++)();
    assert.equal(reveals, 1);
});

test('an absent element creates no observer or callback', () => {
    const observers = browser();
    observeReveal(null, () => assert.fail('must not reveal an unmounted element'));
    assert.equal(observers.length, 0);
});

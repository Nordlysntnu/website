export function observeReveal(element, reveal, offset = 150) {
    if (!element) return;

    let active = true;
    let observer;
    const show = () => {
        // A queued observer notification can arrive after cleanup.
        if (!active) return;
        active = false;
        observer?.disconnect();
        reveal();
    };

    if (!window.IntersectionObserver || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        show();
    } else {
        observer = new window.IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) show();
        }, { rootMargin: `-${offset}px 0px`, threshold: 0 });
        observer.observe(element);
    }

    return () => {
        active = false;
        observer?.disconnect();
    };
}

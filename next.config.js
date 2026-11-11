module.exports = (phase) => {
    const local = phase === 'phase-development-server' && process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true';
    return {
        images: { unoptimized: true },
        output: 'export',
        distDir: local ? '.next-local' : '.next',
        // The laptop mode cannot be enabled in a production build.
        env: { NEXT_PUBLIC_LOCAL_PREVIEW: local ? 'true' : 'false' },
    };
};

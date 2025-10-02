import { defineConfig } from 'kaukau/config'

export default defineConfig({
    enableLogs: false,
    exitOnFail: true,
    files: 'test/lib',
    ext: '.test.mjs',
    options: {
        bail: false,
        fullTrace: true,
        grep: '',
        ignoreLeaks: false,
        reporter: 'spec',
        retries: 0,
        slow: 200,
        timeout: 2000,
        ui: 'bdd',
        color: true
    }
});

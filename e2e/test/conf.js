const puppeteer = require('puppeteer');
const moment = require('moment');

// to do -- convert *.js files to .ts

// for Chrome basic auth
const {Authenticator} = require('authenticator-browser-extension');

//
const fs = require('fs');

// reports & failed screenshots
const HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
const reporter = new HtmlScreenshotReporter({
    dest: 'logs/e2e-report',
    filename: 'e2e-report.html',
    captureOnlyFailedSpecs: true,
    reportOnlyFailedSpecs: false,
    //showSummary: true,
    //showQuickLinks: true,
    // inlineImages: true
});

/*
// chrome removed basic auth in v59 so this is a work around using node-http-proxy...
// npm install --save http-proxy
var http = require('http'),
    httpProxy = require('http-proxy');
var proxy;
var PORT_PROXY_SERVER = 8899;
*/
//const {Authenticator} = require('authenticator-browser-extension');

const capabilitiesMap = {
    'chrome': {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                '--disableChecks',
                //'--window-size=1920,1080',
                //'--remote-debugging-port=9222',
                ////'--no-sandbox',
                '--disable-dev-shm-usage',
                //'--disable-setuid-sandbox',
                //'--enabled-logging',
                //'--v=1',
                //'--disable-gpu',
                //'--headless',
                //'--disable-extensions',
                //'start-fullscreen',
            ]
            //binary: puppeteer.executablePath()
        }
    },
    'chrome-headless': {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                '--disableChecks',
                //'--window-size=1920,1080',
                //'--remote-debugging-port=9222',
                //// '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                //'--enabled-logging',
                //'--v=1',
                //'--disable-gpu',
                '--headless',
                //'--disable-extensions',
                //'start-fullscreen',
            ]
            //binary: puppeteer.executablePath()
        },
    },
    'firefox': {
        browserName: 'firefox',

        'moz:firefoxOptions': {
            args: [
                '--disableChecks',
                //'--window-size=1920,1080',
                //"--headless",
            ]
        }
    },
    'firefox-headless': {
        browserName: 'firefox',

        'moz:firefoxOptions': {
            args: [
                '--disableChecks',
                //'--window-size=1920,1080',
                "--headless",
            ]
        }
    },
    'edge': {
        browserName: 'edge',
    },
    'edge-headless': {
        browserName: 'edge',
    },
    'ie': {
        browserName: 'ie',
        ignoreProtectedModeSettings: true,
        platform: 'ANY',
        version: '11',
        args: ['--silent', '--no-sandbox', '--test-type=browser', '--lang=US', '--start-maximized'],
        prefs: {
            'download': {
                'prompt_for_download': false,
                'directory_upgrade': true,
                'extensions_to_open': '',
                'default_directory': process.cwd() + '/downloads/'
            },
        }
    },
    'ie-headless': {
        browserName: 'ie',
        ignoreProtectedModeSettings: true,
        platform: 'ANY',
        version: '11',
        args: ['--silent', '--no-sandbox', '--test-type=browser', '--lang=US', '--start-maximized', '--headless', '--disable-gpu'],
        prefs: {
            'download': {
                'prompt_for_download': false,
                'directory_upgrade': true,
                'extensions_to_open': '',
                'default_directory': process.cwd() + '/downloads/'
            },
        }
    },

    /*'phantomjs': {
        'browserName': 'phantomjs',
        'phantomjs.binary.path': require('phantomjs-prebuilt').path,
        'phantomjs.cli.args': ['--remote-debugger-port=8081'],
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
    },*/
};

// load .env for pre-config operations (it is loaded again later as part of the normal config setup,
// but too late for what is needed here, where we are dynamically setting up parts of the config)
const envConfig = require('./env.js').envConfig;

// resolutions we can use c.f. --resolution=1080p
// note "max" and "maximum" can also be used.
// pc768ws aka laptop (34%) and 1080p are the most common <2k in 2018
const resolutionsList = {
        'demo': // for demoing in video chat
            {width: 1720, height: 880},
        'flip-phone':
            {width: 640, height: 480},
        'pc240':
            {width: 320, height: 240},
        'pc600':
            {width: 800, height: 600},
        'pc768':
            {width: 1024, height: 768},
        'laptop': //2nd common
            {width: 1366, height: 768},
        'ipad':
            {width: 768, height: 1024},
        'ipad-pro':
            {width: 1024, height: 1366},
        'pc768ws':
            {width: 1366, height: 768},
        'pc1024':
            {width: 1280, height: 1024},
        'pc800ws':
            {width: 1280, height: 800},
        'sd':
            {width: 1280, height: 720},
        'hd':
            {width: 1920, height: 1080},
        '480p':
            {width: 848, height: 480},
        '720p':
            {width: 1280, height: 720},
        '1080p': //common 1st
            {width: 1920, height: 1080},
        '2k':
            {width: 2048, height: 1080},
        'uhd':
            {width: 3840, height: 2160},
        '4k':
            {width: 4096, height: 2160},
        '8k':
            {width: 7680, height: 4320}
    }
;

// flags to indicate which frontend we are testing
const ngFront = false;
const cwFront = false;

// There are a few items we have to load before we do the export.config because we use that
// data to dynamically populate the config data...
let browserMode = 'chrome';
let resolution = '1080p';
let capabilities;
const env = 'stage';
let basicAuth = {
    username: 'user',
    password: 'password'
};

global.resolutionListToOptionString = function (resolution) {
    return '--window-size=' + resolution.width + ',' + resolution.height;
};

// get browser from .env, browser=chrome
// @note: The var is browserMode so as not conflict with the browser object
if (typeof envConfig.browserMode !== 'undefined') {
    browserMode = envConfig.browserMode;
}

// get browser from cli
// --browser=chrome-headless
process.argv.slice(3).forEach(function (arg) {
    let name = arg.split('=')[0];
    const value = arg.split('=')[1];
    name = name.replace('--', '');

    if (name === 'browserMode' || name === 'browser' || name === 'mode') {
        if (Object.prototype.hasOwnProperty.call(capabilitiesMap, value)) {
            browserMode = value;
        }
    }
    if (name === 'resolution') {
        resolution = value;
    }
});

if (typeof envConfig.basicAuth !== "undefined") {
    basicAuth = envConfig.basicAuth;
}

capabilities = capabilitiesMap[browserMode];
if (typeof capabilities['chromeOptions'] !== 'undefined') {
    if (resolutionsList.hasOwnProperty(resolution))
        capabilities['chromeOptions']['args'].push(global.resolutionListToOptionString(resolutionsList[resolution]));
    // Basic Auth for Chrome
    // See https://github.com/jan-molak/authenticator-browser-extension
    // This provides Basic Auth handling for HEADed mode only, not headless
    if (browserMode === 'chrome') {
        capabilities['chromeOptions']['extensions'] = [];
        capabilities['chromeOptions']['extensions'].push(Authenticator.for(basicAuth.username, basicAuth.password).asBase64());
    }
    // Basic Auth for Firefox
    // See https://github.com/juliemr/protractor-demo/tree/master/howtos/setFirefoxProfile
}
if (typeof capabilities['moz:firefoxOptions'] !== 'undefined')
    if (resolutionsList.hasOwnProperty(resolution))
        capabilities['moz:firefoxOptions']['args'].push(global.resolutionListToOptionString(resolutionsList[resolution]));

// setup normal config parameters
exports.config = {
    //seleniumAddress: 'http://localhost:4444/wd/hub',

    directConnect: true,
    // chromeDriver: './node_modules/protractor/node_modules/webdriver-manager/selenium/chromedriver_77.0.3865.75',

    specs: ['**/*.spec.js'],

    /*proxy: {
        proxyType: 'manual',
        httpProxy: `localhost:${PORT_PROXY_SERVER}`,
        sslProxy: `localhost:${PORT_PROXY_SERVER}`
    },*/

    capabilities: capabilitiesMap[browserMode],

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval:
            100000
    }
    ,

    framework: 'jasmine2', //jasmine3

    baseUrl: 'https://software.clearwatercompliance.com',
    //SELENIUM_PROMISE_MANAGER: false,
    // webDriverLogDir: 'logs/',
    // logLevel: 'INFO',

    // seleniumSessionId: 'protractor_1'
    //highlightDelay: 3000,

    params:
        {
            isLoggedIn: false,
            restartBrowserBetweenTests: true,
            DEFAULT_TIMEOUT_INTERVAL: 20000, /* normally 5000 ... */
            LONG_TIMEOUT_INTERVAL: 60000,
            baseUrl: 'https://software.clearwatercompliance.com',
            apiUrl: 'https://software-api.clearwatercompliance.com',
            ngBaseUrl: 'https://localhost:4200',
            homeUrl: 'https://clearwatercompliance.com',
            frontend: 'cwfront', //ngfront
            minimumWait: 50,
            animationWait: 500, /* max wait for css animations */
            wait: 2000,
            maximumWait: 20000,
            debugHelpers: false,
            slowAPIMilliseconds: 2000, /* for performance reports -- the threshold where api calls considered too slow */
            logBrowserErrors: true,
            browserMode: 'chrome',
            messageLibrary: require('./messageLibrary.js').messageLibrary,
            businessRulesLibrary: require('./businessRulesLibrary.js').businessRulesLibrary,
            loginLibrary: require('./loginLibrary.js').loginLibrary,
            endpoints: require('./endpoints.js').endpoints,
            envConfig: require('./env.js').envConfig,
            role: 'AccountOwner',
            product: 'Analysis',
            angularSite: false,
            env: 'stage',
            envs: {
                production: {
                    baseUrl: 'https://software.clearwatercompliance.com',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://software-api.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAdmin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                local: {
                    baseUrl: 'http://software-local.clearwatercompliance.com',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'http://software-api-local.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        },
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAdmin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                stage: {
                    baseUrl: 'https://software-stage.clearwatercompliance.com',
                    ngBaseUrl: 'https://software-stage.clearwatercompliance.com/front/',
                    apiUrl: 'http://software-stage-api.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com pgreene@cc.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                deploy: {
                    baseUrl: 'https://software-deploy.clearwatercompliance.com',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://software-deploy-api.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                fixes: {
                    baseUrl: 'https://software-fixes.clearwatercompliance.com',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://software-fixes-api.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                hotfixes: {
                    baseUrl: 'https://software-hotfixes.clearwatercompliance.com',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://software-hotfixes-api.clearwatercompliance.com',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                localhost: {
                    baseUrl: 'http://localhost',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://localhost:8080',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                },
                localShort: {
                    baseUrl: 'http://clearwater.app',
                    ngBaseUrl: 'http://localhost:4200',
                    apiUrl: 'https://ec-api.app',
                    login: {
                        admin: {
                            email: 'cmiller86@gmail.com',
                            password: 'PASSWORD',
                        }
                        ,
                        accountOwner: {
                            email: 'jon.stone@clearwatercompliance.com',
                            password: 'PASSWORD',
                        }
                        ,
                        analyst: {
                            email: 'pgreene@cc.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        enterpriseAccountOwner: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            password: 'PASSWORD',
                        }
                        ,
                        enterpriseAnalyst: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AnalystReadOnly: {
                            email: 'joelieb@iamacat.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        },
                        AccountOwnerReadOnly: {
                            email: 'jon.stone@clearwatercompliance.com', //joelieb@iamacat.com
                            // email: 'test.demo@hipaasecurityassesment.com',
                            password: 'PASSWORD',
                        }
                    }
                }
            },
        },

    suites: {
        all: ['**/*.spec.js'],
        helpers: ['helpers/**/*.spec.js'],
        logins: 'helpers/login.spec.js',
        tableData: 'helpers/tableData.spec.js',
        expectArray: 'helpers/expectArray.spec.js',
        misc: 'helpers/misc.spec.js',
        sites: 'sites/**/*.spec.js',
        public: 'public/*.spec.js',
        menu: ['menu/**/*.spec.js',],

        pages: ['pages/**/*.spec.js'],
        testPlan:
            'test-plan/**/*.spec.js',
        features:
            'features/**/*.spec.js',

        finding: ['pages/IRM Enterprise/Findings.spec.js'],
        questions: ['pages/IRM Enterprise/Questions.spec.js'],
        frameworks: ['pages/IRM Enterprise/Frameworks.spec.js'],
        frameworkDetails: ['pages/IRM Enterprise/Framework Detail.spec.js'],
        assessments: ['pages/IRM Enterprise/Assessments.spec.js'],

        dashboards: ['pages/Dashboards/**/*.spec.js'],
        framingGovernance: ['pages/Framing+Governance/**/*.spec.js'],
        assets: ['pages/Assets/**/*.spec.js'],
        riskDetermination: ['pages/Risk Determination/**/*.spec.js'],
        riskResponse: ['pages/Risk Response/**/*.spec.js'],
        activities: ['pages/Activities/**/*.spec.js'],
        documents: ['pages/Documents.spec.js'],
        reports: ['pages/Reports/**/*.spec.js'],
        manageAccount: ['pages/Manage Account/**/*.spec.js'],
        support: ['pages/Support/*.spec.js'],

        accounts: ['pages/Accounts/*.spec.js'],
        assessmentWalkthrough: ['pages/Assessment Walkthrough/*.spec.js'],
        auditing: ['pages/Auditing/*.spec.js'],
        newsScreen: ['pages/News Screen/*.spec.js'],
        notifications: ['pages/Notifications/*.spec.js'],
        options: ['pages/Options/*.spec.js'],
        rMCyclesMgmt: ['pages/RM Cycles Mgmt/*.spec.js'],

        riskAnalysisConfiguration: ['pages/Risk Analysis Configuration/*.spec.js'],

        assessment: ['pages/Assessment/*.spec.js'],
        remediationPlan: ['pages/RemediationPlan/*.spec.js'],

        filters: ['filters/**/*.spec.js'],

        basicFlow:
            ['test-plan/UC/TST-SRR-100-BF1.0.spec.js'],
        altFlow:
            ['test-plan/UC/TST-SRR-100-AF*.0.spec.js'],
        smoke:
            ['menu/**/*.spec.js', 'test-plan/Global/TST-GLBL-UI1004.1.spec.js'],
        UC:
            'test-plan/UC/*.spec.js',
        UIS:
            'test-plan/UIS/*.spec.js',
        UXE:
            'test-plan/UXE/*.spec.js',
        Global:
            'test-plan/Global/*.spec.js',
        SRR:
            ['features/SRR/**.spec.js'],
        CES:
            ['features/CES/**.spec.js'],
        Cycle2:
            ['features/Cycle 2/**.spec.js', 'test-plan/Cycle 2/**/*.spec.js'],
        fixture:
            'fixture/**/*.spec.js',
        testData:
            'test-data/**/*.spec.js',
    }
    ,

    beforeLaunch: function () {
        // console.log("beforeLaunch:");

        //
        if (fs.existsSync("logs/e2e.log")) {
            fs.truncateSync("logs/e2e.log");
        }

        // if an exception is thrown, screenshot those as well
        process.on('uncaughtException', function () {
            reporter.jasmineDone();
            reporter.afterLaunch();
        });

        // reports & screenshots setup
        return new Promise(function (resolve) {
            reporter.beforeLaunch(resolve);
        });
    }
    ,

    onPrepare: function () {
        if (browser.params.debugHelpers)
            console.log("onPrepare:");

        //
        jasmine.DEFAULT_TIMEOUT_INTERVAL = browser.params.DEFAULT_TIMEOUT_INTERVAL;
        if (browser.params.debugHelpers)
            console.log("DEFAULT_TIMEOUT_INTERVAL:" + jasmine.DEFAULT_TIMEOUT_INTERVAL);

        //const EC = require('protractor').ExpectedConditions;

        beforeEach(function () {
        });

        afterEach(function () {
            performanceLogging();
        });

        afterAll(function () {
        });

        require('./helper.logger.js');

        global.logger.info('Start e2e tests');

        global.using = require('jasmine-data-provider');

        require('./helper.args.js');

        if (browser.params.debugHelpers)
            console.log("puppeteer.executablePath():" + puppeteer.executablePath());

        // log browser console errors...
        if (browser.params.logBrowserErrors) {
            browser.manage().logs().get('browser').then(function (browserLog) {
                if (browserLog.length) {
                    console.error(browserLog);
                    for (index = 0; index < browserLog.length; index++) {
                        const log = browserLog[index];
                        if (log.level.name === "ERROR") {
                            console.log('Browser console.error:' + log.message);
                            global.logger.error('Browser console.error:' + log.message);
                        }
                    }
                }
            });
        }


        // html reports & failed screenshots
        jasmine.getEnv().addReporter(reporter);

        // ex: hasClass(element(by.id('risk_0')),'active')
        global.hasClass = function (actual, expected) {
            return actual.getAttribute('class').then(function (classes) {
                return classes.split(' ').indexOf(expected) !== -1;
            });
        };

        if (browser.params.debugHelpers)
            console.log("onPrepare: load helpers");

        const jasmineReporters = require("jasmine-reporters");
        require("jasmine-expect");

        require('./helper.matchers.js');
        require('./helper.navigation.js');
        require('./helper.login.js');
        require('./helper.performance.js');
        require('./helper.elements.js');
        require('./helper.sidemenuClick.js');
        require('./helper.expects.js');
        require('./helper.wait.js');
        require('./helper.pageHelp.js');
        //require('./helper.sorting.js');
        //require('./helper.sorting.js');
        require('./helper.form.js');
        //require('./helper.textFixtures.js');

        logger.info(capabilities);

        global.btoa = function (str) {
            return new Buffer(str).toString('base64');
        };

        // get the current suite for use in some tests
        global.suite = require('yargs').argv.suite;
        global.logger.info("Suite: " + suite);

        if (browser.params.debugHelpers) {
            console.log("onPrepare: env: " + browser.params.env);
            console.log("onPrepare: homeUrl: " + browser.params.homeUrl);
            console.log("onPrepare: baseUrl: " + browser.params.baseUrl);
            console.log("onPrepare: ngBaseUrl: " + browser.params.ngBaseUrl);
            console.log("onPrepare: apiUrl: " + browser.params.apiUrl);
        }

        //
        if (resolution === 'max' || resolution === 'maximum') {
            // maximize window so easier to see what's going on when debugging tests
            browser.driver.manage().window().maximize();
            global.logger.info('browser.driver.manage().maximize()');
        } else {
            // set browser to standard 1080p
            const screenSize = resolutionsList[resolution];
            browser.driver.manage().window().setSize(screenSize.width, screenSize.height);
            global.logger.info('browser.driver.manage().window().setSize resolution:' + screenSize.width + ',' + screenSize.height);
        }

        // require('./helper.proxy.js');

        if (browser.params.debugHelpers)
            console.log("onPrepare: done");
    }
    ,

    onComplete: function () {
        if (browser.params.debugHelpers)
            console.log("onComplete:");

        writeReport('Performance Report -- Pages', 'performanceReportPagesTemplate');
        writeReport('Performance Report -- Endpoints', 'performanceReportEndpointsTemplate');
        writeReport('Performance Report -- Views', 'performanceReportViewsTemplate');
        writeEndpointsCoverageReport();

        global.logger.info('onComplete: Done');
    }
    ,

    onCleanup: function () {
        if (browser.params.debugHelpers)
            console.log("onCleanup: End e2e tests");
    }
    ,

    afterLaunch: function () {
        if (browser.params.debugHelpers)
            console.log("afterLaunch:");

        // screenshots -- sets it up so we get screenshots when there is a failed test
        const exitCode = 0;
        return new Promise(function (resolve) {
            reporter.afterLaunch(resolve.bind(this, exitCode));
        });
    }
    ,
}
;



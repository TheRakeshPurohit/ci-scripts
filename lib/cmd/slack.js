/* eslint-disable complexity */
/// Posts a message to your Slack channel.
const request = require('../effects/request');
const log = require('../effects/log');

const headers = {
    'Content-type': 'application/json',
};

const defaultEmoji = 'clap';
const messageSeparator = ':crossed_fingers:';
const defaultMessage = ({PROJECT_NAME, BUILD_VERSION, BUILD_URL, CI_NAME, PROJECT_URL,
    IS_PR, BUILD_PR_URL, BUILD_PR_NUM, BRANCH_URL, BUILD_BRANCH}) => {
    let msg = `Built${IS_PR ? ' PR for' : ''} <${PROJECT_URL}|${'`' + PROJECT_NAME + '`'}>`;

    msg += ` ${messageSeparator} <${BRANCH_URL}|\`${BUILD_BRANCH}\`>`;

    if (IS_PR) {
        msg += ` ${messageSeparator} <${BUILD_PR_URL}|\`/pull/${BUILD_PR_NUM}\`>`;
    }

    msg += ` ${messageSeparator} ${'*`' + BUILD_VERSION + '`*'}`;

    if (BUILD_URL) {
        msg += ` on <${BUILD_URL}|_${CI_NAME}_>`;
    } else {
        msg += ` on ${CI_NAME}`;
    }

    return msg + ' :tada:';
};

const slack = async (ci) => {
    const {params} = ci;
    const uri = params.webhook || ci.SLACK_WEBHOOK || process.env.SLACK_WEBHOOK;

    if (!uri || (typeof uri !== 'string')) {
        throw new Error(`Slack webhook not provided.`);
    }

    const body = {

        /// You can specify a custom message using `--text` param, either through `ci.config.js`
        /// config file or as a command line argument. It can be a static string or a
        /// JavaScript expression.
        ///
        /// ```
        /// ci slack --text="Hello Slack"
        /// ci slack --text="Year: \${YEAR}"
        /// ```
        ///
        /// Set message text using `ci.config.js` config file:
        ///
        /// ```js
        /// {
        ///     slack: {
        ///         params: {
        ///             text: ({PROJECT_NAME}) =>
        ///                 `Success, built ${'`' + PROJECT_NAME + '`'}!`
        ///         }
        ///     }
        /// }
        /// ```
        ///
        /// You can also specify extra text messages using `--beforeText` and `--afterText` params.
        text: params.text || defaultMessage(ci),

        /// Use `--username` param to overwrite sender's display name, defaults to `ci-scripts`.
        username: params.username || 'ci-scripts',

        /// Set emoji icon of the sender using `--icon_emoji` param, defaults to `javascript`.
        ///
        /// ```
        /// ci slack --icon_emoji=ghost
        /// ```
        icon_emoji: params.icon_emoji === void 0
            ? `:${defaultEmoji}:`
            : ':' + (params.icon_emoji || defaultEmoji) + ':',
    };

    if (params.beforeText) {
        body.text = params.beforeText + '\n\n' + body.text;
    }

    if (params.afterText) {
        body.text = body.text + '\n\n' + params.afterText;
    }

    if (params.icon_url) {
        /// Specify sender icon URL using `--icon_url` param.
        body.icon_url = params.icon_url;
    }

    if (params.channel) {
        /// You can overwrite default channel using `--channel` param.
        body.channel = params.channel;
    }

    const result = await request(ci, {
        method: 'POST',

        /// To post to Slack you need a Webhook, you can create one
        /// following [this link](https://mailonline.slack.com/apps/A0F7XDUAZ-incoming-webhooks).
        /// Once you have a Webhook you can specify it to `ci-scipts` in a number of ways.
        /// The simplest way is to an environment variable.
        ///
        /// ```
        /// SLACK_WEBHOOK=<webhook> ci slack
        /// ```
        ///
        /// You can also set it as a command parameter.
        ///
        /// ```
        /// ci slack --webhook="<webhook>"
        /// ```
        ///
        /// Or provide it in `ci.config.js` configuration file.
        ///
        /// ```js
        /// {
        ///     slack: {
        ///         params: {
        ///             webhook: "<webhook>"
        ///         }
        ///     }
        /// }
        /// ```
        uri,
        headers,
        body,
        json: true,
    });

    log(ci, `Posted to Slack: ${ci.BUILD_VERSION}`);

    return result;
};

module.exports = slack;

import { cook, setup } from 'pretty-text/engines/discourse-markdown';
import { sanitize } from 'pretty-text/sanitizer';
import WhiteLister from 'pretty-text/white-lister';

const _registerFns = [];
const identity = value => value;

export function registerOption(fn) {
  _registerFns.push(fn);
}

export function buildOptions(state) {
  setup();

  const {
    siteSettings,
    getURL,
    lookupAvatar,
    getTopicInfo,
    topicId,
    categoryHashtagLookup,
    userId,
    getCurrentUser,
    currentUser,
    lookupAvatarByPostNumber
  } = state;

  const features = {
    'bold-italics': true,
    'auto-link': true,
    'mentions': true,
    'bbcode': true,
    'quote': true,
    'html': true,
    'category-hashtag': true,
    'onebox': true,
    'newline': !siteSettings.traditional_markdown_linebreaks
  };

  const options = {
    sanitize: true,
    getURL,
    features,
    lookupAvatar,
    getTopicInfo,
    topicId,
    categoryHashtagLookup,
    userId,
    getCurrentUser,
    currentUser,
    lookupAvatarByPostNumber,
    mentionLookup: state.mentionLookup,
    enableExperimentalMarkdownIt: siteSettings.enable_experimental_markdown_it,
    allowedHrefSchemes: siteSettings.allowed_href_schemes ? siteSettings.allowed_href_schemes.split('|') : null
  };

  _registerFns.forEach(fn => fn(siteSettings, options, state));

  return options;
}

export default class {
  constructor(opts) {
    this.opts = opts || {};
    this.opts.features = this.opts.features || {};
    this.opts.sanitizer = (!!this.opts.sanitize) ? (this.opts.sanitizer || sanitize) : identity;
    setup();
  }

  cook(raw) {
    if (!raw || raw.length === 0) { return ""; }

    const result = cook(raw, this.opts);
    return result ? result : "";
  }

  sanitize(html) {
    return this.opts.sanitizer(html, new WhiteLister(this.opts));
  }
};

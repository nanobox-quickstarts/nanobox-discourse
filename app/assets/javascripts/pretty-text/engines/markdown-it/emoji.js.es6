import { registerOption } from 'pretty-text/pretty-text';
import { buildEmojiUrl, isCustomEmoji } from 'pretty-text/emoji';
import { translations } from 'pretty-text/emoji/data';

const MAX_NAME_LENGTH = 60;

let translationTree = null;

registerOption((siteSettings, opts, state) => {
  opts.features.emoji = !!siteSettings.enable_emoji;
  opts.emojiSet = siteSettings.emoji_set || "";
  opts.customEmoji = state.customEmoji;
});

// This allows us to efficiently search for aliases

function buildTranslationTree() {
  let tree = [];
  let lastNode;

  Object.keys(translations).forEach(function(key){
    let i;
    let node = tree;

    for(i=0;i<key.length;i++) {
      let code = key.charCodeAt(i);
      let j;

      let found = false;

      for (j=0;j<node.length;j++){
        if (node[j][0] === code) {
          node = node[j][1];
          found = true;
          break;
        }
      }

      if (!found) {
        // token, children, value
        let tmp = [code, []];
        node.push(tmp);
        lastNode = tmp;
        node = tmp[1];
      }
    }

    lastNode[1] = translations[key];
  });

  return tree;
}


function imageFor(code, opts) {
  code = code.toLowerCase();
  const url = buildEmojiUrl(code, opts);
  if (url) {
    const title = `:${code}:`;
    const classes = isCustomEmoji(code, opts) ? "emoji emoji-custom" : "emoji";
    return {url, title, classes};
  }
}

// straight forward :smile: to emoji image
function applyEmojiName(state, isSpace, isPunctChar, discourseOptions) {
  let pos = state.pos;

  // 58 = :
  if (state.src.charCodeAt(pos) !== 58) {
    return false;
  }

  if (pos > 0) {
    let prev = state.src.charCodeAt(pos-1);
    if (!isSpace(prev) && !isPunctChar(String.fromCharCode(prev))) {
      return false;
    }
  }

  pos++;
  if (state.src.charCodeAt(pos) === 58) {
    return false;
  }

  let length = 0;
  while(length < MAX_NAME_LENGTH) {
    length++;

    if (state.src.charCodeAt(pos+length) === 58) {
      break;
    }

    if (pos+length > state.posMax) {
      return false;
    }
  }

  if (length === MAX_NAME_LENGTH) {
    return false;
  }

  let name = state.src.substr(pos, length);

  let info;
  if (info = imageFor(name, discourseOptions)) {

    let token = state.push('emoji', 'img', 0);
    token.attrs = [['src', info.url],
                   ['title', info.title],
                   ['class', info.classes],
                   ['alt', info.title]];

    state.pos = pos + length + 1;

    return true;
  }
}

// translations are "text" shortcuts like :) and :( and ;)
function applyEmojiTranslations(state) {
  translationTree = translationTree || buildTranslationTree();

  let pos = state.pos;
  let currentTree = translationTree;

  let i;

  let search = true;
  let found = false;

  while(search) {

    search = false;

    for (i=0;i<currentTree.length;i++) {
      if(currentTree[i][0] === state.src.charCodeAt(pos)) {
        currentTree = currentTree[i][1];
        pos++;
        search = true;
        if (typeof currentTree === "string") {
          found = true;
        }
        break;
      }
    }
  }

  if (!found) {
    return false;
  }



  return false;
}

function applyEmoji(state, silent, isSpace, isPunctChar, discourseOptions) {
  if (!silent) {
    return applyEmojiName(state, isSpace, isPunctChar, discourseOptions) || applyEmojiTranslations(state);
  }
}

export default function(md) {
  md.inline.ruler.push('emoji', (state,silent) => applyEmoji(
        state,
        silent,
        md.utils.isSpace,
        md.utils.isPunctChar,
        md.options.discourse
  ));
}

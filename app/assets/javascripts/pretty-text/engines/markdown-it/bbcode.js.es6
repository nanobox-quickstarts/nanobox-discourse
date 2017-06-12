
// parse a tag [test a=1 b=2] to a data structure
// {tag: "test", attrs={a: "1", b: "2"}
function parseBBCodeTag(src, start, max) {

  let i;
  let tag;
  let attrs = {};
  let closed = false;

  for (i=start+1;i<max;i++) {
    let letter = src[i];
    if (!( (letter >= 'a' && letter <= 'z') ||
         (letter >= 'A' && letter <= 'Z'))) {
      break;
    }
  }

  tag = src.slice(start+1, i);

  if (!tag) {
    return;
  }

  for (;i<max;i++) {
    let letter = src[i];

    if (letter === ']') {
      closed = true;
      break;
    }
  }

  if (closed) {

    let raw = src.slice(start+tag.length+1, i);

    // trivial parser that is going to have to be rewritten at some point
    if (raw) {
      let split = raw.split('=');
      let nextKey;

      for(i=0; i<split.length; i++) {
        let word = split[i];
        let splitPoint = word.length;

        if (i !== split.length-1) {
          splitPoint = word.lastIndexOf(/\s/);
        }

        let val = word.slice(0, splitPoint).trim();
        if (val && val.length > 0) {
          val = val.replace(/^["'](.*)["']$/, '$1');
          attrs[nextKey || '_default'] = val;
        }
        nextKey = word.substr(splitPoint);
      }
    }

    tag = tag.toLowerCase();

    return {tag, attrs};
  }
}

function applyBBCode(state, startLine, endLine, silent, rules) {

  var i, pos, nextLine,
      old_parent, old_line_max, rule,
      auto_closed = false,
      start = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];


  // [ === 91
  if (91 !== state.src.charCodeAt(start)) { return false; }


  let info = parseBBCodeTag(state.src, start, max);

  for(i=0;i<rules.length;i++) {
    let r = rules[i];

    if (r.tag === state.src.slice(start+1, start+r.tag.length+1)) {
      rule = r;
      break;
    }
  }

  if (!rule) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // Search for the end of the block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    start = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (start < max && state.sCount[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }


    // bbcode close [ === 91
    if (91 !== state.src.charCodeAt(start)) { continue; }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }


    if (state.src.slice(start+2, max-1) !== rule.tag) { continue; }

    if (pos < max) { continue; }

    // found!
    auto_closed = true;
    break;
  }

  old_parent = state.parentType;
  old_line_max = state.lineMax;
  state.parentType = 'container';

  // this will prevent lazy continuations from ever going past our end marker
  state.lineMax = nextLine;

  rule.before(state, info.attrs);

  let lastToken = state.tokens[state.tokens.length-1];
  lastToken.map    = [ startLine, nextLine ];
  console.log(lastToken.map);

  state.md.block.tokenize(state, startLine + 1, nextLine);

  rule.after(state);

  state.parentType = old_parent;
  state.lineMax = old_line_max;
  state.line = nextLine + (auto_closed ? 1 : 0);

  return true;
}



export default {

  create: function() {
    let self = {
      rules: [],

      addBlockRule: function(rule){
        self.rules.push(rule);
      },

      plugin: function(md) {
        md.block.ruler.after('fence', 'bbcode', (state, startLine, endLine, silent)=> {
          applyBBCode(state, startLine, endLine, silent, self.rules);
        });
      }
    };

    return self;
  }

  // let render = function(tokens, idx, _options, env, self) {
  //
  //   // console.log(tokens);
  //   // // add a class to the opening tag
  //   // if (tokens[idx].nesting === 1) {
  //   //   tokens[idx].attrPush([ 'class', name ]);
  //   // }
  //
  //   return self.renderToken(tokens, idx, _options, env, self);
  // };
  //
  // md.renderer.rules['bbcode_open'] = render;
  // md.renderer.rules['bbcode_close'] = render;
};

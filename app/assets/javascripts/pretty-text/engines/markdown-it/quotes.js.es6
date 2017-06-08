// non traditional Markdown newlines
function applyNewline(state, silent) {
  let pos = state.pos;

  // not a newline
  if (state.src.charCodeAt(pos) !== 0x0A) {
    return false;
  }

  if (!silent) {
    state.push('hardbreak', 'br', 0);
  }

  pos++;
  state.pos = pos;

  return true;
}

export default function(md) {
  // md.inline.ruler.before('newline', 'not_traditional_newline', applyNewline);
}

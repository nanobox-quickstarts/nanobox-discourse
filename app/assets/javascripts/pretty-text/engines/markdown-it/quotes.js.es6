export default {
  tag: 'quote',

  before: function(state, attrs) {

    console.log(attrs);

    let token    = state.push('bbcode_open', 'aside', 1);
    token.attrs  = [['class', 'quote']];
    token.block  = true;

    token        = state.push('bbcode_open', 'blockquote', 1);
    token.block  = true;
  },

  after: function(state) {
    let token    = state.push('bbcode_close', 'blockquote', -1);
    token.block  = true;

    token        = state.push('bbcode_close', 'aside', -1);
    token.block  = true;
  }
};

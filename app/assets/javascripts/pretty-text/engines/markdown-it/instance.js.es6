import mentions from 'pretty-text/engines/markdown-it/mentions';
import emoji from 'pretty-text/engines/markdown-it/emoji';
import quotes from 'pretty-text/engines/markdown-it/quotes';
import onebox from 'pretty-text/engines/markdown-it/onebox';


export default function(opts) {
  let engine = window.markdownit({
    discourse: opts,
    html: true,
    breaks: opts.features.newline,
    xhtmlOut: false,
    linkify: true,
    typographer: false
  });

  if (opts.features.mentions) {
    engine = engine.use(mentions);
  }

  if (opts.features.onebox) {
    engine.use(onebox);
  }

  engine.use(quotes);

  if (opts.features.emoji) {
    engine.use(emoji);
  }

  return engine;
}

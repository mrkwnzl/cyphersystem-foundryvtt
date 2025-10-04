export function htmlEscape(string) {
  // List of HTML entities for escaping.
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '{': '&#x7B;',
    '}': '&#x7D;',
    '%': '&#x25;',
    '#': '&#x23;',
    '?': '&#x3F;',
    '+': '&#x2B;'
  };

  // Regex containing the keys listed immediately above.
  const htmlEscaper = /[&<>"'\/`={}%#?+]/g;

  // Escape a string for HTML interpolation.
  string = string.replace(htmlEscaper, function (match) {
    return htmlEscapes[match];
  });

  return string;
}
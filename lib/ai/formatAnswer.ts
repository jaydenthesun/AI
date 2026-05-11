/** Remove markdown bold wrappers (**like this**) for natural UI copy. */
export function stripMarkdownBoldMarkers(text: string): string {
  let prev = "";
  let s = text;
  while (s !== prev) {
    prev = s;
    s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  }
  return s;
}

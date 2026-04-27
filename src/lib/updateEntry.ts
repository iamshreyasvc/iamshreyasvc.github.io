/**
 * Pure helpers for GitHub “updates” markdown entries (shared by admin UI and tests).
 */

/** Create a filename-safe slug from label text. */
export function slugify(input: string, fallbackTimestamp = Date.now()): string {
	const s = input
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return s || `update-${fallbackTimestamp}`;
}

/** Full markdown file body with YAML frontmatter for the updates collection. */
export function buildUpdateFileContent(dateRaw: string, order: number, body: string): string {
	return `---\ndate: ${JSON.stringify(dateRaw)}\norder: ${order}\n---\n\n${body.trim()}\n`;
}

/** Base64 (UTF-8) for GitHub Contents API `content` field. */
export function toBase64Utf8(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	bytes.forEach((b) => {
		binary += String.fromCharCode(b);
	});
	return btoa(binary);
}

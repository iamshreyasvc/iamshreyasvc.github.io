import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(here, '..', 'content');

function parseFrontmatterBlock(raw: string): { frontmatter: string; body: string } | null {
	if (!raw.startsWith('---\n')) return null;
	const end = raw.indexOf('\n---\n', 4);
	if (end === -1) return null;
	return {
		frontmatter: raw.slice(4, end),
		body: raw.slice(end + 5),
	};
}

function listMarkdownFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir).filter((f: string) => f.endsWith('.md'));
}

describe('content collection: research', () => {
	const dir = path.join(contentRoot, 'research');

	it('each entry has title and tags in frontmatter', () => {
		const files = listMarkdownFiles(dir);
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			const raw = fs.readFileSync(path.join(dir, file), 'utf8');
			const parsed = parseFrontmatterBlock(raw);
			expect(parsed, `${file}: expected frontmatter`).not.toBeNull();
			expect(parsed!.frontmatter, `${file}: title`).toMatch(/^title:\s/m);
			expect(parsed!.frontmatter, `${file}: tags`).toMatch(/^tags:\s/m);
		}
	});
});

describe('content collection: projects', () => {
	const dir = path.join(contentRoot, 'projects');

	it('each entry has numeric order in frontmatter', () => {
		const files = listMarkdownFiles(dir);
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			const raw = fs.readFileSync(path.join(dir, file), 'utf8');
			const parsed = parseFrontmatterBlock(raw);
			expect(parsed, `${file}: expected frontmatter`).not.toBeNull();
			const orderLine = parsed!.frontmatter.split('\n').find((l) => l.startsWith('order:'));
			expect(orderLine, `${file}: missing order`).toBeTruthy();
			const orderVal = orderLine!.replace(/^order:\s*/, '').trim();
			expect(Number.isFinite(Number(orderVal)), `${file}: order must be a number`).toBe(true);
		}
	});
});

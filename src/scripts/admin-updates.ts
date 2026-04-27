import { buildUpdateFileContent, slugify, toBase64Utf8 } from '../lib/updateEntry';

const TOKEN_KEY = 'svc-admin-github-token';

const repo = import.meta.env.PUBLIC_GITHUB_REPO || 'iamshreyasvc/iamshreyasvc.github.io';
const defaultBranch = import.meta.env.PUBLIC_GITHUB_BRANCH || 'main';

function $(sel: string) {
	return document.querySelector(sel) as HTMLElement | null;
}

async function githubFetch(path: string, token: string, init: RequestInit = {}) {
	const res = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${token}`,
			...(init.headers as Record<string, string>),
		},
	});
	return res;
}

function setStatus(el: HTMLElement, kind: 'muted' | 'ok' | 'err', text: string) {
	el.classList.remove('text-muted', 'text-success', 'text-danger');
	if (kind === 'ok') el.classList.add('text-success');
	else if (kind === 'err') el.classList.add('text-danger');
	else el.classList.add('text-muted');
	el.textContent = text;
}

function showSection(which: 'login' | 'form') {
	const login = $('#admin-login');
	const form = $('#admin-form');
	if (!login || !form) return;
	login.hidden = which !== 'login';
	form.hidden = which !== 'form';
}

function init() {
	const loginForm = $('#admin-login-form') as HTMLFormElement | null;
	const logoutBtn = $('#admin-logout') as HTMLButtonElement | null;
	const tokenInput = $('#admin-token') as HTMLInputElement | null;
	const updateForm = $('#admin-update-form') as HTMLFormElement | null;
	const statusEl = $('#admin-status') as HTMLElement | null;
	const resultEl = $('#admin-result') as HTMLElement | null;
	const branchInput = $('#admin-branch') as HTMLInputElement | null;

	if (
		!loginForm ||
		!logoutBtn ||
		!tokenInput ||
		!updateForm ||
		!statusEl ||
		!resultEl ||
		!branchInput
	) {
		return;
	}

	branchInput.placeholder = defaultBranch;
	branchInput.value = defaultBranch;

	const stored = sessionStorage.getItem(TOKEN_KEY);
	if (stored) {
		tokenInput.value = stored;
		showSection('form');
	} else {
		showSection('login');
	}

	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const token = tokenInput.value.trim();
		if (!token) {
			setStatus(statusEl, 'err', 'Paste a token first.');
			return;
		}
		setStatus(statusEl, 'muted', 'Checking token…');
		const res = await githubFetch(`/repos/${repo}`, token);
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			setStatus(
				statusEl,
				'err',
				res.status === 401
					? 'Invalid or expired token.'
					: `GitHub error ${res.status}: ${(err as { message?: string }).message || res.statusText}`,
			);
			return;
		}
		sessionStorage.setItem(TOKEN_KEY, token);
		setStatus(statusEl, 'ok', 'Connected. Token is kept in this tab only (session storage).');
		showSection('form');
	});

	logoutBtn.addEventListener('click', () => {
		sessionStorage.removeItem(TOKEN_KEY);
		tokenInput.value = '';
		setStatus(statusEl, 'muted', 'Signed out.');
		showSection('login');
	});

	updateForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const token = sessionStorage.getItem(TOKEN_KEY);
		if (!token) {
			showSection('login');
			return;
		}

		const dateEl = $('#admin-date') as HTMLInputElement;
		const orderEl = $('#admin-order') as HTMLInputElement;
		const slugEl = $('#admin-slug') as HTMLInputElement;
		const bodyEl = $('#admin-body') as HTMLTextAreaElement;
		const msgEl = $('#admin-commit-msg') as HTMLInputElement;

		const dateRaw = dateEl.value.trim();
		const order = Number.parseInt(orderEl.value, 10);
		const slug = slugify(slugEl.value || dateRaw || '', Date.now());
		const body = bodyEl.value.trim();
		const branch = (branchInput.value.trim() || defaultBranch) as string;
		const commitMessage =
			msgEl.value.trim() || `chore(updates): add ${slug}`;

		if (!dateRaw) {
			setStatus(statusEl, 'err', 'Date / label is required.');
			return;
		}
		if (!Number.isFinite(order)) {
			setStatus(statusEl, 'err', 'Order must be a number (lower numbers appear first).');
			return;
		}
		if (!body) {
			setStatus(statusEl, 'err', 'Body text is required.');
			return;
		}

		const path = `src/content/updates/${slug}.md`;
		const fileContent = buildUpdateFileContent(dateRaw, order, body);

		setStatus(statusEl, 'muted', 'Creating commit…');
		resultEl.textContent = '';

		const putRes = await githubFetch(`/repos/${repo}/contents/${path}`, token, {
			method: 'PUT',
			body: JSON.stringify({
				message: commitMessage,
				content: toBase64Utf8(fileContent),
				branch,
			}),
		});

		const data = await putRes.json().catch(() => ({}));

		if (!putRes.ok) {
			setStatus(
				statusEl,
				'err',
				(data as { message?: string }).message ||
					`Request failed (${putRes.status}). If the file already exists, choose another slug.`,
			);
			return;
		}

		const htmlUrl = (data as { content?: { html_url?: string } }).content?.html_url;
		setStatus(
			statusEl,
			'ok',
			branch === 'main'
				? 'Update pushed. GitHub Actions will rebuild the site in a minute or two.'
				: `Committed to branch “${branch}”. Merge to main when ready for production.`,
		);
		resultEl.innerHTML = htmlUrl
			? `<a href="${htmlUrl}" target="_blank" rel="noopener noreferrer">View file on GitHub</a>`
			: '';

		bodyEl.value = '';
		slugEl.value = '';
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

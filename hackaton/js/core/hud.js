/**
 * HUD — постоянная панель прогресса: репутация стажёра, XP, уровень доступа,
 * кнопка личного дела и всплывающие уведомления о наградах.
 *
 * HUD ничего не решает — только отображает состояние из Progress (ТЗ, п. 12.2).
 */

'use strict';
/* global Progress, Overlay */

(function (global) {

	let root = null;
	let bar = null;
	let value = null;
	let xpNode = null;
	let levelNode = null;
	let toasts = null;

	function template () {
		return `
			<button class="hud__profile" type="button" data-action="collection" title="Личное дело">
				<span class="hud__level" data-hud="level">Стажёр</span>
				<span class="hud__xp" data-hud="xp">0 XP</span>
			</button>
			<div class="hud__reputation">
				<span class="hud__label">Репутация стажёра</span>
				<div class="hud__bar"><div class="hud__bar-fill" data-hud="bar"></div></div>
				<span class="hud__value" data-hud="value">70</span>
			</div>
		`;
	}

	function render () {
		if (!root) {
			return;
		}

		const player = Progress.player();
		const percent = Math.max(0, Math.min(100, player.reputation));

		bar.style.width = `${percent}%`;
		bar.dataset.tone = percent >= 60 ? 'good' : (percent >= 30 ? 'warn' : 'bad');
		value.textContent = String(player.reputation);
		xpNode.textContent = `${player.xp} XP`;
		levelNode.textContent = Progress.accessLevelTitle();
	}

	function toast (text, tone = 'neutral') {
		if (!toasts) {
			return;
		}

		const node = document.createElement('div');
		node.className = `toast toast--${tone}`;
		node.textContent = text;
		toasts.appendChild(node);

		window.requestAnimationFrame(() => node.classList.add('toast--visible'));
		window.setTimeout(() => {
			node.classList.remove('toast--visible');
			window.setTimeout(() => node.remove(), 300);
		}, 2600);
	}

	function onProgress (event, payload) {
		if (event === 'change') {
			render();
			return;
		}

		if (event !== 'flash') {
			return;
		}

		if (payload.type === 'reputation' && payload.delta) {
			const sign = payload.delta > 0 ? '+' : '';
			toast(`Репутация ${sign}${payload.delta}`, payload.delta > 0 ? 'good' : 'bad');
		} else if (payload.type === 'xp') {
			toast(`Опыт +${payload.delta}`, 'good');
		} else if (payload.type === 'fact') {
			toast(`Интересный факт: ${payload.title}`, 'info');
		} else if (payload.type === 'competency') {
			toast(`Компетенция: ${payload.title}`, 'good');
		} else if (payload.type === 'accessLevel') {
			toast(`Уровень доступа: ${payload.title}`, 'good');
		} else if (payload.type === 'newTask') {
			toast(payload.title, 'info');
		}
	}

	const HUD = {

		mount () {
			if (root) {
				return;
			}

			const layer = document.getElementById('game-layer');

			root = document.createElement('div');
			root.className = 'hud';
			root.hidden = true;
			root.innerHTML = template();
			layer.appendChild(root);

			toasts = document.createElement('div');
			toasts.className = 'toasts';
			layer.appendChild(toasts);

			bar = root.querySelector('[data-hud="bar"]');
			value = root.querySelector('[data-hud="value"]');
			xpNode = root.querySelector('[data-hud="xp"]');
			levelNode = root.querySelector('[data-hud="level"]');

			root.querySelector('[data-action="collection"]').addEventListener('click', () => {
				Overlay.collection();
			});

			Progress.on(onProgress);
			render();
			this.watchGameScreen();
		},

		/** HUD виден только на игровом экране, а не в главном меню и настройках. */
		watchGameScreen () {
			const screen = document.querySelector('[data-screen="game"]');

			if (!screen) {
				// Компоненты Monogatari ещё не смонтированы — попробуем на следующем кадре.
				window.requestAnimationFrame(() => this.watchGameScreen());
				return;
			}

			const sync = () => {
				root.hidden = !screen.classList.contains('active');
			};

			new MutationObserver(sync).observe(screen, { attributes: true, attributeFilter: ['class'] });
			sync();
		},

		show () {
			if (root) {
				root.hidden = false;
			}
		},

		hide () {
			if (root) {
				root.hidden = true;
			}
		},

		refresh: render,
		toast
	};

	global.HUD = HUD;

})(window);

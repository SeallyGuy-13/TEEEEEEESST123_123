/**
 * Генератор временных ассетов.
 *
 * Создаёт SVG-болванки персонажей и фонов и WAV-заглушки музыки и звуков,
 * чтобы игру можно было пройти целиком до появления финальной графики и аудио.
 *
 * Запуск:  node tools/generate-placeholders.js
 *
 * Готовые ассеты кладутся в те же пути с теми же именами — сценарий и конфиги
 * править не нужно.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function write (relativePath, content) {
	const full = path.join(ROOT, relativePath);
	fs.mkdirSync(path.dirname(full), { recursive: true });
	fs.writeFileSync(full, content);
	console.log('  ' + relativePath);
}

/* ------------------------------------------------------------------------ */
/* Персонажи                                                                 */
/* ------------------------------------------------------------------------ */

const CHARACTERS = [
	{ dir: 'mentor', name: 'Наставник', color: '#43c59e' },
	{ dir: 'operator', name: 'Оператор БПЛА', color: '#5bc0f8' },
	{ dir: 'analyst', name: 'Аналитик', color: '#f0a44b' },
	{ dir: 'coordinator', name: 'Координатор', color: '#c88bf0' },
	{ dir: 'hero', name: 'Стажёр', color: '#eaf3ee' }
];

function characterSvg (character) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 900" width="400" height="900" role="img" aria-label="${character.name} (болванка)">
	<defs>
		<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${character.color}" stop-opacity="0.85"/>
			<stop offset="1" stop-color="${character.color}" stop-opacity="0.35"/>
		</linearGradient>
	</defs>

	<!-- Силуэт-болванка. Заменяется финальным спрайтом с тем же именем файла. -->
	<g fill="url(#g)" stroke="${character.color}" stroke-width="4" stroke-opacity="0.6">
		<circle cx="200" cy="160" r="92"/>
		<path d="M200 268c-96 0-160 62-172 156l-16 476h376l-16-476c-12-94-76-156-172-156z"/>
	</g>

	<g fill="#0e1b16" opacity="0.75">
		<circle cx="172" cy="150" r="10"/>
		<circle cx="228" cy="150" r="10"/>
		<rect x="176" y="196" width="48" height="8" rx="4"/>
	</g>

	<text x="200" y="700" text-anchor="middle" font-family="system-ui, sans-serif"
		font-size="34" font-weight="600" fill="#0e1b16" opacity="0.8">${character.name}</text>
	<text x="200" y="742" text-anchor="middle" font-family="system-ui, sans-serif"
		font-size="22" fill="#0e1b16" opacity="0.55">болванка</text>
</svg>
`;
}

/* ------------------------------------------------------------------------ */
/* Фоны сцен                                                                 */
/* ------------------------------------------------------------------------ */

const SCENES = [
	{
		file: 'office.svg',
		title: 'Офис центра мониторинга',
		top: '#1b3b33', bottom: '#0e1b16',
		shapes: `
			<rect x="80" y="420" width="1120" height="24" fill="#43c59e" opacity="0.25"/>
			<rect x="140" y="240" width="300" height="180" rx="12" fill="#43c59e" opacity="0.18"/>
			<rect x="480" y="200" width="300" height="220" rx="12" fill="#5bc0f8" opacity="0.16"/>
			<rect x="820" y="250" width="260" height="170" rx="12" fill="#f0a44b" opacity="0.14"/>`
	},
	{
		file: 'workstation.svg',
		title: 'Рабочее место с трекером',
		top: '#14262c', bottom: '#0e1b16',
		shapes: `
			<rect x="360" y="150" width="560" height="330" rx="16" fill="#0e1b16" opacity="0.75" stroke="#43c59e" stroke-opacity="0.5" stroke-width="3"/>
			<rect x="400" y="195" width="480" height="26" rx="8" fill="#43c59e" opacity="0.35"/>
			<rect x="400" y="245" width="380" height="18" rx="8" fill="#eaf3ee" opacity="0.18"/>
			<rect x="400" y="285" width="440" height="18" rx="8" fill="#eaf3ee" opacity="0.18"/>
			<rect x="400" y="325" width="300" height="18" rx="8" fill="#eaf3ee" opacity="0.18"/>
			<rect x="400" y="365" width="410" height="18" rx="8" fill="#eaf3ee" opacity="0.18"/>`
	},
	{
		file: 'shore.svg',
		title: 'Береговая линия',
		top: '#1d4a63', bottom: '#c9b087',
		shapes: `
			<path d="M0 380 Q320 340 640 380 T1280 380 L1280 460 L0 460Z" fill="#2a7ba0" opacity="0.55"/>
			<path d="M0 440 Q320 410 640 445 T1280 435 L1280 720 L0 720Z" fill="#c9b087" opacity="0.75"/>
			<circle cx="330" cy="560" r="16" fill="#e5695f" opacity="0.5"/>
			<circle cx="880" cy="520" r="13" fill="#e5695f" opacity="0.45"/>`
	},
	{
		file: 'analytics.svg',
		title: 'Отдел анализа данных',
		top: '#241f3a', bottom: '#0e1b16',
		shapes: `
			<rect x="120" y="180" width="440" height="300" rx="14" fill="#0e1b16" opacity="0.7" stroke="#f0a44b" stroke-opacity="0.45" stroke-width="3"/>
			<rect x="720" y="180" width="440" height="300" rx="14" fill="#0e1b16" opacity="0.7" stroke="#5bc0f8" stroke-opacity="0.45" stroke-width="3"/>
			<polyline points="150,430 240,360 330,395 420,290 530,320" fill="none" stroke="#f0a44b" stroke-width="5" opacity="0.7"/>
			<g fill="#5bc0f8" opacity="0.5">
				<rect x="760" y="360" width="50" height="90"/><rect x="830" y="310" width="50" height="140"/>
				<rect x="900" y="380" width="50" height="70"/><rect x="970" y="270" width="50" height="180"/>
				<rect x="1040" y="340" width="50" height="110"/>
			</g>`
	},
	{
		file: 'event.svg',
		title: 'Реальная активность: уборка',
		top: '#1b3b33', bottom: '#2a5c3f',
		shapes: `
			<g fill="#eaf3ee" opacity="0.35">
				<circle cx="360" cy="430" r="34"/><rect x="330" y="470" width="60" height="130" rx="24"/>
				<circle cx="500" cy="415" r="34"/><rect x="470" y="455" width="60" height="145" rx="24"/>
				<circle cx="640" cy="435" r="34"/><rect x="610" y="475" width="60" height="125" rx="24"/>
				<circle cx="780" cy="420" r="34"/><rect x="750" y="460" width="60" height="140" rx="24"/>
			</g>
			<rect x="900" y="470" width="120" height="130" rx="10" fill="#43c59e" opacity="0.45"/>`
	}
];

function sceneSvg (scene) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="${scene.title} (болванка)">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${scene.top}"/>
			<stop offset="1" stop-color="${scene.bottom}"/>
		</linearGradient>
	</defs>
	<rect width="1280" height="720" fill="url(#bg)"/>
	${scene.shapes}
	<text x="40" y="60" font-family="system-ui, sans-serif" font-size="26" fill="#eaf3ee" opacity="0.55">${scene.title}</text>
	<text x="40" y="92" font-family="system-ui, sans-serif" font-size="18" fill="#eaf3ee" opacity="0.35">временный фон — заменяется файлом с тем же именем</text>
</svg>
`;
}

/* ------------------------------------------------------------------------ */
/* Снимки для мини-игр                                                       */
/* ------------------------------------------------------------------------ */

function imageSvg ({ title, subtitle, body, top, bottom }) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="${title}">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${top}"/>
			<stop offset="1" stop-color="${bottom}"/>
		</linearGradient>
	</defs>
	<rect width="800" height="600" fill="url(#bg)"/>
	${body}
	<text x="24" y="40" font-family="system-ui, sans-serif" font-size="24" fill="#eaf3ee" opacity="0.7">${title}</text>
	<text x="24" y="68" font-family="system-ui, sans-serif" font-size="16" fill="#eaf3ee" opacity="0.45">${subtitle}</text>
</svg>
`;
}

// Пиксельная сетка «спутникового» вида
function noiseBlocks (cols, rows, size, opacity, seed) {
	let out = '';
	let value = seed;

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			value = (value * 1103515245 + 12345) % 2147483648;
			const shade = 0.1 + ((value >> 8) % 100) / 100 * opacity;
			out += `<rect x="${col * size}" y="${row * size}" width="${size}" height="${size}" fill="#eaf3ee" opacity="${shade.toFixed(2)}"/>`;
		}
	}

	return out;
}

const IMAGES = [
	{
		file: 'img_satellite.svg',
		title: 'Спутниковый снимок',
		subtitle: '10 м/пиксель · охват 20 км',
		top: '#132b3a', bottom: '#0e1b16',
		body: noiseBlocks(20, 15, 40, 0.14, 7) +
			'<path d="M0 300 Q200 260 400 305 T800 290 L800 600 L0 600Z" fill="#c9b087" opacity="0.25"/>'
	},
	{
		file: 'img_drone.svg',
		title: 'Съёмка с дрона',
		subtitle: '3 см/пиксель · охват 200 м',
		top: '#1d4a63', bottom: '#c9b087',
		body: `
			<path d="M0 260 Q200 230 400 265 T800 250 L800 600 L0 600Z" fill="#c9b087" opacity="0.8"/>
			<g opacity="0.75">
				<circle cx="230" cy="420" r="18" fill="#e5695f"/>
				<circle cx="262" cy="440" r="12" fill="#5bc0f8"/>
				<circle cx="205" cy="452" r="10" fill="#eaf3ee"/>
				<rect x="520" y="380" width="70" height="26" rx="6" fill="#43c59e"/>
			</g>`
	},
	{
		file: 'img_old.svg',
		title: 'Архивный снимок',
		subtitle: 'спутник · съёмка три года назад',
		top: '#2a2a2a', bottom: '#141414',
		body: noiseBlocks(20, 15, 40, 0.09, 21) +
			'<path d="M0 320 Q200 300 400 325 T800 310 L800 600 L0 600Z" fill="#8a8a7a" opacity="0.3"/>' +
			'<text x="400" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="42" fill="#eaf3ee" opacity="0.25">АРХИВ</text>'
	},
	{
		// Координаты пятен согласованы с hotspots в data/minigames.json (в процентах):
		// h1 (26,58), h2 (68,40), h3 (47,74)
		file: 'img_shore_analysis.svg',
		title: 'Участок берега',
		subtitle: 'съёмка с дрона · отметьте подозрительные места',
		top: '#1d4a63', bottom: '#c9b087',
		body: `
			<path d="M0 200 Q200 170 400 205 T800 190 L800 600 L0 600Z" fill="#c9b087" opacity="0.85"/>
			<path d="M0 180 Q200 150 400 185 T800 170 L800 240 L0 250Z" fill="#2a7ba0" opacity="0.5"/>

			<!-- h1: скопление пластика (26% / 58%) -->
			<g transform="translate(208 348)" opacity="0.85">
				<circle cx="0" cy="0" r="26" fill="#5b6b78" opacity="0.5"/>
				<circle cx="-10" cy="6" r="9" fill="#e8eef2"/>
				<circle cx="8" cy="-6" r="7" fill="#dbe6ec"/>
				<circle cx="10" cy="10" r="6" fill="#c8d6de"/>
			</g>

			<!-- h2: пятно у кромки воды (68% / 40%) -->
			<ellipse cx="544" cy="240" rx="42" ry="22" fill="#3a3f33" opacity="0.55"/>

			<!-- h3: брошенные сети (47% / 74%) -->
			<g transform="translate(376 444)" opacity="0.75" stroke="#7c8f6a" stroke-width="3" fill="none">
				<path d="M-30 -14 L30 -14 M-30 0 L30 0 M-30 14 L30 14"/>
				<path d="M-22 -20 L-22 20 M0 -20 L0 20 M22 -20 L22 20"/>
			</g>

			<!-- отвлекающие детали -->
			<circle cx="660" cy="470" r="10" fill="#b8a582" opacity="0.6"/>
			<circle cx="120" cy="500" r="8" fill="#b8a582" opacity="0.5"/>`
	},
	{
		file: 'img_case_storm.svg',
		title: 'Кейс: после шторма',
		subtitle: 'тёмная полоса вдоль кромки воды',
		top: '#1d3a4d', bottom: '#a8946f',
		body: `
			<path d="M0 250 Q200 220 400 255 T800 240 L800 600 L0 600Z" fill="#a8946f" opacity="0.8"/>
			<path d="M0 250 Q200 220 400 255 T800 240 L800 300 L0 310Z" fill="#3a3f33" opacity="0.65"/>`
	},
	{
		file: 'img_case_confirmed.svg',
		title: 'Кейс: подтверждённое скопление',
		subtitle: 'наземная проверка · 200 м²',
		top: '#25402f', bottom: '#a8946f',
		body: `
			<path d="M0 260 L800 240 L800 600 L0 600Z" fill="#a8946f" opacity="0.8"/>
			<g opacity="0.9">
				<circle cx="280" cy="400" r="14" fill="#e8eef2"/>
				<circle cx="320" cy="425" r="12" fill="#7fc4a0"/>
				<circle cx="255" cy="440" r="11" fill="#d9c27a"/>
				<circle cx="360" cy="395" r="10" fill="#e8eef2"/>
				<circle cx="400" cy="440" r="13" fill="#a8c8d8"/>
				<rect x="470" y="400" width="60" height="34" rx="6" fill="#8a8f7a"/>
			</g>`
	},
	{
		file: 'img_case_repeat.svg',
		title: 'Кейс: повторное загрязнение',
		subtitle: 'третий раз за полгода',
		top: '#3a2f25', bottom: '#a8946f',
		body: `
			<path d="M0 270 L800 250 L800 600 L0 600Z" fill="#a8946f" opacity="0.8"/>
			<g font-family="system-ui, sans-serif" font-size="20" fill="#eaf3ee" opacity="0.6">
				<text x="120" y="360">январь</text>
				<text x="360" y="360">апрель</text>
				<text x="600" y="360">июнь</text>
			</g>
			<g fill="#e5695f" opacity="0.7">
				<circle cx="160" cy="430" r="24"/>
				<circle cx="400" cy="430" r="26"/>
				<circle cx="640" cy="430" r="28"/>
			</g>`
	}
];

/* ------------------------------------------------------------------------ */
/* Аудио                                                                     */
/* ------------------------------------------------------------------------ */

const SAMPLE_RATE = 22050;

function wav (samples) {
	const dataLength = samples.length * 2;
	const buffer = Buffer.alloc(44 + dataLength);

	buffer.write('RIFF', 0);
	buffer.writeUInt32LE(36 + dataLength, 4);
	buffer.write('WAVE', 8);
	buffer.write('fmt ', 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);           // PCM
	buffer.writeUInt16LE(1, 22);           // моно
	buffer.writeUInt32LE(SAMPLE_RATE, 24);
	buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
	buffer.writeUInt16LE(2, 32);
	buffer.writeUInt16LE(16, 34);
	buffer.write('data', 36);
	buffer.writeUInt32LE(dataLength, 40);

	samples.forEach((sample, index) => {
		const clamped = Math.max(-1, Math.min(1, sample));
		buffer.writeInt16LE(Math.round(clamped * 32000), 44 + index * 2);
	});

	return buffer;
}

/** Спокойная зацикленная подложка из нескольких синусов. */
function ambient (seconds, freqs, volume = 0.16) {
	const total = Math.round(seconds * SAMPLE_RATE);
	const samples = new Float32Array(total);

	for (let index = 0; index < total; index += 1) {
		const t = index / SAMPLE_RATE;
		let value = 0;

		freqs.forEach((freq, layer) => {
			// Период каждого слоя укладывается в длину петли — стык не щёлкает.
			const cycles = Math.round(freq * seconds);
			value += Math.sin(2 * Math.PI * cycles * t / seconds) / (layer + 1.5);
		});

		// Мягкое дыхание громкости
		const swell = 0.75 + 0.25 * Math.sin(2 * Math.PI * t / seconds);
		samples[index] = value * volume * swell;
	}

	return Array.from(samples);
}

/** Короткий звук интерфейса. */
function blip (seconds, fromFreq, toFreq, volume = 0.3) {
	const total = Math.round(seconds * SAMPLE_RATE);
	const samples = new Float32Array(total);
	let phase = 0;

	for (let index = 0; index < total; index += 1) {
		const progress = index / total;
		const freq = fromFreq + (toFreq - fromFreq) * progress;
		phase += (2 * Math.PI * freq) / SAMPLE_RATE;

		const envelope = Math.sin(Math.PI * progress) ** 1.5;
		samples[index] = Math.sin(phase) * envelope * volume;
	}

	return Array.from(samples);
}

/** Гудение дрона. */
function droneSound (seconds, volume = 0.22) {
	const total = Math.round(seconds * SAMPLE_RATE);
	const samples = new Float32Array(total);

	for (let index = 0; index < total; index += 1) {
		const t = index / SAMPLE_RATE;
		const wobble = 1 + 0.04 * Math.sin(2 * Math.PI * 7 * t);
		const envelope = Math.min(1, t * 4) * Math.min(1, (seconds - t) * 4);
		samples[index] = (
			Math.sin(2 * Math.PI * 110 * wobble * t) * 0.6 +
			Math.sin(2 * Math.PI * 220 * wobble * t) * 0.3 +
			(Math.random() * 2 - 1) * 0.08
		) * envelope * volume;
	}

	return Array.from(samples);
}

const MUSIC = {
	'menu_loop.wav': ambient(8, [110, 165, 220, 330], 0.15),
	'office_loop.wav': ambient(8, [98, 147, 196, 294], 0.13),
	'field_loop.wav': ambient(8, [123, 185, 246, 370], 0.14),
	'tension_loop.wav': ambient(8, [87, 116, 175, 233], 0.15)
};

const SOUNDS = {
	'click.wav': blip(0.06, 900, 1200, 0.22),
	'success.wav': [].concat(blip(0.1, 660, 880, 0.28), blip(0.18, 880, 1320, 0.26)),
	'error.wav': [].concat(blip(0.12, 400, 260, 0.28), blip(0.16, 260, 180, 0.24)),
	'notify.wav': [].concat(blip(0.08, 1046, 1046, 0.24), blip(0.14, 1318, 1568, 0.22)),
	'drone.wav': droneSound(1.6)
};

/* ------------------------------------------------------------------------ */

console.log('Генерация болванок:');

CHARACTERS.forEach((character) => {
	write(path.join('assets', 'characters', character.dir, 'normal.svg'), characterSvg(character));
});

SCENES.forEach((scene) => {
	write(path.join('assets', 'scenes', scene.file), sceneSvg(scene));
});

IMAGES.forEach((image) => {
	write(path.join('assets', 'scenes', image.file), imageSvg(image));
});

write(path.join('assets', 'images', 'chain.svg'), imageSvg({
	title: 'Цепочка работы с данными',
	subtitle: 'сбор → обработка → анализ → решение → действие',
	top: '#1b3b33', bottom: '#0e1b16',
	body: `<g font-family="system-ui, sans-serif" font-size="22" fill="#43c59e">
		<text x="60" y="300">СБОР</text><text x="200" y="300">ОБРАБОТКА</text>
		<text x="380" y="300">АНАЛИЗ</text><text x="520" y="300">РЕШЕНИЕ</text>
		<text x="660" y="300">ДЕЙСТВИЕ</text>
	</g>`
}));

Object.entries(MUSIC).forEach(([file, samples]) => {
	write(path.join('assets', 'audio', 'music', file), wav(samples));
});

Object.entries(SOUNDS).forEach(([file, samples]) => {
	write(path.join('assets', 'audio', 'sound', file), wav(samples));
});

console.log('Готово.');

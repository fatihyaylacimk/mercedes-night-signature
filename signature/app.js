import {ATMOSPHERES, TOTAL_SECONDS, cleanName, possessive, normalizeConfig, encodeExperience, decodeExperience, chapterTime, timelineAt, poseAt, timeLabel, clamp} from './state.js';
import {AudioDirector} from '../studio/audio.js';
import {SCENES} from '../studio/scenes.js';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'signature-experience-v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const COPY = {
  tr: {
    nameLabel:'Adın veya baş harflerin',optional:'İSTEĞE BAĞLI',nameNote:'İmzanı bu cihazda hatırlarız.',
    start:'Deneyimi başlat',resume:'Kaldığın yerden devam',soundOff:'Ses kapalı',soundOn:'Ses açık',
    atmosphere:'ATMOSFERİNİ SEÇ',night:'Gece',studio:'Showroom',sunset:'Gün batımı',
    premiereNote:'SENİN ANIN.\nSENİN ATMOSFERİN.',pause:'Duraklat',play:'Devam et',
    explore:'Serbest incele',explorePhoto:'Adım adım keşfet',backToFilm:'Filme dön',
    openDoor:'Kapıyı aç',closeDoor:'Kapıyı kapat',lightsOn:'Farlar açık',lightsOff:'Farlar kapalı',
    orbitHint:'Döndürmek için aracı sürükle. Yaklaşmak için iki parmağını kullan.',zoomIn:'Yaklaş',zoomOut:'Uzaklaş',resetView:'Açıyı sıfırla',
    download:'İmzamı indir',share:'Bağlantıyı paylaş',replay:'Yeniden keşfet',editName:'İmzamı değiştir',skipToFinal:'İmzama geç',
    aboutEyebrow:'ÇALIŞMANIN ARDINDA',aboutTitle:'Bir otomobilden\nkişisel bir hikâyeye.',
    aboutCopy:'Fatih Yaylacı tarafından hazırlanan bağımsız bir tasarım ve etkileşim konsepti. Mercedes-Benz veya bir yetkili bayi tarafından sunulan resmî bir hizmet değildir.',
    modelCopy:'Üç boyutlu araç kaynağı Mercedes-AMG GT S 2016 modelidir. Kokpit ve ortam fotoğrafları ayrı görsel konseptlerdir; gerçek araç donanımını temsil etmez.',
    previousStudio:'GT Studio’yu aç',credits:'Kaynaklar ve katkılar',forget:'Kişisel tercihlerimi sıfırla',close:'Kapat',
    yourSignature:'SENİN İMZAN',shareTitle:'Hikâyeni yanında taşı.',shareCopy:'Bu bağlantı adını, seçtiğin atmosferi ve bulunduğun sahneyi içerir. İstediğin kişiyle paylaşabilirsin.',shareLabel:'Kişisel deneyim bağlantısı',copyLink:'Bağlantıyı kopyala',
    introEyebrow:'SANA ÖZEL BİR PRÖMİYER',introOne:'Gecenin sahibi.',introTwo:'Sensin.',introDescription:'Bir otomobil. Üç atmosfer.\nGeriye senin imzan kalır.',
    finalEyebrow:'SON KARE. SENİN İMZAN.',finalTwo:'imzası.',finalDescription:'Seçtiğin atmosferi ve imzanı yanında taşı.',
    orbitEyebrow:'KONTROL SENDE',orbitOne:'Her açıdan.',orbitTwo:'Senin bakışın.',orbitDescription:'Açıyı belirle. Işığı seç. Kendine ait anı bul.',
    photoLabel:'Görsel deneyim',threeLabel:'3D görünüm · GT S 2016',conceptLabel:'Kokpit · Görsel konsept',vehicleLabel:'Mercedes-AMG GT · Bağımsız konsept',
    photoExplanation:'Bu tarayıcıda görsel deneyim açık. Serbest 3D inceleme, destekleyen bir tarayıcıda otomatik olarak kullanılabilir.',
    threeExplanation:'Üç boyutlu araç etkin. Serbest incelemede sürükleme, iki parmakla yakınlaştırma ve klavyedeki yön tuşları kullanılabilir.',
    downloadBusy:'İmzan hazırlanıyor…',downloadDone:'İmza kartın indirildi.',downloadFail:'Görsel hazırlanamadı. Tekrar deneyebilirsin.',
    copied:'Kişisel bağlantın kopyalandı.',copyManual:'Bağlantıyı seçip kopyalayabilirsin.',imageFail:'Bu atmosfer görüntüsü yüklenemedi. Tekrar deneyebilirsin.',
    pausedHidden:'Deneyim duraklatıldı. Hazır olduğunda devam edebilirsin.',soundFail:'Ses başlatılamadı. Yeniden deneyebilirsin.',forgotten:'Kişisel tercihlerin sıfırlandı.',
    sceneNames:['Işık','Çizgiler','Kapı','Kokpit','Hareket','İmza'],
    scenes:[['İLK TEMAS','Bir dokunuş.','Bir başlangıç.','Her hikâye, küçük bir anla başlar.'],['ÇİZGİLERİN ARDINDA','Karakteri','yakından gör.','Işığın gövde üzerindeki yolculuğunu takip et.'],['İÇERİYE BİR DAVET','Bir kapı.','Yeni bir bakış.','Dışarıdaki dünyadan kendi alanına.'],['SENİN ATMOSFERİN','İçeriye geç.','Anı hisset.','Kokpit ve ambiyans için bir görsel konsept.'],['GECEYE KARIŞ','Bir yerden','daha fazlasına.','Hareket, hikâyenin ritmini değiştirir.'],['SON KARE','Senin','imzan.','Seçtiğin atmosfer. Sana ait son kare.']],
  },
  en: {
    nameLabel:'Your name or initials',optional:'OPTIONAL',nameNote:'We remember your signature on this device.',
    start:'Begin your experience',resume:'Continue your experience',soundOff:'Sound off',soundOn:'Sound on',
    atmosphere:'CHOOSE YOUR ATMOSPHERE',night:'Night',studio:'Showroom',sunset:'Sunset',
    premiereNote:'YOUR MOMENT.\nYOUR ATMOSPHERE.',pause:'Pause',play:'Continue',explore:'Explore freely',explorePhoto:'Explore step by step',backToFilm:'Back to the film',
    openDoor:'Open the door',closeDoor:'Close the door',lightsOn:'Lights on',lightsOff:'Lights off',orbitHint:'Drag the car to rotate. Pinch with two fingers to zoom.',zoomIn:'Zoom in',zoomOut:'Zoom out',resetView:'Reset angle',
    download:'Save my signature',share:'Share the experience',replay:'Experience it again',editName:'Edit my signature',skipToFinal:'My signature',
    aboutEyebrow:'BEHIND THE EXPERIENCE',aboutTitle:'From a car\nto a personal story.',
    aboutCopy:'An independent design and interaction concept by Fatih Yaylacı. This is not an official service from Mercedes-Benz or an authorised retailer.',
    modelCopy:'The 3D vehicle source is a 2016 Mercedes-AMG GT S. Cockpit and environment photographs are separate visual concepts and do not represent actual vehicle equipment.',
    previousStudio:'Open GT Studio',credits:'Sources and credits',forget:'Reset my personal preferences',close:'Close',yourSignature:'YOUR SIGNATURE',shareTitle:'Take your story with you.',shareCopy:'This link includes your name, atmosphere and current chapter. Share it with anyone you choose.',shareLabel:'Personal experience link',copyLink:'Copy link',
    introEyebrow:'A PRIVATE PREMIÈRE',introOne:'Own the night.',introTwo:'Make it yours.',introDescription:'One car. Three atmospheres.\nYour signature remains.',
    finalEyebrow:'THE LAST FRAME. YOUR SIGNATURE.',finalTwo:'signature.',finalDescription:'Take your atmosphere and signature with you.',
    orbitEyebrow:'YOU ARE IN CONTROL',orbitOne:'Every angle.',orbitTwo:'Your perspective.',orbitDescription:'Choose the angle. Shape the light. Find your moment.',
    photoLabel:'Visual experience',threeLabel:'3D view · 2016 GT S',conceptLabel:'Cockpit · Visual concept',vehicleLabel:'Mercedes-AMG GT · Independent concept',
    photoExplanation:'The visual experience is active in this browser. Free 3D exploration becomes available automatically in a supported browser.',
    threeExplanation:'The 3D vehicle is active. Drag, pinch to zoom, or use the arrow keys during free exploration.',
    downloadBusy:'Preparing your signature…',downloadDone:'Your signature card was downloaded.',downloadFail:'The image could not be created. Please try again.',copied:'Your personal link was copied.',copyManual:'Select the link to copy it manually.',imageFail:'This atmosphere image could not load. Please try again.',pausedHidden:'Your experience is paused. Continue when you are ready.',soundFail:'Audio could not start. Please try again.',forgotten:'Your personal preferences were reset.',
    sceneNames:['Light','Lines','Door','Cabin','Motion','Signature'],
    scenes:[['FIRST CONTACT','One touch.','One beginning.','Every story starts with a small moment.'],['BEHIND THE LINES','Character,','up close.','Follow the light as it travels across the body.'],['AN INVITATION INSIDE','One door.','A new perspective.','From the world outside to a space of your own.'],['YOUR ATMOSPHERE','Step inside.','Feel the moment.','A visual concept for the cockpit and ambient light.'],['INTO THE NIGHT','More than','a destination.','Movement changes the rhythm of your story.'],['THE LAST FRAME','Your','signature.','Your atmosphere. Your final frame.']],
  },
};

let remembered;
try { remembered = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch {}
const shared = decodeExperience(location.hash);
let config = normalizeConfig(shared || remembered);
if (!shared) config.chapter = 0;
const state = {started: Boolean(shared), elapsed: shared ? (config.chapter === 5 ? TOTAL_SECONDS : chapterTime(config.chapter, .2)) : 0, playing:false, orbit:false, doorOpen:false, lights:true, yaw:2.4, pitch:.22, distance:6.5};
const audio = new AudioDirector($('narration'));
let renderer = null, rendererReady = false, frame = 0, lastFrame = 0, lastChapter = -1, lastClock = '', lastPoster = '', toastTimer, modelAttempted = false;
const images = new Map();
const voiceIndices = [0, 1, 2, 2, 4, 5];
const text = key => COPY[config.lang][key];
const signatureWord = () => config.lang === 'tr' && !config.name ? 'imzan.' : text('finalTwo');
const current = () => timelineAt(state.elapsed);
const currentAudioScene = () => SCENES[voiceIndices[current().chapter]];
const screen = () => !state.started ? 'intro' : state.orbit ? 'explore' : current().complete ? 'final' : 'playing';

function remember() {
  config.chapter = current().chapter;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeConfig(config))); } catch {}
}

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 4000);
}

function imageFor(atmosphere = config.atmosphere) { return new URL(`assets/${atmosphere}.webp`, import.meta.url).href; }

function loadImage(url) {
  if (!images.has(url)) images.set(url, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => { images.delete(url); reject(new Error('Image unavailable')); };
    image.src = url;
  }));
  return images.get(url);
}

async function setAtmosphere(value, notify = false) {
  if (!ATMOSPHERES.includes(value)) return;
  config.atmosphere = value;
  document.body.dataset.atmosphere = value;
  document.querySelector('meta[name="theme-color"]').content = {night:'#080b0f',studio:'#e9eaeb',sunset:'#15100e'}[value];
  for (const button of document.querySelectorAll('[data-atmosphere]')) {
    if (button instanceof HTMLButtonElement) button.setAttribute('aria-pressed', String(button.dataset.atmosphere === value));
  }
  remember();
  requestFrame();
  const source = imageFor(value);
  if (lastPoster === source) return;
  try {
    const image = await loadImage(source);
    if (config.atmosphere !== value) return;
    $('poster').src = image.src;
    lastPoster = source;
  } catch { if (notify) toast(text('imageFail')); }
}

function setHeading(one, two, description, eyebrow) {
  $('line-one').textContent = one;
  $('line-two').textContent = two;
  $('description').textContent = description;
  $('eyebrow').textContent = eyebrow;
}

function fitPersonalHeading() {
  $('line-one').style.fontSize = '';
  $('line-two').style.fontSize = '';
  if (!config.name) return;
  const view = screen();
  const element = view === 'intro' ? $('line-two') : view === 'final' || (current().chapter === 5 && !state.orbit) ? $('line-one') : null;
  if (!element) return;
  const style = getComputedStyle(element);
  const context = document.createElement('canvas').getContext('2d');
  const baseSize = parseFloat(style.fontSize);
  context.font = `${style.fontStyle} ${style.fontWeight} ${baseSize}px ${style.fontFamily}`;
  const measured = context.measureText(element.textContent).width;
  const available = $('headline').clientWidth * .97;
  if (measured > available) element.style.fontSize = Math.max(25, Math.floor(baseSize * available / measured)) + 'px';
}

function renderUI() {
  const view = screen();
  const at = current();
  document.documentElement.lang = config.lang;
  document.title = config.lang === 'tr' ? 'Gecenin Sahibi Sensin · Signature Experience' : 'Own the Night · Signature Experience';
  document.body.dataset.screen = view;
  document.body.dataset.chapter = String(state.started ? at.chapter : 0);
  const skip = document.querySelector('.skip-link');
  skip.href = view === 'intro' ? '#name' : '#chapters';
  skip.textContent = config.lang === 'tr' ? view === 'intro' ? 'Kişiselleştirmeye geç' : 'Sahnelere geç' : view === 'intro' ? 'Skip to personalisation' : 'Skip to chapters';
  $('experience').setAttribute('aria-label',config.lang === 'tr' ? 'Kişisel otomobil prömiyeri' : 'Personal car premiere');
  $('chapters').setAttribute('aria-label',config.lang === 'tr' ? 'Deneyim sahneleri' : 'Experience chapters');
  $('vehicle').setAttribute('aria-label',config.lang === 'tr' ? 'Mercedes-AMG GT S 2016 üç boyutlu araç' : '2016 Mercedes-AMG GT S three-dimensional vehicle');
  document.querySelector('.brand').setAttribute('aria-label',config.lang === 'tr' ? 'GT Studio’ya dön' : 'Back to GT Studio');
  document.querySelector('.author span').textContent = config.lang === 'tr' ? 'BAĞIMSIZ KONSEPT' : 'INDEPENDENT CONCEPT';
  for (const element of document.querySelectorAll('[data-i18n]')) {
    const copy = text(element.dataset.i18n);
    if (typeof copy === 'string') element.textContent = copy;
  }
  $('language').textContent = config.lang === 'tr' ? 'EN' : 'TR';
  $('language').setAttribute('aria-label', config.lang === 'tr' ? 'Switch to English' : 'Türkçeye geç');
  $('name').placeholder = config.lang === 'tr' ? 'Örn. Fatih' : 'e.g. Alex';
  $('start-label').textContent = text(shared && !state.started ? 'resume' : 'start');
  $('welcome-form').hidden = view !== 'intro';
  $('scene-actions').hidden = view === 'intro' || view === 'final';
  $('final-actions').hidden = view !== 'final';
  $('orbit-actions').hidden = !state.orbit || !rendererReady;
  $('chapters').hidden = !state.started;
  $('premiere-note').hidden = state.started;
  $('playback-track').hidden = !state.started;
  $('clock').hidden = !state.started;
  $('finish').hidden = view === 'intro' || view === 'final';
  $('play-toggle').textContent = text(state.playing ? 'pause' : 'play');
  $('explore-toggle').textContent = text(state.orbit ? 'backToFilm' : rendererReady ? 'explore' : 'explorePhoto');
  $('door-toggle').textContent = text(state.doorOpen ? 'closeDoor' : 'openDoor');
  $('door-toggle').setAttribute('aria-pressed', String(state.doorOpen));
  $('light-toggle').textContent = text(state.lights ? 'lightsOn' : 'lightsOff');
  $('light-toggle').setAttribute('aria-pressed', String(state.lights));
  $('sound').textContent = text(audio.enabled ? 'soundOn' : 'soundOff');
  $('sound').setAttribute('aria-pressed', String(audio.enabled));
  $('render-label').textContent = text(state.started && at.chapter === 3 && !state.orbit ? 'conceptLabel' : rendererReady && state.started ? 'threeLabel' : 'photoLabel');
  $('visual-label').textContent = text(state.started && at.chapter === 3 && !state.orbit ? 'conceptLabel' : 'vehicleLabel');
  $('render-explanation').textContent = text(rendererReady ? 'threeExplanation' : 'photoExplanation');
  $('vehicle').tabIndex = state.orbit && rendererReady ? 0 : -1;
  $('vehicle').setAttribute('aria-hidden', String(!rendererReady || !state.started || (at.chapter === 3 && !state.orbit)));

  if (view === 'intro') {
    setHeading(text('introOne'), config.name ? config.name + '.' : text('introTwo'), text('introDescription'), text('introEyebrow'));
  } else if (view === 'explore') {
    setHeading(text('orbitOne'), text('orbitTwo'), text('orbitDescription'), text('orbitEyebrow'));
  } else if (view === 'final') {
    setHeading(possessive(config.name, config.lang), signatureWord(), text('finalDescription'), text('finalEyebrow'));
  } else {
    const [eyebrow, one, two, description] = text('scenes')[at.chapter];
    setHeading(at.chapter === 5 ? possessive(config.name, config.lang) : one, at.chapter === 5 ? signatureWord() : two, description, eyebrow);
  }

  for (const button of $('chapters').children) {
    const index = Number(button.dataset.chapter);
    button.querySelector('.chapter-title').textContent = text('sceneNames')[index];
    button.setAttribute('aria-label', `${index + 1}. ${text('sceneNames')[index]}`);
    if (index === at.chapter) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
  $('detail-image').hidden = !state.started || state.orbit || at.chapter !== 3;
  $('reveal-veil').style.opacity = state.started && at.chapter === 0 && !state.orbit && !reducedMotion.matches ? String(.85 * (1 - clamp(at.local * 2.5))) : '0';
  fitPersonalHeading();
}

function syncChapter() {
  const chapter = current().chapter;
  if (chapter !== lastChapter) {
    lastChapter = chapter;
    renderUI();
    if (state.started && audio.enabled) audio.schedule(currentAudioScene());
    remember();
  }
}

function requestFrame() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }

function draw(now) {
  frame = 0;
  const delta = lastFrame ? clamp((now - lastFrame) / 1000, 0, .12) : 0;
  lastFrame = now;
  if (state.playing) {
    state.elapsed = Math.min(TOTAL_SECONDS, state.elapsed + delta);
    if (state.elapsed >= TOTAL_SECONDS) { state.playing = false; renderUI(); }
  }
  syncChapter();
  const at = current();
  if (state.started) {
    $('playback-progress').style.transform = `scaleX(${at.progress})`;
    const label = timeLabel(state.elapsed) + ' / ' + timeLabel(TOTAL_SECONDS);
    if (label !== lastClock) { $('clock').textContent = label; lastClock = label; }
  }
  if (state.started && at.chapter === 0 && !state.orbit && !reducedMotion.matches) $('reveal-veil').style.opacity = String(.85 * (1 - clamp(at.local * 2.5)));
  if (rendererReady && state.started) {
    const pose = poseAt(at.chapter, reducedMotion.matches ? .5 : at.local);
    if (state.orbit) {
      pose.orbit = true;
      pose.camera = [-.22 + state.distance * Math.cos(state.yaw) * Math.cos(state.pitch), .5 + state.distance * Math.sin(state.pitch), state.distance * Math.sin(state.yaw) * Math.cos(state.pitch)];
      pose.target = [-.22, .5, 0];
      pose.doorAngle = state.doorOpen ? -Math.PI * .36 : 0;
      pose.cockpit = 0;
      pose.tunnel = 0;
      pose.light = 1;
    }
    pose.headlights = state.lights;
    pose.atmosphere = config.atmosphere;
    try { renderer.render(pose); }
    catch { activatePhotoMode(); }
    audio.update(pose, state.playing ? .018 : 0);
  }
  if (state.playing) requestFrame();
}

function activatePhotoMode() {
  rendererReady = false;
  try { renderer?.dispose(); } catch {}
  renderer = null;
  state.orbit = false;
  document.body.dataset.renderer = 'photo';
  renderUI();
}

async function prepareModel() {
  if (modelAttempted) return;
  modelAttempted = true;
  try {
    const {SignatureRenderer} = await import('./renderer.js');
    renderer = new SignatureRenderer($('vehicle'));
    await renderer.load();
    rendererReady = true;
    document.body.dataset.renderer = 'three';
    renderUI();
    requestFrame();
  } catch { activatePhotoMode(); }
}

function pause() {
  state.playing = false;
  audio.suspend();
  renderUI();
  requestFrame();
}

function begin() {
  config.name = cleanName($('name').value);
  $('name').value = config.name;
  state.started = true;
  state.orbit = false;
  state.elapsed = 0;
  state.playing = true;
  lastFrame = 0;
  lastChapter = -1;
  remember();
  renderUI();
  if (audio.enabled) audio.resume(currentAudioScene());
  requestFrame();
  prepareModel();
  $('play-toggle').focus({preventScroll:true});
}

function jumpChapter(index) {
  state.started = true;
  state.orbit = false;
  state.playing = false;
  state.elapsed = index === 5 ? TOTAL_SECONDS : chapterTime(index, .24);
  audio.suspend();
  lastChapter = -1;
  renderUI();
  requestFrame();
  prepareModel();
}

function finish() {
  jumpChapter(5);
  $('download').focus({preventScroll:true});
}

for (let index = 0; index < 6; index++) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.chapter = String(index);
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('div');
  title.className = 'chapter-title';
  button.append(number, title);
  button.addEventListener('click', () => { jumpChapter(index); toast(text('sceneNames')[index]); });
  $('chapters').append(button);
}

$('welcome-form').addEventListener('submit', event => { event.preventDefault(); begin(); });
$('name').value = config.name;
$('name').addEventListener('input', () => { config.name = cleanName($('name').value); remember(); $('line-two').textContent = config.name ? config.name + '.' : text('introTwo'); fitPersonalHeading(); });
$('name').addEventListener('blur', () => { $('name').value = cleanName($('name').value); });
for (const button of document.querySelectorAll('.atmosphere-options button')) button.addEventListener('click', () => setAtmosphere(button.dataset.atmosphere, true));

$('play-toggle').addEventListener('click', () => {
  if (state.playing) pause();
  else {
    state.orbit = false;
    state.playing = true;
    lastFrame = 0;
    if (audio.enabled) audio.resume(currentAudioScene());
    renderUI();
    requestFrame();
  }
});
$('explore-toggle').addEventListener('click', () => {
  pause();
  if (rendererReady) {
    state.orbit = !state.orbit;
    renderUI();
    requestFrame();
    if (state.orbit) $('vehicle').focus({preventScroll:true});
  } else {
    const next = (current().chapter + 1) % 6;
    jumpChapter(next);
  }
});
$('finish').addEventListener('click', finish);
$('replay').addEventListener('click', begin);
$('edit-name').addEventListener('click', () => {
  pause();state.started = false;state.orbit = false;state.elapsed = 0;
  $('name').value = config.name;renderUI();requestFrame();$('name').focus({preventScroll:true});
});
$('language').addEventListener('click', () => {
  config.lang = config.lang === 'tr' ? 'en' : 'tr';
  audio.lang = config.lang;
  if (audio.enabled) audio.language(config.lang, currentAudioScene());
  renderUI();remember();
});
$('sound').addEventListener('click', async () => {
  try { await audio.setEnabled(!audio.enabled, currentAudioScene()); }
  catch { try { await audio.setEnabled(false); } catch {} toast(text('soundFail')); }
  renderUI();
});
$('door-toggle').addEventListener('click', () => { state.doorOpen = !state.doorOpen; renderUI(); requestFrame(); });
$('light-toggle').addEventListener('click', () => { state.lights = !state.lights; renderUI(); requestFrame(); });
$('zoom-in').addEventListener('click', () => { state.distance = clamp(state.distance - .6, 3.5, 10); requestFrame(); });
$('zoom-out').addEventListener('click', () => { state.distance = clamp(state.distance + .6, 3.5, 10); requestFrame(); });
$('reset-view').addEventListener('click', () => { Object.assign(state,{yaw:2.4,pitch:.22,distance:6.5,doorOpen:false});renderUI();requestFrame(); });

const pointers = new Map();
let pinchDistance = 0;
$('vehicle').addEventListener('pointerdown', event => {
  if (!state.orbit || !rendererReady) return;
  $('vehicle').setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, [event.clientX,event.clientY]);
  pinchDistance = 0;
});
$('vehicle').addEventListener('pointermove', event => {
  if (!state.orbit || !pointers.has(event.pointerId)) return;
  const previous = pointers.get(event.pointerId);
  pointers.set(event.pointerId, [event.clientX,event.clientY]);
  if (pointers.size === 1) {
    state.yaw -= (event.clientX - previous[0]) * .008;
    state.pitch = clamp(state.pitch + (event.clientY - previous[1]) * .004, .08, .65);
  } else {
    const [a,b] = [...pointers.values()];
    const next = Math.hypot(a[0] - b[0],a[1] - b[1]);
    if (pinchDistance > 0 && next > 0) state.distance = clamp(state.distance * pinchDistance / next, 3.5, 10);
    pinchDistance = next;
  }
  requestFrame();
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) $('vehicle').addEventListener(type, event => { pointers.delete(event.pointerId);pinchDistance = 0; });
$('vehicle').addEventListener('wheel', event => {
  if (!state.orbit || !rendererReady) return;
  event.preventDefault();state.distance = clamp(state.distance + event.deltaY * .005, 3.5, 10);requestFrame();
}, {passive:false});
$('vehicle').addEventListener('keydown', event => {
  if (!state.orbit || !rendererReady) return;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowLeft') state.yaw -= .12;
  if (event.key === 'ArrowRight') state.yaw += .12;
  if (event.key === 'ArrowUp') state.pitch = clamp(state.pitch + .06,.08,.65);
  if (event.key === 'ArrowDown') state.pitch = clamp(state.pitch - .06,.08,.65);
  if (event.key === '+') state.distance = clamp(state.distance - .4,3.5,10);
  if (event.key === '-') state.distance = clamp(state.distance + .4,3.5,10);
  requestFrame();
});
$('vehicle').addEventListener('webglcontextlost', event => { event.preventDefault();activatePhotoMode(); });

function personalUrl() {
  const url = new URL('./', location.href);
  url.search = '';
  url.hash = encodeExperience({...config,chapter:current().chapter});
  return url.href;
}

function openDialog(dialog) { if (state.playing) pause();dialog.showModal(); }
for (const button of document.querySelectorAll('.close-dialog')) button.addEventListener('click', () => button.closest('dialog').close());
$('about-open').addEventListener('click', () => openDialog($('about-dialog')));
$('share').addEventListener('click', async () => {
  const url = personalUrl();
  if (navigator.share) {
    try { await navigator.share({title:'Signature Experience',text:possessive(config.name, config.lang) + ' ' + signatureWord(),url});return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  $('share-url').value = url;
  openDialog($('share-dialog'));
});
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-url').value);$('share-dialog').close();toast(text('copied')); }
  catch { $('share-url').focus();$('share-url').select();toast(text('copyManual')); }
});
$('share-url').addEventListener('click', () => $('share-url').select());

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  context.save();context.beginPath();context.rect(x,y,width,height);context.clip();
  context.drawImage(image,x + (width - image.width * scale)/2,y + (height - image.height * scale)/2,image.width * scale,image.height * scale);context.restore();
}

$('download').addEventListener('click', async () => {
  const button = $('download');
  button.disabled = true;button.setAttribute('aria-busy','true');toast(text('downloadBusy'));
  try {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');canvas.width = 1600;canvas.height = 1000;
    const context = canvas.getContext('2d');
    const light = config.atmosphere === 'studio';
    context.fillStyle = light ? '#e9eaeb' : config.atmosphere === 'sunset' ? '#15100e' : '#080b0f';context.fillRect(0,0,1600,1000);
    let image;
    if (rendererReady) {
      const pose = poseAt(5,.8);pose.atmosphere=config.atmosphere;pose.headlights=true;renderer.render(pose);
      image = await loadImage(renderer.exportImage());
    } else image = await loadImage(imageFor());
    drawCover(context,image,0,0,1600,830);
    const foreground = light ? '#142536' : '#f1f2ed';
    context.fillStyle=foreground;context.font='15px Arial';context.fillText('MERCEDES-AMG  /  SIGNATURE EXPERIENCE',64,66);
    const title=possessive(config.name,config.lang)+' '+signatureWord();
    let size=74;context.font=`${size}px Georgia`;
    while(context.measureText(title).width>1450 && size>32){size-=2;context.font=`${size}px Georgia`;}
    context.fillText(title,64,900);
    context.font='16px Arial';context.globalAlpha=.7;
    context.fillText(text(config.atmosphere)+' · '+(config.lang==='tr'?'Bağımsız görsel konsept':'Independent visual concept'),67,942);
    context.textAlign='right';context.fillText('Fatih Yaylacı',1536,942);context.globalAlpha=1;
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Export failed')),'image/png'));
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='Signature-Experience-'+config.atmosphere+'.png';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast(text('downloadDone'));
  } catch { toast(text('downloadFail')); }
  finally {button.disabled=false;button.removeAttribute('aria-busy');requestFrame();}
});

$('forget').addEventListener('click', () => {
  pause();config=normalizeConfig({lang:config.lang});Object.assign(state,{started:false,elapsed:0,orbit:false,playing:false,doorOpen:false,lights:true});
  try {localStorage.removeItem(STORAGE_KEY);} catch {}
  if (location.hash) history.replaceState(null,'',location.pathname+location.search);
  $('name').value='';$('about-dialog').close();setAtmosphere('night');renderUI();toast(text('forgotten'));$('name').focus({preventScroll:true});
});
addEventListener('resize', () => {renderer?.resize();fitPersonalHeading();requestFrame();});
document.addEventListener('visibilitychange', () => {
  if(document.hidden){if(state.playing){pause();toast(text('pausedHidden'));}cancelAnimationFrame(frame);frame=0;audio.suspend();}
  else{lastFrame=0;requestFrame();}
});
addEventListener('hashchange', () => {
  const incoming=decodeExperience(location.hash);if(!incoming)return;
  pause();config=incoming;state.started=true;state.orbit=false;state.elapsed=config.chapter===5?TOTAL_SECONDS:chapterTime(config.chapter,.2);$('name').value=config.name;audio.lang=config.lang;setAtmosphere(config.atmosphere);lastChapter=-1;renderUI();requestFrame();prepareModel();
});
addEventListener('pagehide', event => {cancelAnimationFrame(frame);frame=0;audio.suspend();if(!event.persisted)renderer?.dispose();});
addEventListener('pageshow', () => {lastFrame=0;requestFrame();});

audio.lang=config.lang;
renderUI();setAtmosphere(config.atmosphere);requestFrame();
if(state.started)prepareModel();
setTimeout(()=>{for(const atmosphere of ATMOSPHERES)loadImage(imageFor(atmosphere)).catch(()=>{});},1000);

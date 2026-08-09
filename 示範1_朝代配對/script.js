const dynasties = [
  { id: 'qin', name: '秦', img: 'qin.png' }, { id: 'han', name: '漢', img: 'han.png' },
  { id: 'tang', name: '唐', img: 'tang.png' }, { id: 'song', name: '宋', img: 'song.png' },
  { id: 'ming', name: '明', img: 'ming.png' }, { id: 'qing', name: '清', img: 'qing.png' }
];
const events = [
  ['qin','秦始皇統一中國'],['qin','修築萬里長城'],['han','張騫出使西域'],['han','絲綢之路興盛'],['han','漢武帝推行儒學'],
  ['tang','唐太宗開創貞觀之治'],['tang','玄奘西行取經'],['tang','唐詩繁盛'],['song','活字印刷術發明'],['song','指南針用於航海'],
  ['ming','鄭和下西洋'],['ming','修築明長城'],['qing','康熙、乾隆時國力強盛'],['qing','鴉片戰爭爆發']
].map(([dynasty, text], id) => ({ dynasty, text, id }));

let remaining = [];
let selected = null;
let dragged = null;
const grid = document.querySelector('#dynastyGrid');
const pile = document.querySelector('#eventPile');
const progress = document.querySelector('#progress');
const message = document.querySelector('#message');
const shuffle = list => [...list].sort(() => Math.random() - 0.5);

function makeEvent(event) {
  const card = document.createElement('button');
  card.className = 'event-card'; card.type = 'button'; card.textContent = event.text;
  card.draggable = true; card.dataset.id = event.id;
  card.addEventListener('dragstart', () => { dragged = event; card.classList.add('dragging'); });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));
  card.addEventListener('click', () => selectEvent(event, card));
  return card;
}

function selectEvent(event, card) {
  document.querySelectorAll('.event-card.selected').forEach(el => el.classList.remove('selected'));
  selected = selected?.id === event.id ? null : event;
  if (selected) card.classList.add('selected');
  message.textContent = selected ? `已選取「${event.text}」，請點選正確的朝代圖卡。` : '已取消選擇。';
}

function render() {
  grid.innerHTML = '';
  dynasties.forEach(dynasty => {
    const card = document.createElement('article');
    card.className = 'dynasty-card'; card.dataset.dynasty = dynasty.id;
    card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', `選擇${dynasty.name}朝`);
    card.innerHTML = `<img class="dynasty-art" src="assets/images/${dynasty.img}" alt="${dynasty.name}朝主題插圖"><h3>${dynasty.name}朝</h3><div class="drop-zone">點此選擇${dynasty.name}朝</div>`;
    card.addEventListener('dragover', ev => { ev.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', ev => { ev.preventDefault(); card.classList.remove('drag-over'); if (dragged) attempt(dynasty.id, dragged); });
    card.addEventListener('click', () => { if (selected) attempt(dynasty.id, selected); });
    card.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && selected) { ev.preventDefault(); attempt(dynasty.id, selected); } });
    grid.append(card);
  });
  pile.innerHTML = '';
  remaining.forEach(event => pile.append(makeEvent(event)));
  progress.textContent = `已完成 ${events.length - remaining.length} / ${events.length}`;
}

function attempt(target, event) {
  if (target !== event.dynasty) {
    message.textContent = '這張卷軸還沒找到正確的時代，請再想想！'; selected = null;
    document.querySelectorAll('.event-card.selected').forEach(el => el.classList.remove('selected'));
    return;
  }
  const card = grid.querySelector(`[data-dynasty="${target}"]`);
  const eventCard = document.querySelector(`[data-id="${event.id}"]`);
  if (eventCard) card.querySelector('.drop-zone').append(eventCard);
  eventCard?.classList.remove('selected');
  const seal = document.createElement('span'); seal.className = 'seal'; seal.textContent = '正確'; card.append(seal);
  setTimeout(() => seal.remove(), 850);
  remaining = remaining.filter(item => item.id !== event.id); selected = null;
  message.textContent = '配對正確，卷軸已鎖定！';
  progress.textContent = `已完成 ${events.length - remaining.length} / ${events.length}`;
  if (!remaining.length) setTimeout(() => { document.querySelector('#winModal').hidden = false; }, 600);
}

function reset() {
  remaining = shuffle(events); selected = null; dragged = null;
  message.textContent = '卷軸已重新洗牌，請先點選一張卷軸。';
  document.querySelector('#winModal').hidden = true; render();
}
document.querySelector('#resetBtn').addEventListener('click', reset);
document.querySelector('#playAgain').addEventListener('click', reset);
reset();

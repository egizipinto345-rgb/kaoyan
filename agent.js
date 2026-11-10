/* 研向 / local direction engine.
   The prototype runs fully in the browser: no key, no server, no fabricated admission numbers.
   Replace runAgent() with a POST to Dify / FastAPI / an OpenAI-compatible endpoint later. */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const askForm = $('#diagnose');
const askInput = $('#askInput');
const resultArea = $('#resultArea');
const statusEl = $('#agentStatus');
const profileMajor = $('#profileMajor');
const profileRegion = $('#profileRegion');
const profileMath = $('#profileMath');
const toastEl = $('#toast');
const formStatus = $('#agentFormStatus');

let busy = false;
let toastTimer;

function toast(message) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('is-on');
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function detectProfile(text) {
  const lower = text.toLowerCase();
  let major = '待补充';
  const majorRules = [
    [/自动化|控制|电气|机器人/, '自动化 / 控制'],
    [/计算机|软件|人工智能|\bai\b|算法|数据科学/, '计算机 / AI'],
    [/金融|经济|会计|审计|管理/, '经管'],
    [/法学|法硕|法律/, '法学'],
    [/新闻|传播|中文|汉语言|教育|心理/, '人文社科'],
    [/机械|材料|能源|土木|化工/, '工科'],
    [/英语|翻译|外语/, '外语'],
    [/医学|临床|药学|护理/, '医学']
  ];
  for (const [pattern, value] of majorRules) {
    if (pattern.test(lower)) { major = value; break; }
  }

  let region = '待补充';
  const regions = [
    ['长三角', /长三角|上海|江苏|浙江|南京|杭州|苏州/],
    ['京津冀', /京津冀|北京|天津|河北/],
    ['华中', /华中|武汉|湖南|湖北|长沙/],
    ['华南', /华南|广东|广州|深圳|福建/],
    ['西南', /西南|四川|成都|重庆|云南/],
    ['东北', /东北|辽宁|吉林|黑龙江|沈阳|大连/],
    ['西北', /西北|陕西|西安|甘肃/]
  ];
  for (const [name, pattern] of regions) {
    if (pattern.test(text)) { region = name; break; }
  }

  let math = '一般';
  if (/数学差|数学弱|数学不好|零基础|没学过高数|高数一般/.test(text)) math = '偏弱';
  else if (/数学好|数学强|高数扎实|线代扎实|数学基础扎实/.test(text)) math = '较强';
  else if (/数一|数学一/.test(text)) math = '数一';
  else if (/数二|数学二/.test(text)) math = '数二';
  else if (/396|经济类联考/.test(text)) math = '396';

  let budget = '待补充';
  const budgetMatch = text.match(/([1-9]|1[0-2])\s*(小时|h)/i);
  if (budgetMatch) budget = `${budgetMatch[1]} 小时/天`;

  return { major, region, math, budget };
}
function chooseTrack(text, profile) {
  const lower = text.toLowerCase();

  if (/金融|经济|会计|审计|管理|396/.test(lower)) {
    return {
      key: 'finance',
      title: '先比较应用经济学与金融专硕，不要只看报录比。',
      copy: '经管方向的核心不是名字听起来像，而是数学科目、专业课范围、复试规则和就业口径是否一致。先把 396 与数三、金融专硕与应用经济学分开看。',
      fits: [['金融专硕 · 应用型', 84], ['应用经济学 · 学术型', 79], ['管理科学与工程', 74]],
      next: ['先定 396 / 数三', '核验专业课', '查复试比例'],
      source: ['研招网 · 专业目录', '院校 · 招生简章', '近三年录取名单']
    };
  }

  if (/法学|法硕|法律/.test(lower)) {
    return {
      key: 'law',
      title: '先区分法学硕士与法律硕士，再谈院校。',
      copy: '法硕的报考条件、考试科目和培养路径与法学硕士不同。跨考要先确认是否符合报考条件，再比较专业课范围与复试要求。',
      fits: [['法律硕士 · 非法学', 88], ['法学硕士 · 理论法学', 64], ['法律硕士 · 法学', 42]],
      next: ['核验报考条件', '看专业课范围', '查招生名额'],
      source: ['研招网 · 专业目录', '院校 · 招生简章', '复试细则']
    };
  }

  if (/新闻|传播|中文|汉语言|教育|心理|人文|外语|翻译/.test(lower)) {
    return {
      key: 'humanities',
      title: '先看学科口径和专业课，不要只追好上岸。',
      copy: '人文社科方向对阅读量、写作能力和专业课积累要求高。先比较同一名称在不同院校的考试范围，再判断迁移成本。',
      fits: [['新闻与传播', 80], ['教育学 · 学科教学', 76], ['中国语言文学', 68]],
      next: ['比较专业课', '核验参考书', '看复试作品'],
      source: ['研招网 · 专业目录', '院校 · 参考书目', '复试细则']
    };
  }
  if (/计算机|软件|人工智能|\bai\b|算法|数据科学/.test(lower)) {
    if (profile.major === '自动化 / 控制') {
      return {
        key: 'ai-cross',
        title: '先看电子信息与控制科学，纯计算机学硕放到冲刺位。',
        copy: '你的课程迁移路径更接近控制和信号处理，不是从零补计算机本科。下一步重点核验数学科目、复试加试和近三年录取名单。',
        fits: [['控制科学与工程', 86], ['电子信息 · AI 方向', 82], ['计算机学硕', 61]],
        next: ['先补概率与算法', '核验数一 / 数二', '查复试加试'],
        source: ['研招网 · 专业目录', '院校 · 复试细则', '近三年录取名单']
      };
    }
    return {
      key: 'cs',
      title: '先比较计算机学硕、电子信息专硕和软件工程。',
      copy: '这三个名字相近，但数学科目、专业课代码、培养方式和复试规则可能完全不同。先把考试科目对齐，再决定学校层级。',
      fits: [['计算机学硕', 84], ['电子信息 · 计算机技术', 80], ['软件工程', 75]],
      next: ['先查专业课代码', '比较数一 / 数二', '看复试机试'],
      source: ['研招网 · 专业目录', '院校 · 复试细则', '录取名单']
    };
  }

  if (/自动化|控制|电气|机械|机器人|工科/.test(lower)) {
    return {
      key: 'engineering',
      title: '先确认你要做控制、器件还是系统，再选专业。',
      copy: '工科方向的关键是课程连续性和实验能力。控制科学、电气工程、机械工程看起来相近，但专业课与复试要求差异明显。',
      fits: [['控制科学与工程', 84], ['电气工程', 78], ['机械工程', 72]],
      next: ['确认专业课', '核验数学科目', '看实验要求'],
      source: ['研招网 · 专业目录', '院校 · 初试科目', '复试细则']
    };
  }

  return {
    key: 'general',
    title: '先补齐三个变量，再让方向判断变得具体。',
    copy: '目前信息还不足以给出可靠的方向排序。请补充本科专业、数学基础、目标地区，以及你更看重学校层级还是专业方向。',
    fits: [['先做专业迁移分析', 0], ['再比对考试科目', 0], ['最后排院校梯度', 0]],
    next: ['补充本科课程', '补充目标地区', '补充数学基础'],
    source: ['研向方向框架', '研招网 · 专业目录', '院校 · 招生信息']
  };
}
function scoreAdjust(track, profile) {
  const mathPenalty = profile.math === '偏弱' ? 6 : profile.math === '较强' ? -2 : 0;
  return track.fits.map(([name, score], index) => {
    if (!score) return [name, score];
    const adjusted = Math.max(35, Math.min(96, score - mathPenalty + (index === 0 ? 2 : 0)));
    return [name, adjusted];
  });
}

function fitMarkup(fits) {
  return fits.map(([name, score], index) => `
    <div class="fit-row">
      <span>${escapeHtml(name)}</span>
      <b>${score || '—'}</b>
      <span class="fit-bar"><i ${index === fits.length - 1 ? 'data-low' : ''} style="width:${score || 0}%"></i></span>
    </div>
  `).join('');
}

function resultMarkup(query, track, profile) {
  const sourceTags = track.source.map((source) => `<span>${escapeHtml(source)}</span>`).join('');
  return `
    <div class="msg-line user">
      <span class="msg-avatar" aria-hidden="true">你</span>
      <div class="msg-bubble">${escapeHtml(query)}</div>
    </div>
    <div class="msg-line">
      <span class="msg-avatar" aria-hidden="true">研</span>
      <div class="msg-bubble">
        <p class="result-kicker">DIRECTION SIGNAL / 本地判断</p>
        <h2 class="result-title">${escapeHtml(track.title)}</h2>
        <p class="result-copy">${escapeHtml(track.copy)}</p>
        <div class="fit-list" aria-label="方向适配度">${fitMarkup(scoreAdjust(track, profile))}</div>
        <div class="result-next">${track.next.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>
        <div class="msg-meta">${sourceTags}<span>非官方数据 · 需逐校核验</span></div>
      </div>
    </div>
  `;
}
function setThinking() {
  statusEl.textContent = 'THINKING · MATCHING';
  resultArea.innerHTML = `
    <div class="msg-line user">
      <span class="msg-avatar" aria-hidden="true">你</span>
      <div class="msg-bubble">正在拆解你的背景变量…</div>
    </div>
    <div class="msg-line">
      <span class="msg-avatar" aria-hidden="true">研</span>
      <div class="msg-bubble">
        <div class="result-thinking">
          <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>对齐专业迁移、考试科目与信息核验项</span>
        </div>
      </div>
    </div>
  `;
  resultArea.scrollTop = 0;
}

async function runAgent(query) {
  if (busy) {
    toast('研向还在整理上一条问题');
    return;
  }

  const text = query.trim();
  if (text.length < 4) {
    toast('再多写一点背景，判断会更具体');
    askInput.focus();
    return;
  }

  busy = true;
  statusEl.textContent = 'THINKING · MATCHING';
  if (formStatus) formStatus.textContent = '正在分析你的背景并生成方向判断。';
  setThinking();

  const profile = detectProfile(text);
  profileMajor.textContent = profile.major;
  profileRegion.textContent = profile.region;
  profileMath.textContent = profile.math;

  await new Promise((resolve) => setTimeout(resolve, 620));

  const track = chooseTrack(text, profile);
  resultArea.innerHTML = resultMarkup(text, track, profile);
  resultArea.scrollTop = 0;
  statusEl.textContent = 'READY · LOCAL ENGINE';
  if (formStatus) formStatus.textContent = '方向判断已生成，请查看结果。';

  try {
    localStorage.setItem('yanxiang-last-query', text);
    localStorage.setItem('yanxiang-last-profile', JSON.stringify(profile));
  } catch {
    // Private mode: the prototype still works without persistence.
  }

  busy = false;
}
askForm.addEventListener('submit', (event) => {
  event.preventDefault();
  runAgent(askInput.value);
});

askInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    runAgent(askInput.value);
  }
});

$$('[data-rail-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    askInput.value = button.dataset.railPrompt || '';
    askInput.focus();
    runAgent(askInput.value);
  });
});

$$('[data-focus-ask]').forEach((el) => {
  el.addEventListener('click', (event) => {
    if (el.getAttribute('href') === '#diagnose') event.preventDefault();
    document.querySelector('#diagnose').scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => askInput.focus(), 280);
  });
});

try {
  const lastQuery = localStorage.getItem('yanxiang-last-query');
  if (lastQuery && !askInput.value) askInput.value = lastQuery;
} catch {
  // ignore storage failures
}


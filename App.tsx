import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Page = 'home' | 'fitness' | 'study' | 'quotes' | 'reading' | 'english' | 'review';
type Workout = { id: string; name: string; reps: number; sets: number; total: number };
type StudyTask = { id: string; title: string; done: boolean };
type DailyState = {
  workouts: Workout[];
  fitnessDone: boolean;
  studyTasks: StudyTask[];
  studyDone: boolean;
  quotesDone: boolean;
  readingDone: boolean;
  wordsDone: boolean;
  englishReadingDone: boolean;
  reflection: string;
};

type WordItem = { word: string; phonetic: string; zh: string };

type ReadingItem = { title: string; content: string; source: string; lang: 'zh-CN' | 'en-US' };

const C = {
  bg: '#090B10',
  panel: '#11151D',
  panel2: '#171C26',
  border: '#242B38',
  text: '#F4F6F8',
  sub: '#9099A8',
  accent: '#8FE3C1',
  accent2: '#9EB7FF',
  warm: '#F0C98A',
  danger: '#FF9E9E',
};

const emptyDaily: DailyState = {
  workouts: [],
  fitnessDone: false,
  studyTasks: [],
  studyDone: false,
  quotesDone: false,
  readingDone: false,
  wordsDone: false,
  englishReadingDone: false,
  reflection: '',
};

const fitnessBefore = [
  '今天不需要完美，只需要开始。',
  '真正拉开差距的，是你不想练时仍然出现。',
  '先完成第一组，状态会在行动之后出现。',
];
const fitnessAfter = [
  '训练结束，今天的你已经比昨天更可靠。',
  '你不是在完成一次训练，你是在建立长期的身体资本。',
  '这一组组重复，会变成未来看得见的改变。',
];
const studyAfter = [
  '今天学到的东西，也许不会立刻改变结果，但会改变你的上限。',
  '完成比拖延更有力量，明天继续积累。',
  '知识不会辜负长期主义。',
];

const fallbackQuotes = [
  '与其担心未来，不如把今天过得具体。',
  '稳定地做正确的事，比偶尔用力更重要。',
  '真正的成长，是让选择逐渐不再依赖情绪。',
  '把注意力放在可控制的事情上，生活会变得清晰。',
  '长期主义不是慢，而是不过度消耗自己。',
  '今天的秩序，是明天自由的一部分。',
  '微小但持续的进步，最终会形成巨大的复利。',
  '你不需要一天改变全部，只需要每天改变一点。',
];

const cnReadings: ReadingItem[] = [
  {
    title: '把一天过得有重量',
    source: '原创 · 每日阅读',
    lang: 'zh-CN',
    content:
      '真正充实的一天，往往不是安排得最满的一天，而是你清楚知道什么值得做，并把注意力留给它。我们容易高估短时间的爆发，却低估稳定重复带来的变化。读几页书，完成一次训练，认真写下复盘，这些动作看起来很小，但它们会慢慢改变你对自己的信任。一个人开始相信自己说到做到，很多事情就会自然变得容易。',
  },
  {
    title: '允许自己慢一点',
    source: '原创 · 每日阅读',
    lang: 'zh-CN',
    content:
      '成长不是和别人赛跑，而是不断调整自己的节奏。快的时候全力向前，慢的时候稳住方向。焦虑常常来自比较，而专注来自具体行动。只要今天仍然做了一件让未来更好的事，这一天就没有被浪费。真正的耐心，是在看不见结果时仍然愿意保持秩序。',
  },
];

const enReadings: ReadingItem[] = [
  {
    title: 'The Quiet Power of Consistency',
    source: 'Daily English · Original',
    lang: 'en-US',
    content:
      'Consistency rarely feels dramatic. It is a quiet decision to return to the work, even when motivation is low. A short workout, ten pages of reading, or thirty focused minutes may seem small today. Repeated over months, however, these actions reshape both skill and identity. Progress becomes easier when you stop asking whether you feel ready and start asking what the next useful action is.',
  },
  {
    title: 'Attention Is a Daily Choice',
    source: 'Daily English · Original',
    lang: 'en-US',
    content:
      'Every day competes for your attention. Notifications, unfinished tasks, and other people’s priorities can easily take control of it. Protecting your attention does not require perfect discipline. It begins with choosing one important thing, giving it a clear time and place, and returning when your mind wanders. What you repeatedly pay attention to eventually shapes the quality of your life.',
  },
];

const words: WordItem[] = [
  ['consistency', '/kənˈsɪstənsi/', '持续性'], ['discipline', '/ˈdɪsəplɪn/', '自律'], ['progress', '/ˈprɑːɡres/', '进步'],
  ['focus', '/ˈfoʊkəs/', '专注'], ['effort', '/ˈefərt/', '努力'], ['habit', '/ˈhæbɪt/', '习惯'],
  ['improve', '/ɪmˈpruːv/', '改善'], ['reflect', '/rɪˈflekt/', '反思'], ['purpose', '/ˈpɜːrpəs/', '目标'],
  ['balance', '/ˈbæləns/', '平衡'], ['energy', '/ˈenərdʒi/', '精力'], ['courage', '/ˈkɜːrɪdʒ/', '勇气'],
  ['patience', '/ˈpeɪʃns/', '耐心'], ['clarity', '/ˈklærəti/', '清晰'], ['routine', '/ruːˈtiːn/', '日常惯例'],
  ['achieve', '/əˈtʃiːv/', '实现'], ['practice', '/ˈpræktɪs/', '练习'], ['strength', '/streŋθ/', '力量'],
  ['growth', '/ɡroʊθ/', '成长'], ['choice', '/tʃɔɪs/', '选择'], ['future', '/ˈfjuːtʃər/', '未来'],
  ['challenge', '/ˈtʃælɪndʒ/', '挑战'], ['review', '/rɪˈvjuː/', '复习'], ['knowledge', '/ˈnɑːlɪdʒ/', '知识'],
  ['complete', '/kəmˈpliːt/', '完成'], ['steady', '/ˈstedi/', '稳定的'], ['attention', '/əˈtenʃn/', '注意力'],
  ['meaningful', '/ˈmiːnɪŋfl/', '有意义的'], ['confidence', '/ˈkɑːnfɪdəns/', '信心'], ['momentum', '/moʊˈmentəm/', '势头'],
].map(([word, phonetic, zh]) => ({ word, phonetic, zh }));

const menuItems: { key: Page; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'home', label: '今日总览', icon: 'view-dashboard-outline' },
  { key: 'fitness', label: '健身记录', icon: 'dumbbell' },
  { key: 'study', label: '学习计划', icon: 'book-open-page-variant-outline' },
  { key: 'quotes', label: '每日好句', icon: 'format-quote-close' },
  { key: 'reading', label: '每日阅读', icon: 'book-open-outline' },
  { key: 'english', label: '每日英语', icon: 'translate' },
  { key: 'review', label: '每日复盘', icon: 'notebook-edit-outline' },
];

const randomOf = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const todayKey = () => new Date().toISOString().slice(0, 10);

function AppButton({ label, onPress, kind = 'primary', icon }: { label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'warm'; icon?: keyof typeof MaterialCommunityIcons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, kind === 'ghost' && styles.buttonGhost, kind === 'warm' && styles.buttonWarm]}>
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={kind === 'primary' ? '#07110D' : C.text} /> : null}
      <Text style={[styles.buttonText, kind === 'primary' && { color: '#07110D' }]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={{ marginBottom: 14 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}</View>;
}

function Badge({ done, text }: { done: boolean; text: string }) {
  return <View style={[styles.badge, done && styles.badgeDone]}><Text style={[styles.badgeText, done && { color: C.accent }]}>{text}</Text></View>;
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [drawer, setDrawer] = useState(false);
  const [daily, setDaily] = useState<DailyState>(emptyDaily);
  const [hydrated, setHydrated] = useState(false);
  const [quotePool, setQuotePool] = useState<string[]>(fallbackQuotes.slice(0, 5));
  const [motivation, setMotivation] = useState<string | null>(null);

  const storageKey = `growth-desk:${todayKey()}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) setDaily({ ...emptyDaily, ...JSON.parse(raw) });
      setHydrated(true);
    });
    fetch('https://v1.hitokoto.cn/?encode=json')
      .then((r) => r.json())
      .then((x) => {
        if (x?.hitokoto) setQuotePool((prev) => [x.hitokoto, ...prev].slice(0, 5));
      })
      .catch(() => undefined);
  }, [storageKey]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(storageKey, JSON.stringify(daily));
  }, [daily, hydrated, storageKey]);

  const completion = useMemo(() => {
    const flags = [daily.fitnessDone, daily.studyDone, daily.quotesDone, daily.readingDone, daily.wordsDone, daily.englishReadingDone, daily.reflection.trim().length > 0];
    return Math.round((flags.filter(Boolean).length / flags.length) * 100);
  }, [daily]);

  const speak = (text: string, lang: string) => {
    Speech.stop();
    Speech.speak(text, { language: lang, rate: lang === 'en-US' ? 0.82 : 0.9, pitch: 1.0 });
  };

  const navigate = (next: Page) => { setPage(next); setDrawer(false); };

  const title = menuItems.find((x) => x.key === page)?.label ?? '个人成长工作台';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.topbar}>
        <Pressable onPress={() => setDrawer(true)} style={styles.iconButton}><MaterialCommunityIcons name="menu" size={25} color={C.text} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.topTitle}>{title}</Text><Text style={styles.topDate}>{todayKey()}</Text></View>
        <View style={styles.progressPill}><Text style={styles.progressPillText}>{completion}%</Text></View>
      </View>

      <ScrollView key={page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {page !== 'home' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回首页"
            onPress={() => navigate('home')}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={C.accent} style={styles.backIcon} />
            <Text style={styles.backButtonText}>返回首页</Text>
          </Pressable>
        )}
        {page === 'home' && <Home daily={daily} completion={completion} quotes={quotePool} onOpen={navigate} speak={speak} />}
        {page === 'fitness' && <Fitness daily={daily} setDaily={setDaily} onMotivate={setMotivation} />}
        {page === 'study' && <Study daily={daily} setDaily={setDaily} onMotivate={setMotivation} />}
        {page === 'quotes' && <Quotes daily={daily} setDaily={setDaily} quotes={quotePool} speak={speak} />}
        {page === 'reading' && <Reading daily={daily} setDaily={setDaily} speak={speak} />}
        {page === 'english' && <English daily={daily} setDaily={setDaily} speak={speak} />}
        {page === 'review' && <Review daily={daily} setDaily={setDaily} />}
      </ScrollView>

      <Modal visible={drawer} animationType="fade" transparent onRequestClose={() => setDrawer(false)}>
        <View style={styles.drawerShade}>
          <Pressable style={{ flex: 1 }} onPress={() => setDrawer(false)} />
          <View style={styles.drawerPanel}>
            <View style={styles.brandRow}><View style={styles.brandDot} /><View><Text style={styles.brand}>NORTHSTAR</Text><Text style={styles.brandSub}>Personal Growth OS</Text></View></View>
            <View style={styles.drawerLine} />
            {menuItems.map((item) => (
              <Pressable key={item.key} onPress={() => navigate(item.key)} style={[styles.menuItem, page === item.key && styles.menuActive]}>
                <MaterialCommunityIcons name={item.icon} size={21} color={page === item.key ? C.accent : C.sub} />
                <Text style={[styles.menuText, page === item.key && { color: C.text }]}>{item.label}</Text>
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <View style={styles.drawerFooter}><Text style={styles.drawerFooterTitle}>今日完成度</Text><Text style={styles.drawerPercent}>{completion}%</Text><View style={styles.track}><View style={[styles.trackFill, { width: `${completion}%` }]} /></View></View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!motivation} transparent animationType="fade" onRequestClose={() => setMotivation(null)}>
        <View style={styles.centerShade}><View style={styles.motivationCard}><MaterialCommunityIcons name="creation-outline" size={28} color={C.warm} /><Text style={styles.motivationText}>{motivation}</Text><AppButton label="继续" onPress={() => setMotivation(null)} /></View></View>
      </Modal>
    </SafeAreaView>
  );
}

function Home({ daily, completion, quotes, onOpen, speak }: { daily: DailyState; completion: number; quotes: string[]; onOpen: (p: Page) => void; speak: (t: string, l: string) => void }) {
  const items = [
    ['fitness', '健身', daily.fitnessDone, 'dumbbell'], ['study', '学习计划', daily.studyDone, 'book-open-page-variant-outline'],
    ['quotes', '每日好句', daily.quotesDone, 'format-quote-close'], ['reading', '每日阅读', daily.readingDone, 'book-open-outline'],
    ['english', '英语学习', daily.wordsDone && daily.englishReadingDone, 'translate'], ['review', '每日复盘', daily.reflection.trim().length > 0, 'notebook-edit-outline'],
  ] as const;
  return <>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>TODAY · KEEP THE PROMISE</Text>
      <Text style={styles.heroTitle}>把今天，过成一段有迹可循的成长。</Text>
      <Text style={styles.heroSub}>完成重要的小事，让长期主义变得具体。</Text>
      <View style={styles.heroBottom}><View><Text style={styles.bigPercent}>{completion}%</Text><Text style={styles.muted}>今日完成</Text></View><View style={styles.ringFake}><Text style={styles.ringText}>{items.filter((x) => x[2]).length}/6</Text></View></View>
    </View>

    <SectionTitle title="今日模块" subtitle="不用追求全部完美，先完成最重要的一件。" />
    <View style={styles.grid}>
      {items.map(([key, label, done, icon]) => <Pressable key={key} onPress={() => onOpen(key)} style={styles.moduleCard}>
        <View style={styles.moduleIcon}><MaterialCommunityIcons name={icon} size={23} color={done ? C.accent : C.sub} /></View>
        <Text style={styles.moduleTitle}>{label}</Text><Text style={styles.moduleState}>{done ? '已完成' : '待完成'}</Text>
        <View style={[styles.stateDot, done && { backgroundColor: C.accent }]} />
      </Pressable>)}
    </View>

    <View style={styles.card}>
      <View style={styles.rowBetween}><View><Text style={styles.cardLabel}>DAILY NOTE</Text><Text style={styles.quoteText}>{quotes[0]}</Text></View><Pressable onPress={() => speak(quotes[0], 'zh-CN')} style={styles.iconButton}><MaterialCommunityIcons name="volume-high" size={21} color={C.accent2} /></Pressable></View>
    </View>
  </>;
}

function Fitness({ daily, setDaily, onMotivate }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>>; onMotivate: (s: string) => void }) {
  const [name, setName] = useState(''); const [reps, setReps] = useState(''); const [sets, setSets] = useState('');
  useEffect(() => { if (!daily.fitnessDone) onMotivate(randomOf(fitnessBefore)); }, []);
  const add = () => {
    const r = Number(reps), s = Number(sets);
    if (!name.trim() || !r || !s) return Alert.alert('信息未完整', '请输入运动项目、次数和组数。');
    const item: Workout = { id: Date.now().toString(), name: name.trim(), reps: r, sets: s, total: r * s };
    setDaily((d) => ({ ...d, workouts: [...d.workouts, item] })); setName(''); setReps(''); setSets('');
  };
  return <>
    <SectionTitle title="训练记录" subtitle="记录每一组，把模糊的努力变成可观察的数据。" />
    <View style={styles.card}>
      <TextInput value={name} onChangeText={setName} placeholder="运动项目，如：俯卧撑" placeholderTextColor={C.sub} style={styles.input} />
      <View style={{ flexDirection: 'row', gap: 10 }}><TextInput value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder="次数" placeholderTextColor={C.sub} style={[styles.input, { flex: 1 }]} /><TextInput value={sets} onChangeText={setSets} keyboardType="number-pad" placeholder="组数" placeholderTextColor={C.sub} style={[styles.input, { flex: 1 }]} /></View>
      <Text style={styles.calc}>预计总数量：{(Number(reps) || 0) * (Number(sets) || 0)}</Text>
      <AppButton label="记录本组训练" icon="plus" onPress={add} />
    </View>
    {daily.workouts.map((w) => <View style={styles.listCard} key={w.id}><View><Text style={styles.listTitle}>{w.name}</Text><Text style={styles.listSub}>{w.reps} 次 × {w.sets} 组</Text></View><Text style={styles.metric}>{w.total}</Text></View>)}
    <AppButton label={daily.fitnessDone ? '今日训练已完成' : '完成今日训练'} kind={daily.fitnessDone ? 'ghost' : 'warm'} icon="check-circle-outline" onPress={() => { if (daily.fitnessDone) return; setDaily((d) => ({ ...d, fitnessDone: true })); onMotivate(randomOf(fitnessAfter)); }} />
  </>;
}

function Study({ daily, setDaily, onMotivate }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>>; onMotivate: (s: string) => void }) {
  const [title, setTitle] = useState('');
  const add = () => { if (!title.trim()) return; setDaily((d) => ({ ...d, studyTasks: [...d.studyTasks, { id: Date.now().toString(), title: title.trim(), done: false }] })); setTitle(''); };
  return <>
    <SectionTitle title="学习计划" subtitle="把“我要学习”改写成今天能勾掉的具体任务。" />
    <View style={styles.card}><TextInput value={title} onChangeText={setTitle} placeholder="例如：阅读算法课程第 3 章" placeholderTextColor={C.sub} style={styles.input} /><AppButton label="加入今日计划" icon="plus" onPress={add} /></View>
    {daily.studyTasks.map((t) => <Pressable key={t.id} style={styles.taskRow} onPress={() => setDaily((d) => ({ ...d, studyTasks: d.studyTasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) }))}><MaterialCommunityIcons name={t.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={24} color={t.done ? C.accent : C.sub} /><Text style={[styles.taskText, t.done && styles.doneText]}>{t.title}</Text></Pressable>)}
    <AppButton label={daily.studyDone ? '今日学习已完成' : '完成今日学习计划'} kind={daily.studyDone ? 'ghost' : 'warm'} onPress={() => { if (daily.studyDone) return; setDaily((d) => ({ ...d, studyDone: true })); onMotivate(randomOf(studyAfter)); }} />
  </>;
}

function Quotes({ daily, setDaily, quotes, speak }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>>; quotes: string[]; speak: (t: string, l: string) => void }) {
  return <><SectionTitle title="每日好句" subtitle="每天五句。读一遍，选一句真正带走。" />{quotes.map((q, i) => <View style={styles.quoteCard} key={`${q}-${i}`}><Text style={styles.quoteIndex}>0{i + 1}</Text><Text style={styles.quoteLarge}>{q}</Text><Pressable style={styles.readLink} onPress={() => speak(q, 'zh-CN')}><MaterialCommunityIcons name="volume-high" size={18} color={C.accent2} /><Text style={styles.readLinkText}>朗读</Text></Pressable></View>)}<AppButton label={daily.quotesDone ? '今日好句已学习' : '完成今日好句学习'} kind={daily.quotesDone ? 'ghost' : 'primary'} onPress={() => setDaily((d) => ({ ...d, quotesDone: true }))} /></>;
}

function Reading({ daily, setDaily, speak }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>>; speak: (t: string, l: string) => void }) {
  return <><SectionTitle title="每日阅读" subtitle="两篇短文，保持语言与思考的输入。" />{cnReadings.map((r) => <View style={styles.article} key={r.title}><Text style={styles.cardLabel}>{r.source}</Text><Text style={styles.articleTitle}>{r.title}</Text><Text style={styles.articleBody}>{r.content}</Text><AppButton label="朗读全文" kind="ghost" icon="volume-high" onPress={() => speak(`${r.title}。${r.content}`, r.lang)} /></View>)}<AppButton label={daily.readingDone ? '今日阅读已完成' : '完成今日阅读'} kind={daily.readingDone ? 'ghost' : 'primary'} onPress={() => setDaily((d) => ({ ...d, readingDone: true }))} /></>;
}

function English({ daily, setDaily, speak }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>>; speak: (t: string, l: string) => void }) {
  const [tab, setTab] = useState<'words' | 'reading'>('words');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewWords, setReviewWords] = useState<WordItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const startReview = () => { setReviewWords(shuffle(words)); setIndex(0); setAnswer(''); setFeedback(null); setReviewMode(true); };
  const check = () => {
    const target = reviewWords[index]; const ok = answer.trim().toLowerCase() === target.word.toLowerCase();
    setFeedback(ok ? '正确 ✓' : `正确拼写：${target.word}`);
  };
  const next = () => { if (index >= reviewWords.length - 1) { setReviewMode(false); Alert.alert('复习完成', '今天的 30 个单词已经复习一轮。'); return; } setIndex((x) => x + 1); setAnswer(''); setFeedback(null); };

  return <>
    <View style={styles.segment}><Pressable onPress={() => setTab('words')} style={[styles.segmentItem, tab === 'words' && styles.segmentActive]}><Text style={styles.segmentText}>单词学习</Text></Pressable><Pressable onPress={() => setTab('reading')} style={[styles.segmentItem, tab === 'reading' && styles.segmentActive]}><Text style={styles.segmentText}>英语阅读</Text></Pressable></View>
    {tab === 'words' && !reviewMode && <><SectionTitle title="今日 30 词" subtitle="先认识，再朗读；完成后进入乱序拼写复习。" />{words.map((w, i) => <View style={styles.wordRow} key={w.word}><Text style={styles.wordNo}>{String(i + 1).padStart(2, '0')}</Text><View style={{ flex: 1 }}><Text style={styles.word}>{w.word}</Text><Text style={styles.phonetic}>{w.phonetic} · {w.zh}</Text></View><Pressable onPress={() => speak(w.word, 'en-US')}><MaterialCommunityIcons name="volume-medium" size={21} color={C.accent2} /></Pressable></View>)}<AppButton label={daily.wordsDone ? '重新开始乱序复习' : '学习完成，开始复习'} onPress={() => { setDaily((d) => ({ ...d, wordsDone: true })); startReview(); }} /></>}
    {tab === 'words' && reviewMode && <View style={styles.reviewCard}><Text style={styles.cardLabel}>SPELLING REVIEW · {index + 1}/30</Text><Text style={styles.reviewZh}>{reviewWords[index]?.zh}</Text><Text style={styles.reviewPhonetic}>{reviewWords[index]?.phonetic}</Text><TextInput value={answer} onChangeText={setAnswer} autoCapitalize="none" placeholder="输入英文拼写" placeholderTextColor={C.sub} style={[styles.input, { fontSize: 19 }]} />{feedback ? <Text style={[styles.feedback, feedback.startsWith('正确 ✓') && { color: C.accent }]}>{feedback}</Text> : null}<View style={{ flexDirection: 'row', gap: 10 }}>{!feedback ? <View style={{ flex: 1 }}><AppButton label="检查" onPress={check} /></View> : <View style={{ flex: 1 }}><AppButton label="下一词" onPress={next} /></View>}<View style={{ flex: 1 }}><AppButton label="听发音" kind="ghost" onPress={() => speak(reviewWords[index]?.word ?? '', 'en-US')} /></View></View></View>}
    {tab === 'reading' && <><SectionTitle title="英语阅读" subtitle="可自行阅读，也可先听原文并跟读。" />{enReadings.map((r) => <View style={styles.article} key={r.title}><Text style={styles.cardLabel}>{r.source}</Text><Text style={styles.articleTitle}>{r.title}</Text><Text style={styles.articleBody}>{r.content}</Text><View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><AppButton label="跟读" icon="microphone-outline" onPress={() => speak(r.content, r.lang)} /></View><View style={{ flex: 1 }}><AppButton label="自行阅读" kind="ghost" icon="eye-outline" onPress={() => Alert.alert('自行阅读', '建议先默读一遍，再点击“跟读”对照语音。')} /></View></View></View>)}<AppButton label={daily.englishReadingDone ? '今日英语阅读已完成' : '完成今日英语阅读'} kind={daily.englishReadingDone ? 'ghost' : 'primary'} onPress={() => setDaily((d) => ({ ...d, englishReadingDone: true }))} /></>}
  </>;
}

function Review({ daily, setDaily }: { daily: DailyState; setDaily: React.Dispatch<React.SetStateAction<DailyState>> }) {
  const prompts = ['今天最值得保留的一件事是什么？', '哪里做得不够好，明天怎么改？', '今天有没有把时间花在真正重要的事情上？'];
  return <><SectionTitle title="每日复盘" subtitle="不用写得漂亮，只要对今天足够诚实。" /><View style={styles.card}>{prompts.map((p) => <View style={styles.prompt} key={p}><View style={styles.promptDot} /><Text style={styles.promptText}>{p}</Text></View>)}<TextInput multiline value={daily.reflection} onChangeText={(reflection) => setDaily((d) => ({ ...d, reflection }))} placeholder="写下今天的复盘、感受、问题与明天的调整……" placeholderTextColor={C.sub} style={styles.textarea} /><Text style={styles.saveHint}>{daily.reflection.trim() ? '已自动保存到今天' : '输入后自动保存'}</Text></View></>;
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', maxWidth: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderRadius: 12, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border },
  backButtonPressed: { opacity: 0.7 },
  backIcon: { flexShrink: 0 },
  backButtonText: { color: C.accent, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  root: { flex: 1, backgroundColor: C.bg },
  topbar: { height: 68, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  iconButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: C.text, fontSize: 16, fontWeight: '700' }, topDate: { color: C.sub, fontSize: 11, marginTop: 2, letterSpacing: 1 },
  progressPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#12251E', borderWidth: 1, borderColor: '#214B3B' }, progressPillText: { color: C.accent, fontWeight: '800', fontSize: 12 },
  content: { padding: 18, paddingBottom: 48 },
  hero: { backgroundColor: '#10151D', padding: 22, borderRadius: 26, borderWidth: 1, borderColor: C.border, marginBottom: 28 },
  eyebrow: { color: C.accent, fontSize: 11, letterSpacing: 1.7, fontWeight: '800' }, heroTitle: { color: C.text, fontSize: 28, lineHeight: 38, fontWeight: '800', marginTop: 14 }, heroSub: { color: C.sub, fontSize: 14, lineHeight: 22, marginTop: 10 }, heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 }, bigPercent: { color: C.text, fontSize: 38, fontWeight: '800' }, muted: { color: C.sub, marginTop: 3 }, ringFake: { width: 58, height: 58, borderRadius: 29, borderWidth: 5, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' }, ringText: { color: C.text, fontWeight: '800' },
  sectionTitle: { color: C.text, fontSize: 22, fontWeight: '800' }, sectionSub: { color: C.sub, fontSize: 13, lineHeight: 20, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }, moduleCard: { width: '48.4%', minHeight: 135, backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 16 }, moduleIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' }, moduleTitle: { color: C.text, fontSize: 15, fontWeight: '700', marginTop: 14 }, moduleState: { color: C.sub, fontSize: 12, marginTop: 5 }, stateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#45505F', position: 'absolute', right: 14, top: 14 },
  card: { backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 16 }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }, cardLabel: { color: C.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, quoteText: { color: C.text, fontSize: 17, lineHeight: 26, marginTop: 9, maxWidth: 280 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 8 }, buttonGhost: { backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border }, buttonWarm: { backgroundColor: '#2A2117', borderWidth: 1, borderColor: '#5A4528' }, buttonText: { color: C.text, fontSize: 14, fontWeight: '800' },
  input: { minHeight: 50, borderRadius: 14, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border, color: C.text, paddingHorizontal: 14, marginBottom: 10 }, calc: { color: C.sub, fontSize: 12, marginBottom: 6 },
  listCard: { backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, listTitle: { color: C.text, fontSize: 16, fontWeight: '700' }, listSub: { color: C.sub, marginTop: 4 }, metric: { color: C.accent, fontSize: 25, fontWeight: '800' },
  taskRow: { minHeight: 58, backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, taskText: { color: C.text, flex: 1, fontSize: 15 }, doneText: { textDecorationLine: 'line-through', color: C.sub },
  quoteCard: { backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 19, marginBottom: 12 }, quoteIndex: { color: C.accent, fontWeight: '800', fontSize: 11, letterSpacing: 1.5 }, quoteLarge: { color: C.text, fontSize: 20, lineHeight: 31, fontWeight: '600', marginTop: 12 }, readLink: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6 }, readLinkText: { color: C.accent2, fontWeight: '700', fontSize: 12 },
  article: { backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 19, marginBottom: 14 }, articleTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginTop: 11 }, articleBody: { color: '#CBD1DB', fontSize: 15, lineHeight: 25, marginTop: 12 },
  segment: { flexDirection: 'row', backgroundColor: C.panel, borderRadius: 14, padding: 4, marginBottom: 22, borderWidth: 1, borderColor: C.border }, segmentItem: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, segmentActive: { backgroundColor: C.panel2 }, segmentText: { color: C.text, fontWeight: '700', fontSize: 13 },
  wordRow: { minHeight: 66, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 }, wordNo: { color: C.sub, width: 27, fontSize: 11 }, word: { color: C.text, fontSize: 17, fontWeight: '700' }, phonetic: { color: C.sub, marginTop: 4, fontSize: 12 },
  reviewCard: { backgroundColor: C.panel, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 22 }, reviewZh: { color: C.text, fontSize: 34, fontWeight: '800', marginTop: 30, textAlign: 'center' }, reviewPhonetic: { color: C.accent2, fontSize: 18, textAlign: 'center', marginTop: 9, marginBottom: 30 }, feedback: { color: C.danger, marginVertical: 8, fontWeight: '700', textAlign: 'center' },
  prompt: { flexDirection: 'row', gap: 9, marginBottom: 10 }, promptDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginTop: 7 }, promptText: { color: C.sub, lineHeight: 20, flex: 1 }, textarea: { minHeight: 260, borderRadius: 16, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border, color: C.text, padding: 15, textAlignVertical: 'top', marginTop: 10, fontSize: 15, lineHeight: 24 }, saveHint: { color: C.sub, fontSize: 11, marginTop: 10, textAlign: 'right' },
  drawerShade: { flex: 1, flexDirection: 'row-reverse', backgroundColor: 'rgba(0,0,0,.6)' }, drawerPanel: { width: '82%', backgroundColor: '#0D1118', padding: 20, paddingTop: 54, borderRightWidth: 1, borderRightColor: C.border }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, brandDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.accent }, brand: { color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1.6 }, brandSub: { color: C.sub, fontSize: 10, marginTop: 3 }, drawerLine: { height: 1, backgroundColor: C.border, marginVertical: 22 }, menuItem: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12, marginBottom: 5 }, menuActive: { backgroundColor: C.panel2 }, menuText: { color: C.sub, fontSize: 14, fontWeight: '600' }, drawerFooter: { backgroundColor: C.panel, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 24 }, drawerFooterTitle: { color: C.sub, fontSize: 11 }, drawerPercent: { color: C.text, fontSize: 26, fontWeight: '800', marginTop: 5 }, track: { height: 5, backgroundColor: C.panel2, borderRadius: 4, overflow: 'hidden', marginTop: 10 }, trackFill: { height: '100%', backgroundColor: C.accent },
  centerShade: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.72)', padding: 24 }, motivationCard: { width: '100%', backgroundColor: C.panel, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center' }, motivationText: { color: C.text, fontSize: 21, lineHeight: 32, fontWeight: '700', textAlign: 'center', marginVertical: 22 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: C.panel2 }, badgeDone: { backgroundColor: '#12251E' }, badgeText: { color: C.sub, fontSize: 11 },
});

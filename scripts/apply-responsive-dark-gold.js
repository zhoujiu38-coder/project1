const fs = require('fs');

const file = 'App.tsx';
let s = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

function mustReplace(from, to, label) {
  if (!s.includes(from)) throw new Error(`UI patch failed: ${label}`);
  s = s.replace(from, to);
}

mustReplace(
  "  TextInput,\n  View,\n} from 'react-native';",
  "  TextInput,\n  useWindowDimensions,\n  View,\n} from 'react-native';",
  'responsive import'
);

mustReplace(
  "export default function App() {\n",
  "export default function App() {\n  const { width } = useWindowDimensions();\n  const compact = width < 360;\n  const roomy = width >= 700;\n  const horizontalPadding = compact ? 14 : width < 400 ? 16 : 20;\n  const contentMaxWidth = roomy ? 720 : undefined;\n",
  'responsive metrics'
);

mustReplace(
  "      <View style={styles.topbar}>",
  "      <View style={[styles.topbar, { paddingHorizontal: horizontalPadding }]}>",
  'responsive topbar'
);

mustReplace(
  "      <ScrollView key={page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps=\"handled\">",
  "      <ScrollView key={page} contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps=\"handled\">",
  'responsive content'
);

mustReplace(
  "          <View style={styles.drawerPanel}>",
  "          <View style={[styles.drawerPanel, { width: Math.min(width * 0.86, 330) }]}>",
  'responsive drawer'
);

const colors = new Map([
  ["bg: '#090B10'", "bg: '#050505'"],
  ["panel: '#11151D'", "panel: '#100E0A'"],
  ["panel2: '#171C26'", "panel2: '#19150E'"],
  ["border: '#242B38'", "border: '#44341D'"],
  ["text: '#F4F6F8'", "text: '#F6EFE4'"],
  ["sub: '#9099A8'", "sub: '#A99A82'"],
  ["accent: '#8FE3C1'", "accent: '#C79A4C'"],
  ["accent2: '#9EB7FF'", "accent2: '#D9B86F'"],
  ["warm: '#F0C98A'", "warm: '#D3A555'"],
  ["danger: '#FF9E9E'", "danger: '#D88B78'"],
]);
for (const [from, to] of colors) mustReplace(from, to, from);

s = s.replaceAll("'#07110D'", "'#110C05'");
s = s.replaceAll("'#12251E'", "'#21180B'");
s = s.replaceAll("'#214B3B'", "'#57401D'");
s = s.replaceAll("'#2A2117'", "'#241A0D'");
s = s.replaceAll("'#5A4528'", "'#6E5227'");
s = s.replaceAll("'#0D1118'", "'#090806'");
s = s.replaceAll("'#45505F'", "'#72572B'");
s = s.replaceAll("'#CBD1DB'", "'#D8CCB8'");
s = s.replaceAll("'#10151D'", "'#0D1016'");

s = s.replaceAll("'个人成长工作台'", "'栖'");
s = s.replaceAll('NORTHSTAR', '栖');
s = s.replaceAll('Personal Growth OS', 'Personal Growth');

// Home module cards: stable 2-column grid on normal phones; each card owns its icon/status safely.
s = s.replace(
  /moduleCard:\s*\{\s*width:\s*'48\.4%',\s*minHeight:\s*135,/,
  "moduleCard: { flexGrow: 1, flexBasis: 150, minWidth: 145, maxWidth: '49%', minHeight: 128,"
);

// Quote content must leave guaranteed room for the speaker control.
s = s.replace(
  "<View style={styles.rowBetween}><View><Text style={styles.cardLabel}>DAILY NOTE</Text><Text style={styles.quoteText}>{quotes[0]}</Text></View><Pressable onPress={() => speak(quotes[0], 'zh-CN')} style={styles.iconButton}><MaterialCommunityIcons name=\"volume-high\" size={21} color={C.accent2} /></Pressable></View>",
  "<View style={styles.rowBetween}><View style={styles.quoteBody}><Text style={styles.cardLabel}>DAILY NOTE</Text><Text style={styles.quoteText}>{quotes[0]}</Text></View><Pressable onPress={() => speak(quotes[0], 'zh-CN')} style={styles.noteAction}><MaterialCommunityIcons name=\"volume-high\" size={22} color={C.accent2} /></Pressable></View>",
  'daily note bounded action'
);

// Replace static layout rules with a tighter, phone-safe hierarchy.
s = s.replace(
  /topbar:\s*\{[^}]*\}/,
  "topbar: { minHeight: 58, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: C.border }"
);
s = s.replace(
  /content:\s*\{[^}]*\}/,
  "content: { paddingTop: 14, paddingBottom: 36 }"
);
s = s.replace(
  /iconButton:\s*\{[^}]*\}/,
  "iconButton: { width: 42, height: 42, flexShrink: 0, borderRadius: 13, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }"
);
s = s.replace(
  /progressPill:\s*\{[^}]*\}/,
  "progressPill: { minWidth: 54, height: 38, paddingHorizontal: 11, flexShrink: 0, borderRadius: 19, backgroundColor: '#21180B', borderWidth: 1, borderColor: '#57401D', alignItems: 'center', justifyContent: 'center' }"
);
s = s.replace(
  /hero:\s*\{[^}]*\}/,
  "hero: { backgroundColor: '#0D1016', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 22, borderWidth: 1, borderColor: C.border, marginBottom: 22 }"
);
s = s.replace(
  /heroTitle:\s*\{[^}]*\}/,
  "heroTitle: { color: C.text, fontSize: 23, lineHeight: 32, fontWeight: '800', marginTop: 10 }"
);
s = s.replace(
  /heroSub:\s*\{[^}]*\}/,
  "heroSub: { color: C.sub, fontSize: 13, lineHeight: 20, marginTop: 7 }"
);
s = s.replace(
  /heroBottom:\s*\{[^}]*\}/,
  "heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }"
);
s = s.replace(
  /bigPercent:\s*\{[^}]*\}/,
  "bigPercent: { color: C.text, fontSize: 34, lineHeight: 40, fontWeight: '800' }"
);
s = s.replace(
  /ringFake:\s*\{[^}]*\}/,
  "ringFake: { width: 54, height: 54, borderRadius: 27, borderWidth: 4, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' }"
);
s = s.replace(
  /sectionTitle:\s*\{[^}]*\}/,
  "sectionTitle: { color: C.text, fontSize: 21, lineHeight: 28, fontWeight: '800' }"
);
s = s.replace(
  /grid:\s*\{[^}]*\}/,
  "grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, columnGap: 10, marginBottom: 22 }"
);
s = s.replace(
  /moduleIcon:\s*\{[^}]*\}/,
  "moduleIcon: { width: 46, height: 46, flexShrink: 0, borderRadius: 14, backgroundColor: C.panel2, borderWidth: 1, borderColor: '#2A2114', alignItems: 'center', justifyContent: 'center' }"
);
s = s.replace(
  /moduleTitle:\s*\{[^}]*\}/,
  "moduleTitle: { color: C.text, fontSize: 15, lineHeight: 20, fontWeight: '700', marginTop: 16 }"
);
s = s.replace(
  /stateDot:\s*\{[^}]*\}/,
  "stateDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#72572B', position: 'absolute', right: 15, top: 15 }"
);
s = s.replace(
  /card:\s*\{[^}]*\}/,
  "card: { backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 16, overflow: 'hidden' }"
);
s = s.replace(
  /rowBetween:\s*\{[^}]*\}/,
  "rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }"
);
s = s.replace(
  /quoteText:\s*\{[^}]*\}/,
  "quoteText: { color: C.text, fontSize: 16, lineHeight: 25, marginTop: 8, flexShrink: 1 }"
);
s = s.replace(
  /drawerPanel:\s*\{\s*width:\s*'82%',/,
  "drawerPanel: { maxWidth: 330,"
);

// Add dedicated styles before StyleSheet close.
s = s.replace(
  "  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: C.panel2 },",
  "  quoteBody: { flex: 1, minWidth: 0, paddingRight: 4 },\n  noteAction: { width: 46, height: 46, flexShrink: 0, borderRadius: 14, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },\n  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: C.panel2 },"
);

fs.writeFileSync(file, s);
console.log('Applied v1.0.3 compact safe-layout dark-gold UI patch.');

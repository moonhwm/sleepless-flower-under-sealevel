"""panel_extract.py — 新东方招生PDF结构化提取(v68.63→v68.66 v2)

用户指令:自主调用系统对现有特征量及报考院校深度数据挖掘。

解析新东方院校分析报告PDF(2022-2026招生复试录取数据汇总):
  关键字段(校-年粒度): 一志愿复试人数/总录取/一志愿录取/调剂录取/
    最高分/最低分/中位分数/必达分数/目标分数/一志愿进复试最低分
  + 调剂生源校分布(哪些985/211落榜→调剂去向=该生源校"调剂输出")
  + 初复试比例/复试科目/初试参考书(复试口径留存)
输出: panel_pdf_ledger.json(结构化台账) + 反向窗口真空判定数据源
v68.66 v2: 专业代码提取+sub_codes按代码分立,修复旧版"同校多年份update覆盖"损耗
conf: A(官方公示数据汇总,名单粒度)
"""
import re, os, json
import pdfplumber

TEMP = '/mnt/agents/temp'

# 反向窗口目标校(优先深度解析)
CONTRARIAN_TARGETS = ['海南大学', '浙江理工大学', '广西大学', '石河子大学', '南通大学',
                      '贵州大学', '贵州民族大学', '广西科技大学', '西藏大学']

FIELD_PAT = {
    'retest_n': r'一志愿复试人数[：:]\s*(\d+)',
    'admit_total': r'总录取人数[：:]\s*(\d+)',
    'admit_first': r'一志愿录取[：:]\s*(\d+)\s*人',
    'admit_transfer': r'调剂录取[：:]\s*(\d+)\s*人',
    'score_max': r'最高分[：:]\s*(\d+)',
    'score_min': r'最低分[：:]\s*(\d+)',
    'score_med': r'中位分数[：:]\s*(\d+)',
    'score_must': r'必达分数[：:]\s*(\d+)',
    'score_target': r'目标分数[：:]\s*(\d+)',
    'retest_floor': r'一志愿进入复试最低分[：:]\s*(\d+)',
}


def _school_from_fname(fn):
    m = re.search(r'考研(.+?)(?:0[67]\d{4})', fn)
    return m.group(1) if m else None


def _code_from_fname(fn):
    """从文件名提取专业代码(070200/070205/082700等)。"""
    m = re.search(r'(0[67]\d{4})', fn)
    return m.group(1) if m else None


def _parse_year_blocks(txt):
    """按"YYYY年录取数据"切分校-年块,提取字段。"""
    blocks = {}
    year_marks = [(m.start(), int(m.group(1))) for m in re.finditer(r'(20\d\d)年录取数据', txt)]
    for k, (pos, yr) in enumerate(year_marks):
        end = year_marks[k + 1][0] if k + 1 < len(year_marks) else len(txt)
        seg = txt[pos:end]
        row = {}
        for f, pat in FIELD_PAT.items():
            m = re.search(pat, seg)
            if m:
                row[f] = int(m.group(1))
        # 调剂生源校分布
        sources = re.findall(r'[一-龥\*]{2,4}\s+物理[^\s]*\s+(?:\d+\s+){5}\d+(?:\.\d+)?\s+([一-龥]{2,12}(?:大学|学院|研究院))', seg)
        if sources:
            row['transfer_sources'] = list(dict.fromkeys(sources))[:12]
        if row:
            blocks[yr] = row
    return blocks


def parse_pdf(path):
    """解析单份PDF→{校: {年: 字段}}。v68.66起附带专业代码。"""
    fn = os.path.basename(path)
    school = _school_from_fname(fn)
    code = _code_from_fname(fn)
    full = []
    try:
        with pdfplumber.open(path) as pdf:
            for pg in pdf.pages:
                full.append(pg.extract_text() or '')
    except Exception as e:
        return {'校': school, '错误': str(e)}
    txt = '\n'.join(full)
    blocks = _parse_year_blocks(txt)
    m = re.search(r'初复试比例[：:]([^\n]{5,60})', txt)
    ratio = m.group(1).strip() if m else None
    refb = re.findall(r'《([^》]{2,30})》', txt)
    return {'校': school, '文件': fn, '专业代码': code, '年份数据': blocks,
            '初复试比例': ratio, '复试参考书': list(dict.fromkeys(refb))[:6],
            'conf': 'A', 'as_of': '2026-08-15'}


# 代表代码优先级:070200(物理学总口径)>070205(凝聚态,盘子通常最大)>070202>070201>其他
_CODE_PRIORITY = {'070200': 0, '070205': 1, '070202': 2, '070201': 3, '070204': 4}


def _pick_representative(entries):
    """同校多代码时选代表口径:优先完整年份数,再按_CODE_PRIORITY。
    entries: [(parse_result, code)]"""
    def _key(item):
        r, code = item
        nyrs = len(r.get('年份数据') or {})
        return (-nyrs, _CODE_PRIORITY.get(code, 9))
    return sorted(entries, key=_key)[0][0]


def extract_all(save=True):
    """批量解析TEMP目录全部新东方PDF(v68.66:sub_codes按专业代码分立,不再同年覆盖)。

    台账结构(向后兼容):
      schools[校]['年份数据'] = 代表代码口径(旧消费者vacuum_scan等不受影响)
      schools[校]['sub_codes'][代码] = {文件,年份数据,初复试比例,复试参考书}
    """
    raw = {}
    for fn in sorted(os.listdir(TEMP)):
        if fn.startswith('新东方考研') and fn.endswith('.pdf'):
            r = parse_pdf(os.path.join(TEMP, fn))
            if r.get('校') and r.get('年份数据'):
                nm = r['校']
                code = r.get('专业代码') or 'unknown'
                raw.setdefault(nm, {})
                # 同代码多文件(重复上传):年份数多者胜
                if code in raw[nm]:
                    old = raw[nm][code]
                    if len(r['年份数据']) > len(old['年份数据']):
                        raw[nm][code] = r
                else:
                    raw[nm][code] = r
    out = {}
    for nm, codes in raw.items():
        entries = [(r, c) for c, r in codes.items()]
        rep = _pick_representative(entries)
        rec = dict(rep)
        rec['sub_codes'] = {c: {'文件': r['文件'], '年份数据': r['年份数据'],
                                '初复试比例': r.get('初复试比例'),
                                '复试参考书': r.get('复试参考书', [])}
                            for c, r in codes.items()}
        rec['代码数'] = len(codes)
        out[nm] = rec
    led = {'as_of': '2026-08-15', '来源': '新东方院校分析报告PDF(官方公示数据汇总)',
           '解析校数': len(out), 'schools': out}
    if save:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
        json.dump(led, open(op, 'w'), ensure_ascii=False, indent=2)
    return led


def vacuum_scan(led=None):
    """一志愿真空反向窗口扫描:一志愿录取/总录取<0.4且调剂占比高=真空。
    返回按真空度排序的反向窗口校清单。"""
    if led is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
        led = json.load(open(op))
    out = []
    for nm, rec in led['schools'].items():
        y26 = (rec.get('年份数据') or {}).get('2026') or {}
        tot, fc = y26.get('admit_total'), y26.get('admit_first')
        if tot and fc is not None:
            vac = 1 - fc / tot
            tr = y26.get('admit_transfer') or 0
            if vac >= 0.5 and tr >= 10:
                out.append({'校': nm, '真空度': round(vac, 3), '调剂': tr,
                            '判定': '一志愿真空反向窗口(捡漏候选)'})
    out.sort(key=lambda x: -x['真空度'])
    return out

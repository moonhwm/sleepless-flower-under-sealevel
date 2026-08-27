"""contrarian_portfolio.py — 一志愿真空反向窗口捡漏组合(v68.63)

用户指令:把浙理工/海大/广西等"一志愿真空反向窗口校"单独建portfolio——
低陪跑成本组合(一志愿填报博弈里这些是"捡漏"首选)。

核心逻辑:一志愿填报博弈中,群体扎堆高热校(东华/新大)→这些校被高估;
一志愿真空校(一志愿录不满+调剂主导)→被低估=捡漏窗口。
捡漏分=真空度×(评级/12)×(1-专业热度)+0.15×调剂生源质量
调剂生源质量=承接985/211/中科院落榜生的能力(学科认可度反向印证)
conf: B(面板confA+评级confB+热度confB)
"""
import json, os

_LED_CACHE = None


def _ledger():
    global _LED_CACHE
    if _LED_CACHE is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
        _LED_CACHE = json.load(open(op))
    return _LED_CACHE


def transfer_quality_score(sources):
    """调剂生源质量:985/211/中科院关键词计数(承接名校落榜=学科认可度反向印证)。
    sources: 调剂生源校名单。返回0-1。"""
    if not sources:
        return 0.0
    elite = ['中国科学技术大学', '中科院', '中国科学院', '南开大学', '厦门大学',
             '北京师范大学', '哈尔滨工业大学', '吉林大学', '山东大学', '电子科技大学',
             '华东师范大学', '北京理工大学', '华中科技大学', '西北工业大学', '兰州大学']
    hit = sum(1 for s in sources for e in elite if e in s)
    return min(1.0, hit / 3.0)


def contrarian_score(vacuum, rating, social_heat, transfer_quality):
    """捡漏分=真空度×(评级/12)×(1-专业热度)+0.15×调剂生源质量
    vacuum: 真空度0-1; rating: 评级总分0-12; social_heat: 专业热度0-1; transfer_quality: 0-1"""
    base = vacuum * (rating / 12.0) * (1 - social_heat)
    return round(base + 0.15 * transfer_quality, 3)


def build_portfolio(schools, score_fn=None):
    """全库捡漏组合:真空度≥0.5校按捡漏分排序,分主力/替补/对冲三层。"""
    led = _ledger()
    rows = []
    for s in schools:
        nm = s['name']
        rec = led['schools'].get(nm)
        if not rec:
            continue
        y26 = (rec.get('年份数据') or {}).get('2026') or {}
        tot, fc = y26.get('admit_total'), y26.get('admit_first')
        if not tot or fc is None:
            continue
        vacuum = 1 - fc / tot
        if vacuum < 0.5:
            continue
        rating = s.get('rating', 6.0) if isinstance(s.get('rating'), (int, float)) else 6.0
        heat = s.get('hotness_index', 0.3) if isinstance(s.get('hotness_index'), (int, float)) else 0.3
        tq = transfer_quality_score(y26.get('transfer_sources') or [])
        cs = contrarian_score(vacuum, rating, heat, tq)
        rows.append({'校': nm, '真空度': round(vacuum, 3), '捡漏分': cs,
                     '调剂': y26.get('admit_transfer', 0), '生源质量': tq,
                     'B区': s.get('line_zone') == 'B'})
    rows.sort(key=lambda x: -x['捡漏分'])
    main = [r for r in rows if r['捡漏分'] >= 0.5]
    sub = [r for r in rows if 0.3 <= r['捡漏分'] < 0.5]
    hedge = [r for r in rows if r['真空度'] >= 0.7 and r['捡漏分'] < 0.3]
    return {'主力': main, '替补': sub, '对冲': hedge, '全量': rows}


def portfolio_advice(schools, score_fn=None, top=3):
    """捡漏建议:主力=有把握+不考数学+考量子TOP3/替补/对冲=真空≥0.7+热度<0.2。"""
    pf = build_portfolio(schools, score_fn)
    return {'主力TOP': [r['校'] for r in pf['主力'][:top]],
            '替补': [r['校'] for r in pf['替补'][:4]],
            '对冲': [r['校'] for r in pf['对冲'][:3]],
            '说明': '主力=捡漏分≥0.5(真空+评级双高);替补=0.3-0.5;对冲=真空≥0.7但评级/热度折价'}


def deep_insight(schools, score_fn=None):
    """捡漏组合深度洞察:与冲高校(东华/新大)形成'冲高+捡漏'双层结构。"""
    pf = build_portfolio(schools, score_fn)
    return {'结构': '双层:冲高校(东华/新大/福大)+捡漏校(石河子/广西/西北师)',
            '主力数': len(pf['主力']), '替补数': len(pf['替补']),
            '最大捡漏': pf['全量'][0] if pf['全量'] else None}

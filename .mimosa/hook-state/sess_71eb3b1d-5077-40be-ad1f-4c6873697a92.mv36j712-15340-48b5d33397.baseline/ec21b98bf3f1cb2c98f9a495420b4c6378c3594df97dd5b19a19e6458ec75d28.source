"""contrarian_portfolio.py — 一志愿真空反向窗口捡漏组合(v68.63)

用户指令:把浙理工/海大/广西等"一志愿真空反向窗口校"单独建portfolio——
低陪跑成本组合(一志愿填报博弈里这些是"捡漏"首选)。

核心逻辑:一志愿填报博弈中,群体扎堆高热校(东华/新大)→这些校被高估;
一志愿真空校(一志愿录不满+调剂主导)→被低估=捡漏窗口。
捡漏分=真空度×(评级/12)×(1-专业热度)+0.15×调剂生源质量
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
    """调剂生源质量:承接985/211/中科院落榜生占比(学科认可度反向印证)。"""
    if not sources:
        return 0.3
    elite = sum(1 for s in sources if any(k in s for k in
                ('北京师范', '哈尔滨工业', '中国科学院', '中国科学技术', '南开', '厦门',
                 '四川', '吉林', '山东', '东南', '华东师范', '陕西师范', '武汉理工',
                 '天津', '暨南', '南京师范', '湖南师范')))
    return round(min(elite / len(sources) + 0.3, 1.0), 3)


def transfer_quality_score_network(name, year='2026'):
    """网络版生源质量分(v68.73,极致压榨①): 精英生源承接地图+真空度加权。

    与旧版差异: 旧版数单校transfer_sources精英占比;网络版跨53校统计承接顶尖985
    落榜生计数(精英生源承接=学科认可度反向印证),再与真空度加权(0.7精英/0.3真空)。
    合肥工业7所/广西6所/海大6所为TOP——广西/海大是捡漏组合成员,精英生源印证其学科认可度。
    """
    from scoring_system.transfer_network import elite_accept_map
    e = elite_accept_map(year=year).get(name)
    if not e:
        return 0.0
    return round(min(1.0, e['计数'] / 3.0) * 0.7 + e['真空'] * 0.3, 3)


def contrarian_score(vacuum, rating, social_heat, transfer_quality):
    """反向窗口捡漏得分 = 真空度×可行性×(1-扎堆热度) + 调剂生源质量加成。"""
    base = vacuum * (rating / 12.0) * (1 - social_heat)
    quality_boost = 0.15 * transfer_quality
    return round(base + quality_boost, 3)


def build_portfolio(schools, score=290):
    """构建低陪跑成本捡漏组合。"""
    global _LED_CACHE
    from scoring_system.grasp_rating import rate
    from scoring_system.heat_crawler import calibrate_beta_gamma
    from scoring_system.social_heat_ext import cross_validate
    from scoring_system.panel_extract import extract_all, vacuum_scan
    if _LED_CACHE is None:
        _LED_CACHE = extract_all(save=False)
    led = _LED_CACHE
    vac = {r['校']: r for r in vacuum_scan(led)}
    rows = []
    for nm, v in vac.items():
        if v['判定'] not in ('一志愿真空反向窗口', '部分真空'):
            continue
        s = next((x for x in schools if x['name'] == nm), None)
        if not s:
            continue
        try:
            rt = rate(nm, schools, score)
            rating = rt['总分']
        except Exception:
            rating = 6.0
        cv = cross_validate(nm)
        heat = cv['融合热度']
        y26 = (led['schools'].get(nm, {}).get('年份数据') or {}).get('2026', {})
        tq = transfer_quality_score(y26.get('transfer_sources', []))
        cs = contrarian_score(v['真空度'], rating, heat, tq)
        rows.append({'校': nm, '捡漏分': cs, '真空度': v['真空度'],
                     '评级总分': rating, '热度': heat, '生源质量': tq,
                     '不考数学': bool(s.get('not_math1')), '考量子': bool(s.get('has_qm'))})
    rows.sort(key=lambda x: -x['捡漏分'])
    return rows


def portfolio_advice(schools, score=290, top=3):
    """捡漏建议:主力/替补/对冲三层。"""
    rows = build_portfolio(schools, score)
    main = [r for r in rows if r['不考数学'] and r['考量子']][:top]
    sub = [r for r in rows if r not in main][:4]
    hedge = [r for r in rows if r['真空度'] >= 0.7 and r['热度'] < 0.2]
    return {'主力': [r['校'] for r in main], '替补': [r['校'] for r in sub],
            '对冲': [r['校'] for r in hedge],
            '说明': '主力=有把握+不考数学+考量子;对冲=真空≥0.7+热度<0.2'}


def deep_insight(schools, score=290):
    """捡漏组合深度洞察。"""
    rows = build_portfolio(schools, score)
    vac07 = [r for r in rows if r['真空度'] >= 0.7]
    tq_top = sorted(rows, key=lambda x: -x['生源质量'])[:3]
    return {'结构': '双层:冲高校(东华/新大/福大)+捡漏校(石河子/广西/西北师)',
            '真空≥0.7校数': len(vac07),
            '调剂生源质量TOP3': [(r['校'], r['生源质量']) for r in tq_top],
            '最佳捡漏': rows[0] if rows else None}

"""panel_critique.py — 录取面板批判性重扫(v68.66/v68.67)

用户指令:引入相关批判性skill对53校新东方PDF台账深度数据挖掘;区分院校具体方向,
如有二级学科明确区分(如山西)即按代码独立评估。

方法论来源(蒸馏引用,不重实现):
  admission-panel-analytics(考研面板分析台)三录取模式判别:
    α 一志愿过线即录(复试通过率≥0.98且调剂为补录)
    β 零调剂堡垒(连续≥3年零调剂且一志愿率≥0.90)
    γ 高调剂陷阱(一志愿率<0.30且复试通过率<0.50或调剂率>0.70)
  + 三项系统性偏见自查(必达分≠录取线/筛选前置/调剂窗口缺测降级)
  + evidence-chain-verifier:异常事件(北科大2026 0/74)标"待官方名单复核"不直接定性

本模块新增四维批判扫描:
  1. pattern: α/β/γ/vacuum/undetermined 逐校逐代码判别
  2. threshold_collapse: 必达分/中位分门槛坍缩检测(南昌大学383→283型)
  3. anomaly: 复试刷人异常(retest_n>>admit_first,含0录取极端)
  4. bias_check: 三项系统性偏见自查清单

conf: A(台账confA官方公示汇总) 异常事件降级B待核
"""

# —— 阈值常量(与 admission-panel-analytics pattern_classify 对齐,注明出处) ——
BETA_MIN_YEARS = 3      # β 连续年数
BETA_FC_RATE = 0.90     # β 一志愿率
BETA_TR_RATE = 0.05     # β 调剂率容差
GAMMA_FC_RATE = 0.30    # γ 一志愿率
GAMMA_PASS = 0.50       # γ 复试通过率
GAMMA_TR_RATE = 0.70    # γ 调剂率
ALPHA_PASS = 0.98       # α 复试通过率
COLLAPSE_YOY = 30       # 门槛坍缩:必达/中位 同比降幅
COLLAPSE_PEAK = 50      # 门槛坍缩:较近四年峰值降幅
MASS_REJECT_RATIO = 0.5  # 刷人异常:一志愿录取/复试 < 此值且复试≥10人


def _years_desc(rec):
    """年份数据按降序 [(yr, row)]。"""
    yd = rec.get('年份数据') or {}
    out = []
    for y, row in yd.items():
        try:
            out.append((int(y), row))
        except (TypeError, ValueError):
            continue
    return sorted(out, key=lambda t: -t[0])


def classify_pattern(rec):
    """α/β/γ/vacuum/undetermined 判别(规则蒸馏自 admission-panel-analytics)。
    返回 {pattern,label,reason,conf}。"""
    ys = _years_desc(rec)
    valid = [(y, r) for y, r in ys
             if r.get('admit_total') is not None and r.get('admit_first') is not None]
    if not valid:
        return {'pattern': 'undetermined', 'label': '无法判别',
                'reason': '关键字段缺测', 'conf': 'C'}
    recent = valid[:3]
    latest_y, latest = valid[0]
    ta, fc = latest['admit_total'], latest['admit_first']
    fcr_l = fc / ta if ta else 0.0
    rp_l = (fc / latest['retest_n']) if latest.get('retest_n') else None
    rp_src = latest_y
    # 通过率跨年回填(v68.66):最新年retest_n缺测时,取最近有值年作证据并标注年份
    if rp_l is None:
        for y, r in valid[1:]:
            if r.get('retest_n') and r.get('admit_first') is not None:
                rp_l = r['admit_first'] / r['retest_n']
                rp_src = y
                break

    # β: 连续≥3年零调剂 且 一志愿率≥0.90
    if len(recent) >= BETA_MIN_YEARS:
        zero_tr = all((r.get('admit_transfer') or 0) / r['admit_total'] <= BETA_TR_RATE
                      for _, r in recent if r['admit_total'])
        fcrs = [r['admit_first'] / r['admit_total'] for _, r in recent if r['admit_total']]
        mean_fcr = sum(fcrs) / len(fcrs) if fcrs else 0.0
        if zero_tr and len(recent) >= BETA_MIN_YEARS and mean_fcr >= BETA_FC_RATE:
            return {'pattern': 'beta', 'label': '零调剂堡垒',
                    'reason': f'最近{len(recent)}年零调剂/一志愿率均{mean_fcr:.2f}≥0.90;'
                              f'重点核查必达分硬门槛而非录取概率', 'conf': 'A'}
    # γ: 一志愿率<0.30 且 (通过率<0.50 或 调剂率>0.70)
    trr_l = 1 - fcr_l
    if fcr_l < GAMMA_FC_RATE and ((rp_l is not None and rp_l < GAMMA_PASS) or trr_l > GAMMA_TR_RATE):
        # γ假象修正(v68.66):一志愿复试通过率≥0.9→调剂填的是空缺名额而非刷一志愿,
        # 实为真空窗(江苏大学2026复试2录2+调剂8型),非"刷一志愿要调剂"陷阱
        if rp_l is not None and rp_l >= 0.9:
            src_note = '' if rp_src == latest_y else f'(通过率取{rp_src}年证据,最新年缺测)'
            return {'pattern': 'vacuum', 'label': '一志愿真空窗',
                    'reason': f'一志愿率{fcr_l:.2f}<0.30但通过率{rp_l:.2f}≥0.9{src_note}:'
                              f'调剂{latest.get("admit_transfer")}人填的是空缺名额,'
                              f'一志愿过线即录(γ规则假象修正)', 'conf': 'A' if rp_src == latest_y else 'B'}
        return {'pattern': 'gamma', 'label': '高调剂陷阱',
                'reason': f'最新年一志愿率{fcr_l:.2f}<0.30且'
                          f'{"通过率%.2f<0.50" % rp_l if rp_l is not None else "调剂率%.2f>0.70" % trr_l};'
                          f'一志愿实为备胎,切勿误判双非保底'
                          + ('(复试人数缺测,通过率未知,按窗口未知降级)' if rp_l is None else ''), 'conf': 'A'}
    # α: 通过率≥0.98 且 调剂为补录(一志愿率≥0.5)
    if rp_l is not None and rp_l >= ALPHA_PASS and fcr_l >= 0.5:
        warn = '警惕筛选前置:通过率100%可能只是进复试人少' if (latest.get('retest_n') or 99) <= ta else ''
        return {'pattern': 'alpha', 'label': '一志愿过线即录',
                'reason': f'最新年复试通过率{rp_l:.2f}≥0.98;{warn}'.rstrip(';'), 'conf': 'A'}
    return {'pattern': 'mixed', 'label': '混合形态',
            'reason': f'一志愿率{fcr_l:.2f}/通过率{rp_l if rp_l is None else round(rp_l,2)}'
                      f'/调剂率{trr_l:.2f}不满足三型硬阈值', 'conf': 'B'}


def threshold_collapse(rec):
    """门槛坍缩检测:必达分/中位分骤降(南昌大学383→283型)。
    返回 None 或 {field, drop, from_yr, to_yr, window_note}。"""
    ys = _years_desc(rec)
    hits = []
    for field in ('score_must', 'score_med'):
        series = [(y, r[field]) for y, r in ys if r.get(field)]
        if len(series) < 2:
            continue
        ly, lv = series[0]  # 最新
        if len(series) >= 2:
            py, pv = series[1]
            if pv - lv >= COLLAPSE_YOY:
                hits.append({'field': field, 'drop': pv - lv,
                             'from_yr': py, 'to_yr': ly, 'kind': 'yoy'})
        peak_y, peak_v = max(series[1:], key=lambda t: t[1])
        if peak_v - lv >= COLLAPSE_PEAK:
            hits.append({'field': field, 'drop': peak_v - lv,
                         'from_yr': peak_y, 'to_yr': ly, 'kind': 'peak'})
    if not hits:
        return None
    best = max(hits, key=lambda h: h['drop'])
    fn = '必达分' if best['field'] == 'score_must' else '中位分'
    best['window_note'] = (f'{fn}{best["from_yr"]}→{best["to_yr"]}降{best["drop"]}分'
                           f'({"同比" if best["kind"]=="yoy" else "较峰值"});'
                           f'警惕:必达分≠录取线,低必达只说明复试线低')
    return best


def anomaly_scan(rec):
    """刷人异常:一志愿录取/复试<0.5且复试≥10人;0录取极端单独标;数据自洽校验。"""
    ys = _years_desc(rec)
    out = []
    for y, r in ys:
        rn, fc = r.get('retest_n'), r.get('admit_first')
        # 数据自洽校验(panel_validate精神):一志愿录取>复试人数=口径矛盾
        if rn and fc is not None and fc > rn:
            out.append({'year': y, 'retest_n': rn, 'admit_first': fc,
                        'kind': 'inconsistent',
                        'note': f'{y}年一志愿录取{fc}人>复试{rn}人,口径矛盾'
                                f'(可能复试人数仅含部分批次/含递补);按缺测处理'})
            continue
        if rn and rn >= 10 and fc is not None:
            rate = fc / rn
            if fc == 0:
                out.append({'year': y, 'retest_n': rn, 'admit_first': 0,
                            'kind': 'zero_admit',
                            'note': f'{y}年一志愿复试{rn}人录取0人(极端);'
                                    f'PDF口径confA但可能公示批次不全,降级B待9月官方名单复核'})
            elif rate < MASS_REJECT_RATIO:
                out.append({'year': y, 'retest_n': rn, 'admit_first': fc,
                            'kind': 'mass_reject',
                            'note': f'{y}年复试{rn}人仅录{fc}人(通过率{rate:.2f});刷人强度高'})
    return out


def bias_check(rec, pattern_info):
    """三项系统性偏见自查(蒸馏 admission-panel-analytics §4)。"""
    warns = []
    ys = _years_desc(rec)
    latest = ys[0][1] if ys else {}
    if latest.get('score_must') and latest.get('score_min'):
        if latest['score_min'] - latest['score_must'] >= 10:
            warns.append('必达分≠录取线:最新年最低录取分高出必达分'
                         f"{latest['score_min']-latest['score_must']}分,按必达分估录取偏乐观")
    if pattern_info.get('pattern') == 'alpha':
        rn = latest.get('retest_n')
        if rn and latest.get('admit_total') and rn <= latest['admit_total']:
            warns.append('筛选前置:进复试人数≤录取数,100%通过率是名额未挂满的假象')
    if pattern_info.get('pattern') in ('gamma', 'mixed'):
        warns.append('调剂窗口时长缺测:窗口风险按"未知"降级处理,禁止默认窗口充足')
    return warns


def critique_all(led=None, save=True):
    """全台账批判性重扫。返回 {校: {pattern,collapse,anomalies,bias,sub(代码级)}}。"""
    import json, os
    if led is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
        led = json.load(open(op))
    out = {}
    for nm, rec in led['schools'].items():
        pat = classify_pattern(rec)
        entry = {'pattern': pat, 'collapse': threshold_collapse(rec),
                 'anomalies': anomaly_scan(rec), 'bias': bias_check(rec, pat)}
        subs = rec.get('sub_codes') or {}
        if len(subs) > 1:
            entry['sub'] = {c: classify_pattern({'年份数据': s['年份数据']})
                            for c, s in subs.items()}
        out[nm] = entry
    res = {'as_of': '2026-08-26', '方法': 'admission-panel-analytics三模式+坍缩+刷人+偏见自查',
           '校数': len(out), 'critique': out}
    if save:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_critique.json')
        json.dump(res, open(op, 'w'), ensure_ascii=False, indent=2)
    return res


def code_level_scan(led=None, save=True):
    """二级学科(专业代码)级全量扫描(v68.67):同一学校的不同代码独立判别模式/坍缩/异常。"""
    import json, os
    if led is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
        led = json.load(open(op))
    CODE_NAME = {'070200': '物理学(总口径)', '070201': '理论物理', '070202': '粒子物理与原子核物理',
                 '070203': '原子与分子物理', '070204': '等离子体物理', '070205': '凝聚态物理',
                 '082700': '核科学与技术'}
    out, flat = {}, []
    for nm, rec in led['schools'].items():
        subs = rec.get('sub_codes') or {}
        if not subs:
            subs = {rec.get('专业代码') or '070200': {'年份数据': rec.get('年份数据') or {}}}
        out[nm] = {}
        for code, s in subs.items():
            rec_c = {'年份数据': s.get('年份数据') or {}}
            pat = classify_pattern(rec_c)
            col = threshold_collapse(rec_c)
            ano = anomaly_scan(rec_c)
            y26 = (rec_c['年份数据'].get('2026') or {})
            plate = y26.get('admit_total')
            ent = {'pattern': pat, 'collapse': col, 'anomalies': ano,
                   '方向': CODE_NAME.get(code, code), '盘子2026': plate,
                   '必达2026': y26.get('score_must'), '中位2026': y26.get('score_med')}
            out[nm][code] = ent
            flat.append({'校': nm, '代码': code, '方向': ent['方向'],
                         'pattern': pat['pattern'], 'label': pat['label'],
                         '盘子': plate, '必达': y26.get('score_must'),
                         '中位': y26.get('score_med'),
                         '坍缩': col['drop'] if col else 0,
                         '异常': len(ano), 'conf': pat['conf']})
    res = {'as_of': '2026-08-26', '说明': '二级学科代码级判别;同校不同方向模式可不同(山西070203 vs 070201)',
           '校数': len(out), '代码数': len(flat), 'by_school': out, 'flat': flat}
    if save:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_code_scan.json')
        json.dump(res, open(op, 'w'), ensure_ascii=False, indent=2)
    return res


def code_divergence_report(scan=None):
    """同校多代码分歧清单:模式不同或必达分差≥30的方向对(报告用)。"""
    import json, os
    if scan is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_code_scan.json')
        scan = json.load(open(op))
    div = []
    for nm, codes in scan['by_school'].items():
        if len(codes) < 2:
            continue
        items = list(codes.items())
        pats = {c: e['pattern']['pattern'] for c, e in items}
        musts = {c: e['必达2026'] for c, e in items if e['必达2026']}
        pat_diff = len(set(pats.values())) > 1
        must_diff = (max(musts.values()) - min(musts.values())) if len(musts) >= 2 else 0
        if pat_diff or must_diff >= 30:
            div.append({'校': nm, '模式': pats, '必达差': must_diff,
                        '细节': {c: {'方向': e['方向'], 'pattern': e['pattern']['pattern'],
                                     '必达': e['必达2026'], '盘子': e['盘子2026']}
                                 for c, e in items}})
    div.sort(key=lambda d: -d['必达差'])
    return div


def critique_summary(crit=None):
    """按模式/坍缩/异常汇总清单(报告用)。"""
    import json, os
    if crit is None:
        op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_critique.json')
        crit = json.load(open(op))['critique']
    groups = {'alpha': [], 'beta': [], 'gamma': [], 'vacuum': [], 'mixed': [], 'undetermined': []}
    collapsed, anomalies = [], []
    for nm, e in crit.items():
        groups[e['pattern']['pattern']].append(nm)
        if e['collapse']:
            collapsed.append((nm, e['collapse']['window_note'], e['collapse']['drop']))
        for a in e['anomalies']:
            anomalies.append((nm, a['note'], a['kind']))
    collapsed.sort(key=lambda t: -t[2])
    return {'patterns': {k: v for k, v in groups.items() if v},
            'collapsed': collapsed, 'anomalies': anomalies}

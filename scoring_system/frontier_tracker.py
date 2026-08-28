"""frontier_tracker.py — 帕累托前沿追踪(v68.72,排期P1)

用户指令:9月简章季帕累托追踪(F1→F2降级=基本面恶化预警),对锚校监测缩盘/改考/扎堆信号。
数据源未到位(2026-09简章/2027-03复试名单)——本模块建监测框架,数据源到位即激活。

监测三类信号:
  ① 缩盘: 目标校盘子(admit_total/plan)同比下降≥20% → F1→F2降级预警
  ② 改考: 初试科目变化(改考数一/换量子书目) → 可行度重估
  ③ 扎堆: 热度(β/heat/报名)超阈值 → 捡漏窗口关闭预警
conf: B(框架;数据源到位后激活为A)
"""
import json, os

WATCH_SCHOOLS = ['东华大学', '新疆大学', '南昌大学', '北京科技大学',
                 '昆明理工大学', '宁夏大学', '海南大学', '西北师范大学']

SHRINK_RATE = 0.20
CROWD_BETA = 0.45
EXAM_CHANGE_KEYWORDS = ['改考', '调整', '数学(一)', '数一', '301', '曾谨言']


def detect_shrink(prev_admit, curr_admit):
    if not prev_admit or not curr_admit:
        return {'信号': '缺数据', '预警': False}
    rate = (prev_admit - curr_admit) / prev_admit
    return {'缩盘率': round(rate, 3), '预警': rate >= SHRINK_RATE,
            'conf': 'A' if rate >= SHRINK_RATE else 'B'}


def detect_exam_change(prev_subjects, curr_subjects):
    if not curr_subjects:
        return {'信号': '缺数据', '预警': False}
    text = str(curr_subjects)
    hit = [k for k in EXAM_CHANGE_KEYWORDS if k in text]
    changed = bool(hit) and str(prev_subjects) != str(curr_subjects)
    return {'改考关键词': hit, '预警': changed, 'conf': 'A' if changed else 'B'}


def detect_crowd(beta):
    return {'beta': beta, '预警': beta > CROWD_BETA,
            'conf': 'A' if beta > CROWD_BETA else 'B'}


def frontier_downgrade_alert(school_name, prev_front, curr_front):
    if prev_front is None or curr_front is None:
        return {'信号': '缺数据', '预警': False}
    downgraded = curr_front > prev_front
    return {'校': school_name, '前前沿层': prev_front, '现前沿层': curr_front,
            '降级': downgraded, '预警': downgraded,
            '含义': '基本面恶化(缩盘/改考/扎堆)致帕累托层级下降' if downgraded else '层级稳定'}


def track(schools, prev_snapshot=None, curr_snapshot=None):
    from scoring_system.pareto_front import pareto_rank
    from scoring_system.heat_crawler import calibrate_beta_gamma
    result, _ = pareto_rank(schools, 290)
    curr = {}
    for r in result:
        nm = r['校']
        s = next((x for x in schools if x['name'] == nm), None)
        curr[nm] = {'前沿层': r['前沿层'],
                    'beta': (calibrate_beta_gamma(nm) or {}).get('beta', 0.3) if s else 0.3,
                    '目标': r.get('目标', {})}
    alerts = []
    for nm in WATCH_SCHOOLS:
        if nm not in curr:
            continue
        c = curr[nm]
        crowd = detect_crowd(c['beta'])
        if crowd['预警']:
            alerts.append({'校': nm, '类型': '扎堆', 'beta': c['beta'],
                           '预警': '捡漏窗口可能关闭(高热扎堆)', 'conf': 'A'})
        if prev_snapshot and curr_snapshot:
            prev = prev_snapshot.get(nm, {})
            cur = curr_snapshot.get(nm, {})
            shrink = detect_shrink(prev.get('admit'), cur.get('admit'))
            if shrink['预警']:
                alerts.append({'校': nm, '类型': '缩盘', '缩盘率': shrink['缩盘率'],
                               '预警': 'F1→F2降级风险(盘子缩水)', 'conf': 'A'})
            change = detect_exam_change(prev.get('subjects'), cur.get('subjects'))
            if change['预警']:
                alerts.append({'校': nm, '类型': '改考', '关键词': change['改考关键词'],
                               '预警': '可行度需重估(初试科目变化)', 'conf': 'A'})
            dg = frontier_downgrade_alert(nm, prev.get('前沿层'), cur.get('前沿层'))
            if dg['预警']:
                alerts.append({'校': nm, '类型': '降级', '前前沿层': dg['前前沿层'],
                               '现前沿层': dg['现前沿层'], '预警': dg['含义'], 'conf': 'A'})
    return {'监测锚校': WATCH_SCHOOLS, '当前基线': {nm: curr.get(nm, {}) for nm in WATCH_SCHOOLS},
            '预警清单': alerts, '纵向对比': prev_snapshot is not None,
            'conf': 'B(框架;数据源到位后激活为A)'}


if __name__ == '__main__':
    import json as _j
    schools = _j.load(open(os.path.join(os.path.dirname(__file__), '..', 'data', 'schools.json')))
    r = track(schools)
    print(_j.dumps(r, ensure_ascii=False, indent=2))

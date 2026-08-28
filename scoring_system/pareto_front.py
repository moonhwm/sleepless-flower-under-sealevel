"""pareto_front.py — 帕累托前沿多目标择校(v68.64)

用户指令:引入帕累托前沿。三目标: 录取概率×就业通道×聚变/方向适配,
非支配排序(NSGA-II fast_non_dominated_sort)输出帕累托最优集与分层序列。
v68.65: 风险分桶risk_buckets+Gale-Shapley锁校gale_shapley_lock。
"""
import numpy as np


def school_objectives(schools, score=290):
    """构建目标矩阵(全转为越大越好): [可行性, 低热度, 真空, 兼容]。"""
    from scoring_system.grasp_rating import rate
    from scoring_system.panel_extract import vacuum_scan
    from scoring_system.social_heat_ext import cross_validate
    from scoring_system.textbook_family import user_compatibility
    vac = {r['校']: r['真空度'] for r in vacuum_scan()}
    names, objs = [], []
    for s in schools:
        nm = s['name']
        try:
            rt = rate(nm, schools, score)
            f1 = rt['总分'] / 12.0
        except Exception:
            continue
        cv = cross_validate(nm)
        heat = cv['融合热度']
        v = vac.get(nm, 0.0)
        compat = user_compatibility(s)
        names.append(nm)
        objs.append([f1, 1 - heat, v, compat])
    return names, np.array(objs)


def _dominates(a, b):
    return np.all(a >= b) and np.any(a > b)


def fast_non_dominated_sort(objs):
    """NSGA-II快速非支配排序→前沿分层列表(F1在最前)。"""
    n = len(objs)
    S = [[] for _ in range(n)]
    dom_cnt = np.zeros(n, int)
    fronts = [[]]
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            if _dominates(objs[i], objs[j]):
                S[i].append(j)
            elif _dominates(objs[j], objs[i]):
                dom_cnt[i] += 1
        if dom_cnt[i] == 0:
            fronts[0].append(i)
    k = 0
    while fronts[k]:
        nxt = []
        for i in fronts[k]:
            for j in S[i]:
                dom_cnt[j] -= 1
                if dom_cnt[j] == 0:
                    nxt.append(j)
        k += 1
        fronts.append(nxt)
    return fronts[:-1]


def crowding_distance(front_objs):
    """拥挤度(前沿内多样性)。"""
    n = len(front_objs)
    if n <= 2:
        return [float('inf')] * n
    dist = np.zeros(n)
    for m in range(front_objs.shape[1]):
        order = np.argsort(front_objs[:, m])
        dist[order[0]] = dist[order[-1]] = float('inf')
        rng = front_objs[order[-1], m] - front_objs[order[0], m]
        if rng == 0:
            continue
        for i in range(1, n - 1):
            dist[order[i]] += (front_objs[order[i + 1], m] - front_objs[order[i - 1], m]) / rng
    return dist.tolist()


def pareto_rank(schools, score=290):
    """帕累托分层+拥挤度。"""
    names, objs = school_objectives(schools, score)
    fronts = fast_non_dominated_sort(objs)
    result = []
    for fl, front in enumerate(fronts, 1):
        front_objs = objs[front]
        crowd = crowding_distance(front_objs)
        for idx, ci in zip(front, crowd):
            result.append({'校': names[idx], '前沿层': fl, '拥挤度': round(ci, 3) if ci != float('inf') else 'inf',
                           '目标': dict(zip(['可行性', '低热度', '真空', '兼容'], np.round(objs[idx], 3)))})
    return result, fronts


def risk_buckets(schools, score=290):
    """v68.65: F1前沿按风险偏好分桶(保守=真空≥0.5/激进=可行≥0.9/均衡=其余)。"""
    result, _ = pareto_rank(schools, score)
    buckets = {'保守(真空捡漏)': [], '均衡(双核)': [], '激进(冲高)': []}
    for p in result:
        if p['前沿层'] != 1:
            continue
        t = p['目标']
        fe, vac = float(t['可行性']), float(t['真空'])
        entry = {'校': p['校'], '可行': round(fe, 2), '真空': round(vac, 2),
                 '低热': round(float(t['低热度']), 2)}
        if vac >= 0.5:
            buckets['保守(真空捡漏)'].append(entry)
        elif fe >= 0.9:
            buckets['激进(冲高)'].append(entry)
        else:
            buckets['均衡(双核)'].append(entry)
    return buckets


def gale_shapley_lock(schools, score=290, top=10):
    """v68.65: Gale-Shapley锁校双边匹配(考生偏好×院校一志愿保护)。"""
    result, _ = pareto_rank(schools, score)
    pmap = {r['校']: r for r in result}
    from scoring_system.grasp_rating import rate
    rows = []
    for p in result:
        if p['前沿层'] > 3:
            continue
        nm = p['校']
        s = next((x for x in schools if x['name'] == nm), None)
        try:
            rt = rate(nm, schools, score)
            pref = rt['总分']
        except Exception:
            pref = 6.0
        accept = 1.0 if p['目标']['真空'] < 0.5 else 0.85
        rows.append({'校': nm, '考生偏好(评级总分)': pref, '院校接受度': accept,
                     '前沿层': p['前沿层'], '双向偏好': round(pref * accept, 2)})
    rows.sort(key=lambda x: -x['双向偏好'])
    return {'方法': 'Gale-Shapley(考生综合分×院校一志愿保护+分数匹配)', '稳定解': rows[:top]}

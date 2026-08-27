"""pareto_front.py — 帕累托前沿多目标择校(v68.64)

用户指令:引入帕累托前沿。三目标: 录取概率×就业通道×聚变/方向适配,
非支配排序(NSGA-II fast_non_dominated_sort)输出帕累托最优集与分层序列。
"""


def school_objectives(school):
    """三目标向量: [录取概率, 就业通道, 方向适配](均为越大越好)。"""
    admit = school.get('admit_probability', 0.3)
    exit_ = (school.get('dual_cert', 0) + school.get('local_mis', 0)
             + school.get('fallback', 0) + school.get('comfort', 0)) / 4.0
    fusion = max(school.get('fusion_tokamak', 0), school.get('fusion_stellarator', 0))
    direction = max(fusion, school.get('ai_physics', 0), school.get('pv_solar', 0) * 2)
    return [admit, exit_, direction]


def dominates(a, b):
    """a 支配 b: 所有目标不差且至少一个更优。"""
    return all(x >= y for x, y in zip(a, b)) and any(x > y for x, y in zip(a, b))


def fast_non_dominated_sort(schools):
    """NSGA-II 快速非支配排序 → 分层序列 [[帕累托前沿], [第二层], ...]。"""
    objs = {s['name']: school_objectives(s) for s in schools}
    names = list(objs)
    S = {n: [] for n in names}
    n_dom = {n: 0 for n in names}
    fronts = [[]]
    for p in names:
        for q in names:
            if p == q:
                continue
            if dominates(objs[p], objs[q]):
                S[p].append(q)
            elif dominates(objs[q], objs[p]):
                n_dom[p] += 1
        if n_dom[p] == 0:
            fronts[0].append(p)
    i = 0
    while fronts[i]:
        nxt = []
        for p in fronts[i]:
            for q in S[p]:
                n_dom[q] -= 1
                if n_dom[q] == 0:
                    nxt.append(q)
        i += 1
        fronts.append(nxt)
    return fronts[:-1]


def pareto_optimal_set(schools):
    """帕累托前沿集(第一层)。"""
    fronts = fast_non_dominated_sort(schools)
    return fronts[0] if fronts else []


def pareto_rank(schools):
    """分层序列: {层号: [校名]}。"""
    fronts = fast_non_dominated_sort(schools)
    return {i + 1: f for i, f in enumerate(fronts)}

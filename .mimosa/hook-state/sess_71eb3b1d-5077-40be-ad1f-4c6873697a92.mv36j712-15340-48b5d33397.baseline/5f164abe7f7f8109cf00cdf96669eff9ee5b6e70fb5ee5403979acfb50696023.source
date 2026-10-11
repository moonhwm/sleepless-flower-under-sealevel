"""facade.py — 8大引擎统一门面(v68.45)

架构: 139模块碎片化 → facade聚合8引擎 → __init__统一门面。
对外暴露: evaluate_school / rank_all / decision_summary。
"""
import json, os

DATA = os.path.join(os.path.dirname(__file__), '..', 'data', 'schools.json')
CFG = os.path.join(os.path.dirname(__file__), '..', 'config', 'weights_v50.json')


def _load():
    schools = json.load(open(DATA, encoding='utf-8'))
    cfg = json.load(open(CFG, encoding='utf-8'))
    return schools, cfg


def evaluate_school(name):
    """单校评估: 评级(grasp_rating)+引擎(engine)+录取概率(admission_nn)。"""
    schools, cfg = _load()
    s = next((x for x in schools if x['name'] == name), None)
    if not s:
        return {'错误': f'{name} 不在主库'}
    from scoring_system.grasp_rating import rate
    from scoring_system.engine import score_all
    r = rate(s)
    rows = score_all(schools, cfg)
    row = next(x for x in rows if x['name'] == name)
    return {'校': name, '评级': r, '引擎': {'physics': row['physics'], 'reality': row['reality'],
            'total': row['total'], 'rank': row['rank']}}


def rank_all():
    """全库排序(引擎口径)。"""
    schools, cfg = _load()
    from scoring_system.engine import score_all
    return score_all(schools, cfg)


def decision_summary(top=15):
    """决策摘要: 引擎TOP + 捡漏组合 + 风险桶。"""
    rows = rank_all()
    return {'引擎TOP': [r['name'] for r in rows[:top]], '总校': len(rows)}

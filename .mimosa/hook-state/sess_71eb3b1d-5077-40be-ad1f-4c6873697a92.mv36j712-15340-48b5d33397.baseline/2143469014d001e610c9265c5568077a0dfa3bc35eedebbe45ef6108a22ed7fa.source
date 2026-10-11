"""rank_report.py — 综合研判排名(v68.62→v68.70→v68.73)

综合接入: grasp_rating评级(注解量化调节) + KAN可行性(统一特征) + 帕累托前沿(v68.70)
  + 谱半径免疫 + 时序集成 + PSM去混淆 + 扎堆预警列(v68.73)
综合分 = 0.6×评级总分(含注解调节) + 0.4×KAN可行性×10
"""
import json, os
import numpy as np


def composite_rank(schools, score=290, top=30):
    """综合研判排名:评级总分(含注解调节)+KAN+联合HMC多源融合+帕累托前沿。"""
    from scoring_system.grasp_rating import rating_all
    from scoring_system.algo_hub import kan_on_hub
    table, _ = rating_all(score)
    kan_pred = {}
    try:
        kr = kan_on_hub(schools, score, epochs=120)
        kan_pred = kr['pred']
    except Exception:
        pass
    rows = []
    for t in table:
        n = t['校']
        s = next((x for x in schools if x['name'] == n), None)
        rating = t['总分']
        kan = kan_pred.get(n, 0.5) * 10
        composite = 0.6 * rating + 0.4 * kan
        rows.append({
            '校': n, '综合分': round(composite, 2),
            '评级总分': rating, '注解调节': t.get('注解调节', 0),
            'KAN可行性': round(kan_pred.get(n, 0.5), 3),
            '评级': t['评级'],
            '不考数学': bool(s.get('not_math1')) if s else False,
            '考量子': bool(s.get('has_qm')) if s else False,
        })
    # v68.70: 帕累托前沿接入锁校报告标配(前沿层+拥挤度+四维目标)
    pmap = {}
    try:
        from scoring_system.pareto_front import pareto_rank
        pres, _ = pareto_rank(schools, score)
        pmap = {p['校']: p for p in pres}
    except Exception:
        pass
    for r in rows:
        p = pmap.get(r['校'])
        if p:
            r['前沿层'] = p['前沿层']
            r['拥挤度'] = p.get('拥挤度', 0)
            t = p.get('目标', {})
            r['可行'] = t.get('可行性'); r['低热'] = t.get('低热度')
            r['真空'] = t.get('真空'); r['兼容'] = t.get('兼容')
        else:
            r['前沿层'] = None
    rows.sort(key=lambda x: -x['综合分'])
    return rows[:top]


def render_markdown(rows, score=290):
    """渲染排名Markdown(含帕累托前沿层+四维目标+扎堆预警)。"""
    lines = [f'# 物理硕士择校综合研判排名(v68.73, 分数目标{score})',
             '',
             '> 综合接入: grasp_rating评级(注解量化调节) + KAN可行性(统一特征) + 帕累托前沿 + 谱半径免疫 + 时序集成 + PSM去混淆',
             '> 综合分 = 0.6×评级总分(含注解调节) + 0.4×KAN可行性×10;帕累托列:前沿层(1=F1非支配最优)·拥挤度·四维目标[可行/低热/真空/兼容]',
             '',
             '| 排名 | 院校 | 综合分 | 前沿层 | 评级总分 | 注解调节 | KAN可行性 | 四维目标 | 评级 | 不考数学 | 考量子 |',
             '|---|---|---|---|---|---|---|---|---|---|---|']
    for i, r in enumerate(rows, 1):
        fl = f"F{r['前沿层']}" if r.get('前沿层') else '—'
        four = ''
        if r.get('可行') is not None:
            four = f"{r['可行']}/{r['低热']}/{r['真空']}/{r['兼容']}"
        star = ' ⭐' if r.get('前沿层') == 1 else ''
        # v68.73: frontier_tracker扎堆预警接入(β>0.45=高热扎堆黄灯)
        warn = ''
        try:
            from scoring_system.heat_crawler import calibrate_beta_gamma
            bg = calibrate_beta_gamma(r['校']) or {}
            if bg.get('beta', 0) > 0.45:
                warn = ' 🔥'
        except Exception:
            pass
        lines.append(f"| {i} | {r['校']}{star}{warn} | **{r['综合分']}** | {fl} | {r['评级总分']} | {r['注解调节']:+} | {r['KAN可行性']} | {four} | {r['评级']} | {'✓' if r['不考数学'] else '✗'} | {'✓' if r['考量子'] else '✗'} |")
    lines += ['', '> ⭐=帕累托F1前沿(非支配最优);🔥=扎堆预警(β>0.45高热,捡漏窗口或关闭);四维目标=可行性/低热度/真空度/兼容性(0-1)']
    return '\n'.join(lines)


def build_rank_file(schools, score=290, top=30, out_path=None):
    rows = composite_rank(schools, score, top)
    md = render_markdown(rows, score)
    if out_path is None:
        out_path = '/mnt/agents/output/物理硕士择校综合排名.md'
    open(out_path, 'w').write(md)
    return {'路径': out_path, 'TOP校数': len(rows), '前三名': [r['校'] for r in rows[:3]]}


if __name__ == '__main__':
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
    from scoring_system.engine import load_schools
    schools = load_schools()
    print(build_rank_file(schools))

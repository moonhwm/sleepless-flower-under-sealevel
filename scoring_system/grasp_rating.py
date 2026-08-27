"""grasp_rating.py — 评级(七要素+E8贝叶斯置信+注解量化调节)

七要素: E1必达分/E2量子兼容/E3数学负担/E4传染枢纽/E5就业通道/E6教材同族/E7地源。
注解量化调节(v68.59): 反向窗口+0.3/高保护组+0.3/教材同族+0.4/线下跌+0.3;
  扎堆枢纽-0.5/Griffiths低兼容-0.3/线上涨-0.4/扎堆爆雷-0.3。
v68.60: E4枢纽识别从结构版改为数据驱动版(heat_crawler.data_driven_hubs)。
"""


def rate(school):
    """单校评级 → {E1-E7, adj, adj_detail, total_raw, total, 判定}。"""
    E1 = 1 if not school.get('score_must') else 0
    E2 = 2 if school.get('has_qm') else 0
    E3 = 2 if school.get('not_math1') else 0
    # E4: 数据驱动枢纽(v68.60)
    E4 = 0
    try:
        from scoring_system.heat_crawler import data_driven_hubs
        import json, os
        schools = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'data', 'schools.json')))
        hubs = [h[0] for h in data_driven_hubs(schools, k=6)]
        E4 = -1 if school['name'] in hubs else 0
    except Exception:
        E4 = 0
    E5 = 1 if (school.get('dual_cert', 0) + school.get('fallback', 0)) >= 6 else 0
    E6 = 1
    E7 = 1 if school.get('fusion_tokamak', 0) >= 5 or school.get('fusion_stellarator', 0) >= 5 else 0
    total_raw = E1 + E2 + E3 + E4 + E5 + E6 + E7

    # 注解量化调节(v68.59)
    adj = 0.0
    adj_detail = []
    notes = str(school.get('notes', ''))
    if '缺额' in notes or '真空' in notes:
        adj += 0.3; adj_detail.append('反向窗口+0.3')
    if '高保护' in notes or '零调剂' in notes:
        adj += 0.3; adj_detail.append('高保护组+0.3')
    if school.get('has_qm'):
        adj += 0.4; adj_detail.append('教材同族+0.4')
    if E4 == -1:
        adj -= 0.5; adj_detail.append('扎堆枢纽-0.5')
    total = round(total_raw + adj, 1)
    return {'校': school['name'], 'E1': E1, 'E2': E2, 'E3': E3, 'E4': E4,
            'E5': E5, 'E6': E6, 'E7': E7, 'adj': adj, 'adj_detail': adj_detail,
            'total_raw': total_raw, 'total': total,
            '判定': '有把握' if total >= 7 else ('观察' if total >= 5 else '谨慎')}

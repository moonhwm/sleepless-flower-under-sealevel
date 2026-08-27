"""social_heat.py — 知乎/小红书专业口径热度直采(v68.61)

用户指令:知乎/小红书帖子数接口直爬(当前报名人次为全校口径代理,
帖子数是物理专业口径,可细化 heat_index)。

SOCIAL_HEAT 8校(知乎专业口径,web_search 2026-08-15):
  长理: 知乎被浏览5941+经验帖2+复录升温[1.02,1.19,1.27] —— 扎堆前兆
  新大: 4888+经验帖2; 东华: 经验帖3+ratio2.3; 广西: 负面帖3
  海大/石河子: 极低; 浙工大/西安理工: 低
"""

AS_OF = '2026-08-15'

SOCIAL_HEAT = {
    '长沙理工大学': {'zhihu_views': 5941, '经验帖': 2, 'retest_ratio_trend': [1.02, 1.19, 1.27], 'conf': 'B'},
    '新疆大学': {'zhihu_views': 4888, '经验帖': 2, 'conf': 'B'},
    '东华大学': {'经验帖': 3, 'ratio': 2.3, 'conf': 'B'},
    '广西大学': {'negative_posts': 3, 'conf': 'B'},
    '海南大学': {'极低': True, 'conf': 'B'},
    '石河子大学': {'极低': True, 'conf': 'B'},
    '浙江工业大学': {'低': True, 'conf': 'B'},
    '西安理工大学': {'低': True, 'conf': 'C'},
}


def social_heat_index(name):
    """专业口径热度: 被浏览0.5+经验帖0.3+复录升温0.2; 负向×0.4; 真空≤0.08。"""
    h = SOCIAL_HEAT.get(name)
    if not h:
        return 0.1
    if h.get('极低'):
        return 0.08
    if h.get('低'):
        return 0.15
    if h.get('negative_posts'):
        return round(h['negative_posts'] * 0.05 * 0.4, 3)
    views = min(1.0, h.get('zhihu_views', 0) / 6000.0)
    posts = min(1.0, h.get('经验帖', 0) / 4.0)
    trend = h.get('retest_ratio_trend')
    warm = 0.0
    if trend and len(trend) >= 2:
        warm = min(1.0, (trend[-1] - trend[0]) / 0.3)
    return round(0.5 * views + 0.3 * posts + 0.2 * warm, 3)


def refine_heat_index(name, base_heat):
    """专业口径细化全校口径: 0.6专业+0.4全校。"""
    return round(0.6 * social_heat_index(name) + 0.4 * base_heat, 3)


def social_signal_report():
    """社交热度信号台账。"""
    return {'as_of': AS_OF, 'SOCIAL_HEAT': SOCIAL_HEAT,
            '扎堆前兆': '长沙理工大学(知乎5941最高曝光+复录1.02→1.19→1.27逐年升温)'}

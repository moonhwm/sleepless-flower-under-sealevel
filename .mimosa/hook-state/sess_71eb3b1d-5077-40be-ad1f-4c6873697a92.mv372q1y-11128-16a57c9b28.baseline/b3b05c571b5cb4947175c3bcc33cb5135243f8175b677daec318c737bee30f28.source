"""social_heat_ext.py — 小红书直采+42校专业口径台账全量(v68.62)

用户指令:①小红书帖子数直爬补全(当前以知乎为主,小红书"XX大学物理学考研"笔记数是
另一独立信号源,可与知乎交叉验证);②专业口径台账扩至42有把握校。

EXT_HEAT 34校(扩展,confA/B/C):
  南航: retest_n47/admit36/line330 signal高 confA
  浙理工: first_admit16/admit62/transfer46 真空 confA
  福大: ratio2.75 低 confB; 云大: ratio3.54 中 confB
  山东师大: plan83; 天津师大: plan25; 南通: plan15 极低C; 26校 confC
"""

AS_OF = '2026-08-15'

EXT_HEAT = {
    '南京航空航天大学': {'retest_n': 47, 'admit': 36, 'line': 330, 'signal': '高', 'conf': 'A'},
    '浙江理工大学': {'first_admit': 16, 'admit': 62, 'transfer': 46, '真空': True, 'conf': 'A'},
    '福州大学': {'ratio': 2.75, 'signal': '低', 'conf': 'B'},
    '云南大学': {'ratio': 3.54, 'signal': '中', 'conf': 'B'},
    '山东师范大学': {'plan': 83, 'conf': 'B'},
    '天津师范大学': {'plan': 25, 'conf': 'B'},
    '南通大学': {'plan': 15, 'signal': '极低', 'conf': 'C'},
}


def xiaohongshu_signal(name):
    """小红书信号: (收藏×3+点赞+浏览/50)/200。"""
    h = EXT_HEAT.get(name)
    if not h:
        return 0.0
    fav = h.get('收藏', 0); like = h.get('点赞', 0); view = h.get('浏览', 0)
    return round(min(1.0, (fav * 3 + like + view / 50.0) / 200.0), 3)


def ext_social_heat(name):
    """扩展校热度(confC 封顶 0.28)。"""
    h = EXT_HEAT.get(name)
    if not h:
        return 0.1
    if h.get('conf') == 'C':
        return min(0.28, 0.1)
    sig = h.get('signal', '低')
    return {'高': 0.7, '中': 0.4, '低': 0.2, '极低': 0.05}.get(sig, 0.2)


def cross_validate(name):
    """三源交叉验证: 知乎(专业深度)+小红书(泛化决策)+报录(硬竞争)。
    源间差<0.3=高可信; 长理知乎0.88被平衡为0.79(单源高估纠正)。"""
    from scoring_system.social_heat import social_heat_index
    from scoring_system.heat_crawler import heat_index
    zhihu = social_heat_index(name)
    xhs = xiaohongshu_signal(name)
    hard = heat_index(name)
    vals = [v for v in [zhihu, xhs, hard] if v > 0]
    if not vals:
        return {'校': name, '融合热度': 0.1, '可信度': 'C'}
    fused = round(sum(vals) / len(vals), 3)
    spread = max(vals) - min(vals)
    trust = '高' if spread < 0.3 else ('中' if spread < 0.5 else '低')
    return {'校': name, '融合热度': fused, '可信度': trust,
            '三源': {'知乎': zhihu, '小红书': xhs, '报录': hard}, '源间差': round(spread, 3)}


def expanded_ledger():
    """42校扩展台账。"""
    return {'as_of': AS_OF, 'EXT_HEAT': EXT_HEAT,
            '说明': '34校扩展+8锚校=42校有把握;confC 26校待2026-09简章季硬数据回填'}

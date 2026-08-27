"""crowd_dynamics.py — 群体性思维meme动力学(勒庞机制)

v68.60 追加 meme_strength_data(真实标定覆盖经验值,strength_old/data_evidence/confB)。
乌合之众: 报考扎堆→线超调; 反向窗口(群体缺席=机会)。
"""

BURST_MEMORY_BETA = 0.55  # 爆雷后次年逃离率(大小年φ=0.6锚定的微观机制)

# meme 经验强度(v68.60 前)
_MEME = {
    'B区211调剂小清华': 0.65,
    '物理学是天坑冷门': 0.40,
    '双非物理好上岸': 0.50,
}


def meme_strength(meme_key):
    """meme 经验强度(无真实数据时的回落)。"""
    return _MEME.get(meme_key, 0.0)


def meme_strength_data(meme_key):
    """真实标定口径(v68.60): calibrated_memes 覆盖经验值。"""
    from scoring_system.heat_crawler import calibrated_memes
    cm = calibrated_memes()
    if meme_key in cm:
        m = cm[meme_key]
        return {'meme': meme_key, 'strength': m['strength'],
                'strength_old': m['strength_old'], 'evidence': m['evidence'], 'conf': m['conf']}
    return {'meme': meme_key, 'strength': _MEME.get(meme_key, 0.0),
            'strength_old': None, 'evidence': None, 'conf': 'C(经验值)'}

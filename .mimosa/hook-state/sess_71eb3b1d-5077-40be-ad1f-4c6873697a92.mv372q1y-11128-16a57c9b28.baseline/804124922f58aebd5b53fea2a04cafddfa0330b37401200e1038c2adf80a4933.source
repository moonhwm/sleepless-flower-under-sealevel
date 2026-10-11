"""gillespie.py — Gillespie 随机传染动力学(SSA)

v68.60 追加 meme_spread_risk_data(真实标定口径,无数据回落 meme_spread_risk)。
传染病模型 SIR 变体用于"报考扎堆"传染: β=传染率(热度), γ=康复率(退烧)。
"""
import numpy as np


def meme_spread_risk(school_name, hotness=0.5, N=1000, seed=42):
    """Gillespie SSA 模拟报考扎堆传染。R0=β/γ>1.5→扎堆爆雷;R0<1→反向窗口。"""
    rng = np.random.default_rng(seed)
    beta = 0.15 + 0.6 * hotness
    gamma = 0.10 + 0.35 * (1 - hotness)
    R0 = beta / gamma if gamma else 0
    # Gillespie SSA
    S, I = N - 1, 1
    t, peak = 0.0, 1
    while t < 60 and I > 0:
        r_inf = beta * S * I / N
        r_rec = gamma * I
        rt = r_inf + r_rec
        if rt <= 0:
            break
        t += rng.exponential(1 / rt)
        if rng.random() < r_inf / rt:
            S -= 1; I += 1
        else:
            I -= 1
        peak = max(peak, I)
    risk = '高' if R0 > 1.5 else ('中' if R0 > 1.0 else '低')
    return {'校': school_name, 'beta': round(beta, 3), 'gamma': round(gamma, 3),
            'R0': round(R0, 2), '峰值感染': peak, '扎堆爆雷风险': risk,
            '反向窗口': R0 < 1}


def meme_spread_risk_data(school_name, N=1000, seed=42):
    """真实标定口径(v68.60): 用 calibrate_beta_gamma 的 β/γ(真实热度标定),
    无数据校回落 meme_spread_risk(hotness=0.5)。"""
    from scoring_system.heat_crawler import calibrate_beta_gamma, REAL_HEAT
    if school_name in REAL_HEAT:
        bg = calibrate_beta_gamma(school_name)
        return meme_spread_risk(school_name, hotness=bg['heat'], N=N, seed=seed)
    return meme_spread_risk(school_name, hotness=0.5, N=N, seed=seed)

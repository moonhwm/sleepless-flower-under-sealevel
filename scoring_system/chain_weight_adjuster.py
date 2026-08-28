"""chain_weight_adjuster.py — 链级证据驱动 pv/lithium 权重动态调整(v68.72)

用户指令:链级证据(pv/lithium)接入lock_plan做权重动态调整。
读 data/pv_lithium_chain.json 的链级ETF数据,按规则调整 config/weights_v50.json 的
pv_lithium_weights(独立通道,不进physics_scale分母)。
conf: B(规则为主观阈值,链级数据A)
"""
import json, os

CHAIN = os.path.join(os.path.dirname(__file__), '..', 'data', 'pv_lithium_chain.json')
CFG = os.path.join(os.path.dirname(__file__), '..', 'config', 'weights_v50.json')

PV_DOWN, PV_UP, PV_MID = 0.85, 1.1, 1.5
LI_DOWN, LI_UP, LI_MID = 0.70, 1.3, 2.0


def suggest_weights(chain=None):
    if chain is None:
        chain = json.load(open(CHAIN))
    pv_etf = chain['光伏链']['ETF515790']['收']
    li_etf = chain['锂电链']['ETF159755']['收']
    pv = PV_MID
    if pv_etf < PV_DOWN:
        pv = 1.0
    elif pv_etf > PV_UP:
        pv = 2.0
    lithium = LI_MID
    if li_etf < LI_DOWN:
        lithium = 1.0
    elif li_etf > LI_UP:
        lithium = 2.5
    return {'pv': pv, 'lithium': lithium,
            'pv_etf': pv_etf, 'li_etf': li_etf,
            '规则': f'pv<{PV_DOWN}→1.0/>{PV_UP}→2.0/否则1.5; lithium<{LI_DOWN}→1.0/>{LI_UP}→2.5/否则2.0',
            'conf': 'B(规则为主观阈值,链级数据A)'}


def apply_weights(dry_run=True):
    sug = suggest_weights()
    cfg = json.load(open(CFG))
    cur = cfg.get('pv_lithium_weights', {})
    diff = {'当前': {'pv': cur.get('pv'), 'lithium': cur.get('lithium')},
            '建议': {'pv': sug['pv'], 'lithium': sug['lithium']},
            '需调整': sug['pv'] != cur.get('pv') or sug['lithium'] != cur.get('lithium')}
    if not dry_run and diff['需调整']:
        cfg['pv_lithium_weights']['pv'] = sug['pv']
        cfg['pv_lithium_weights']['lithium'] = sug['lithium']
        cfg['pv_lithium_weights']['_note'] += f" | v68.72链级动态调整(pv_etf={sug['pv_etf']},li_etf={sug['li_etf']})"
        json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=1)
        diff['已写入'] = True
    return diff


if __name__ == '__main__':
    print(json.dumps(apply_weights(dry_run=True), ensure_ascii=False, indent=2))

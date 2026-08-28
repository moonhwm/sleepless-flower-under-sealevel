"""transfer_network.py — 调剂生源网络(v68.72)

用户指令:现有53校面板/59代码还有没有未榨干的结构——调剂生源校网络。
53校panel的transfer_sources(调剂生源校)→"调剂输出网络":
  ① 输出端: 哪些985/211落榜生最多流向这些B区/双非校(承接力)
  ② 质量端: 承接顶尖985落榜生最多的校=学科认可度反向印证(网络版transfer_quality_score)
conf: A(台账confA官方公示汇总)
"""
import json, os
from collections import Counter

ELITE = {'中国科学技术大学','吉林大学','哈尔滨工业大学','华东师范大学','四川大学','东北大学',
         '东南大学','山东大学','中南大学','华中科技大学','南开大学','厦门大学','北京师范大学','电子科技大学'}


def _ledger():
    op = os.path.join(os.path.dirname(__file__), '..', 'data', 'panel_pdf_ledger.json')
    return json.load(open(op))


def transfer_network(led=None, year='2026'):
    """调剂输出网络: {输出校: 输出去向校清单} + {承接校: 生源校清单}。"""
    if led is None:
        led = _ledger()
    out_net = Counter()
    accept = {}
    for nm, rec in led['schools'].items():
        y = (rec.get('年份数据') or {}).get(year) or {}
        srcs = set(y.get('transfer_sources') or [])
        for s in srcs:
            if s != nm:
                out_net[s] += 1
        if srcs:
            accept[nm] = {'生源校': sorted(srcs), '真空': 1 - (y.get('admit_first', 0) / (y.get('admit_total', 1) or 1))}
    return {'输出网络': dict(out_net.most_common()), '承接网络': accept, 'year': year}


def elite_accept_map(led=None, year='2026'):
    """精英生源承接地图: 承接顶尖985落榜生最多的校(学科认可度反向印证)。"""
    if led is None:
        led = _ledger()
    out = {}
    for nm, rec in led['schools'].items():
        y = (rec.get('年份数据') or {}).get(year) or {}
        srcs = set(y.get('transfer_sources') or [])
        hits = srcs & ELITE
        if hits:
            out[nm] = {'精英生源': sorted(hits), '计数': len(hits),
                       '真空': round(1 - (y.get('admit_first', 0) / (y.get('admit_total', 1) or 1)), 3)}
    return dict(sorted(out.items(), key=lambda x: -x[1]['计数']))


def network_quality_score(name, led=None, year='2026'):
    """网络版生源质量分: 精英生源计数/3 + 真空度加权(0-1)。"""
    em = elite_accept_map(led, year)
    e = em.get(name)
    if not e:
        return 0.0
    return round(min(1.0, e['计数'] / 3.0) * 0.7 + e['真空'] * 0.3, 3)


if __name__ == '__main__':
    em = elite_accept_map()
    print(json.dumps({k: em[k] for k in list(em)[:8]}, ensure_ascii=False, indent=2))

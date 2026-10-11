"""engine.py — 评分核心引擎(物理核+现实维+守门员)

v68.68: 新增 pv_solar/lithium_batt 方向子维度,走 cfg["pv_lithium_weights"] 独立通道
        (不进 w 主表 → 不进 physics_scale 分母 → 防全局标尺摊薄)。
        教训: 新增权重禁止入主表,否则 physics_scale=physics_target/sum(w) 分母变大,
        全库113校隐形降分(南昌pv=0也中招)。
"""
from typing import Any, Dict, List
from scoring_system.continuous_fn import log_scaled, cscaled

REQUIRED_FIELDS = {
    "code", "name", "level", "conf",
    "not_math1", "has_qm",
    "semiconductor", "photo_couple",
    "fusion_tokamak", "fusion_stellarator",
    "rebco_superconductor", "ai_physics", "ai_materials",
}


def calibrate_max_raw(schools: List[Dict[str, Any]], legacy: bool = False) -> Dict[str, float]:
    """以数据实际最大值做标定,保证满分在数据上可达。"""
    def mx(field):
        return max(float(s.get(field, 0) or 0) for s in schools) or 1.0
    return {
        "semi": mx("semiconductor"), "photo": mx("photo_couple"),
        "field10": 10.0, "engineer": mx("eng_cluster"),
        "exit": mx("dual_cert"), "access": 2.8, "faculty": 2.2, "city": 2.8, "phd_pair": 5.0,
    }


def compute(d: Dict[str, Any], cfg: Dict[str, Any], max_raw: Dict[str, float]) -> Dict[str, Any]:
    w = cfg["weights"]; rw = cfg["reality_weights"]; mr = max_raw

    bonus = 0.0
    if d["not_math1"] and not d["has_qm"]:
        bonus = w["dual_free"]
    elif d["not_math1"]:
        bonus = w["no_math1"]
    elif not d["has_qm"]:
        bonus = w["no_qm"]

    fnc = cfg.get("fn_config", {})
    def dim(key):
        f = fnc.get(key, fnc.get("_default", {"fn": "log", "params": {}}))
        return f["fn"], f.get("params", {})
    def sc(raw, maxr, tgt, key):
        fn, pr = dim(key)
        if fn == "log":
            return log_scaled(raw, maxr, tgt)
        return cscaled(raw, maxr, tgt, fn, pr)

    s = bonus
    s += sc(d["semiconductor"], mr["semi"], w["semi"], "semi")
    s += sc(d["photo_couple"], mr["photo"], w["photo"], "photo")
    # v68.68: 光伏/锂电方向子维度(独立通道,不进physics_scale分母)
    plw = cfg.get("pv_lithium_weights", {})
    s += sc(d.get("pv_solar", 0.0), mr["photo"], plw.get("pv", 0.0), "pv")
    s += sc(d.get("lithium_batt", 0.0), mr["photo"], plw.get("lithium", 0.0), "lithium")
    if cfg.get("flat_basic_bonus", True):
        s += w["basic"]

    fusion_raw = (cfg["fusion_mix"]["tokamak"] * d.get("fusion_tokamak", 0)
                  + cfg["fusion_mix"]["stellarator"] * d.get("fusion_stellarator", 0))
    s += sc(fusion_raw, mr["field10"], w["fusion_t"], "field10")
    # (其余维度同结构,略——完整见仓库历史)

    physics_raw_sum = sum(w.values())
    physics_scale = cfg["physics_target"] / physics_raw_sum
    physics = round(s * physics_scale, 2)

    r = 0.0
    exit_raw = d["dual_cert"] + d["local_mis"] + d["fallback"] + d["comfort"]
    r += sc(exit_raw, mr["exit"], rw["exit"], "exit")
    reality = round(r, 2)

    return {"physics": physics, "reality": reality,
            "total": round(physics + reality, 2)}


def score_all(schools: List[Dict[str, Any]], cfg: Dict[str, Any]) -> List[Dict[str, Any]]:
    is_legacy = cfg.get("duplicate_access_faculty", True)
    if cfg.get("max_raw") == "auto":
        max_raw = calibrate_max_raw(schools, legacy=is_legacy)
    else:
        max_raw = cfg["max_raw"]
    out = []
    for d in schools:
        res = compute(d, cfg, max_raw)
        out.append({"name": d["name"], "code": d["code"], **res})
    # 守门员基准(西安石油大学为参考基准线,固定锚点保集合不变性)
    gk = cfg.get("gatekeeper") or {}
    gk_k = float(gk.get("penalty_k", 0.35))
    gk_total = gk.get("baseline_total")
    if gk_total is None:
        gk_name = gk.get("school", "西安石油大学")
        gk_total = next((x["total"] for x in out if x["name"] == gk_name), None)
    if gk_total is not None and gk.get("enabled", not is_legacy):
        for x in out:
            gap = gk_total - x["total"]
            if gap > 0:
                pen = round(gk_k * gap, 2)
                x["gatekeeper_penalty"] = pen
                x["total"] = round(x["total"] - pen, 2)
            else:
                x["gatekeeper_penalty"] = 0.0
    out.sort(key=lambda x: -x["total"])
    for i, x in enumerate(out):
        x["rank"] = i + 1
    return out

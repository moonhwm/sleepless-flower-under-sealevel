# -*- coding: utf-8 -*-
"""scoring_system 统一门面(v68.45)
8大引擎聚合 + 常用函数快捷导入。
架构: 139模块碎片化 → facade聚合8引擎 → __init__统一门面。"""

# ── 8大引擎门面 ──
from scoring_system import (
    grasp_rating, benchmark_gate, admission_nn, pagerank_nn,
    param_registry, family_finance, dead_end, weekly_plan,
)

# ── 聚合引擎 ──
from scoring_system.facade import evaluate_school, rank_all, decision_summary
from scoring_system.path_iterator import iterate_paths, recommend
from scoring_system.nn_deep import build_deep_scorer, build_features
from scoring_system.nn_ensemble import ensemble_score, bayesian_admit_prob
from scoring_system.content_auditor import auditor_report
from scoring_system.mining_ledger import mining_status
from scoring_system.textbook_family import build_families, user_compatibility
from scoring_system.subject_nn import build_subject_scorer
from scoring_system.change_forecast import forecast_all as forecast_changes
from scoring_system.monte_carlo import score_mc, admit_mc
from scoring_system.bayes_forest import bayes_forest, vi_posterior
from scoring_system.numeric_adv import score_qmc, admit_gauss_quad, line_spline, threshold_root
from scoring_system.prob_adv import hmc_nuts, svgd, GPBO
from scoring_system.graph_embed import build_graph_embed
from scoring_system.align_adv import user_ot_compat, sinkhorn
from scoring_system.hierarchical import hac_cluster
from scoring_system.hrank import layered_rank
from scoring_system.hrl_path import hrl_plan
from scoring_system.hirag import build_hirag, hirag_query
from scoring_system.hmc_joint import joint_posterior
from scoring_system.weight_adv import rank_weights, entropy_weight, critic_weight
from scoring_system.ts_adv import ts_ensemble
from scoring_system.psm import psm_compare
from scoring_system.rank_report import composite_rank, build_rank_file
from scoring_system.heat_crawler import (build_ledger as build_heat_ledger,
    heat_index, calibrate_beta_gamma, calibrated_memes, data_driven_hubs)
from scoring_system.gillespie import meme_spread_risk_data
from scoring_system.crowd_dynamics import meme_strength_data
from scoring_system.social_heat import social_heat_index, social_signal_report, refine_heat_index
from scoring_system.social_heat_ext import (cross_validate, expanded_ledger,
    ext_social_heat, xiaohongshu_signal)
from scoring_system.panel_extract import (extract_all, vacuum_scan, parse_pdf)
from scoring_system.contrarian_portfolio import (build_portfolio, portfolio_advice,
    deep_insight, contrarian_score)
from scoring_system.pareto_front import (pareto_optimal_set, pareto_rank,
    school_objectives, fast_non_dominated_sort)
from scoring_system.lock_plan import risk_buckets, gale_shapley_lock
from scoring_system.panel_critique import (critique_all, critique_summary,
    classify_pattern, threshold_collapse, anomaly_scan, code_level_scan,
    code_divergence_report)

__version__ = '68.69'

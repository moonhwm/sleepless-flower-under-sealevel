"""scoring_system 统一门面(v68.45→v68.78)
8大引擎聚合 + 常用函数快捷导入。
架构: 139模块碎片化 → facade聚合8引擎 → __init__统一门面。
"""

try:
    from scoring_system import grasp_rating
except ImportError:
    pass
try:
    from scoring_system import benchmark_gate
except ImportError:
    pass
try:
    from scoring_system import admission_nn
except ImportError:
    pass
try:
    from scoring_system import pagerank_nn
except ImportError:
    pass
try:
    from scoring_system import param_registry
except ImportError:
    pass
try:
    from scoring_system import family_finance
except ImportError:
    pass
try:
    from scoring_system import dead_end
except ImportError:
    pass
try:
    from scoring_system import weekly_plan
except ImportError:
    pass

try:
    from scoring_system.facade import evaluate_school, rank_all, decision_summary
except ImportError:
    pass
try:
    from scoring_system.path_iterator import iterate_paths, recommend
except ImportError:
    pass
try:
    from scoring_system.nn_deep import build_deep_scorer, build_features
except ImportError:
    pass
try:
    from scoring_system.nn_ensemble import ensemble_score, bayesian_admit_prob
except ImportError:
    pass
try:
    from scoring_system.content_auditor import auditor_report
except ImportError:
    pass
try:
    from scoring_system.mining_ledger import mining_status
except ImportError:
    pass
try:
    from scoring_system.textbook_family import build_families, user_compatibility
except ImportError:
    pass
try:
    from scoring_system.subject_nn import build_subject_scorer
except ImportError:
    pass
try:
    from scoring_system.change_forecast import forecast_all as forecast_changes
except ImportError:
    pass
try:
    from scoring_system.monte_carlo import score_mc, admit_mc
except ImportError:
    pass
try:
    from scoring_system.bayes_forest import bayes_forest, vi_posterior
except ImportError:
    pass
try:
    from scoring_system.numeric_adv import score_qmc, admit_gauss_quad, line_spline, threshold_root
except ImportError:
    pass
try:
    from scoring_system.prob_adv import hmc_nuts, svgd, GPBO
except ImportError:
    pass
try:
    from scoring_system.graph_embed import build_graph_embed
except ImportError:
    pass
try:
    from scoring_system.align_adv import user_ot_compat, sinkhorn
except ImportError:
    pass
try:
    from scoring_system.hierarchical import hac_cluster
except ImportError:
    pass
try:
    from scoring_system.hrank import layered_rank
except ImportError:
    pass
try:
    from scoring_system.hrl_path import hrl_plan
except ImportError:
    pass
try:
    from scoring_system.hirag import build_hirag, hirag_query
except ImportError:
    pass
try:
    from scoring_system.hmc_joint import joint_posterior
except ImportError:
    pass
try:
    from scoring_system.weight_adv import rank_weights, entropy_weight, critic_weight
except ImportError:
    pass
try:
    from scoring_system.ts_adv import ts_ensemble
except ImportError:
    pass
try:
    from scoring_system.psm import psm_compare
except ImportError:
    pass
try:
    from scoring_system.rank_report import composite_rank, build_rank_file
except ImportError:
    pass
try:
    from scoring_system.heat_crawler import (build_ledger as build_heat_ledger,
        heat_index, calibrate_beta_gamma, calibrated_memes, data_driven_hubs)
except ImportError:
    pass
try:
    from scoring_system.gillespie import meme_spread_risk_data
except ImportError:
    pass
try:
    from scoring_system.crowd_dynamics import meme_strength_data
except ImportError:
    pass
try:
    from scoring_system.social_heat import social_heat_index, social_signal_report, refine_heat_index
except ImportError:
    pass
try:
    from scoring_system.social_heat_ext import (cross_validate, expanded_ledger,
        ext_social_heat, xiaohongshu_signal)
except ImportError:
    pass
try:
    from scoring_system.panel_extract import (extract_all, vacuum_scan, parse_pdf)
except ImportError:
    pass
try:
    from scoring_system.contrarian_portfolio import (build_portfolio, portfolio_advice,
        deep_insight, contrarian_score)
except ImportError:
    pass
try:
    from scoring_system.pareto_front import (pareto_optimal_set, pareto_rank,
        school_objectives, fast_non_dominated_sort)
except ImportError:
    pass
try:
    from scoring_system.lock_plan import risk_buckets, gale_shapley_lock
except ImportError:
    pass
try:
    from scoring_system.panel_critique import (critique_all, critique_summary,
        classify_pattern, threshold_collapse, anomaly_scan, code_level_scan,
        code_divergence_report)
except ImportError:
    pass
try:
    from scoring_system.frontier_tracker import track as frontier_track
except ImportError:
    pass
try:
    from scoring_system.transfer_network import (transfer_network, elite_accept_map,
        network_quality_score)
except ImportError:
    pass
try:
    from scoring_system.chain_weight_adjuster import suggest_weights as chain_suggest_weights
except ImportError:
    pass
try:
    from scoring_system.chain_weight_adjuster import apply_weights as chain_apply_weights
except ImportError:
    pass
try:
    from scoring_system.contrarian_portfolio import transfer_quality_score_network
except ImportError:
    pass

__version__ = '68.78'

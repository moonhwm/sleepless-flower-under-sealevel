"""models.py — 数据模型(必填核心字段+可选实证子表+扩展字段放行)

v68.68: SchoolModel 新增 pv_solar/lithium_batt(0-10,默认0)——光伏/锂电方向子维度,
Wind股价实证(光伏弱周期/锂电景气),三链分离(南昌硅基LED/深大光电不加分)。
"""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SchoolModel(BaseModel):
    """单校完整模型：必填核心字段 + 可选实证子表 + 扩展字段放行。"""
    model_config = ConfigDict(extra="allow")

    name: str
    code: Optional[str] = None
    level: str
    conf: str
    # 0-10 主观/半实证维度
    fusion_tokamak: float = Field(ge=0, le=10)
    fusion_stellarator: float = Field(ge=0, le=10)
    rebco_superconductor: float = Field(ge=0, le=10)
    semiconductor: float = Field(ge=0, le=10)
    photo_couple: float = Field(ge=0, le=10)
    pv_solar: float = Field(default=0.0, ge=0, le=10)  # 光伏方向耦合(v68.68)
    lithium_batt: float = Field(default=0.0, ge=0, le=10)  # 锂电/储能方向耦合(v68.68)
    ai_physics: float = Field(ge=0, le=10)
    ai_materials: float = Field(ge=0, le=10)
    ai4math: float = Field(ge=0, le=10)
    cold_atom: float = Field(ge=0, le=10)
    particle_phys: float = Field(ge=0, le=10)
    quantum_computing: float = Field(ge=0, le=10)
    not_math1: bool = True
    has_qm: bool = True


# 顶层 School = SchoolModel(历史结构兼容)
School = SchoolModel

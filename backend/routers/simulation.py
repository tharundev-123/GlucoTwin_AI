"""
Router for digital twin simulation controls: start, pause, reset, step, and what-if analysis.
"""

from fastapi import APIRouter
from backend.services import twin_service
from backend.schemas import SimulationStepInput, WhatIfRequest, WhatIfResponse

router = APIRouter(prefix="/api/v1/simulation", tags=["Simulation Controls"])


@router.post("/start")
def start_simulation():
    """Start continuous simulated time-series streaming for the virtual twin."""
    return twin_service.start_simulation()


@router.post("/pause")
def pause_simulation():
    """Pause the simulated time-series streaming."""
    return twin_service.pause_simulation()


@router.post("/reset")
def reset_simulation():
    """Reset the virtual twin state back to the deterministic initial sequence."""
    twin_service.reset()
    return {
        "status": "reset",
        "message": "Virtual digital twin restored to baseline state.",
        "state": twin_service.get_state()
    }


@router.post("/step")
def step_simulation(payload: SimulationStepInput):
    """
    Advance the simulated patient state by specified ticks with optional contextual inputs
    (e.g., meal carbs, physical activity, sleep).
    """
    state, forecast = twin_service.step(
        meal_carbs_g=payload.meal_carbs_g or 0.0,
        activity_level=payload.activity_level or 0.35,
        sleep_hours=payload.sleep_hours or 7.0,
        steps=payload.steps or 1
    )
    return {
        "status": "advanced",
        "ticks_advanced": payload.steps,
        "minutes_advanced": payload.steps * 5,
        "state": state,
        "forecast": forecast
    }


@router.post("/what-if", response_model=WhatIfResponse)
def what_if_simulation(payload: WhatIfRequest):
    """
    Evaluate a hypothetical 'What-If' scenario on the current digital twin state.
    Note: strictly illustrative and educational; not for medical or insulin guidance.
    """
    return twin_service.simulate_what_if(
        scenario_name=payload.scenario_name,
        hypothetical_carbs_g=payload.hypothetical_carbs_g,
        hypothetical_activity=payload.hypothetical_activity_level,
        duration_minutes=payload.duration_minutes
    )

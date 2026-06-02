from user_agents import parse


def parse_user_agent(ua: str) -> dict:
    if not ua:
        ua = ""

    user_agent = parse(ua)
    return {
        "browser": {
            "family": user_agent.browser.family,
            "version": user_agent.browser.version_string,
        },
        "os": {
            "family": user_agent.os.family,
            "version": user_agent.os.version_string,
        },
        "device": {
            "family": user_agent.device.family,
            "brand": user_agent.device.brand,
            "model": user_agent.device.model,
        },
        "is_mobile": user_agent.is_mobile,
        "is_tablet": user_agent.is_tablet,
        "is_pc": user_agent.is_pc,
        "is_bot": user_agent.is_bot,
        "raw": ua,
    }

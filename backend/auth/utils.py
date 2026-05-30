def parse_user_agent(ua: str) -> str:
    if not ua:
        return "Unknown Device"
    ua_lower = ua.lower()
    browser = "Unknown Browser"
    os = "Unknown OS"

    if "chrome" in ua_lower or "chromium" in ua_lower:
        browser = "Chrome"
    elif "safari" in ua_lower:
        browser = "Safari"
    elif "firefox" in ua_lower:
        browser = "Firefox"
    elif "edge" in ua_lower:
        browser = "Edge"

    if "windows" in ua_lower:
        os = "Windows"
    elif "macintosh" in ua_lower or "mac os" in ua_lower:
        os = "macOS"
    elif "iphone" in ua_lower:
        os = "iPhone"
    elif "android" in ua_lower:
        os = "Android"
    elif "linux" in ua_lower:
        os = "Linux"

    return f"{browser} on {os}"

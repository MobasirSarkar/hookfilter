const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function logoutRequest() {
    await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}

export async function logoutAllRequest() {
    await fetch(`${API_BASE}/auth/logout-all`, {
        method: "POST",
        credentials: "include",
    });
}

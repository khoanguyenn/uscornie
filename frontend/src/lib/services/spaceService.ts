import api from "@/lib/api";

export const spaceService = {
  async fetchMySpaces() {
    const res = await api.get("/spaces/me");
    return res.data;
  },
  async createSpace() {
    const res = await api.post("/spaces", {});
    return res.data;
  },
  async generateInvite(spaceId: string) {
    const res = await api.post(`/invites/${spaceId}`, {});
    return res.data;
  },
  async joinSpace(inviteToken: string) {
    const res = await api.post("/spaces/join", { invite_token: inviteToken });
    return res.data;
  },
  async updateInviteStatus(inviteToken: string, status: string) {
    const res = await api.patch(`/invites/${inviteToken}`, { status });
    return res.data;
  },
  async getInviteStatus(inviteToken: string) {
    const res = await api.get(`/invites/${inviteToken}/status`);
    return res.data;
  },
  async getSpaceStats(spaceId: string) {
    const res = await api.get(`/spaces/${spaceId}/stats`);
    return res.data;
  },
};

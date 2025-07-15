import adminInstance from '../features/auth/adminInstance';

const adminModerationApi = {
  fetchReports: async (params) => {
    const res = await adminInstance.get('/reports/',{params});
    return res.data;
  },
  updateReportStatus: async (reportId, status) => {
    const res = await adminInstance.patch(`/reports/${reportId}/status/`, { status });
    return res.data;
  }
};

export default adminModerationApi;
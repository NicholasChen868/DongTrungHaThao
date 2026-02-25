// ===================================
// ADMIN ANALYTICS — Biểu đồ & thống kê
// Chart.js: bar (doanh thu), doughnut (trạng thái)
// Event tracking stats (D11)
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import { apiCall, handleApiError } from '../utils/api.js';

/**
 * Tải dữ liệu phân tích & vẽ biểu đồ
 */
export async function loadAnalytics({ supabase, getSessionToken, showAdminToast }) {
    try {
        const { data: orders, error } = await apiCall(
            () => supabase.rpc('admin_get_analytics', {
                p_session_token: getSessionToken(), p_days: 30
            }),
            { retries: 2, context: 'Tải phân tích' }
        );
        if (error) throw error;

        if (!orders?.length) {
            document.getElementById('anMonthOrders').textContent = '0';
            document.getElementById('anMonthRevenue').textContent = '0₫';
            return;
        }

        // Month stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthOrders = orders.filter(o => o.created_at >= monthStart);
        const monthCompleted = monthOrders.filter(o => o.status === 'completed');
        document.getElementById('anMonthOrders').textContent = monthOrders.length;
        document.getElementById('anMonthRevenue').textContent =
            monthCompleted.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString('vi-VN') + '₫';

        // --- Bar chart: Revenue by day ---
        const dayMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(5, 10);
            dayMap[key] = 0;
        }
        orders.filter(o => o.status !== 'cancelled').forEach(o => {
            const key = o.created_at.slice(5, 10);
            if (dayMap[key] !== undefined) dayMap[key] += (o.total_amount || 0);
        });

        const chartColors = {
            gold: 'rgba(212, 168, 83, 0.8)',
            goldBorder: 'rgba(212, 168, 83, 1)',
            gridColor: 'rgba(255,255,255,0.06)',
            textColor: '#a09888',
        };

        new Chart(document.getElementById('chartRevenue'), {
            type: 'bar',
            data: {
                labels: Object.keys(dayMap).map(k => k.replace('-', '/')),
                datasets: [{
                    label: 'Doanh thu (₫)',
                    data: Object.values(dayMap),
                    backgroundColor: chartColors.gold,
                    borderColor: chartColors.goldBorder,
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.raw.toLocaleString('vi-VN') + '₫'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: chartColors.gridColor },
                        ticks: {
                            color: chartColors.textColor,
                            callback: (v) => v >= 1000000 ? (v / 1000000) + 'M' : v >= 1000 ? (v / 1000) + 'K' : v
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartColors.textColor, maxRotation: 45 }
                    }
                }
            }
        });

        // --- Doughnut chart: Status breakdown ---
        const statusCount = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
        orders.forEach(o => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });

        new Chart(document.getElementById('chartStatus'), {
            type: 'doughnut',
            data: {
                labels: ['Chờ duyệt', 'Đã duyệt', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: [
                        'rgba(251,191,36,0.7)',
                        'rgba(96,165,250,0.7)',
                        'rgba(129,140,248,0.7)',
                        'rgba(74,222,128,0.7)',
                        'rgba(248,113,113,0.7)',
                    ],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: chartColors.textColor, padding: 16, font: { size: 13 } }
                    }
                }
            }
        });

    } catch (err) {
        handleApiError(err, 'Tải phân tích', showAdminToast);
    }

    // --- D11: Event Tracking Stats ---
    try {
        const { data: eventStats, error: evErr } = await supabase.rpc('get_event_stats', { p_days: 7 });
        if (!evErr && eventStats) {
            const stats = eventStats;

            const pageViews = stats.page_views || 0;
            const ctaClicks = stats.cta_clicks || 0;
            const deepScrolls = stats.deep_scrolls || 0;
            const sessions = stats.unique_sessions || 0;

            const pvEl = document.getElementById('anPageViews');
            const ccEl = document.getElementById('anCtaClicks');
            const dsEl = document.getElementById('anDeepScroll');
            const ssEl = document.getElementById('anSessions');

            if (pvEl) pvEl.textContent = pageViews.toLocaleString('vi-VN');
            if (ccEl) ccEl.textContent = ctaClicks.toLocaleString('vi-VN');
            if (dsEl) dsEl.textContent = deepScrolls.toLocaleString('vi-VN');
            if (ssEl) ssEl.textContent = sessions.toLocaleString('vi-VN');

            // Top CTA list
            const topCtaEl = document.getElementById('topCtaList');
            if (topCtaEl && stats.top_ctas?.length) {
                topCtaEl.innerHTML = `<table class="admin-table">
                    <thead><tr><th>#</th><th>CTA Target</th><th>Clicks</th></tr></thead>
                    <tbody>
                    ${stats.top_ctas.map((item, i) => `<tr>
                        <td>${i + 1}</td>
                        <td><code>${escapeHTML(item.target || item.event_target || '—')}</code></td>
                        <td style="color:var(--gold-light);font-weight:600">${item.count || item.click_count || 0}</td>
                    </tr>`).join('')}
                    </tbody>
                </table>`;
            } else if (topCtaEl) {
                topCtaEl.innerHTML = '<div class="admin-empty">Chưa có dữ liệu CTA clicks</div>';
            }
        }
    } catch {
        // Silent — event stats are non-critical
    }
}
